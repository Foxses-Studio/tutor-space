import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const reqHeaders = await headers()
    
    // Read user auth session using Payload auth helper
    const authResult = await payload.auth({
      headers: reqHeaders,
    })

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Not authenticated.' },
        { status: 401 }
      )
    }

    const safeUser = {
      id: authResult.user.id,
      name: authResult.user.name,
      email: authResult.user.email,
      phone: authResult.user.phone,
      profilePic: authResult.user.profilePic,
      role: authResult.user.role,
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
