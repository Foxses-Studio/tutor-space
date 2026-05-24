import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params

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
      return NextResponse.json({ error: 'Forbidden: Admins only.' }, { status: 403 })
    }

    // Don't allow an admin to delete their own account
    if (user._id.toString() === id) {
      return NextResponse.json({ error: 'Forbidden: You cannot delete your own admin account.' }, { status: 400 })
    }

    await User.findByIdAndDelete(id)

    return NextResponse.json({
      success: true,
      message: 'Staff member successfully deleted.',
    })
  } catch (error: any) {
    console.error('Delete Staff API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete staff member.' }, { status: 500 })
  }
}
