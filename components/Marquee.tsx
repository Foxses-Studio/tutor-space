import React from 'react'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Category } from '@/lib/db/models/Category'
import MarqueeClient from './MarqueeClient'

export default async function Marquee() {
  // Premium default list in case database categories are empty
  let items = [
    'Interactive Lessons',
    'Expert Instructors',
    'Flexible Learning',
    'Lifetime Access',
    'Verified Certificates'
  ]

  try {
    await connectToDatabase()
    const categoriesDocs = await Category.find().limit(15).lean()

    if (categoriesDocs && categoriesDocs.length > 0) {
      items = categoriesDocs.map((cat: any) => cat.name).filter(Boolean)
    }
  } catch (error) {
    console.error('Error fetching categories for marquee:', error)
  }

  // Final fallback to make sure array is never empty
  if (items.length === 0) {
    items = [
      'Interactive Lessons',
      'Expert Instructors',
      'Flexible Learning',
      'Lifetime Access',
      'Verified Certificates'
    ]
  }

  return <MarqueeClient items={items} />
}

