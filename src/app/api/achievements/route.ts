import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Achievement, UserAchievement } from '@/models/Achievement';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'all' or 'unlocked'

    if (!userId) {
      // Get all achievements
      const achievements = await Achievement.find({ isActive: true })
        .populate('criteriaRelated');
      return NextResponse.json(achievements);
    }

    let query: any = {};
    if (type === 'unlocked') {
      const userAchievements = await UserAchievement.find({ userId })
        .populate({
          path: 'achievementId',
          match: { isActive: true },
        });

      return NextResponse.json(userAchievements);
    }

    // Get all achievements with progress for user
    const achievements = await Achievement.find({ isActive: true });
    const userAchievements = await UserAchievement.find({ userId });

    const enrichedAchievements = achievements.map((achievement) => {
      const userAch = userAchievements.find(
        (ua) => ua.achievementId.toString() === achievement._id.toString()
      );
      return {
        ...achievement.toObject(),
        isUnlocked: !!userAch,
        progress: userAch?.progress || 0,
        unlockedAt: userAch?.unlockedAt,
      };
    });

    return NextResponse.json(enrichedAchievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const achievement = new Achievement(body);
    await achievement.save();

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'Failed to create achievement' },
      { status: 500 }
    );
  }
}
