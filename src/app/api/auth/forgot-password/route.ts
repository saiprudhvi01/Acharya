import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Please provide email' },
        { status: 400 }
      );
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json(
        { message: 'If an account exists, a reset link will be sent' },
        { status: 200 }
      );
    }

    // In production, send email with reset token
    // For demo, return a mock reset token
    const resetToken = Buffer.from(`${user.id}-${Date.now()}`).toString('base64');

    return NextResponse.json(
      {
        message: 'If an account exists, a reset link will be sent',
        resetToken, // Only for demo purposes
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
