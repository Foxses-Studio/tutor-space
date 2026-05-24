'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiStar, FiSend, FiBookOpen, FiCheck, FiClock } from 'react-icons/fi'
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
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 cursor-pointer transition-transform hover:scale-110 duration-150"
          >
            <FiStar
              className={`h-7 w-7 transition-colors duration-150 ${
                filled ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'
              }`}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-2 text-base font-bold text-zinc-600">
          {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][value]}
        </span>
      )}
    </div>
  )
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: 'Pending Approval', classes: 'bg-amber-50 text-amber-600 border-amber-200' },
  approved: { label: 'Live & Published', classes: 'bg-green-50 text-green-600 border-green-200' },
  rejected: { label: 'Not Approved', classes: 'bg-red-50 text-red-600 border-red-200' },
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

        if (!sessionRes.ok || !sessionData.authenticated || sessionData.user.role !== 'student') {
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
          <p className="text-base font-bold text-zinc-600">Loading your reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 pb-16">

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-800 tracking-tight font-display">My Reviews</h1>
        <p className="text-base font-semibold text-zinc-500 mt-2">
          Share your experience to help other learners make informed decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── Left: Submit review form ── */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-zinc-200/80 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#615fff]/10 flex items-center justify-center">
                <FiStar className="h-5 w-5 text-[#615fff]" />
              </div>
              <h2 className="text-xl font-bold text-zinc-800">Write a Review</h2>
            </div>

            {enrollments.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                  <FiBookOpen className="h-7 w-7 text-zinc-400" />
                </div>
                <div>
                  <p className="text-base font-bold text-zinc-700 mb-1">No enrolled courses</p>
                  <p className="text-base font-semibold text-zinc-400">
                    You can review courses after completing enrollment and payment.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Course selector */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-zinc-700">Select Course</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-lg border border-zinc-200 bg-white text-base font-semibold text-zinc-800 focus:outline-none focus:border-[#615fff] focus:ring-2 focus:ring-[#615fff]/15 transition-all"
                  >
                    <option value="">— Choose a course you enrolled in —</option>
                    {enrollments.map((e) => (
                      <option key={e.id} value={e.course.id}>
                        {e.course.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star rating */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-zinc-700">Your Rating</label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-base font-bold text-zinc-700">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    placeholder="Share your honest experience — what did you enjoy? What could be improved?"
                    className="w-full px-4 py-3.5 rounded-lg border border-zinc-200 bg-white text-base font-semibold text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#615fff] focus:ring-2 focus:ring-[#615fff]/15 transition-all resize-none leading-relaxed"
                  />
                  <p className="text-base font-semibold text-zinc-400">
                    {comment.length} / 500 characters
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !selectedCourseId || rating === 0 || !comment.trim()}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-lg shadow-[#615fff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend className="h-5 w-5" />
                      Submit Review
                    </>
                  )}
                </button>

                <p className="text-base font-semibold text-zinc-400 text-center">
                  Reviews are reviewed by our team before going live.
                </p>

              </form>
            )}
          </div>
        </div>

        {/* ── Right: My submitted reviews ── */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200/80 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#615fff]/10 flex items-center justify-center">
                  <FiClock className="h-5 w-5 text-[#615fff]" />
                </div>
                <h2 className="text-xl font-bold text-zinc-800">My Submissions</h2>
              </div>
              <span className="text-base font-bold text-zinc-400">{myReviews.length}</span>
            </div>

            <div className="divide-y divide-zinc-100">
              <AnimatePresence>
                {myReviews.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-base font-semibold text-zinc-400">
                      No reviews submitted yet. Be the first to share!
                    </p>
                  </div>
                ) : (
                  myReviews.slice(0, 10).map((review) => {
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
                        className="p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-base font-bold text-zinc-800 leading-snug line-clamp-2">
                            {courseTitle}
                          </p>
                          <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-base font-bold ${cfg.classes}`}>
                            {cfg.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <FiStar
                              key={s}
                              className={`h-4 w-4 ${s <= starCount ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`}
                            />
                          ))}
                        </div>

                        <p className="text-base font-semibold text-zinc-500 leading-relaxed line-clamp-2">
                          &ldquo;{review.comment}&rdquo;
                        </p>

                        {review.status === 'approved' && (
                          <div className="flex items-center gap-1.5 text-green-600">
                            <FiCheck className="h-4 w-4" />
                            <span className="text-base font-bold">Published on course page</span>
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
