import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

// GET user profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const user = db.prepare('SELECT id, name, email, role, avatar, phone, bio, subjects, isVerified, isBlocked, isSuspended, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionIsActive, createdAt, updatedAt FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get enrolled courses
    const enrolledCourses = db.prepare(`
      SELECT c.id, c.title, c.description, c.thumbnail, c.teacherId, u.name as teacherName
      FROM user_enrollments ue
      JOIN courses c ON ue.courseId = c.id
      JOIN users u ON c.teacherId = u.id
      WHERE ue.userId = ?
    `).all(userId);

    return NextResponse.json({ user: { ...user, subjects: user.subjects ? JSON.parse(user.subjects) : [], enrolledCourses } }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, bio, avatar, currentPassword, newPassword } = body;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update basic fields
    const updates: any[] = [];
    const params: any[] = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email && email !== user.email) {
      // Check if email is already taken
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 409 }
        );
      }
      updates.push('email = ?');
      params.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (bio) {
      updates.push('bio = ?');
      params.push(bio);
    }
    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (updates.length > 0) {
      params.push(userId);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updatedUser = db.prepare('SELECT id, name, email, role, avatar, phone, bio, subjects, isVerified, isBlocked, isSuspended, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionIsActive, createdAt, updatedAt FROM users WHERE id = ?').get(userId) as any;

    return NextResponse.json(
      { message: 'Profile updated successfully', user: { ...updatedUser, subjects: updatedUser.subjects ? JSON.parse(updatedUser.subjects) : [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
