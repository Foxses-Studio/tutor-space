import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'

export async function POST(request: Request) {
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
    
    // 1. Authenticate user session
    const authResult = await payload.auth({
      headers: cleanHeaders,
    })

    if (!authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      )
    }

    // Determine collection slug safely by checking if user exists in students
    let targetCollection: 'students' | 'users' = 'students'
    try {
      const studentCheck = await payload.findByID({
        collection: 'students',
        id: authResult.user.id,
      })
      if (studentCheck) {
        targetCollection = 'students'
      }
    } catch (e) {
      targetCollection = 'users'
    }

    const body = await request.json()
    const { name, phone, profilePic, currentPassword, newPassword } = body

    // 2. Basic validation
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required.' },
        { status: 400 }
      )
    }

    // 3. Process new profile picture upload if base64 is provided
    let profilePicId: string | number | undefined = undefined
    if (profilePic && typeof profilePic === 'object' && profilePic.base64) {
      try {
        const base64Data = profilePic.base64.split(';base64,').pop() || profilePic.base64
        const buffer = Buffer.from(base64Data, 'base64')
        const userEmail = authResult.user.email || 'student'
        const fileName = profilePic.name || `${userEmail.replace(/[@.]/g, '_')}_profile.jpg`
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
      } catch (uploadError: any) {
        console.error('Failed to upload profile picture:', uploadError)
        return NextResponse.json(
          { success: false, error: 'Failed to save profile picture: ' + uploadError.message },
          { status: 500 }
        )
      }
    }

    // 4. Update user/student details
    const updateData: any = {
      name,
      phone: phone || undefined,
    }

    if (profilePicId) {
      updateData.profilePic = profilePicId
    }

    if (currentPassword && newPassword) {
      if (!authResult.user.email) {
        return NextResponse.json(
          { success: false, error: 'User email is not set. Cannot verify password change.' },
          { status: 400 }
        )
      }

      try {
        await payload.login({
          collection: targetCollection,
          data: {
            email: authResult.user.email,
            password: currentPassword,
          },
        })
      } catch (loginError) {
        return NextResponse.json(
          { success: false, error: 'Incorrect current password. Please try again.' },
          { status: 400 }
        )
      }
      updateData.password = newPassword
    }

    const updatedUser = await payload.update({
      collection: targetCollection,
      id: authResult.user.id,
      data: updateData,
    })

    // 5. Resolve new profile pic URL cleanly
    let profilePicUrl = null
    if (updatedUser.profilePic) {
      if (typeof updatedUser.profilePic === 'object' && (updatedUser.profilePic as any).url) {
        profilePicUrl = (updatedUser.profilePic as any).url
      } else if (typeof updatedUser.profilePic === 'string') {
        if (updatedUser.profilePic.startsWith('/') || updatedUser.profilePic.startsWith('http')) {
          profilePicUrl = updatedUser.profilePic
        } else {
          try {
            const mediaDoc = await payload.findByID({
              collection: 'media',
              id: updatedUser.profilePic,
            })
            profilePicUrl = mediaDoc?.url || null
          } catch (e) {
            console.error('Error resolving profile pic in update route:', e)
          }
        }
      }
    }

    const safeUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profilePic: profilePicUrl,
      role: (updatedUser as any).role || 'student',
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: safeUser,
    })

  } catch (error: any) {
    console.error('Profile Update Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred during profile update.' },
      { status: 500 }
    )
  }
}
