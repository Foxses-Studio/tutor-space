import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Media } from '@/lib/db/models/Media'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    await connectToDatabase()
    const media = await Media.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ success: true, media })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase()

    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded?.id) return NextResponse.json({ error: 'Invalid session.' }, { status: 401 })

    const user = await User.findById(decoded.id).lean()
    if (!user || !['admin', 'staff'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Media ID required.' }, { status: 400 })

    await Media.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Media record removed from database.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
