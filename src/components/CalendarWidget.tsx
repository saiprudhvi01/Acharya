'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  eventType: 'assignment' | 'liveClass' | 'deadline' | 'exam' | 'custom';
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  color?: string;
}

const eventTypeColors: Record<string, string> = {
  assignment: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  liveClass: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
  deadline: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700',
  exam: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
  custom: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700',
};

interface CalendarWidgetProps {
  userId?: string;
  compact?: boolean;
}

export default function CalendarWidget({ userId, compact = false }: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [currentDate, userId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const query = new URLSearchParams();
      query.append('startDate', startDate.toISOString());
      query.append('endDate', endDate.toISOString());
      if (userId) query.append('userId', userId);

      const response = await fetch(`/api/calendar?${query}`);
      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, compact ? 5 : 10);

  if (loading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Events
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">Error: {error}</div>}

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No upcoming events
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event._id}
              className={`p-3 rounded-lg border-l-4 ${eventTypeColors[event.eventType]}`}
            >
              <h3 className="font-semibold text-sm">{event.title}</h3>

              <div className="mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(event.startDate).toLocaleDateString()} -{' '}
                    {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.description && (
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
