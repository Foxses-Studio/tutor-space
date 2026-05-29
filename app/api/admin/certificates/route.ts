import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { CertificateRequest } from '@/lib/db/models/CertificateRequest'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

async function adminCheck() {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')?.value
  if (!payloadToken) return null

  const decoded = verifyToken(payloadToken)
  if (!decoded?.id) return null

  const user = await User.findById(decoded.id).lean()
  if (!user || !['admin', 'staff', 'instructor'].includes(user.role)) return null

  return user
}

// GET all certificate requests for administration panel
export async function GET() {
  try {
    await connectToDatabase()
    const user = await adminCheck()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const requests = await CertificateRequest.find()
      .populate('student', 'name email phone')
      .populate('course', 'title price')
      .sort({ createdAt: -1 })
      .lean()

    const formatted = requests.map((r: any) => ({
      id: r._id.toString(),
      student: r.student ? {
        id: r.student._id.toString(),
        name: r.student.name,
        email: r.student.email,
        phone: r.student.phone || 'N/A',
      } : null,
      course: r.course ? {
        id: r.course._id.toString(),
        title: r.course.title,
      } : null,
      status: r.status,
      progress: r.progress,
      certificateUrl: r.certificateUrl || null,
      adminNotes: r.adminNotes || '',
      createdAt: r.createdAt,
    }))

    return NextResponse.json({ success: true, requests: formatted })
  } catch (error: any) {
    console.error('GET /api/admin/certificates error:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate requests.' }, { status: 500 })
  }
}
