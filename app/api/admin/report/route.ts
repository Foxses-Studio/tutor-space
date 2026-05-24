import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Enrollment } from '@/lib/db/models/Enrollment'
import { Student } from '@/lib/db/models/Student'
import { Course } from '@/lib/db/models/Course'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    await connectToDatabase()
    
    const cookieStore = await cookies()
    const payloadToken = cookieStore.get('payload-token')?.value

    const decoded = payloadToken ? verifyToken(payloadToken) : null
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch all enrollments with course and student data populated
    const enrollments = await Enrollment.find()
      .populate('student')
      .populate('course')
      .exec()

    // Aggregate stats
    const totalEnrollments = enrollments.length
    const completedEnrollments = enrollments.filter((e) => e.paymentStatus === 'completed')
    const pendingEnrollments = enrollments.filter((e) => e.paymentStatus === 'pending')
    const refundedEnrollments = enrollments.filter((e) => e.paymentStatus === 'refunded')

    const totalIncome = completedEnrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0)
    const totalRefunded = refundedEnrollments.reduce((sum, e) => sum + (e.pricePaid || 0), 0)

    // Income by course
    const courseMap: Record<string, { title: string; enrollments: number; income: number }> = {}
    for (const e of enrollments) {
      const course = e.course as any
      if (!course || typeof course !== 'object') continue
      const id = course._id.toString()
      if (!courseMap[id]) {
        courseMap[id] = { title: course.title || 'Unknown', enrollments: 0, income: 0 }
      }
      courseMap[id].enrollments += 1
      if (e.paymentStatus === 'completed') {
        courseMap[id].income += e.pricePaid || 0
      }
    }

    const courseBreakdown = Object.values(courseMap).sort((a, b) => b.income - a.income)

    // Unique student count
    const uniqueStudentIds = new Set(
      enrollments.map((e) => {
        const s = e.student as any
        return typeof s === 'object' ? s?._id.toString() : s
      })
    )

    // Recent 10 enrollments
    const recentEnrollments = [...enrollments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((e) => {
        const student = e.student as any
        const course = e.course as any
        return {
          id: e._id.toString(),
          studentName: typeof student === 'object' ? student?.name : 'Unknown',
          studentEmail: typeof student === 'object' ? student?.email : '',
          courseTitle: typeof course === 'object' ? course?.title : 'Unknown',
          pricePaid: e.pricePaid || 0,
          paymentStatus: e.paymentStatus,
          createdAt: e.createdAt,
        }
      })

    return NextResponse.json({
      summary: {
        totalEnrollments,
        completedEnrollments: completedEnrollments.length,
        pendingEnrollments: pendingEnrollments.length,
        refundedEnrollments: refundedEnrollments.length,
        totalIncome,
        totalRefunded,
        uniqueStudents: uniqueStudentIds.size,
      },
      courseBreakdown,
      recentEnrollments,
    })
  } catch (error) {
    console.error('Admin report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
