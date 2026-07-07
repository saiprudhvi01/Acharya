import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssignment extends Document {
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  maxMarks: number;
  attachments?: {
    title: string;
    url: string;
  }[];
  submissions: {
    student: mongoose.Types.ObjectId;
    fileUrl: string;
    submittedAt: Date;
    marks?: number;
    feedback?: string;
    gradedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [0, 'Marks cannot be negative'],
    },
    attachments: [
      {
        title: String,
        url: String,
      },
    ],
    submissions: [
      {
        student: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        fileUrl: String,
        submittedAt: Date,
        marks: Number,
        feedback: String,
        gradedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Assignment: Model<IAssignment> = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
