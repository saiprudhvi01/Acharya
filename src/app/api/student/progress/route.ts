import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['student']);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = auth.userId;

    // Get enrolled courses
    const enrolledCourses = db.prepare(`
      SELECT c.id, c.title
      FROM user_enrollments ue
      JOIN courses c ON ue.courseId = c.id
      WHERE ue.userId = ?
    `).all(userId) as any[];

    const courseIds = enrolledCourses.map(c => c.id);

    // Get assignments for enrolled courses
    const assignments = db.prepare(`
      SELECT a.*, c.title as courseTitle
      FROM assignments a
      JOIN courses c ON a.courseId = c.id
      WHERE a.courseId IN (${courseIds.map(() => '?').join(',')})
    `).all(...courseIds) as any[];

    // Calculate assignment progress
    const assignmentProgress = assignments.map(assignment => {
      const submission = db.prepare('SELECT * FROM assignment_submissions WHERE assignmentId = ? AND studentId = ?').get(assignment.id, userId) as any;
      return {
        assignmentId: assignment.id,
        courseTitle: assignment.courseTitle,
        title: assignment.title,
        dueDate: assignment.dueDate,
        maxMarks: assignment.maxMarks,
        submitted: !!submission,
        marks: submission?.marks,
        submittedAt: submission?.submittedAt,
      };
    });

    // Get attendance records
    const attendanceRecords = db.prepare(`
      SELECT a.*, c.title as courseTitle
      FROM attendance a
      JOIN courses c ON a.courseId = c.id
      WHERE a.studentId = ?
    `).all(userId) as any[];

    // Calculate attendance percentage per course
    const attendanceByCourse: { [key: string]: { present: number; total: number } } = {};
    attendanceRecords.forEach(record => {
      const courseId = record.courseId;
      const courseTitle = record.courseTitle;
      
      if (!attendanceByCourse[courseId]) {
        attendanceByCourse[courseId] = { present: 0, total: 0 };
      }
      
      attendanceByCourse[courseId].total++;
      if (record.status === 'present' || record.status === 'late') {
        attendanceByCourse[courseId].present++;
      }
    });

    const attendanceStats = Object.entries(attendanceByCourse).map(([courseId, stats]) => {
      const record = attendanceRecords.find(r => r.courseId === courseId);
      return {
        courseId,
        courseTitle: record ? record.courseTitle : 'Unknown Course',
        percentage: Math.round((stats.present / stats.total) * 100),
        present: stats.present,
        total: stats.total,
      };
    });

    // Overall stats
    const totalCourses = enrolledCourses.length;
    const completedAssignments = assignmentProgress.filter(a => a.submitted).length;
    const totalAssignments = assignments.length;
    const overallAttendance = attendanceStats.length > 0 
      ? Math.round(attendanceStats.reduce((sum, stat) => sum + stat.percentage, 0) / attendanceStats.length)
      : 0;

    return NextResponse.json(
      {
        totalCourses,
        completedAssignments,
        totalAssignments,
        overallAttendance,
        assignmentProgress,
        attendanceStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
