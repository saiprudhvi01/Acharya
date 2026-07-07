'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

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

const typeIcons: Record<string, any> = {
  assignment: '📝',
  message: '💬',
  achievement: '🏆',
  course: '📚',
  system: 'ℹ️',
  payment: '💳',
};

interface RealtimeNotificationProps {
  userId: string;
  onClose?: () => void;
}

export default function RealtimeNotification({
  userId,
  onClose,
}: RealtimeNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [toast, setToast] = useState<Notification | null>(null);

  const { isConnected, isConnecting, error, send } = useWebSocket({
    userId,
    onMessage: useCallback((message: any) => {
      if (message.type === 'notification') {
        const newNotification = message.data;
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        setToast(newNotification);
        setTimeout(() => setToast(null), 5000);
      } else if (message.type === 'subscribed') {
        setConnectionStatus('connected');
      }
    }, []),
    onConnect: () => setConnectionStatus('connected'),
    onDisconnect: () => setConnectionStatus('disconnected'),
  });

  useEffect(() => {
    setConnectionStatus(isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected');
  }, [isConnected, isConnecting]);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
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

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg border ${typeColors[toast.type]}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{typeIcons[toast.type]}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{toast.title}</h3>
                <p className="text-xs mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              title={`Connection: ${connectionStatus}`}
            />
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          )}

          {!loading && (
            <>
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
                      } transition hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{typeIcons[notification.type]}</span>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex gap-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
