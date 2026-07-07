import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized. Student access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get user and course details
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    const course = db.prepare('SELECT c.*, u.name as teacherName FROM courses c JOIN users u ON c.teacherId = u.id WHERE c.id = ?').get(courseId) as any;

    if (!user || !course) {
      return NextResponse.json(
        { error: 'User or course not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(userId, courseId);
    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 400 }
      );
    }

    // Generate certificate data
    const certificateData = {
      studentName: user.name,
      courseName: course.title,
      teacherName: course.teacherName,
      completionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    return NextResponse.json(
      {
        message: 'Certificate generated successfully',
        certificate: certificateData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate certificate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
