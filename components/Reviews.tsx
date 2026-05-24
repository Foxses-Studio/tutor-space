'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi'

// ─── Exported Types ──────────────────────────────────────────────────────────

interface ProfilePicDoc {
  url?: string | null
}

interface StudentDoc {
  id: string
  name: string
  profilePic?: ProfilePicDoc | string | null
}

export interface ReviewDoc {
  id: string
  rating: '1' | '2' | '3' | '4' | '5'
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  student: StudentDoc | string | null
  course: { id: string; title: string } | string | null
}

interface ReviewsProps {
  reviews: ReviewDoc[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GAP = 24 // px — must match gap-6

function getStudentName(student: ReviewDoc['student']): string {
  if (!student || typeof student === 'string') return 'Anonymous'
  return student.name
}

function getProfilePicUrl(student: ReviewDoc['student']): string | null {
  if (!student || typeof student === 'string') return null
  const pic = student.profilePic
  if (!pic || typeof pic === 'string') return null
  return pic.url ?? null
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: string }) {
  const count = parseInt(rating, 10)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          className={`h-4 w-4 ${s <= count ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}`}
        />
      ))}
    </div>
  )
}

function ReviewAvatar({ student }: { student: ReviewDoc['student'] }) {
  const name = getStudentName(student)
  const picUrl = getProfilePicUrl(student)
  if (picUrl) {
    return (
      <img
        src={picUrl}
        alt={name}
        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
      />
    )
  }
  return (
    <div className="h-12 w-12 rounded-full bg-[#615fff]/15 border-2 border-white shadow-sm flex items-center justify-center font-bold text-base text-[#615fff] shrink-0">
      {getInitials(name)}
    </div>
  )
}

function ReviewCard({ review }: { review: ReviewDoc }) {
  return (
    <div className="relative bg-[#f5f4ff] border border-[#615fff]/10 rounded-lg p-6 flex flex-col gap-5 h-full overflow-hidden">
      {/* Decorative quote */}
      <span className="absolute top-3 right-5 text-8xl font-bold text-[#615fff]/10 leading-none select-none font-display pointer-events-none">
        ❝
      </span>

      <StarDisplay rating={review.rating} />

      <p className="text-base font-semibold text-zinc-700 leading-relaxed flex-1 relative z-10">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="border-t border-[#615fff]/10" />

      <div className="flex items-center gap-3">
        <ReviewAvatar student={review.student} />
        <div className="min-w-0">
          <p className="text-base font-bold text-zinc-800 leading-tight truncate">
            {getStudentName(review.student)}
          </p>
          <p className="text-base font-semibold text-zinc-400 mt-0.5">Verified Student</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Reviews({ reviews }: ReviewsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)

  // Measure container on mount + resize to compute exact card width
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return
      const cw = containerRef.current.clientWidth
      const vc = cw >= 1024 ? 3 : cw >= 640 ? 2 : 1
      setVisibleCount(vc)
      setCardWidth((cw - (vc - 1) * GAP) / vc)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (reviews.length === 0) return null

  const maxIndex = Math.max(0, reviews.length - visibleCount)
  const translateX = cardWidth > 0 ? -(currentIndex * (cardWidth + GAP)) : 0

  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, maxIndex))
  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0))

  return (
    <section className="py-20 md:py-28 px-6 bg-white border-t border-zinc-100 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#615fff]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Heading */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-base font-bold text-[#615fff] mb-3 tracking-wide uppercase"
          >
            Student Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans text-zinc-900 tracking-tight leading-[1.2]"
          >
            What Learners Are{' '}
            <span className="text-[#615fff]">Saying</span>{' '}
            <br className="hidden sm:block" />
            About Tutor Space
          </motion.h2>
        </div>

        {/* Carousel track */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="overflow-hidden" ref={containerRef}>
            <motion.div
              className="flex"
              style={{ gap: `${GAP}px` }}
              animate={{ x: translateX }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.9 }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="shrink-0"
                  style={{
                    width: cardWidth > 0
                      ? `${cardWidth}px`
                      : `calc(${100 / visibleCount}% - ${(GAP * (visibleCount - 1)) / visibleCount}px)`,
                  }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
          className="flex items-center justify-center gap-5 mt-10"
        >
          {/* Prev */}
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
              currentIndex === 0
                ? 'border-zinc-200 text-zinc-300 cursor-not-allowed'
                : 'border-[#615fff] text-[#615fff] hover:bg-[#615fff] hover:text-white'
            }`}
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>

          {/* Dot indicators — one per card */}
          <div className="flex items-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(Math.min(i, maxIndex))}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex
                    ? 'h-2.5 w-6 bg-[#615fff]'
                    : 'h-2.5 w-2.5 bg-zinc-200 hover:bg-[#615fff]/40'
                }`}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={currentIndex === maxIndex}
            className={`h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
              currentIndex === maxIndex
                ? 'border-zinc-200 text-zinc-300 cursor-not-allowed'
                : 'border-[#615fff] text-[#615fff] hover:bg-[#615fff] hover:text-white'
            }`}
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </motion.div>

      </div>
    </section>
  )
}
