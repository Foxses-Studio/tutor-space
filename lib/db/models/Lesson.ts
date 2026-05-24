import mongoose, { Schema, Document } from 'mongoose'

export interface ILesson extends Document {
  title: string
  slug: string
  course: mongoose.Types.ObjectId | string
  order: number
  lessonType: 'recorded' | 'live'
  videoUrl?: string
  videoFile?: mongoose.Types.ObjectId | string
  livePlatform?: 'zoom' | 'meet' | 'teams' | 'other'
  autoGenerateZoom: boolean
  liveUrl?: string
  liveDate?: Date
  content?: any // Lexical rich text
  duration: number
  isPreviewable: boolean
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

const LessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, required: true, min: 1 },
    lessonType: { type: String, enum: ['recorded', 'live'], default: 'recorded', required: true },
    videoUrl: String,
    videoFile: { type: Schema.Types.ObjectId, ref: 'Video' },
    livePlatform: { type: String, enum: ['zoom', 'meet', 'teams', 'other'], default: 'zoom' },
    autoGenerateZoom: { type: Boolean, default: false },
    liveUrl: String,
    liveDate: Date,
    content: Schema.Types.Mixed, // Lexical RichText
    duration: { type: Number, required: true },
    isPreviewable: { type: Boolean, default: false },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
    },
  },
  { collection: 'lessons', timestamps: true }
)

export const Lesson = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema)
