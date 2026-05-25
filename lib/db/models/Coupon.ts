import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  expirationDate?: Date
  isActive: boolean
  maxUses?: number
  usedCount: number
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed', required: true },
    discountValue: { type: Number, required: true, min: 0 },
    expirationDate: { type: Date },
    isActive: { type: Boolean, default: true, required: true },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0, required: true },
  },
  { collection: 'coupons', timestamps: true }
)

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
