'use client'

import React from 'react'
import Link from 'next/link'
import Courses from '@/components/Courses'
import Reviews from '@/components/Reviews'
import CTASection from '@/components/CTASection'
import type { CourseDoc, CategoryDoc } from '@/components/Courses'
import type { ReviewDoc } from '@/components/Reviews'

interface RealInstructor {
  id: string
  name: string
  email: string
  designation?: string
  profilePicUrl?: string
}

interface InstructorsPageClientProps {
  realInstructors: RealInstructor[]
  courses: CourseDoc[]
  categories: CategoryDoc[]
  reviews: ReviewDoc[]
}

const MOCK_MENTORS = [
  {
    name: 'Robert David',
    role: 'UI/UX Designer',
    bg: 'bg-[#FDE2CA]', // Pastel peach
    profilePicUrl: '/media/vxlpbiket9vqph7spwyngltvsmg-1779840199862-554434273.png'
  },
  {
    name: 'Ethan Samuel',
    role: 'Developer',
    bg: 'bg-[#C1F2E2]', // Pastel teal
    profilePicUrl: '/media/rrppejy37or3c1ehg8dislrjny-1779840200159-103378770.png'
  },
  {
    name: 'Alexander Paul',
    role: 'Project Manager',
    bg: 'bg-[#FDF0BE]', // Pastel yellow
    profilePicUrl: '/media/qqxygfrpzzveslnttt8tbpyyty-1779840200418-636067296.png'
  },
  {
    name: 'William Henry',
    role: 'Digital Marketer',
    bg: 'bg-[#FDCFDF]', // Pastel pink
    profilePicUrl: '/media/qz82hvtiuti1iiqemr8rcled0y-1779840200650-803315217.png'
  },
  {
    name: 'James Robert',
    role: 'Project Manager',
    bg: 'bg-[#FDE2CA]', // Pastel peach
    profilePicUrl: '/media/gxxhfh6uqztk5gqswsdcczhwpb0-1779840200885-780441840.png'
  },
  {
    name: 'Brandon Michael',
    role: 'Digital Marketer',
    bg: 'bg-[#C1F2E2]', // Pastel teal
    profilePicUrl: '/media/wlfcozjetqkfmzn9ctbaqxom-1779840201125-910407530.png'
  },
  {
    name: 'Matthew John',
    role: 'Software Engineer',
    bg: 'bg-[#FDF0BE]', // Pastel yellow
    profilePicUrl: '/media/3ul2gmpwxkjvp1r96k9qy7uvjk-1779840201353-176576378.png'
  },
  {
    name: 'Joseph Andrew',
    role: 'UI/UX Designer',
    bg: 'bg-[#FDCFDF]', // Pastel pink
    profilePicUrl: '/media/erlxh9zrrws3wckh39cxektsqag-1779840201569-732309520.png'
  }
]

export default function InstructorsPageClient({
  realInstructors,
  courses,
  categories,
  reviews
}: InstructorsPageClientProps) {
  // Combine real database instructors with mock mentors to create a full premium list of at least 8 profiles
  const combined = [
    ...realInstructors.map((ins, i) => ({
      name: ins.name,
      role: ins.designation || 'Expert Mentor',
      bg: ['bg-[#FDE2CA]', 'bg-[#C1F2E2]', 'bg-[#FDF0BE]', 'bg-[#FDCFDF]'][i % 4],
      profilePicUrl: ins.profilePicUrl || '/media/learning-journey.png'
    })),
    ...MOCK_MENTORS
  ]

  // Slice to guarantee at least 8 elements, or more if DB has more
  const finalInstructors = combined.slice(0, Math.max(8, realInstructors.length))

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFB] via-[#F3F4F6]/40 to-[#ECEEFC]/50 select-text">
      
      {/* ── MENTORS GRID SECTION ── */}
      <section className="container mx-auto px-6 pt-36 pb-24 space-y-12">
        {/* Header Breadcrumbs and Heading Area */}
        <div className="space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-base font-semibold text-zinc-500 mb-2 select-none">
            <Link href="/" className="hover:text-zinc-850 transition-colors">Home</Link>
            <span className="text-zinc-350 font-normal">/</span>
            <span className="text-[#0A163A]">Mentors</span>
          </div>

          {/* Heading with Dot Matrix */}
          <div className="flex justify-between items-center gap-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0A163A] tracking-tight leading-tight select-text">
              Meet Our Industry's<br />
              <span className="text-[#615fff] bg-gradient-to-r from-[#615fff] to-[#5248e8] bg-clip-text text-transparent">
                Leading Expert Mentors
              </span>
            </h1>
            
            {/* Dot Matrix Decoration */}
            <div className="hidden md:grid grid-cols-6 gap-2.5 shrink-0 pr-6 select-none opacity-80">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-zinc-300/80" />
              ))}
            </div>
          </div>
        </div>

        {/* Mentor Cards Grid - 4 Columns on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {finalInstructors.map((instructor, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-3 shadow-md shadow-zinc-200/40 hover:shadow-lg hover:shadow-zinc-300/50 hover:-translate-y-1 transition-all duration-300 border border-zinc-100 flex flex-col group"
            >
              {/* Photo Box with Solid Pastel BG */}
              <div className={`aspect-[10/9] ${instructor.bg} rounded-lg overflow-hidden relative flex items-end justify-center`}>
                <img
                  src={instructor.profilePicUrl}
                  alt={instructor.name}
                  className="w-full h-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text Info */}
              <div className="py-5 text-center space-y-1 bg-white">
                <h3 className="text-lg font-bold text-[#0A163A] leading-tight select-text transition-colors group-hover:text-[#615fff]">
                  {instructor.name}
                </h3>
                <p className="text-sm font-semibold text-[#615fff] select-text">
                  {instructor.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE COURSES SECTION ── */}
      <section className="bg-white border-t border-zinc-100">
        <Courses initialCourses={courses} categories={categories} />
      </section>

      {/* ── TESTIMONIALS & REVIEWS SECTION ── */}
      <section className="bg-[#FAFBFD] border-t border-zinc-100">
        <Reviews reviews={reviews} />
      </section>

      {/* ── CALL TO ACTION SECTION ── */}
      <CTASection />

    </div>
  )
}
