import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, subjects } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (role === 'teacher' && (!subjects || subjects.length === 0)) {
      return NextResponse.json(
        { error: 'Teachers must select at least one subject' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const subjectsJson = role === 'teacher' ? JSON.stringify(subjects) : null;
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, subjects)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, role, subjectsJson);

    const userId = result.lastInsertRowid;

    // Generate token
    const token = signToken({
      userId: userId.toString(),
      email,
      role,
    });

    // Get user without password
    const user = db.prepare(`
      SELECT id, name, email, role, avatar, phone, bio, subjects, isVerified, isBlocked, isSuspended, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionIsActive, createdAt, updatedAt
      FROM users WHERE id = ?
    `).get(userId) as any;

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { ...user, subjects: user.subjects ? JSON.parse(user.subjects) : [] },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
