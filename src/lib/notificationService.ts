import Notification from '@/models/Notification';
import { broadcastToUser } from '@/lib/websocket';

export interface CreateNotificationParams {
  recipientId: string;
  senderId?: string;
  title: string;
  message: string;
  type: 'assignment' | 'message' | 'achievement' | 'course' | 'system' | 'payment';
  actionUrl?: string;
  icon?: string;
  data?: Record<string, any>;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = new Notification({
      recipientId: params.recipientId,
      senderId: params.senderId,
      title: params.title,
      message: params.message,
      type: params.type,
      actionUrl: params.actionUrl,
      icon: params.icon,
      data: params.data,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await notification.save();

    // Broadcast to user via WebSocket
    broadcastToUser(params.recipientId, {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      icon: notification.icon,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function notifyAssignmentCreated(
  teacherId: string,
  studentIds: string[],
  assignmentTitle: string,
  courseId: string
) {
  const promises = studentIds.map((studentId) =>
    createNotification({
      recipientId: studentId,
      senderId: teacherId,
      title: 'New Assignment',
      message: `New assignment "${assignmentTitle}" has been posted`,
      type: 'assignment',
      data: { courseId, assignmentTitle },
      actionUrl: `/assignments`,
    })
  );

  return Promise.all(promises);
}

export async function notifyAchievementUnlocked(
  userId: string,
  achievementName: string,
  achievementPoints: number
) {
  return createNotification({
    recipientId: userId,
    title: 'Achievement Unlocked! 🎉',
    message: `You've unlocked the "${achievementName}" achievement and earned ${achievementPoints} points!`,
    type: 'achievement',
    icon: '🏆',
    data: { achievementName, achievementPoints },
  });
}

export async function notifyPaymentSuccessful(
  userId: string,
  amount: number,
  courseTitle: string
) {
  return createNotification({
    recipientId: userId,
    title: 'Payment Successful',
    message: `Payment of $${amount} for "${courseTitle}" has been processed successfully`,
    type: 'payment',
    icon: '✅',
    data: { amount, courseTitle },
  });
}

export async function notifyLiveClassStarting(
  studentIds: string[],
  className: string,
  meetingLink: string
) {
  const promises = studentIds.map((studentId) =>
    createNotification({
      recipientId: studentId,
      title: 'Live Class Starting',
      message: `"${className}" is starting now!`,
      type: 'course',
      icon: '📚',
      actionUrl: meetingLink,
      data: { className, meetingLink },
    })
  );

  return Promise.all(promises);
}

export async function notifyNewMessage(
  recipientId: string,
  senderName: string,
  messagePreview: string
) {
  return createNotification({
    recipientId,
    title: `New message from ${senderName}`,
    message: messagePreview,
    type: 'message',
    icon: '💬',
    actionUrl: '/messages',
  });
}

export async function notifySystemAlert(message: string) {
  // This could be broadcast to all users or specific users
  return createNotification({
    recipientId: 'admin', // Send to system
    title: 'System Alert',
    message,
    type: 'system',
    icon: 'ℹ️',
  });
}
