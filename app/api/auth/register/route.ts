import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone, profilePic, role } = body

    // 1. Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required fields.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // 2. Role Security Verification
    let targetRole = role || 'student'
    const sensitiveRoles = ['admin', 'staff', 'instructor']

    if (sensitiveRoles.includes(targetRole)) {
      // Check X-Admin-Secret header
      const adminSecretHeader = request.headers.get('x-admin-secret')
      const isSecretValid = adminSecretHeader && adminSecretHeader === process.env.ADMIN_REGISTRATION_SECRET

      if (!isSecretValid) {
        // Fallback: check if currently logged-in user is an Admin
        const reqHeaders = await headers()
        const authResult = await payload.auth({ headers: reqHeaders })
        const isCurrentAdmin = authResult.user && authResult.user.role === 'admin'

        if (!isCurrentAdmin) {
          return NextResponse.json(
            {
              success: false,
              error: 'Forbidden: You do not have permissions to register users with sensitive roles. Provide a valid x-admin-secret header or authenticate as Admin.',
            },
            { status: 403 }
          )
        }
      }
    }

    // 3. Process base64 profile picture upload if provided
    let profilePicId: string | number | undefined = undefined
    if (profilePic && typeof profilePic === 'object' && profilePic.base64) {
      try {
        const base64Data = profilePic.base64.split(';base64,').pop() || profilePic.base64
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = profilePic.name || `${email.replace(/[@.]/g, '_')}_profile.jpg`
        const mimeType = profilePic.mimeType || 'image/jpeg'

        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `${name} Profile Picture`,
          },
          file: {
            data: buffer,
            name: fileName,
            mimetype: mimeType,
            size: buffer.length,
          },
        })
        profilePicId = mediaDoc.id
      } catch (uploadError) {
        console.error('Failed to upload profile picture:', uploadError)
      }
    }

    // 4. Register using Payload Local API under the correct collection
    let user: any
    if (targetRole === 'student') {
      user = await payload.create({
        collection: 'students',
        data: {
          name,
          email,
          password,
          phone: phone || undefined,
          profilePic: profilePicId || undefined,
          status: 'active',
        },
      })
    } else {
      user = await payload.create({
        collection: 'users',
        data: {
          name,
          email,
          password,
          phone: phone || undefined,
          profilePic: profilePicId || undefined,
          role: targetRole,
        },
      })
    }

    // Return registered details safely (excluding password field)
    let profilePicUrl = null
    if (user.profilePic) {
      if (typeof user.profilePic === 'object' && (user.profilePic as any).url) {
        profilePicUrl = (user.profilePic as any).url
      } else if (typeof user.profilePic === 'string') {
        if (user.profilePic.startsWith('/') || user.profilePic.startsWith('http')) {
          profilePicUrl = user.profilePic
        } else {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: user.profilePic,
            })
            profilePicUrl = mediaDoc?.url || null
          } catch (e) {
            console.error('Error resolving profile pic in register:', e)
          }
        }
      }
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: profilePicUrl,
      role: 'role' in user ? user.role : 'student',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      success: true,
      message: `${targetRole.charAt(0).toUpperCase() + targetRole.slice(1)} registered successfully.`,
      user: safeUser,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during registration. The email might already be registered.',
      },
      { status: 400 }
    )
  }
}
