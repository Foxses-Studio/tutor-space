import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Media } from '@/lib/db/models/Media'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

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
    let alt = formData.get('alt') as string | null

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
    const mimeType = file.type || 'image/jpeg'

    const { uploadToStorage } = await import('@/lib/storage')

    // Save main file
    const mainFileUrl = await uploadToStorage(buffer, filename, 'media', mimeType)

    // Calculate metadata
    let width = undefined
    let height = undefined
    try {
      const meta = await sharp(buffer).metadata()
      width = meta.width
      height = meta.height
    } catch (e) {
      console.warn('Could not read image metadata with sharp:', e)
    }

    // Auto-generate Alt Text if not provided
    if (!alt || !alt.trim()) {
      alt = baseName
        .split('-')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // 4. Generate Responsive Sizes using Sharp
    const sizes: any = {}

    // Only attempt Sharp resizing if it's an image
    if (mimeType.startsWith('image/')) {
      const sizesConfig = [
        { name: 'thumbnail', w: 400, h: 300 },
        { name: 'card', w: 800, h: 600 },
        { name: 'hero', w: 1920, h: 1080 },
      ]

      for (const conf of sizesConfig) {
        try {
          const subFilename = `${baseName}-${uniqueId}-${conf.name}.webp`

          // Resize keeping aspect ratio or cover
          const resizedBuffer = await sharp(buffer)
            .resize(conf.w, conf.h, { fit: 'cover', withoutEnlargement: true })
            .toFormat('webp')
            .toBuffer()

          const subUrl = await uploadToStorage(resizedBuffer, subFilename, 'media', 'image/webp')

          sizes[conf.name] = {
            url: subUrl,
            width: conf.w,
            height: conf.h,
            filename: subFilename,
          }
        } catch (sharpError) {
          console.error(`Failed to generate ${conf.name} size with sharp:`, sharpError)
        }
      }
    }

    // 5. Create media record in database
    const mediaDoc = new Media({
      filename,
      mimeType,
      filesize: file.size,
      width,
      height,
      alt,
      url: mainFileUrl,
      sizes: Object.keys(sizes).length > 0 ? sizes : undefined,
    })

    await mediaDoc.save()

    return NextResponse.json({
      success: true,
      message: 'Media asset uploaded and processed successfully.',
      media: {
        id: mediaDoc._id.toString(),
        filename: mediaDoc.filename,
        url: mediaDoc.url,
        alt: mediaDoc.alt,
        sizes: mediaDoc.sizes,
      },
    })

  } catch (error: any) {
    console.error('Media Upload API Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to upload media.' }, { status: 500 })
  }
}
