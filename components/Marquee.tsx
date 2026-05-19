import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

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

  return (
    <div className="w-full bg-gradient-to-r from-[#543CDF] via-[#615fff] to-[#7c3aed] py-6 overflow-hidden relative select-none z-10 transform -rotate-[5deg] scale-[1.02] origin-center my-8 shadow-xl shadow-[#615fff]/20 border-y border-white/10">
      <div className="animate-marquee-track flex gap-20">
        
        {/* Marquee Group 1 */}
        <div className="flex gap-20 items-center shrink-0 text-base font-extrabold uppercase tracking-widest text-white">
          {items.map((item, index) => (
            <React.Fragment key={`g1-${index}`}>
              <span>{item}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#FDBF2D] shadow-sm shadow-[#FDBF2D]/50" />
            </React.Fragment>
          ))}
        </div>

        {/* Marquee Group 2 (Duplicate for infinite seamless loop) */}
        <div className="flex gap-20 items-center shrink-0 text-base font-extrabold uppercase tracking-widest text-white" aria-hidden="true">
          {items.map((item, index) => (
            <React.Fragment key={`g2-${index}`}>
              <span>{item}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-[#FDBF2D] shadow-sm shadow-[#FDBF2D]/50" />
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  )
}
