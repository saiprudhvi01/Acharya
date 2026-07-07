'use client';

import { useEffect, useState } from 'react';
import { Star, Lock } from 'lucide-react';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  points: number;
  isUnlocked?: boolean;
  unlockedAt?: Date;
  progress?: number;
}

const rarityColors: Record<string, string> = {
  common: 'bg-gray-200 dark:bg-gray-700',
  uncommon: 'bg-green-200 dark:bg-green-700',
  rare: 'bg-blue-200 dark:bg-blue-700',
  legendary: 'bg-purple-200 dark:bg-purple-700',
};

const rarityBorders: Record<string, string> = {
  common: 'border-gray-300 dark:border-gray-600',
  uncommon: 'border-green-300 dark:border-green-600',
  rare: 'border-blue-300 dark:border-blue-600',
  legendary: 'border-purple-300 dark:border-purple-600',
};

interface AchievementBadgesProps {
  userId?: string;
  limit?: number;
  showUnlocked?: boolean;
}

export default function AchievementBadges({
  userId,
  limit,
  showUnlocked = true,
}: AchievementBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (userId) query.append('userId', userId);

      const response = await fetch(`/api/achievements?${query}`);
      if (!response.ok) throw new Error('Failed to fetch achievements');

      let data = await response.json();

      if (!showUnlocked) {
        data = data.filter((ach: Achievement) => !ach.isUnlocked);
      }

      if (limit) {
        data = data.slice(0, limit);
      }

      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading achievements...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        Achievements
      </h2>

      {achievements.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No achievements yet. Keep learning!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement._id}
              className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition ${
                achievement.isUnlocked
                  ? `${rarityColors[achievement.rarity]} ${rarityBorders[achievement.rarity]}`
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50'
              }`}
            >
              {!achievement.isUnlocked && (
                <div className="absolute top-1 right-1">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
              )}

              <div className="text-4xl mb-2">{achievement.badge}</div>

              <h3 className="font-semibold text-center text-sm text-gray-900 dark:text-white">
                {achievement.name}
              </h3>

              <p className="text-xs text-center text-gray-700 dark:text-gray-300 mt-1">
                {achievement.description}
              </p>

              <div className="mt-2 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-semibold">{achievement.points}</span>
              </div>

              {achievement.isUnlocked && achievement.unlockedAt && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
