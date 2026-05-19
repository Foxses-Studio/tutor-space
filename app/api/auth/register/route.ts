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

    // 3. Register user using Payload Local API
    const user = await payload.create({
      collection: 'users',
      data: {
        name,
        email,
        password,
        phone: phone || undefined,
        profilePic: profilePic || undefined,
        role: targetRole,
      },
    })

    // Return registered user details safely (excluding password field)
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      role: user.role,
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
