import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Check if admin already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@tutorspace.com' } }
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json({ 
        message: 'Admin already exists!', 
        email: 'admin@tutorspace.com', 
        password: 'password123' 
      })
    }

    // Create a new admin user
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@tutorspace.com',
        password: 'password123',
        name: 'Super Admin',
        role: 'admin',
      },
    })

    return NextResponse.json({ 
      message: 'Admin user created successfully!', 
      email: 'admin@tutorspace.com', 
      password: 'password123' 
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
