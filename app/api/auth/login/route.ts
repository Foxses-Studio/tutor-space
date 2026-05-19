import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // 2. Perform authentication using Payload login
    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (!result.token || !result.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed. Invalid email or password.' },
        { status: 401 }
      )
    }

    // 3. Prepare response and set cookie
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
      message: 'Logged in successfully.',
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
      maxAge: result.exp ? result.exp - Math.floor(Date.now() / 1000) : 7200,
    }

    response.cookies.set(cookieOptions)

    return response

  } catch (error: any) {
    console.error('Login Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Invalid email or password.',
      },
      { status: 401 }
    )
  }
}
