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

// PUT: Update a certificate request status, upload URL, notes
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const user = await adminCheck()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json()
    const { status, certificateUrl, adminNotes } = body

    const req = await CertificateRequest.findById(id)
    if (!req) {
      return NextResponse.json({ error: 'Certificate request not found.' }, { status: 404 })
    }

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 })
      }
      req.status = status
    }

    if (certificateUrl !== undefined) {
      req.certificateUrl = certificateUrl
    }

    if (adminNotes !== undefined) {
      req.adminNotes = adminNotes
    }

    await req.save()

    return NextResponse.json({
      success: true,
      message: 'Certificate request updated successfully.',
      request: {
        id: req._id.toString(),
        status: req.status,
        certificateUrl: req.certificateUrl || null,
        adminNotes: req.adminNotes || '',
      }
    })

  } catch (error: any) {
    console.error('PUT /api/admin/certificates/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update certificate request.' }, { status: 500 })
  }
}

// DELETE a certificate request
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params
    const user = await adminCheck()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const req = await CertificateRequest.findById(id)
    if (!req) {
      return NextResponse.json({ error: 'Certificate request not found.' }, { status: 404 })
    }

    await req.deleteOne()

    return NextResponse.json({ success: true, message: 'Certificate request deleted successfully.' })

  } catch (error: any) {
    console.error('DELETE /api/admin/certificates/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete certificate request.' }, { status: 500 })
  }
}
