'use client';

import Leaderboard from '@/components/Leaderboard';
import AchievementBadges from '@/components/AchievementBadges';
import { useState } from 'react';

export default function LeaderboardPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Leaderboard & Achievements
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Leaderboard limit={20} />
          </div>

          <div>
            <AchievementBadges userId={userId} limit={9} />
          </div>
        </div>
      </div>
    </div>
  );
}
