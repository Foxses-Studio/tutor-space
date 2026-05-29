import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Lesson } from '@/lib/db/models/Lesson'
import { Course } from '@/lib/db/models/Course'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import { createZoomMeeting } from '@/lib/zoom'

// GET all lessons (optionally filtered by courseId)
export async function GET(request: Request) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const query: any = courseId ? { course: courseId } : {}
    const lessons = await Lesson.find(query)
      .populate({ path: 'course', select: 'title slug status instructor' })
      .sort({ course: 1, order: 1 })
      .lean()

    return NextResponse.json({ success: true, lessons })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch lessons.' }, { status: 500 })
  }
}

// POST create new lesson
export async function POST(request: Request) {
  try {
    await connectToDatabase()

    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')?.value
    if (!payloadToken) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const decoded = verifyToken(payloadToken)
    if (!decoded?.id) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })

    const user = await User.findById(decoded.id).lean()
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, slug, course: courseId, order, lessonType, videoUrl, livePlatform, liveUrl, liveDate, content, duration, isPreviewable, autoGenerateZoom, quizQuestions } = body

    if (!title || !slug || !courseId || !order || !duration) {
      return NextResponse.json({ error: 'Missing required lesson fields.' }, { status: 400 })
    }

    // Verify course ownership
    const course = await Course.findById(courseId).lean()
    if (!course) return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    if (user.role === 'instructor' && (course as any).instructor.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden: You do not own this course.' }, { status: 403 })
    }

    // Check slug uniqueness
    const existing = await Lesson.findOne({ slug }).lean()
    if (existing) return NextResponse.json({ error: 'Lesson slug already exists.' }, { status: 400 })

    let actualLiveUrl = liveUrl
    const finalAutoGenerate = !!(lessonType === 'live' && livePlatform === 'zoom' && autoGenerateZoom)

    if (finalAutoGenerate) {
      if (!liveDate) {
        return NextResponse.json({ error: 'Scheduled Time & Date is required to auto-generate a Zoom meeting.' }, { status: 400 })
      }

      const zoomDetails = await createZoomMeeting(title, liveDate, Number(duration) || 60)
      if (!zoomDetails) {
        return NextResponse.json({ error: 'Failed to auto-generate Zoom meeting link. Please verify your Zoom credentials.' }, { status: 500 })
      }
      actualLiveUrl = zoomDetails.joinUrl
    }

    const newLesson = new Lesson({
      title, slug, course: courseId, order, lessonType: lessonType || 'recorded',
      videoUrl, livePlatform, liveUrl: actualLiveUrl,
      liveDate: liveDate ? new Date(liveDate) : undefined,
      content, duration: Number(duration),
      isPreviewable: isPreviewable || false,
      autoGenerateZoom: finalAutoGenerate,
      quizQuestions: lessonType === 'quiz' ? quizQuestions : undefined,
    })
    await newLesson.save()

    return NextResponse.json({ success: true, lesson: newLesson }, { status: 201 })
  } catch (error: any) {
    console.error('Create Lesson Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create lesson.' }, { status: 500 })
  }
}
