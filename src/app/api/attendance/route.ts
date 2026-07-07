import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    let query = 'SELECT a.*, s.name as studentName, s.email as studentEmail, t.name as teacherName, t.email as teacherEmail, c.title as courseTitle FROM attendance a JOIN users s ON a.studentId = s.id JOIN users t ON a.markedBy = t.id JOIN courses c ON a.courseId = c.id WHERE 1=1';
    const params: any[] = [];

    // Students can only see their own attendance
    if (userRole === 'student') {
      query += ' AND a.studentId = ?';
      params.push(userId);
    } else if (userRole === 'teacher' && courseId) {
      // Teachers can see attendance for their courses
      const course = db.prepare('SELECT teacherId FROM courses WHERE id = ?').get(courseId) as any;
      if (course && course.teacherId === parseInt(userId)) {
        query += ' AND a.courseId = ?';
        params.push(courseId);
      } else {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (userRole === 'admin') {
      // Admins can see all attendance
      if (courseId) {
        query += ' AND a.courseId = ?';
        params.push(courseId);
      }
      if (studentId) {
        query += ' AND a.studentId = ?';
        params.push(studentId);
      }
    }

    query += ' ORDER BY a.date DESC';

    const attendance = db.prepare(query).all(...params);

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST mark attendance (teacher only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can mark attendance.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { course, student, date, status, liveClassId } = body;

    // Validation
    if (!course || !student || !date || !status) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Verify course belongs to teacher
    const courseDoc = db.prepare('SELECT teacherId FROM courses WHERE id = ?').get(course) as any;
    if (!courseDoc || courseDoc.teacherId !== parseInt(userId)) {
      return NextResponse.json(
        { error: 'Course not found or you are not the teacher' },
        { status: 403 }
      );
    }

    // Check if student is enrolled
    const enrollment = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(student, course);
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student not enrolled in this course' },
        { status: 400 }
      );
    }

    // Create or update attendance record
    const result = db.prepare(`
      INSERT INTO attendance (courseId, studentId, date, status, markedBy)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(courseId, studentId, date) DO UPDATE SET
        status = excluded.status,
        markedBy = excluded.markedBy
    `).run(course, student, date, status, userId);

    const attendance = db.prepare(`
      SELECT a.*, s.name as studentName, s.email as studentEmail, t.name as teacherName, t.email as teacherEmail, c.title as courseTitle
      FROM attendance a
      JOIN users s ON a.studentId = s.id
      JOIN users t ON a.markedBy = t.id
      JOIN courses c ON a.courseId = c.id
      WHERE a.courseId = ? AND a.studentId = ? AND a.date = ?
    `).get(course, student, date);

    return NextResponse.json(
      { message: 'Attendance marked successfully', attendance },
      { status: 201 }
    );
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
