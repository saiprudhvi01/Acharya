'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';

interface LeaderboardUser {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  achievements: number;
}

interface LeaderboardProps {
  period?: 'week' | 'month' | 'all-time';
  limit?: number;
}

export default function Leaderboard({ period = 'all-time', limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setLeaderboard(data.slice(0, limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Top performers this {period === 'week' ? 'week' : period === 'month' ? 'month' : 'all time'}</p>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <div
            key={user.userId}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-lg">
              {index === 0 ? (
                <Trophy className="w-6 h-6 text-yellow-500" />
              ) : index === 1 ? (
                <Medal className="w-6 h-6 text-gray-400" />
              ) : index === 2 ? (
                <Medal className="w-6 h-6 text-orange-600" />
              ) : (
                <span className="text-gray-600 dark:text-gray-400">#{index + 1}</span>
              )}
            </div>

            <div className="flex-grow">
              <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-gray-900 dark:text-white">{user.points}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user.achievements} achievements</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
