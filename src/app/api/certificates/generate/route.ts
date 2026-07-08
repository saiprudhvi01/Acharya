import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - student fetches their own certificates, teacher fetches by courseId
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (userRole === 'student') {
    const certificates = db.prepare(`
      SELECT cert.*, c.title as courseTitle, u.name as teacherName
      FROM certificates cert
      JOIN courses c ON cert.courseId = c.id
      JOIN users u ON c.teacherId = u.id
      WHERE cert.studentId = ?
      ORDER BY cert.issuedAt DESC
    `).all(userId);
    return NextResponse.json({ certificates }, { status: 200 });
  }

  if (userRole === 'teacher') {
    const courseId = request.nextUrl.searchParams.get('courseId');
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });
    const certificates = db.prepare(`
      SELECT cert.*, u.name as studentName, u.email as studentEmail
      FROM certificates cert
      JOIN users u ON cert.studentId = u.id
      WHERE cert.courseId = ?
      ORDER BY cert.issuedAt DESC
    `).all(courseId);
    return NextResponse.json({ certificates }, { status: 200 });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// POST - teacher uploads certificate for a student
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || userRole !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { studentId, courseId, fileUrl } = await request.json();
  if (!studentId || !courseId || !fileUrl) {
    return NextResponse.json({ error: 'studentId, courseId and fileUrl are required' }, { status: 400 });
  }

  // Verify course belongs to this teacher
  const course = db.prepare('SELECT id, title FROM courses WHERE id = ? AND teacherId = ?').get(courseId, userId) as any;
  if (!course) return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 403 });

  // Verify student is enrolled
  const enrollment = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(studentId, courseId);
  if (!enrollment) return NextResponse.json({ error: 'Student is not enrolled in this course' }, { status: 400 });

  db.prepare(`
    INSERT INTO certificates (studentId, courseId, fileUrl)
    VALUES (?, ?, ?)
    ON CONFLICT(studentId, courseId) DO UPDATE SET fileUrl = excluded.fileUrl, issuedAt = CURRENT_TIMESTAMP
  `).run(studentId, courseId, fileUrl);

  // Notify student
  const student = db.prepare('SELECT name FROM users WHERE id = ?').get(studentId) as any;
  db.prepare('INSERT INTO notifications (userId, title, message) VALUES (?, ?, ?)').run(
    studentId,
    '🎓 Certificate Issued!',
    `Your certificate for "${course.title}" has been uploaded by your teacher.`
  );

  return NextResponse.json({ message: 'Certificate uploaded successfully' }, { status: 200 });
}
