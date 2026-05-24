import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Lesson } from '@/lib/db/models/Lesson'
import { Course } from '@/lib/db/models/Course'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

async function authCheck() {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')?.value
  if (!payloadToken) return null
  const decoded = verifyToken(payloadToken)
  if (!decoded?.id) return null
  return await User.findById(decoded.id).lean()
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const user = await authCheck()
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    if (!['admin', 'instructor'].includes(user.role)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const lesson = await Lesson.findById(id)
    if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })

    // Ownership check
    const course = await Course.findById(lesson.course).lean()
    if (user.role === 'instructor' && (course as any)?.instructor.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden: Not your course.' }, { status: 403 })
    }

    const body = await request.json()
    Object.assign(lesson, {
      title: body.title ?? lesson.title,
      slug: body.slug ?? lesson.slug,
      order: body.order ?? lesson.order,
      lessonType: body.lessonType ?? lesson.lessonType,
      videoUrl: body.videoUrl ?? lesson.videoUrl,
      livePlatform: body.livePlatform ?? lesson.livePlatform,
      liveUrl: body.liveUrl ?? lesson.liveUrl,
      liveDate: body.liveDate ? new Date(body.liveDate) : lesson.liveDate,
      content: body.content ?? lesson.content,
      duration: body.duration ? Number(body.duration) : lesson.duration,
      isPreviewable: body.isPreviewable ?? lesson.isPreviewable,
    })
    await lesson.save()

    return NextResponse.json({ success: true, lesson })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update lesson.' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const user = await authCheck()
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    if (!['admin', 'instructor'].includes(user.role)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

    const lesson = await Lesson.findById(id)
    if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })

    // Ownership check
    if (user.role === 'instructor') {
      const course = await Course.findById(lesson.course).lean()
      if ((course as any)?.instructor.toString() !== user._id.toString()) {
        return NextResponse.json({ error: 'Forbidden: Not your course.' }, { status: 403 })
      }
    }

    await lesson.deleteOne()
    return NextResponse.json({ success: true, message: 'Lesson deleted successfully.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete lesson.' }, { status: 500 })
  }
}
