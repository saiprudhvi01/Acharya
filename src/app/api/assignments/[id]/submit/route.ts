import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileUrl } = body;

    // Validation
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'File URL is required' },
        { status: 400 }
      );
    }

    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(params.id) as any;

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    const existingSubmission = db.prepare('SELECT * FROM assignment_submissions WHERE assignmentId = ? AND studentId = ?').get(params.id, userId) as any;

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this assignment' },
        { status: 400 }
      );
    }

    // Add submission
    db.prepare(`
      INSERT INTO assignment_submissions (assignmentId, studentId, fileUrl, submittedAt)
      VALUES (?, ?, ?, ?)
    `).run(params.id, userId, fileUrl, new Date().toISOString());

    return NextResponse.json(
      { message: 'Assignment submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit assignment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
