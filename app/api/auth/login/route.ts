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

    // 2. Determine which auth collection to authenticate against (users or students)
    let collectionSlug: 'users' | 'students' = 'users'
    const studentQuery = await payload.find({
      collection: 'students',
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
      limit: 1,
    })

    if (studentQuery.docs && studentQuery.docs.length > 0) {
      collectionSlug = 'students'
    }

    // 3. Perform authentication using Payload login
    const result = await payload.login({
      collection: collectionSlug,
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

    // 4. Prepare response and set cookie
    let profilePicUrl = null
    if (result.user.profilePic) {
      if (typeof result.user.profilePic === 'object' && (result.user.profilePic as any).url) {
        profilePicUrl = (result.user.profilePic as any).url
      } else if (typeof result.user.profilePic === 'string') {
        if (result.user.profilePic.startsWith('/') || result.user.profilePic.startsWith('http')) {
          profilePicUrl = result.user.profilePic
        } else {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: result.user.profilePic,
            })
            profilePicUrl = mediaDoc?.url || null
          } catch (e) {
            console.error('Error resolving profile pic in login:', e)
          }
        }
      }
    }

    const safeUser = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone,
      profilePic: profilePicUrl,
      role: result.user.role || 'student',
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      user: safeUser,
      token: result.token,
    })

    // Set standard Payload JWT cookie dynamically
    const cookieOptions = {
      name: collectionSlug === 'students' ? 'student-token' : 'payload-token',
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
