import mongoose, { Schema, Document } from 'mongoose'

export interface IBlog extends Document {
  title: string
  author: mongoose.Types.ObjectId | string
  publishedDate?: Date
  coverImage?: mongoose.Types.ObjectId | string
  content: any // Lexical rich text
  tags?: Array<{ tag: string }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedDate: Date,
    coverImage: { type: Schema.Types.ObjectId, ref: 'Media' },
    content: { type: Schema.Types.Mixed, required: true }, // Lexical JSON
    tags: [
      {
        tag: { type: String, required: true },
      },
    ],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
    },
  },
  { collection: 'blogs', timestamps: true }
)

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema)
