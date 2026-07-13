import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all-time'; // week, month, all-time

    // Calculate start date based on period
    const now = new Date();
    let startDate = new Date(0);

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();

    // Get leaderboard from achievements table
    const leaderboard = db.prepare(`
      SELECT 
        u.id as userId,
        u.name,
        u.email,
        u.avatar,
        COUNT(a.id) as achievementCount,
        COUNT(a.id) * 10 as totalPoints
      FROM users u
      LEFT JOIN achievements a ON u.id = a.userId AND a.createdAt >= ?
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY totalPoints DESC
      LIMIT 100
    `).all(startDateStr) as any[];

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
