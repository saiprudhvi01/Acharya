import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  name: string;
  description: string;
  icon: string;
  badge: string;
  criteria: {
    type: 'coursesCompleted' | 'assignmentSubmissions' | 'perfectScore' | 'streak' | 'engagement';
    threshold: number;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  points: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  unlockedAt: Date;
  progress: number;
  notified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    name: {
      type: String,
      required: [true, 'Achievement name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    icon: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      required: true,
    },
    criteria: {
      type: {
        type: String,
        enum: ['coursesCompleted', 'assignmentSubmissions', 'perfectScore', 'streak', 'engagement'],
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'legendary'],
      default: 'common',
    },
    points: {
      type: Number,
      default: 10,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const UserAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Achievement = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
export const UserAchievement = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
