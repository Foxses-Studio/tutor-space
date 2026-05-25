'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiStar, FiSend, FiBookOpen, FiCheck, FiClock, FiMessageSquare } from 'react-icons/fi'
import Swal from 'sweetalert2'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSession {
  id: string
  name: string
  email: string
  role: string
}

interface CourseItem {
  id: string
  title: string
  thumbnail?: { url?: string } | null
  category?: { name: string } | null
  slug: string
}

interface EnrollmentItem {
  id: string
  course: CourseItem
  paymentStatus: string
}

interface SubmittedReview {
  id: string
  rating: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  course: { title: string } | string
}

// ─── Sub Components ───────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-1 cursor-pointer transition-transform hover:scale-115 duration-150 border-none bg-transparent outline-none"
          >
            <FiStar
              className={`h-8 w-8 transition-colors duration-150 ${
                filled ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)]' : 'text-zinc-350'
              }`}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-3 text-base font-bold text-[#615fff] bg-[#615fff]/10 px-3 py-1 rounded-lg transition-all">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pending Approval', classes: 'bg-amber-500/10 text-amber-600 rounded-lg text-base px-3 py-1 font-bold' },
  approved: { label: 'Live & Published', classes: 'bg-emerald-500/10 text-emerald-600 rounded-lg text-base px-3 py-1 font-bold' },
  rejected: { label: 'Not Approved', classes: 'bg-rose-500/10 text-rose-600 rounded-lg text-base px-3 py-1 font-bold' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [myReviews, setMyReviews] = useState<SubmittedReview[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const sessionRes = await fetch('/api/auth/me')
        const sessionData = await sessionRes.json()

        if (!sessionRes.ok || !sessionData.authenticated || (sessionData.user.role !== 'student' && sessionData.user.role !== 'admin')) {
          router.push('/login')
          return
        }

        setUser(sessionData.user)

        // Fetch enrollments and student's reviews in parallel
        const [enrollRes, reviewRes] = await Promise.all([
          fetch('/api/enrollments?depth=2&limit=100'),
          fetch(`/api/reviews?where[student][equals]=${encodeURIComponent(sessionData.user.id)}&depth=2&limit=50`),
        ])

        const reviewedIds = new Set<string>()
        if (reviewRes.ok) {
          const data = await reviewRes.json()
          const reviewsList = data.docs ?? []
          setMyReviews(reviewsList)

          // Collect course IDs that this student has already reviewed
          for (const r of reviewsList) {
            const cId = r.course && typeof r.course === 'object' ? r.course.id : r.course
            if (cId) reviewedIds.add(cId)
          }
        }

        if (enrollRes.ok) {
          const data = await enrollRes.json()
          const completed = (data.docs ?? []).filter(
            (e: EnrollmentItem) => 
              e.paymentStatus === 'completed' && 
              e.course && 
              typeof e.course === 'object' &&
              !reviewedIds.has(e.course.id)
          )
          setEnrollments(completed)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedCourseId || rating === 0 || !comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete',
        text: 'Please select a course, give a star rating, and write a comment.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: selectedCourseId,
          rating: String(rating),
          comment: comment.trim(),
        }),
      })

      if (res.ok) {
        const newReview = await res.json()
        const addedReview = newReview.doc ?? newReview
        setMyReviews((prev) => [addedReview, ...prev])
        
        // Remove reviewed course from enrollments dropdown immediately
        const newReviewCourseId = addedReview.course && typeof addedReview.course === 'object' 
          ? addedReview.course.id 
          : addedReview.course
        setEnrollments((prev) => prev.filter((e) => e.course.id !== newReviewCourseId))

        setSelectedCourseId('')
        setRating(0)
        setComment('')
        Swal.fire({
          icon: 'success',
          title: 'Review Submitted!',
          text: 'Your review is pending admin approval. Thank you for sharing your feedback!',
          confirmButtonColor: '#615fff',
        })
      } else {
        const err = await res.json()
        throw new Error(err.message ?? 'Failed to submit review')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message ?? 'Something went wrong. Please try again.',
        confirmButtonColor: '#615fff',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-650">Loading reviews hub...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 pb-16">

      {/* Premium Dynamic Interactive Hero Banner */}
      <div className="w-full bg-[#0A163A] rounded-lg p-8 md:p-12 relative overflow-hidden select-none mb-10 shadow-lg shadow-[#0A163A]/10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#615fff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#543cdf]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#615fff]/20 border border-[#615fff]/30 text-base font-bold text-[#615fff] uppercase tracking-wider mb-6">
            Share Feedback
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
            Learner <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8a88ff] to-white font-bold">Reviews Hub</span> 🌟
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-semibold leading-relaxed">
            Your detailed experiences and ratings guide the community. Share your learning milestones or review your ongoing course curriculum!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ── Left Column: Write a Review Form ── */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-6 py-5 bg-zinc-50/50 flex items-center gap-3 select-none">
              <div className="h-10 w-10 rounded-lg bg-[#615fff]/10 flex items-center justify-center shadow-sm">
                <FiStar className="h-5 w-5 text-[#615fff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-800 leading-none">Write a Review</h2>
                <p className="text-sm font-semibold text-zinc-450 mt-1">Submit your course testimonial</p>
              </div>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-5">
                <div className="h-16 w-16 rounded-lg bg-[#615fff]/5 flex items-center justify-center text-[#615fff] shadow-inner">
                  <FiBookOpen className="h-8 w-8" />
                </div>
                <div className="max-w-sm space-y-1.5">
                  <p className="text-lg font-bold text-zinc-800">All Completed Courses Reviewed</p>
                  <p className="text-base font-semibold text-zinc-450 leading-relaxed">
                    You have reviewed all available enrolled courses. Buy new e-learning courses from our home page to submit more feedback!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Course selector */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-zinc-700 block select-none">Select Enrolled Course</label>
                  <div className="relative">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-lg bg-zinc-50 text-base font-semibold text-zinc-800 focus:outline-none focus:bg-white shadow-sm focus:shadow-md transition-all outline-none border-none cursor-pointer appearance-none"
                    >
                      <option value="">— Choose a course to review —</option>
                      {enrollments.map((e) => (
                        <option key={e.id} value={e.course.id}>
                          {e.course.title}
                        </option>
                      ))}
                    </select>
                    {/* Custom Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                      <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Star rating picker */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-zinc-700 block select-none">Your Star Rating</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Review Textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-base font-bold text-zinc-700 block">Your Honest Review</label>
                    <span className="text-sm font-semibold text-zinc-400">
                      {comment.length} / 500 characters
                    </span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="Tell us what you liked about this course syllabus, video streaming, live webinars, and curriculum quality. What can we build better?"
                    className="w-full px-4 py-3.5 rounded-lg bg-zinc-50 text-base font-semibold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white shadow-sm focus:shadow-md transition-all resize-none leading-relaxed outline-none border-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedCourseId || rating === 0 || !comment.trim()}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/15 hover:shadow-lg hover:shadow-[#615fff]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  {submitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <>
                      <FiSend className="h-5 w-5" />
                      <span>Submit Testimonial</span>
                    </>
                  )}
                </button>

                <p className="text-base font-semibold text-zinc-400 text-center select-none leading-relaxed">
                  Your submission is moderated by administrative staff before publishing.
                </p>

              </form>
            )}
          </div>
        </div>

        {/* ── Right Column: My Submissions ── */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="px-6 py-5 bg-zinc-50/50 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#615fff]/10 flex items-center justify-center shadow-sm">
                  <FiClock className="h-5 w-5 text-[#615fff]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-800 leading-none">My Reviews</h2>
                  <p className="text-sm font-semibold text-zinc-450 mt-1">Timeline of submitted logs</p>
                </div>
              </div>
              <span className="text-base font-bold text-[#615fff] bg-[#615fff]/10 px-3 py-1 rounded-lg">
                {myReviews.length}
              </span>
            </div>

            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {myReviews.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 shadow-inner">
                      <FiMessageSquare className="h-6 w-6" />
                    </div>
                    <p className="text-base font-semibold text-zinc-400 max-w-xs leading-relaxed">
                      You haven't submitted any reviews yet. Complete your course lessons and submit your first testimonial!
                    </p>
                  </div>
                ) : (
                  myReviews.map((review) => {
                    const courseTitle = review.course && typeof review.course === 'object'
                      ? review.course.title : 'Course'
                    const cfg = statusConfig[review.status] ?? statusConfig.pending
                    const starCount = parseInt(review.rating || '5', 10)

                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-5 bg-zinc-50/30 rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-base font-bold text-zinc-800 leading-snug line-clamp-2">
                            {courseTitle}
                          </p>
                          <span className={`shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold capitalize select-none ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Star Rating Render */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              className={`h-4.5 w-4.5 ${s <= starCount ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`}
                            />
                          ))}
                        </div>

                        <p className="text-base font-semibold text-zinc-500 leading-relaxed italic">
                          &ldquo;{review.comment}&rdquo;
                        </p>

                        {review.status === 'approved' && (
                          <div className="flex items-center gap-1.5 text-emerald-600 select-none">
                            <FiCheck className="h-4.5 w-4.5" />
                            <span className="text-sm font-bold">Published on course landing page</span>
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
