import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { Student } from '@/lib/db/models/Student'
import { Course } from '@/lib/db/models/Course'
import { Enrollment } from '@/lib/db/models/Enrollment'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    await connectToDatabase()

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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search') || ''

    let matchCriteria: any = {}

    if (searchQuery) {
      // Find students matching search query
      const matchingStudents = await Student.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } }
        ]
      }).select('_id').lean()
      const studentIds = matchingStudents.map((s) => s._id)

      // Find courses matching search query
      const matchingCourses = await Course.find({
        title: { $regex: searchQuery, $options: 'i' }
      }).select('_id').lean()
      const courseIds = matchingCourses.map((c) => c._id)

      matchCriteria.$or = [
        { student: { $in: studentIds } },
        { course: { $in: courseIds } }
      ]
    }

    const enrollments = await Enrollment.find(matchCriteria)
      .populate('student')
      .populate('course')
      .sort({ createdAt: -1 })
      .lean()

    const formattedEnrollments = enrollments.map((e: any) => ({
      id: e._id.toString(),
      studentName: e.student && typeof e.student === 'object' ? e.student.name : 'Unknown Student',
      studentEmail: e.student && typeof e.student === 'object' ? e.student.email : '',
      courseTitle: e.course && typeof e.course === 'object' ? e.course.title : 'Unknown Course',
      pricePaid: e.pricePaid || 0,
      paymentStatus: e.paymentStatus,
      createdAt: e.createdAt,
    }))

    return NextResponse.json({
      success: true,
      enrollments: formattedEnrollments,
    })

  } catch (error: any) {
    console.error('Admin Enrollments API GET Error:', error)
    return NextResponse.json({ error: 'Failed to fetch enrollments' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase()

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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('id')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required.' }, { status: 400 })
    }

    const deleted = await Enrollment.findByIdAndDelete(enrollmentId)

    if (!deleted) {
      return NextResponse.json({ error: 'Enrollment record not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Student unenrolled / course removed successfully.',
    })

  } catch (error: any) {
    console.error('Admin Enrollments API DELETE Error:', error)
    return NextResponse.json({ error: 'Failed to delete enrollment' }, { status: 500 })
  }
}
