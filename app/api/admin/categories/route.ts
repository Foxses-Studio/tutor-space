import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Category } from '@/lib/db/models/Category'
import { User } from '@/lib/db/models/User'
import { verifyToken } from '@/lib/auth/auth'
import { cookies } from 'next/headers'

async function authCheck(allowedRoles = ['admin', 'staff']) {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded?.id) return null
  const user = await User.findById(decoded.id).lean()
  if (!user || !allowedRoles.includes(user.role)) return null
  return user
}

export async function GET() {
  try {
    await connectToDatabase()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return NextResponse.json({ success: true, categories })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    const user = await authCheck(['admin', 'staff'])
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const { name, slug } = await request.json()
    if (!name || !slug) return NextResponse.json({ error: 'Name and slug are required.' }, { status: 400 })

    const existing = await Category.findOne({ $or: [{ name }, { slug }] }).lean()
    if (existing) return NextResponse.json({ error: 'Category name or slug already exists.' }, { status: 400 })

    const category = new Category({ name, slug })
    await category.save()
    return NextResponse.json({ success: true, category }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase()
    const user = await authCheck(['admin', 'staff'])
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

    const { id, name, slug } = await request.json()
    if (!id || !name || !slug) return NextResponse.json({ error: 'id, name and slug required.' }, { status: 400 })

    const category = await Category.findById(id)
    if (!category) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })

    category.name = name
    category.slug = slug
    await category.save()
    return NextResponse.json({ success: true, category })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase()
    const user = await authCheck(['admin'])
    if (!user) return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 401 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'id required.' }, { status: 400 })

    await Category.findByIdAndDelete(id)
    return NextResponse.json({ success: true, message: 'Category deleted.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
