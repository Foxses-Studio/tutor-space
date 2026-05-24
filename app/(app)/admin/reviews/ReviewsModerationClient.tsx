'use client'

import React, { useState } from 'react'
import { FiStar, FiCheck, FiX, FiClock, FiSearch, FiPlus } from 'react-icons/fi'
import Swal from 'sweetalert2'
import Link from 'next/link'

interface ReviewItem {
  _id: string
  rating: string
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  course?: { title: string; slug: string }
  student?: { name: string; email: string }
  createdAt: string
}

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: FiClock },
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: FiCheck },
  rejected: { label: 'Rejected', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/25', icon: FiX },
}

function StarDisplay({ rating }: { rating: string }) {
  const r = parseInt(rating, 10)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <FiStar key={s} className={`h-4 w-4 ${s <= r ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`} />
      ))}
    </div>
  )
}

export default function ReviewsModerationClient({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  const filtered = reviews.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchSearch = !search ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      (r.student?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.course?.title || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const pendingCount = reviews.filter(r => r.status === 'pending').length

  async function updateStatus(reviewId: string, newStatus: 'approved' | 'rejected') {
    setUpdating(reviewId)
    try {
      const res = await fetch('/api/admin/reviews/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, status: newStatus } : r))
      Swal.fire({
        icon: 'success',
        title: newStatus === 'approved' ? 'Review Approved' : 'Review Rejected',
        timer: 1200, showConfirmButton: false, background: '#121829', color: '#fff'
      })
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message, background: '#121829', color: '#fff' })
    } finally { setUpdating(null) }
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Reviews Moderation</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">Review student feedback before it appears on course pages</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-base">
              <FiClock className="h-5 w-5" />
              {pendingCount} awaiting review
            </div>
          )}
          <Link href="/admin/reviews/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer">
            <FiPlus className="h-5 w-5" /> Add New Review
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-[#121829] border border-zinc-800 p-4 rounded-lg">
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-[#070b16] border border-zinc-800 focus-within:border-[#615fff]/60 rounded-lg transition-colors">
          <FiSearch className="h-5 w-5 text-zinc-500 shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student, course or comment..."
            className="bg-transparent border-none outline-none w-full text-base font-semibold text-white placeholder-zinc-500" />
        </div>
        <div className="flex bg-[#070b16] border border-zinc-800 p-1 rounded-lg">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button key={tab} onClick={() => setFilterStatus(tab)}
              className={`px-4 py-1.5 rounded-md text-base font-bold capitalize transition-all cursor-pointer ${
                filterStatus === tab ? 'bg-[#615fff] text-white' : 'text-zinc-400 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#121829] border border-zinc-800 rounded-lg p-16 text-center">
          <FiStar className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-base font-semibold text-zinc-500">No reviews match your current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(review => {
            const conf = statusConfig[review.status]
            const Icon = conf.icon
            const isUpdating = updating === review._id
            const initials = (review.student?.name || 'AN').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

            return (
              <div key={review._id} className="bg-[#121829] border border-zinc-800 rounded-lg p-5 space-y-4 hover:border-zinc-700 transition-colors">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#615fff]/15 border border-[#615fff]/20 flex items-center justify-center font-bold text-[#615fff] text-base shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-white text-base leading-tight">{review.student?.name || 'Anonymous'}</p>
                      <p className="text-sm font-semibold text-zinc-500 mt-0.5">{review.student?.email}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-sm font-bold ${conf.color} ${conf.bg} ${conf.border}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {conf.label}
                  </div>
                </div>

                {/* Course & rating */}
                {review.course && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-400 truncate max-w-[60%]">
                      <span className="text-zinc-600 font-semibold">Course:</span> {review.course.title}
                    </p>
                    <StarDisplay rating={review.rating} />
                  </div>
                )}

                {/* Comment */}
                <blockquote className="text-base font-semibold text-zinc-300 leading-relaxed border-l-2 border-[#615fff]/40 pl-3 line-clamp-4">
                  &ldquo;{review.comment}&rdquo;
                </blockquote>

                {/* Date */}
                <p className="text-sm font-semibold text-zinc-600">
                  {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => updateStatus(review._id, 'approved')}
                    disabled={isUpdating || review.status === 'approved'}
                    className="flex-1 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/25 hover:border-emerald-500 text-emerald-400 hover:text-white font-bold text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <FiCheck className="h-4.5 w-4.5" />
                    {isUpdating ? 'Updating...' : 'Approve'}
                  </button>
                  <button onClick={() => updateStatus(review._id, 'rejected')}
                    disabled={isUpdating || review.status === 'rejected'}
                    className="flex-1 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 border border-rose-500/25 hover:border-rose-500 text-rose-400 hover:text-white font-bold text-base transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <FiX className="h-4.5 w-4.5" />
                    {isUpdating ? 'Updating...' : 'Reject'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
