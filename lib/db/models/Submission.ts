import mongoose, { Schema, Document } from 'mongoose'

export interface ISubmission extends Document {
  student: mongoose.Types.ObjectId | string
  course: mongoose.Types.ObjectId | string
  lesson: mongoose.Types.ObjectId | string
  type: 'quiz' | 'assignment'
  googleDriveLink?: string
  status: 'pending' | 'graded'
  feedback?: string
  totalMarks: number
  marksObtained: number
  quizCorrectAnswers?: number
  quizTotalQuestions?: number
  submittedAt: Date
  gradedAt?: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    type: { type: String, enum: ['quiz', 'assignment'], required: true },
    googleDriveLink: String,
    status: { type: String, enum: ['pending', 'graded'], default: 'pending', required: true },
    feedback: String,
    totalMarks: { type: Number, required: true, min: 0 },
    marksObtained: { type: Number, required: true, min: 0, default: 0 },
    quizCorrectAnswers: Number,
    quizTotalQuestions: Number,
    submittedAt: { type: Date, default: Date.now },
    gradedAt: Date,
  },
  { collection: 'submissions', timestamps: true }
)

// Ensure one submission per student per lesson
SubmissionSchema.index({ student: 1, lesson: 1 }, { unique: true })

export const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)
