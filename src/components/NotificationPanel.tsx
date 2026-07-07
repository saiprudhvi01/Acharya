'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'assignment' | 'message' | 'achievement' | 'course' | 'system' | 'payment';
  isRead: boolean;
  icon?: string;
  actionUrl?: string;
  createdAt: Date;
}

const typeColors: Record<string, string> = {
  assignment: 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700',
  message: 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700',
  achievement: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700',
  course: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700',
  system: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
  payment: 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700',
};

interface NotificationPanelProps {
  userId: string;
  onClose?: () => void;
}

export default function NotificationPanel({ userId, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{unreadCount}</span>}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4">
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 block"
          >
            Mark all as read
          </button>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg border ${typeColors[notification.type]} ${
                  !notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
                } transition`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
