import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Bootcamp } from '@/lib/db/models/Bootcamp'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

export async function PUT(
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
    if (!user || !['admin', 'staff', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, course, startDate, endDate, totalSeats, price, status, students } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (course !== undefined) updateData.course = course
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (totalSeats !== undefined) updateData.totalSeats = Number(totalSeats)
    if (price !== undefined) updateData.price = Number(price)
    if (status !== undefined) updateData.status = status
    if (students !== undefined) updateData.students = students

    const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('course', 'title slug').populate('students', 'name email phone')

    if (!updatedBootcamp) {
      return NextResponse.json({ error: 'Bootcamp not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Bootcamp successfully updated.',
      bootcamp: updatedBootcamp,
    })

  } catch (error: any) {
    console.error('Update Bootcamp API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update bootcamp.' }, { status: 500 })
  }
}

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

    const deleted = await Bootcamp.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Bootcamp not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Bootcamp successfully deleted.',
    })

  } catch (error: any) {
    console.error('Delete Bootcamp API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete bootcamp.' }, { status: 500 })
  }
}
