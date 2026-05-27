import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Bootcamp } from '@/lib/db/models/Bootcamp'
import { User } from '@/lib/db/models/User'
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
    if (!user || !['admin', 'staff', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 })
    }

    const bootcamps = await Bootcamp.find({})
      .populate('course', 'title slug')
      .populate('students', 'name email phone')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, bootcamps })

  } catch (error: any) {
    console.error('Get Bootcamps API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch bootcamps.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, course, startDate, endDate, totalSeats, price, status } = body

    if (!title || !description || !course || !startDate || !endDate || !totalSeats) {
      return NextResponse.json({ error: 'Missing required bootcamp parameters.' }, { status: 400 })
    }

    const newBootcamp = new Bootcamp({
      title,
      description,
      course,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalSeats: Number(totalSeats),
      price: Number(price || 0),
      status: status || 'upcoming',
      students: [],
    })

    await newBootcamp.save()

    return NextResponse.json({
      success: true,
      message: 'Bootcamp successfully created.',
      bootcamp: newBootcamp,
    })

  } catch (error: any) {
    console.error('Create Bootcamp API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create bootcamp.' }, { status: 500 })
  }
}
