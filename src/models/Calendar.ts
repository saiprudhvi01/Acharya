import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarEvent extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  eventType: 'assignment' | 'liveClass' | 'deadline' | 'exam' | 'custom';
  course?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  location?: string;
  reminders: {
    type: 'email' | 'notification';
    timeBeforeEvent: number; // in minutes
  }[];
  status: 'scheduled' | 'completed' | 'cancelled';
  color?: string;
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    eventType: {
      type: String,
      enum: ['assignment', 'liveClass', 'deadline', 'exam', 'custom'],
      default: 'custom',
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: String,
    reminders: [
      {
        type: {
          type: String,
          enum: ['email', 'notification'],
        },
        timeBeforeEvent: Number,
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    color: String,
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    recurrenceEndDate: Date,
  },
  { timestamps: true }
);

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
