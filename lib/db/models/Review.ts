import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  course: mongoose.Types.ObjectId | string
  student: mongoose.Types.ObjectId | string
  rating: '1' | '2' | '3' | '4' | '5'
  comment: string
  status: 'pending' | 'approved' | 'rejected'
}

const ReviewSchema = new Schema<IReview>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    rating: { type: String, enum: ['1', '2', '3', '4', '5'], default: '5', required: true },
    comment: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
  },
  { collection: 'reviews', timestamps: true }
)

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
