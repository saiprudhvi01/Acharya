import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50'
  ).all(userId);

  const unreadCount = (db.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0'
  ).get(userId) as any).count;

  return NextResponse.json({ notifications, unreadCount }, { status: 200 });
}
