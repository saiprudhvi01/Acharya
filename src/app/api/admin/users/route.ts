import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['admin']);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let query = 'SELECT id, name, email, role, avatar, phone, bio, subjects, isVerified, isBlocked, isSuspended, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionIsActive, createdAt, updatedAt FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC';

    const users = db.prepare(query).all(...params);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['admin']);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { userId, isBlocked, isSuspended, isVerified } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updates: any[] = [];
    const queryParams: any[] = [];

    if (isBlocked !== undefined) {
      updates.push('isBlocked = ?');
      queryParams.push(isBlocked ? 1 : 0);
    }
    if (isSuspended !== undefined) {
      updates.push('isSuspended = ?');
      queryParams.push(isSuspended ? 1 : 0);
    }
    if (isVerified !== undefined) {
      updates.push('isVerified = ?');
      queryParams.push(isVerified ? 1 : 0);
    }

    if (updates.length > 0) {
      queryParams.push(userId);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...queryParams);
    }

    const updatedUser = db.prepare('SELECT id, name, email, role, avatar, phone, bio, subjects, isVerified, isBlocked, isSuspended, subscriptionPlan, subscriptionStartDate, subscriptionEndDate, subscriptionIsActive, createdAt, updatedAt FROM users WHERE id = ?').get(userId) as any;

    return NextResponse.json(
      { message: 'User updated successfully', user: { ...updatedUser, subjects: updatedUser.subjects ? JSON.parse(updatedUser.subjects) : [] } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['admin']);
    
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from deleting themselves
    const currentUserId = auth.userId;
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
