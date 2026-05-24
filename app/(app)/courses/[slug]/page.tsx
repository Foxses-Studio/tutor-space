import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Course } from '@/lib/db/models/Course'
import { Lesson } from '@/lib/db/models/Lesson'
import { Review } from '@/lib/db/models/Review'
import {
  FiArrowLeft, FiClock, FiBookOpen, FiUsers, FiCheck,
  FiStar, FiZap, FiList, FiAward,
} from 'react-icons/fi'

// ─── Type helpers ─────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }>
}

function getLevelLabel(level: string): string {
  const map: Record<string, string> = {
    all: 'All Levels', beginner: 'Beginner',
    intermediate: 'Intermediate', advanced: 'Advanced',
  }
  return map[level] ?? 'All Levels'
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

function getImageUrl(thumbnail: any): string {
  if (!thumbnail || typeof thumbnail === 'string') return ''
  return thumbnail.sizes?.card?.url ?? thumbnail.sizes?.hero?.url ?? thumbnail.url ?? ''
}

function getStarCount(reviews: any[]): number {
  if (!reviews.length) return 0
  const sum = reviews.reduce((acc, r) => acc + parseInt(r.rating, 10), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}`}
        />
      ))}
    </div>
  )
}

// ─── Generate page metadata ──────────────────────────────────────────────────

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  await connectToDatabase()
  const course = await Course.findOne({ slug, status: 'published' }).lean()
  if (!course) return { title: 'Course Not Found' }
  return {
    title: `${course.title} - Tutor Space`,
    description: course.summary,
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params
  await connectToDatabase()

  // Fetch course
  const course = await Course.findOne({ slug, status: 'published' })
    .populate('category')
    .populate('instructor')
    .populate('thumbnail')
    .lean() as any

  if (!course) notFound()

  // Parallel: lessons count + approved reviews for this course
  const [lessonsDocs, reviewsDocs] = await Promise.all([
    Lesson.find({ course: course._id }).lean(),
    Review.find({ course: course._id, status: 'approved' })
      .populate({
        path: 'student',
        populate: { path: 'profilePic' }
      })
      .lean(),
  ])

  const lessonCount = lessonsDocs.length
  const reviews = reviewsDocs as any[]
  const avgRating = getStarCount(reviews)
  const categoryName = course.category && typeof course.category === 'object' ? course.category.name : ''
  const instructorName = course.instructor && typeof course.instructor === 'object'
    ? course.instructor.name ?? course.instructor.email
    : 'Expert Instructor'
  const imageUrl = getImageUrl(course.thumbnail)

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">

      {/* ── Breadcrumb bar ── */}
      <div className="border-b border-zinc-100 bg-zinc-50/70">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-base font-semibold text-zinc-500">
          <Link href="/" className="hover:text-[#615fff] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#courses" className="hover:text-[#615fff] transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-zinc-800 line-clamp-1">{course.title}</span>
        </div>
      </div>

      {/* ── Hero section ── */}
      <div className="bg-[#0A163A] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#615fff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#543cdf]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left: course info */}
          <div className="lg:col-span-7 space-y-6">
            <Link
              href="/#courses"
              className="inline-flex items-center gap-2 text-base font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryName && (
                <span className="px-3.5 py-1.5 bg-[#615fff]/20 border border-[#615fff]/30 text-[#a09dff] rounded-lg font-bold text-base">
                  {categoryName}
                </span>
              )}
              <span className="px-3.5 py-1.5 bg-white/10 border border-white/15 text-zinc-300 rounded-lg font-bold text-base">
                {getLevelLabel(course.level)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display leading-tight tracking-tight">
              {course.title}
            </h1>

            {/* Summary */}
            <p className="text-lg font-semibold text-zinc-300 leading-relaxed max-w-2xl">
              {course.summary}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 text-base font-semibold text-zinc-400">
              {course.duration && (
                <span className="flex items-center gap-2">
                  <FiClock className="h-5 w-5 text-[#615fff]" />
                  {course.duration}
                </span>
              )}
              {lessonCount > 0 && (
                <span className="flex items-center gap-2">
                  <FiList className="h-5 w-5 text-[#615fff]" />
                  {lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}
                </span>
              )}
              <span className="flex items-center gap-2">
                <FiAward className="h-5 w-5 text-[#615fff]" />
                {getLevelLabel(course.level)}
              </span>
              {reviews.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <FiStar className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-bold">{avgRating}</span>
                  <span className="text-zinc-400">({reviews.length} reviews)</span>
                </span>
              )}
            </div>

            {/* Instructor */}
            <p className="text-base font-semibold text-zinc-400">
              Instructor:{' '}
              <span className="text-white font-bold">{instructorName}</span>
            </p>
          </div>

          {/* Right: course thumbnail */}
          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-white/10 shadow-2xl aspect-[16/10] bg-[#152347] relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.css-placeholder');
                      if (fallback) fallback.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={`css-placeholder w-full h-full bg-gradient-to-br from-[#0A163A] to-[#121212] flex flex-col items-center justify-center border border-white/5 absolute inset-0 ${imageUrl ? 'hidden' : ''}`}>
                <span className="h-16 w-16 rounded-lg bg-[#615fff]/20 flex items-center justify-center font-bold text-white shadow-lg text-xl mb-2.5">
                  T
                </span>
                <span className="text-base font-bold text-zinc-450 uppercase tracking-wider">Tutor Space</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left: detailed content */}
        <div className="lg:col-span-8 space-y-12">

          {/* What You'll Learn */}
          {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">
                What You&apos;ll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f7ff] border border-[#615fff]/10 rounded-lg p-6">
                {course.whatYouWillLearn.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#615fff]/15 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCheck className="h-3 w-3 text-[#615fff]" />
                    </div>
                    <span className="text-base font-semibold text-zinc-700 leading-snug">
                      {item.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight">
                Requirements
              </h2>
              <ul className="space-y-3">
                {course.requirements.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-base font-semibold text-zinc-600">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#615fff] shrink-0" />
                    {item.requirement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews section */}
          {reviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
                  Student Reviews
                </h2>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={avgRating} />
                  <span className="text-base font-bold text-zinc-700">{avgRating} / 5</span>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review: any) => {
                  const studentName = review.student && typeof review.student === 'object'
                    ? review.student.name : 'Anonymous'
                  const picUrl = review.student?.profilePic?.url ?? null
                  const initials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)

                  return (
                    <div key={review._id.toString()} className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {picUrl ? (
                            <img src={picUrl} alt={studentName} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#615fff]/10 flex items-center justify-center font-bold text-base text-[#615fff]">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="text-base font-bold text-zinc-800">{studentName}</p>
                            <p className="text-base font-semibold text-zinc-400">Verified Student</p>
                          </div>
                        </div>
                        <StarDisplay rating={parseInt(review.rating, 10)} />
                      </div>
                      <p className="text-base font-semibold text-zinc-600 leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right: Sticky pricing card */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 bg-white border border-zinc-200/80 rounded-lg shadow-lg overflow-hidden">
            {/* Card image preview */}
            <div className="aspect-[16/10] overflow-hidden bg-zinc-100 relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.css-placeholder');
                      if (fallback) fallback.classList.remove('hidden');
                    }
                  }}
                />
              ) : null}
              <div className={`css-placeholder w-full h-full bg-gradient-to-br from-[#0A163A] to-[#121212] flex flex-col items-center justify-center border border-white/5 absolute inset-0 ${imageUrl ? 'hidden' : ''}`}>
                <span className="h-12 w-12 rounded-lg bg-[#615fff]/20 flex items-center justify-center font-bold text-white shadow-lg text-lg mb-2">
                  T
                </span>
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Tutor Space</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Price */}
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-[#615fff]">
                  {formatPrice(course.price)}
                </span>
              </div>

              {/* Enroll CTA */}
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-lg shadow-[#615fff]/20 hover:shadow-[#615fff]/30 transition-all duration-300"
              >
                <FiZap className="h-5 w-5" />
                Enroll Now
              </Link>

              <p className="text-base font-semibold text-zinc-400 text-center">
                30-day money-back guarantee
              </p>

              {/* Course includes */}
              <div className="space-y-3 border-t border-zinc-100 pt-5">
                <p className="text-base font-bold text-zinc-800 mb-2">This course includes:</p>
                {course.duration && (
                  <div className="flex items-center gap-3 text-base font-semibold text-zinc-600">
                    <FiClock className="h-5 w-5 text-[#615fff] shrink-0" />
                    <span>{course.duration} of content</span>
                  </div>
                )}
                {lessonCount > 0 && (
                  <div className="flex items-center gap-3 text-base font-semibold text-zinc-600">
                    <FiList className="h-5 w-5 text-[#615fff] shrink-0" />
                    <span>{lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-base font-semibold text-zinc-600">
                  <FiAward className="h-5 w-5 text-[#615fff] shrink-0" />
                  <span>{getLevelLabel(course.level)}</span>
                </div>
                <div className="flex items-center gap-3 text-base font-semibold text-zinc-600">
                  <FiUsers className="h-5 w-5 text-[#615fff] shrink-0" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-base font-semibold text-zinc-600">
                  <FiBookOpen className="h-5 w-5 text-[#615fff] shrink-0" />
                  <span>Certificate of completion</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="border-t border-zinc-100 pt-5">
                <p className="text-base font-semibold text-zinc-500 mb-1">Instructor</p>
                <p className="text-base font-bold text-zinc-800">{instructorName}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
