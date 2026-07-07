import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET messages (for current user)
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

    // Build query
    let query = `
      SELECT m.*, 
             s.name as senderName, s.email as senderEmail, s.avatar as senderAvatar,
             r.name as receiverName, r.email as receiverEmail, r.avatar as receiverAvatar,
             c.title as courseTitle
      FROM messages m
      JOIN users s ON m.senderId = s.id
      JOIN users r ON m.receiverId = r.id
      LEFT JOIN courses c ON m.courseId = c.id
      WHERE (m.senderId = ? OR m.receiverId = ?)
    `;
    const params: any[] = [userId, userId];

    if (courseId) {
      query += ' AND m.courseId = ?';
      params.push(courseId);
    }

    query += ' ORDER BY m.createdAt DESC';

    const messages = db.prepare(query).all(...params);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST send message
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { receiver, course, content, attachments } = body;

    // Validation
    if (!receiver || !content) {
      return NextResponse.json(
        { error: 'Receiver and content are required' },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiverUser = db.prepare('SELECT id FROM users WHERE id = ?').get(receiver) as any;
    if (!receiverUser) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Create message
    const result = db.prepare(`
      INSERT INTO messages (senderId, receiverId, courseId, content)
      VALUES (?, ?, ?, ?)
    `).run(userId, receiver, course || null, content);

    const messageId = result.lastInsertRowid;

    const message = db.prepare(`
      SELECT m.*, 
             s.name as senderName, s.email as senderEmail, s.avatar as senderAvatar,
             r.name as receiverName, r.email as receiverEmail, r.avatar as receiverAvatar,
             c.title as courseTitle
      FROM messages m
      JOIN users s ON m.senderId = s.id
      JOIN users r ON m.receiverId = r.id
      LEFT JOIN courses c ON m.courseId = c.id
      WHERE m.id = ?
    `).get(messageId);

    return NextResponse.json(
      { message },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
