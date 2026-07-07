import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET assignments
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

    let query = `
      SELECT a.*, c.title as courseTitle, u.name as teacherName, u.email as teacherEmail
      FROM assignments a
      JOIN courses c ON a.courseId = c.id
      JOIN users u ON c.teacherId = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (courseId) {
      query += ' AND a.courseId = ?';
      params.push(courseId);
    }

    // Teachers can only see their own assignments
    if (userRole === 'teacher') {
      query += ' AND c.teacherId = ?';
      params.push(userId);
    }

    query += ' ORDER BY a.dueDate DESC';

    const assignments = db.prepare(query).all(...params);

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create assignment (teacher only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can create assignments.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { course, title, description, dueDate, maxMarks, attachments } = body;

    // Validation
    if (!course || !title || !description || !dueDate || !maxMarks) {
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

    // Create assignment
    const result = db.prepare(`
      INSERT INTO assignments (courseId, title, description, dueDate, maxMarks)
      VALUES (?, ?, ?, ?, ?)
    `).run(course, title, description, dueDate, maxMarks);

    const assignmentId = result.lastInsertRowid;

    const assignment = db.prepare(`
      SELECT a.*, c.title as courseTitle, u.name as teacherName, u.email as teacherEmail
      FROM assignments a
      JOIN courses c ON a.courseId = c.id
      JOIN users u ON c.teacherId = u.id
      WHERE a.id = ?
    `).get(assignmentId);

    return NextResponse.json(
      { message: 'Assignment created successfully', assignment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
