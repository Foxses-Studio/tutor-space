import mongoose, { Schema, Document } from 'mongoose'

export interface IBootcamp extends Document {
  title: string
  description: string
  course: mongoose.Types.ObjectId | string // Associated Course
  startDate: Date
  endDate: Date
  totalSeats: number
  price: number
  status: 'upcoming' | 'active' | 'completed'
  students: Array<mongoose.Types.ObjectId | string> // Students who booked a seat
  createdAt: Date
  updatedAt: Date
}

const BootcampSchema = new Schema<IBootcamp>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalSeats: { type: Number, required: true, default: 50, min: 1 },
    price: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  },
  { collection: 'bootcamps', timestamps: true }
)

export const Bootcamp = mongoose.models.Bootcamp || mongoose.model<IBootcamp>('Bootcamp', BootcampSchema)
