import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

// GET all courses (public)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const skillLevel = searchParams.get('skillLevel');
    const teacherId = searchParams.get('teacherId');
    const search = searchParams.get('search');

    const params: any[] = [];
    // If fetching by teacherId, show all their courses (approved or not)
    let query = teacherId
      ? 'SELECT c.*, u.name as teacherName, u.email as teacherEmail, u.avatar as teacherAvatar FROM courses c JOIN users u ON c.teacherId = u.id WHERE c.teacherId = ?'
      : 'SELECT c.*, u.name as teacherName, u.email as teacherEmail, u.avatar as teacherAvatar FROM courses c JOIN users u ON c.teacherId = u.id WHERE c.isApproved = 1';

    if (teacherId) {
      params.push(teacherId);
    }
    if (category) {
      query += ' AND c.category = ?';
      params.push(category);
    }
    if (subject) {
      query += ' AND c.subject = ?';
      params.push(subject);
    }
    if (skillLevel) {
      query += ' AND c.skillLevel = ?';
      params.push(skillLevel);
    }
    if (search) {
      query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY c.createdAt DESC';

    const courses = db.prepare(query).all(...params);

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create course (teacher only)
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['teacher']);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const teacherId = auth.userId;

    const body = await request.json();
    const {
      title,
      description,
      category,
      subject,
      duration,
      price,
      skillLevel,
      coverImage,
    } = body;

    // Validation
    if (!title || !description || !category || !subject || !duration || !price) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = db.prepare('SELECT id FROM users WHERE id = ? AND role = ?').get(teacherId, 'teacher');
    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found or invalid teacher ID' },
        { status: 404 }
      );
    }

    // Create course
    const result = db.prepare(`
      INSERT INTO courses (title, description, teacherId, category, subject, duration, price, skillLevel, thumbnail, isApproved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(title, description, teacherId, category, subject, duration, price, skillLevel || 'beginner', coverImage || null);

    const courseId = result.lastInsertRowid;

    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);

    return NextResponse.json(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
