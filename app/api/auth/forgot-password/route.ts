import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Trigger forgot password flow
    const token = await payload.forgotPassword({
      collection: 'users',
      data: {
        email,
      },
      overrideAccess: true,
    })

    // Return success response
    // In development mode, we also return the token to make it easy to test without email setup
    const isDev = process.env.NODE_ENV !== 'production'
    
    return NextResponse.json({
      success: true,
      message: 'If the email exists, a password reset link has been generated.',
      ...(isDev && token ? { debugToken: token } : {}),
    })

  } catch (error: any) {
    console.error('Forgot Password Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while processing forgot password request.',
      },
      { status: 400 }
    )
  }
}
