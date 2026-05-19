import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and new password are required.' },
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

    // Reset password programmatically
    const result = await payload.resetPassword({
      collection: 'users',
      data: {
        token,
        password,
      },
      overrideAccess: true,
    })

    if (!result.token || !result.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset password. The token may be invalid or expired.' },
        { status: 400 }
      )
    }

    // Automatically log the user in after password reset
    const safeUser = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone,
      profilePic: result.user.profilePic,
      role: result.user.role,
    }

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully and logged in.',
      user: safeUser,
      token: result.token,
    })

    // Set standard Payload JWT cookie
    const cookieOptions = {
      name: 'payload-token',
      value: result.token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7200,
    }

    response.cookies.set(cookieOptions)

    return response

  } catch (error: any) {
    console.error('Reset Password Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred during password reset.',
      },
      { status: 400 }
    )
  }
}
