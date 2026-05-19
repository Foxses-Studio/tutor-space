import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
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
    const payload = await getPayload({ config: configPromise })
    const categoriesData = await payload.find({
      collection: 'categories',
      limit: 15,
    })

    if (categoriesData.docs && categoriesData.docs.length > 0) {
      items = categoriesData.docs.map((cat: any) => cat.name).filter(Boolean)
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
