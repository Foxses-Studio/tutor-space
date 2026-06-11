import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Review } from '@/lib/db/models/Review'
import { Course } from '@/lib/db/models/Course'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    // 1. Session verification
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')?.value

    if (!payloadToken) {
      return NextResponse.json({ error: 'Unauthorized: Session missing.' }, { status: 401 })
    }

    const decoded = verifyToken(payloadToken)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Unauthorized: Session invalid.' }, { status: 401 })
    }

    const user = await User.findById(decoded.id).lean()
    if (!user || !['admin', 'staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 })
    }

    // 2. Parse request parameters
    const body = await request.json()
    const { reviewId, status } = body

    if (!reviewId || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters provided.' }, { status: 400 })
    }

    // 3. Update review status in Mongoose
    const review = await Review.findById(reviewId)
    if (!review) {
      return NextResponse.json({ error: 'Review document not found.' }, { status: 404 })
    }

    review.status = status
    await review.save()

    // Fetch the related course to get its slug for revalidation
    const course = await Course.findById(review.course).lean()
    const slug = (course as any)?.slug

    // Revalidate paths for the public frontend to ensure changes are immediately visible
    if (slug) {
      try {
        revalidatePath('/')
        revalidatePath('/courses')
        revalidatePath('/instructors')
        revalidatePath(`/courses/${slug}`)
      } catch (cacheError) {
        console.error('Failed to revalidate paths during review moderation:', cacheError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Review successfully updated to ${status}.`,
      review: {
        id: review._id.toString(),
        status: review.status,
      },
    })

  } catch (error: any) {
    console.error('Moderation API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update review status.' }, { status: 500 })
  }
}
