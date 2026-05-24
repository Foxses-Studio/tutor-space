import mongoose, { Schema, Document } from 'mongoose'

export interface IVideo extends Document {
  filename: string
  mimeType: string
  filesize?: number
  url?: string
  title: string
}

const VideoSchema = new Schema<IVideo>(
  {
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    filesize: { type: Number },
    url: { type: String },
    title: { type: String, required: true },
  },
  { collection: 'videos', timestamps: true }
)

export const Video = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema)
