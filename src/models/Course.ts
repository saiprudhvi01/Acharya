import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  teacher: mongoose.Types.ObjectId;
  category: string;
  subject: string;
  duration: string;
  price: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  coverImage?: string;
  thumbnail?: string;
  videos: {
    title: string;
    url: string;
    duration: number;
    order: number;
  }[];
  materials: {
    title: string;
    url: string;
    type: 'pdf' | 'note' | 'resource';
  }[];
  liveClasses: {
    title: string;
    date: Date;
    meetingLink: string;
    meetingId: string;
    isCompleted: boolean;
  }[];
  ratings: number;
  reviewsCount: number;
  enrolledStudents: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    coverImage: String,
    thumbnail: String,
    videos: [
      {
        title: String,
        url: String,
        duration: Number,
        order: Number,
      },
    ],
    materials: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'note', 'resource'],
        },
      },
    ],
    liveClasses: [
      {
        title: String,
        date: Date,
        meetingLink: String,
        meetingId: String,
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
