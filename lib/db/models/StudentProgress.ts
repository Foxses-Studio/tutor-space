import mongoose, { Schema, Document } from 'mongoose'

export interface IStudentProgress extends Document {
  student: mongoose.Types.ObjectId | string
  loginDates: string[] // Array of date strings YYYY-MM-DD
  createdAt: Date
  updatedAt: Date
}

const StudentProgressSchema = new Schema<IStudentProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    loginDates: { type: [String], default: [] },
  },
  { collection: 'student_progress', timestamps: true }
)

export const StudentProgress =
  mongoose.models.StudentProgress ||
  mongoose.model<IStudentProgress>('StudentProgress', StudentProgressSchema)
