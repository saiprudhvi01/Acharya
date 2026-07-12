import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { UserAchievement, Achievement } from '@/models/Achievement';

export async function POST(request: NextRequest) {
  try {
    

    const body = await request.json();
    const { userId, achievementId } = body;

    // Check if achievement already unlocked
    const existing = await UserAchievement.findOne({ userId, achievementId });

    if (existing) {
      return NextResponse.json(
        { error: 'Achievement already unlocked' },
        { status: 400 }
      );
    }

    const userAchievement = new UserAchievement({
      userId,
      achievementId,
      unlockedAt: new Date(),
    });

    await userAchievement.save();

    const populated = await userAchievement.populate('achievementId');

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const userAchievements = await UserAchievement.find({ userId })
      .populate('achievementId')
      .sort({ unlockedAt: -1 });

    return NextResponse.json(userAchievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
