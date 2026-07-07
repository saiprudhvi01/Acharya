import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  subscription?: 'basic' | 'standard' | 'premium';
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'subscription' | 'course';
  teacherShare?: number;
  platformShare?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    subscription: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['subscription', 'course'],
      required: true,
    },
    teacherShare: Number,
    platformShare: Number,
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
