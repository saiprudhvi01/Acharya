import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { UserAchievement } from '@/models/Achievement';
import User from '@/models/User';
import Assignment from '@/models/Assignment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time'; // week, month, all-time

    // Calculate start date based on period
    const now = new Date();
    let startDate = new Date(0);

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user points from achievements
    const userAchievements = await UserAchievement.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalPoints: {
            $sum: {
              $cond: [{ $eq: ['$achievementId', null] }, 0, 10],
            },
          },
          achievementCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
      {
        $limit: 100,
      },
    ]);

    // Enrich with user data
    const leaderboard = await Promise.all(
      userAchievements.map(async (item) => {
        const user = await User.findById(item._id).select('name email avatar');
        return {
          userId: item._id,
          name: user?.name || 'Unknown',
          email: user?.email,
          avatar: user?.avatar,
          points: item.totalPoints,
          achievements: item.achievementCount,
        };
      })
    );

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
