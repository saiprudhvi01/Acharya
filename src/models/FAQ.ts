import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  category: string;
  question: string;
  answer: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedQuestions: mongoose.Types.ObjectId[];
  tags: string[];
  author: mongoose.Types.ObjectId;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHelpArticle extends Document {
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  views: number;
  helpful: number;
  notHelpful: number;
  author: mongoose.Types.ObjectId;
  thumbnail?: string;
  isPublished: boolean;
  order: number;
  relatedArticles: mongoose.Types.ObjectId[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['general', 'courses', 'payments', 'technical', 'account'],
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      unique: true,
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    relatedQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'FAQ',
      },
    ],
    tags: [String],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const HelpArticleSchema = new Schema<IHelpArticle>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    subcategory: String,
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    thumbnail: String,
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    relatedArticles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'HelpArticle',
      },
    ],
    tags: [String],
  },
  { timestamps: true }
);

export const FAQ = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);
export const HelpArticle = mongoose.models.HelpArticle || mongoose.model<IHelpArticle>('HelpArticle', HelpArticleSchema);
