import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password?: string
  name: string
  phone?: string
  profilePic?: mongoose.Types.ObjectId | string
  role: 'admin' | 'staff' | 'instructor'
  resetPasswordToken?: string
  resetPasswordExpiration?: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // Hashed password
    name: { type: String, required: true },
    phone: { type: String },
    profilePic: { type: Schema.Types.ObjectId, ref: 'Media' },
    role: { type: String, enum: ['admin', 'staff', 'instructor'], default: 'staff', required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpiration: { type: Date },
  },
  { collection: 'users', timestamps: true }
)

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
