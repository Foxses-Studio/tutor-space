import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Submission } from '@/lib/db/models/Submission'
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

// PUT: Grade a submission
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const user = await adminCheck()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { marksObtained, feedback, googleDriveLink } = body

    if (typeof marksObtained !== 'number') {
      return NextResponse.json({ error: 'marksObtained (number) is required.' }, { status: 400 })
    }

    const submission = await Submission.findById(id)
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
    }

    submission.marksObtained = marksObtained
    submission.feedback = feedback || ''
    if (googleDriveLink !== undefined) {
      submission.googleDriveLink = googleDriveLink
    }
    submission.status = 'graded'
    submission.gradedAt = new Date()

    await submission.save()

    return NextResponse.json({ success: true, submission })
  } catch (error: any) {
    console.error('PUT /api/admin/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update submission grade.' }, { status: 500 })
  }
}

// DELETE: Delete a submission
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const user = await adminCheck()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await params
    await Submission.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete submission.' }, { status: 500 })
  }
}
