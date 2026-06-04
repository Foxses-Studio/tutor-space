import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

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
    if (!user || !['admin', 'staff', 'instructor'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 })
    }

    // 2. Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    // 3. Process file info and paths
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const originalName = file.name
    const fileExt = path.extname(originalName)
    const baseName = path.basename(originalName, fileExt)
      .replace(/[^a-zA-Z0-9]/g, '-') // replace non-alphanumeric with hyphen
      .toLowerCase()
    
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const filename = `${baseName}-${uniqueId}${fileExt}`

    const { uploadToStorage } = await import('@/lib/storage')
    const fileUrl = await uploadToStorage(buffer, filename, 'study-materials', file.type || 'application/octet-stream')

    return NextResponse.json({
      success: true,
      message: 'Study material uploaded and secured successfully.',
      filename,
      url: fileUrl,
    })

  } catch (error: any) {
    console.error('Study Material Upload API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload study material.' }, { status: 500 })
  }
}
