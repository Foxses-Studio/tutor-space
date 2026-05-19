import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const reqHeaders = await headers()
    const cookieStore = await cookies()
    
    const studentToken = cookieStore.get('student-token')?.value
    const payloadToken = cookieStore.get('payload-token')?.value

    const cleanHeaders = new Headers(reqHeaders)
    if (studentToken) {
      // Map student-token to payload-token so payload.auth parses it seamlessly
      cleanHeaders.set('cookie', `payload-token=${studentToken}`)
    } else if (payloadToken) {
      cleanHeaders.set('cookie', `payload-token=${payloadToken}`)
    }
    
    // Read user auth session using Payload auth helper
    const authResult = await payload.auth({
      headers: cleanHeaders,
    })

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    let profilePicUrl = null
    if (authResult.user.profilePic) {
      if (typeof authResult.user.profilePic === 'object' && (authResult.user.profilePic as any).url) {
        profilePicUrl = (authResult.user.profilePic as any).url
      } else if (typeof authResult.user.profilePic === 'string') {
        if (authResult.user.profilePic.startsWith('/') || authResult.user.profilePic.startsWith('http')) {
          profilePicUrl = authResult.user.profilePic
        } else {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: authResult.user.profilePic,
            })
            profilePicUrl = mediaDoc?.url || null
          } catch (e) {
            console.error('Error resolving profile pic in auth check:', e)
          }
        }
      }
    }

    const safeUser = {
      id: authResult.user.id,
      name: authResult.user.name,
      email: authResult.user.email,
      phone: authResult.user.phone,
      profilePic: profilePicUrl,
      role: authResult.user.role || 'student',
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: safeUser,
    })

  } catch (error: any) {
    console.error('Auth Check Error:', error)
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Failed to verify session.' },
      { status: 500 }
    )
  }
}
