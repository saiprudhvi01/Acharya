import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET enrolled students for a teacher's course
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || userRole !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const courseId = request.nextUrl.searchParams.get('courseId');
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  // Verify course belongs to teacher
  const course = db.prepare('SELECT id, title FROM courses WHERE id = ? AND teacherId = ?').get(courseId, userId);
  if (!course) return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 403 });

  const students = db.prepare(`
    SELECT u.id, u.name, u.email, ue.enrolledAt,
      (SELECT fileUrl FROM certificates WHERE studentId = u.id AND courseId = ?) as certificateUrl
    FROM user_enrollments ue
    JOIN users u ON ue.userId = u.id
    WHERE ue.courseId = ?
    ORDER BY ue.enrolledAt DESC
  `).all(courseId, courseId);

  return NextResponse.json({ students }, { status: 200 });
}
