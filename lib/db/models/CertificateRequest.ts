import mongoose, { Schema, Document } from 'mongoose'

export interface ICertificateRequest extends Document {
  student: mongoose.Types.ObjectId | string
  course: mongoose.Types.ObjectId | string
  status: 'pending' | 'approved' | 'rejected'
  progress: number
  certificateUrl?: string
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

const CertificateRequestSchema = new Schema<ICertificateRequest>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', required: true },
    progress: { type: Number, required: true, default: 0 },
    certificateUrl: String,
    adminNotes: String,
  },
  { collection: 'certificate_requests', timestamps: true }
)

export const CertificateRequest =
  mongoose.models.CertificateRequest ||
  mongoose.model<ICertificateRequest>('CertificateRequest', CertificateRequestSchema)
