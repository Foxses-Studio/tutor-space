import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Attendance } from '@/lib/db/models/Attendance'
import { Batch } from '@/lib/db/models/Batch'
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
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch')
    const dateStr = searchParams.get('date')

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID parameter is required.' }, { status: 400 })
    }

    const batch = await Batch.findById(batchId).lean()
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 444 })
    }

    // Instructors can only view attendance for their own batches
    if (user.role === 'instructor' && batch.instructor.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden: You can only view attendance for your own batches.' }, { status: 403 })
    }

    const query: any = { batch: batchId }
    if (dateStr) {
      const startOfDay = new Date(dateStr)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(dateStr)
      endOfDay.setHours(23, 59, 59, 999)
      query.date = { $gte: startOfDay, $lte: endOfDay }
    }

    const attendanceLogs = await Attendance.find(query)
      .populate('records.student', 'name email phone')
      .populate('instructor', 'name email')
      .sort({ date: -1 })
      .lean()

    return NextResponse.json({ success: true, attendanceLogs })

  } catch (error: any) {
    console.error('Get Attendance API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance.' }, { status: 500 })
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
    const { batchId, date, records, remarks } = body

    if (!batchId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing required attendance parameters.' }, { status: 400 })
    }

    const batch = await Batch.findById(batchId)
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found.' }, { status: 444 })
    }

    // Instructors can only submit attendance for their own batches
    if (user.role === 'instructor' && batch.instructor.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden: You can only manage attendance for your own batches.' }, { status: 403 })
    }

    const attendanceDate = new Date(date)
    const startOfDay = new Date(attendanceDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(attendanceDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Upsert logic: Find existing attendance for this batch on this day
    let attendance = await Attendance.findOne({
      batch: batchId,
      date: { $gte: startOfDay, $lte: endOfDay }
    })

    if (attendance) {
      // Update existing record
      attendance.records = records
      if (remarks !== undefined) attendance.remarks = remarks
      attendance.instructor = user._id.toString()
      await attendance.save()
    } else {
      // Create new record
      attendance = new Attendance({
        batch: batchId,
        date: startOfDay,
        instructor: user._id.toString(),
        records,
        remarks: remarks || '',
      })
      await attendance.save()
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance log successfully saved.',
      attendance,
    })

  } catch (error: any) {
    console.error('Save Attendance API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to save attendance.' }, { status: 500 })
  }
}
