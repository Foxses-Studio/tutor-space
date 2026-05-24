import mongoose, { Schema, Document } from 'mongoose'

export interface IFAQ extends Document {
  question: string
  answer: string
  order: number
  isActive: boolean
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { collection: 'faqs', timestamps: true }
)

export const FAQ = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema)
