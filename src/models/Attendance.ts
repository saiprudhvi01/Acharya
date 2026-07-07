import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  course: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  liveClassId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'absent',
    },
    liveClassId: String,
  },
  {
    timestamps: true,
  }
);

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
