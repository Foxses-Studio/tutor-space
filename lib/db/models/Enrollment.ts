import mongoose, { Schema, Document } from 'mongoose'

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId | string
  course: mongoose.Types.ObjectId | string
  paymentStatus: 'pending' | 'completed' | 'refunded'
  pricePaid: number
  paymentReference?: string
  createdAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending', required: true },
    pricePaid: { type: Number, required: true, min: 0 },
    paymentReference: String,
  },
  { collection: 'enrollments', timestamps: true }
)

export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
