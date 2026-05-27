import mongoose, { Schema, Document } from 'mongoose'

export interface IAttendanceRecord {
  student: mongoose.Types.ObjectId | string
  status: 'present' | 'absent' | 'excused'
}

export interface IAttendance extends Document {
  batch: mongoose.Types.ObjectId | string
  date: Date
  instructor: mongoose.Types.ObjectId | string
  records: IAttendanceRecord[]
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'excused'], default: 'present', required: true },
  },
  { _id: false }
)

const AttendanceSchema = new Schema<IAttendance>(
  {
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    date: { type: Date, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    records: [AttendanceRecordSchema],
    remarks: { type: String },
  },
  { collection: 'attendances', timestamps: true }
)

// Compound index to ensure one attendance log per batch per day
AttendanceSchema.index({ batch: 1, date: 1 }, { unique: true })

export const Attendance = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)
