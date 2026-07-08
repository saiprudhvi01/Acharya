import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(userId);
  return NextResponse.json({ message: 'All marked as read' }, { status: 200 });
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
