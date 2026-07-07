import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  senderId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'assignment' | 'message' | 'achievement' | 'course' | 'system' | 'payment';
  actionUrl?: string;
  icon?: string;
  isRead: boolean;
  readAt?: Date;
  data?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,
      enum: ['assignment', 'message', 'achievement', 'course', 'system', 'payment'],
      default: 'system',
    },
    actionUrl: String,
    icon: String,
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    data: {
      type: Schema.Types.Mixed,
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

// TTL index to auto-delete old notifications after 30 days
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
