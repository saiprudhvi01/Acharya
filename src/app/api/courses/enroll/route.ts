import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || userRole !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { courseId } = await request.json();
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  const course = db.prepare('SELECT id FROM courses WHERE id = ? AND isApproved = 1').get(courseId);
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const existing = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(userId, courseId);
  if (!existing) {
    db.prepare('INSERT INTO user_enrollments (userId, courseId) VALUES (?, ?)').run(userId, courseId);
    db.prepare('UPDATE courses SET enrolledStudents = enrolledStudents + 1 WHERE id = ?').run(courseId);
    // Record payment
    const c = db.prepare('SELECT title, price FROM courses WHERE id = ?').get(courseId) as any;
    db.prepare('INSERT INTO payments (userId, courseId, amount, status, paymentType) VALUES (?, ?, ?, ?, ?)').run(
      userId, courseId, c?.price ?? 0, 'completed', 'course'
    );
    // Notify student
    db.prepare('INSERT INTO notifications (userId, title, message) VALUES (?, ?, ?)').run(
      userId,
      'Enrollment Successful 🎉',
      `You have successfully enrolled in "${c?.title}". Start learning now!`
    );
  }

  return NextResponse.json({ message: 'Enrolled successfully' }, { status: 200 });
}
