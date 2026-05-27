import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Course } from '@/lib/db/models/Course'
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

    let query = {}
    if (user.role === 'instructor') {
      query = { instructor: user._id }
    }

    const courses = await Course.find(query).select('title _id').sort({ title: 1 }).lean()

    return NextResponse.json({ success: true, courses })
  } catch (error: any) {
    console.error('GET Courses API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch courses.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()

    // 1. Session verification
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

    // 2. Parse and validate parameters
    const body = await request.json()
    const {
      title,
      slug,
      summary,
      description,
      price,
      thumbnail,
      category,
      instructor,
      status,
      duration,
      level,
      whatYouWillLearn,
      requirements,
      seo,
    } = body

    if (!title || !slug || !summary || !description || price === undefined || !thumbnail || !category) {
      return NextResponse.json({ error: 'Missing required course parameters.' }, { status: 400 })
    }

    // Check slug uniqueness
    const existingCourse = await Course.findOne({ slug }).lean()
    if (existingCourse) {
      return NextResponse.json({ error: 'Slug must be unique. A course with this slug already exists.' }, { status: 400 })
    }

    // Force instructor ID for instructor role
    const finalInstructor = user.role === 'instructor' ? user._id.toString() : (instructor || user._id.toString())

    // 3. Create course document
    const newCourse = new Course({
      title,
      slug,
      summary,
      description,
      price: Number(price),
      thumbnail,
      category,
      instructor: finalInstructor,
      status: status || 'draft',
      duration,
      level: level || 'all',
      whatYouWillLearn: whatYouWillLearn || [],
      requirements: requirements || [],
      seo: seo || {},
    })

    await newCourse.save()

    return NextResponse.json({
      success: true,
      message: 'Course successfully created.',
      course: newCourse,
    }, { status: 211 }) // Status 201 Created

  } catch (error: any) {
    console.error('Create Course API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create course.' }, { status: 500 })
  }
}
