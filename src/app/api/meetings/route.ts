import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all meetings for a teacher
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

    let query = `
      SELECT m.*, c.title as courseTitle
      FROM meetings m
      LEFT JOIN courses c ON m.courseId = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Teachers can only see their own meetings
    if (userRole === 'teacher') {
      query += ' AND m.teacherId = ?';
      params.push(userId);
    }

    query += ' ORDER BY m.scheduledFor DESC';

    const meetings = db.prepare(query).all(...params);

    return NextResponse.json({ meetings }, { status: 200 });
  } catch (error) {
    console.error('Get meetings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create meeting (teacher only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized. Only teachers can create meetings.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { courseId, title, description, scheduledFor, duration } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate unique room ID
    const roomId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create meeting
    const result = db.prepare(`
      INSERT INTO meetings (roomId, teacherId, courseId, title, description, scheduledFor, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(roomId, userId, courseId || null, title, description || null, scheduledFor || null, duration || null);

    const meetingId = result.lastInsertRowid;

    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(meetingId);

    return NextResponse.json(
      { message: 'Meeting created successfully', meeting },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create meeting error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
