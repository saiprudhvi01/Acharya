import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET materials for a course (enrolled students + teacher)
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const courseId = request.nextUrl.searchParams.get('courseId');

  if (!userId || !courseId) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 });
  }

  // Teachers can always see their own course materials
  if (userRole === 'teacher') {
    const course = db.prepare('SELECT id FROM courses WHERE id = ? AND teacherId = ?').get(courseId, userId);
    if (!course) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  } else {
    // Students must be enrolled
    const enrollment = db.prepare('SELECT * FROM user_enrollments WHERE userId = ? AND courseId = ?').get(userId, courseId);
    if (!enrollment) return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
  }

  const materials = db.prepare('SELECT * FROM course_materials WHERE courseId = ? ORDER BY createdAt ASC').all(courseId);
  return NextResponse.json({ materials }, { status: 200 });
}

// POST add material to a course (teacher only)
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  if (!userId || userRole !== 'teacher') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { courseId, title, type, url } = body;

  if (!courseId || !title || !type || !url) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const course = db.prepare('SELECT id FROM courses WHERE id = ? AND teacherId = ?').get(courseId, userId);
  if (!course) return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 403 });

  const result = db.prepare(
    'INSERT INTO course_materials (courseId, title, type, url) VALUES (?, ?, ?, ?)'
  ).run(courseId, title, type, url);

  const material = db.prepare('SELECT * FROM course_materials WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ material }, { status: 201 });
}

// DELETE material (teacher only)
export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const materialId = request.nextUrl.searchParams.get('materialId');

  if (!userId || userRole !== 'teacher' || !materialId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const material = db.prepare(`
    SELECT cm.* FROM course_materials cm
    JOIN courses c ON cm.courseId = c.id
    WHERE cm.id = ? AND c.teacherId = ?
  `).get(materialId, userId);

  if (!material) return NextResponse.json({ error: 'Material not found' }, { status: 404 });

  db.prepare('DELETE FROM course_materials WHERE id = ?').run(materialId);
  return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
}
