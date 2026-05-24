import mongoose, { Schema, Document } from 'mongoose'

export interface IMedia extends Document {
  filename: string
  mimeType: string
  filesize?: number
  width?: number
  height?: number
  alt: string
  url?: string
  sizes?: {
    thumbnail?: {
      url?: string
      width?: number
      height?: number
      filename?: string
    }
    card?: {
      url?: string
      width?: number
      height?: number
      filename?: string
    }
    hero?: {
      url?: string
      width?: number
      height?: number
      filename?: string
    }
  }
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    filesize: { type: Number },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, required: true },
    url: { type: String },
    sizes: {
      thumbnail: {
        url: String,
        width: Number,
        height: Number,
        filename: String,
      },
      card: {
        url: String,
        width: Number,
        height: Number,
        filename: String,
      },
      hero: {
        url: String,
        width: Number,
        height: Number,
        filename: String,
      },
    },
  },
  { collection: 'media', timestamps: true }
)

export const Media = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema)
