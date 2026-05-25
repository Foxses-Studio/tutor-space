import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Coupon } from '@/lib/db/models/Coupon'

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required.' }, { status: 400 })
    }

    const uppercaseCode = code.toUpperCase().trim()

    const coupon = await Coupon.findOne({ code: uppercaseCode })
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code.' }, { status: 404 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ success: false, error: 'This coupon is no longer active.' }, { status: 400 })
    }

    if (coupon.expirationDate && new Date() > new Date(coupon.expirationDate)) {
      return NextResponse.json({ success: false, error: 'This coupon has expired.' }, { status: 400 })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit.' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      }
    })
  } catch (error: any) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to validate coupon.' }, { status: 500 })
  }
}
