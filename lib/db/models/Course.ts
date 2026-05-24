import mongoose, { Schema, Document } from 'mongoose'

export interface ICourse extends Document {
  title: string
  slug: string
  summary: string
  description: any // Lexical JSON
  price: number
  thumbnail: mongoose.Types.ObjectId | string
  category: mongoose.Types.ObjectId | string
  instructor: mongoose.Types.ObjectId | string
  status: 'draft' | 'published'
  duration?: string
  level: 'all' | 'beginner' | 'intermediate' | 'advanced'
  meetingLink?: string
  whatYouWillLearn?: Array<{ outcome: string }>
  requirements?: Array<{ requirement: string }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    description: { type: Schema.Types.Mixed, required: true }, // Lexical JSON structure
    price: { type: Number, required: true, min: 0 },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', required: true },
    duration: { type: String },
    level: { type: String, enum: ['all', 'beginner', 'intermediate', 'advanced'], default: 'all', required: true },
    meetingLink: { type: String },
    whatYouWillLearn: [
      {
        outcome: { type: String, required: true },
      },
    ],
    requirements: [
      {
        requirement: { type: String, required: true },
      },
    ],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
    },
  },
  { collection: 'courses', timestamps: true }
)

export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
