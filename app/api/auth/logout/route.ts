import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear the httpOnly session token cookies from the server side
    cookieStore.set({
      name: 'student-token',
      value: '',
      httpOnly: true,
      path: '/',
      expires: new Date(0), // Instantly expire cookie
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    cookieStore.set({
      name: 'payload-token',
      value: '',
      httpOnly: true,
      path: '/',
      expires: new Date(0), // Instantly expire cookie
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully on server.',
    })
  } catch (error: any) {
    console.error('Logout Server Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process logout.' },
      { status: 500 }
    )
  }
}
