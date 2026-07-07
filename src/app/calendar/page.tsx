'use client';

import CalendarWidget from '@/components/CalendarWidget';
import { useState } from 'react';

export default function CalendarPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Calendar
        </h1>
        <CalendarWidget userId={userId} compact={false} />
      </div>
    </div>
  );
}
