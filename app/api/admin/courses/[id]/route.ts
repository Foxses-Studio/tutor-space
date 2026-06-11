import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Course } from '@/lib/db/models/Course'
import { Lesson } from '@/lib/db/models/Lesson'
import { Review } from '@/lib/db/models/Review'
import { Enrollment } from '@/lib/db/models/Enrollment'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

// GET a specific course
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params

    const course = await Course.findById(id)
      .populate('category')
      .populate('instructor')
      .populate('thumbnail')
      .lean()

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    return NextResponse.json({ success: true, course })
  } catch (error: any) {
    console.error('Get Course API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch course.' }, { status: 500 })
  }
}

// DELETE a specific course (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params

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
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only.' }, { status: 403 })
    }

    // 2. Delete related documents
    await Promise.all([
      Course.findByIdAndDelete(id),
      Lesson.deleteMany({ course: id }),
      Review.deleteMany({ course: id }),
      Enrollment.deleteMany({ course: id }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Course and all related items (lessons, reviews, enrollments) successfully deleted.',
    })

  } catch (error: any) {
    console.error('Delete Course API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete course.' }, { status: 500 })
  }
}

// PUT (Update) a specific course (Admin and Instructor owner)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const { id } = await params

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

    // 2. Find course
    const course = await Course.findById(id)
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    // Instructor owner verification
    if (user.role === 'instructor' && course.instructor.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden: You do not own this course.' }, { status: 403 })
    }

    // 3. Parse and validate body
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
      studyMaterials,
      modules,
    } = body

    if (!title || !slug || !summary || !description || price === undefined || !thumbnail || !category) {
      return NextResponse.json({ error: 'Missing required course parameters.' }, { status: 400 })
    }

    // Check slug uniqueness (excluding current course)
    const existingCourse = await Course.findOne({ slug, _id: { $ne: id } }).lean()
    if (existingCourse) {
      return NextResponse.json({ error: 'Slug must be unique. A course with this slug already exists.' }, { status: 400 })
    }

    // 4. Perform Mongoose Update
    course.title = title
    course.slug = slug
    course.summary = summary
    course.description = description
    course.price = Number(price)
    course.thumbnail = thumbnail
    course.category = category
    // Admin can reassign instructors, instructor cannot reassign themselves
    if (user.role === 'admin' && instructor) {
      course.instructor = instructor
    }
    course.status = status || course.status
    course.duration = duration
    course.level = level || course.level
    course.whatYouWillLearn = whatYouWillLearn || []
    course.requirements = requirements || []
    course.seo = seo || {}
    course.studyMaterials = studyMaterials || []
    course.modules = modules || []

    await course.save()

    return NextResponse.json({
      success: true,
      message: 'Course successfully updated.',
      course,
    })

  } catch (error: any) {
    console.error('Update Course API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update course.' }, { status: 500 })
  }
}
