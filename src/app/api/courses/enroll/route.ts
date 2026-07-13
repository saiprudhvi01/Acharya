import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request, ['student']);
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const userId = auth.userId;

  const { courseId, plan = 'basic' } = await request.json();
  if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  if (!['basic', 'intermediate', 'advanced'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const course = db.prepare('SELECT id FROM courses WHERE id = ? AND isApproved = 1').get(courseId);
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const existing = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(userId, courseId);
  if (!existing) {
    db.prepare('INSERT INTO user_enrollments (userId, courseId, plan) VALUES (?, ?, ?)').run(userId, courseId, plan);
    db.prepare('UPDATE courses SET enrolledStudents = enrolledStudents + 1 WHERE id = ?').run(courseId);
    const c = db.prepare('SELECT title, price FROM courses WHERE id = ?').get(courseId) as any;

    let amount = c?.price ?? 0;
    if (plan === 'intermediate') amount *= 2;
    if (plan === 'advanced') amount *= 3;

    db.prepare('INSERT INTO payments (userId, courseId, amount, status, paymentType) VALUES (?, ?, ?, ?, ?)').run(
      userId, courseId, amount, 'completed', 'course'
    );
    // Notify student
    db.prepare('INSERT INTO notifications (userId, title, message) VALUES (?, ?, ?)').run(
      userId,
      'Enrollment Successful 🎉',
      `You have successfully enrolled in "${c?.title}" with the ${plan} plan. Start learning now!`
    );
  }

  return NextResponse.json({ message: 'Enrolled successfully' }, { status: 200 });
}
