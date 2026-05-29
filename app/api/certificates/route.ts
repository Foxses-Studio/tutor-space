import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Enrollment } from '@/lib/db/models/Enrollment'
import { Course } from '@/lib/db/models/Course'
import { Lesson } from '@/lib/db/models/Lesson'
import { CertificateRequest } from '@/lib/db/models/CertificateRequest'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const studentToken = cookieStore.get('student-token')?.value
  const payloadToken = cookieStore.get('payload-token')?.value

  if (studentToken) {
    const decoded = verifyToken(studentToken)
    if (decoded?.id) return decoded.id
  }
  if (payloadToken) {
    const decoded = verifyToken(payloadToken)
    if (decoded?.id) return decoded.id
  }
  return null
}

// GET: Fetch all certificate requests for the logged-in student
export async function GET() {
  try {
    await connectToDatabase()
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const requests = await CertificateRequest.find({ student: userId })
      .populate('course', 'title slug')
      .sort({ createdAt: -1 })
      .lean()

    const formatted = requests.map((r: any) => ({
      id: r._id.toString(),
      courseId: r.course?._id?.toString(),
      courseTitle: r.course?.title || 'Unknown Course',
      courseSlug: r.course?.slug || '',
      status: r.status,
      progress: r.progress,
      certificateUrl: r.certificateUrl || null,
      adminNotes: r.adminNotes || '',
      createdAt: r.createdAt,
    }))

    return NextResponse.json({ success: true, requests: formatted })
  } catch (error: any) {
    console.error('GET /api/certificates error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch certificates.' }, { status: 500 })
  }
}

// POST: Create a new certificate request for a course
export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required.' }, { status: 400 })
    }

    // Check course existence
    const course = await Course.findById(courseId).lean()
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found.' }, { status: 404 })
    }

    // Check active enrollment
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      paymentStatus: 'completed',
    }).lean()

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'You are not enrolled in this course.' }, { status: 403 })
    }

    // Check existing request
    const existingRequest = await CertificateRequest.findOne({
      student: userId,
      course: courseId,
    }).lean()

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        message: 'Certificate request already exists.',
        request: {
          id: existingRequest._id.toString(),
          status: existingRequest.status,
          certificateUrl: existingRequest.certificateUrl || null,
        }
      })
    }

    // Calculate current progress
    const totalLessons = await Lesson.countDocuments({ course: courseId })
    const completedLessonsCount = enrollment.completedLessons?.length || 0
    const progress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0

    // Create certificate request
    const newRequest = await CertificateRequest.create({
      student: userId,
      course: courseId,
      status: 'pending',
      progress,
    })

    return NextResponse.json({
      success: true,
      message: 'Certificate request created successfully.',
      request: {
        id: newRequest._id.toString(),
        status: newRequest.status,
        progress: newRequest.progress,
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('POST /api/certificates error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit certificate request.' }, { status: 500 })
  }
}
