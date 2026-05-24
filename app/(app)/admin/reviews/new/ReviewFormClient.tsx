'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiStar, FiArrowLeft, FiPlus, FiCheck, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CourseOption {
  id: string
  title: string
}

interface StudentOption {
  id: string
  name: string
  email: string
}

interface ReviewFormClientProps {
  courses: CourseOption[]
  students: StudentOption[]
}

export default function ReviewFormClient({ courses, students }: ReviewFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [courseId, setCourseId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'approved' | 'pending'>('approved')

  // Student states: either select existing or create a custom one
  const [isCustomStudent, setIsCustomStudent] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [customStudentName, setCustomStudentName] = useState('')
  const [customStudentEmail, setCustomStudentEmail] = useState('')

  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!courseId || !comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select a course and enter a review comment.',
        background: '#121829',
        color: '#ffffff',
      })
      return
    }

    if (isCustomStudent) {
      if (!customStudentName.trim() || !customStudentEmail.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please provide custom student name and email.',
          background: '#121829',
          color: '#ffffff',
        })
        return
      }
    } else {
      if (!selectedStudentId) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please select an existing student, or opt to create a custom student.',
          background: '#121829',
          color: '#ffffff',
        })
        return
      }
    }

    setIsSubmitting(true)

    const payload = {
      course: courseId,
      rating,
      comment: comment.trim(),
      status,
      studentId: isCustomStudent ? '' : selectedStudentId,
      studentName: isCustomStudent ? customStudentName.trim() : '',
      studentEmail: isCustomStudent ? customStudentEmail.trim() : '',
    }

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Review Added Successfully',
        text: 'The review document has been registered in the database.',
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#ffffff',
      })

      router.push('/admin/reviews')
      router.refresh()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.message || 'Could not complete the write request.',
        background: '#121829',
        color: '#ffffff',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Back & Heading panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Add Review</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Register a custom review directly from the management console
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/reviews')}
          className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-350 hover:text-white rounded-lg text-base font-bold transition-colors cursor-pointer"
        >
          Cancel & Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-3">Review Parameters</h2>

            {/* Course Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Target Course *</label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                <option value="">-- Select Target Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Mode Selector */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-zinc-300">Student Profile *</label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCustomStudent}
                    onChange={(e) => setIsCustomStudent(e.target.checked)}
                    className="rounded border-zinc-800 bg-[#070b16] text-[#615fff] focus:ring-0 h-4 w-4"
                  />
                  <span className="text-base font-semibold text-zinc-400">Add Custom Student on the fly</span>
                </label>
              </div>

              {isCustomStudent ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5 bg-[#070b16] border border-zinc-850 rounded-lg animate-fadeIn">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-zinc-400">Student Name *</label>
                    <input
                      type="text"
                      required
                      value={customStudentName}
                      onChange={(e) => setCustomStudentName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="bg-[#070b16] border border-zinc-850 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-zinc-400">Student Email *</label>
                    <input
                      type="email"
                      required
                      value={customStudentEmail}
                      onChange={(e) => setCustomStudentEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="bg-[#070b16] border border-zinc-850 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
                >
                  <option value="">-- Choose Existing Student Profile --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Star Rating Picker */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-base font-bold text-zinc-300">Rating Tier *</label>
              <div className="flex items-center gap-1 bg-[#070b16] border border-zinc-850 p-3.5 rounded-lg w-fit">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoveredStar ?? rating)
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 duration-150"
                    >
                      <FiStar
                        className={`h-7 w-7 transition-colors duration-150 ${
                          isFilled ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  )
                })}
                <span className="ml-3 text-base font-bold text-zinc-400">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hoveredStar ?? rating]}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Review Comment *</label>
              <textarea
                required
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write student testimonial / experience feedback..."
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Sidebar Info: Visibility Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-2.5">Visibility Status</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Moderation State</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                <option value="approved">Approved & Live (Instant Publish)</option>
                <option value="pending">Pending Admin Review</option>
              </select>
            </div>
          </div>

          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-lg shadow-[#615fff]/20 hover:shadow-[#615fff]/30 transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isSubmitting ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Review...</span>
                </div>
              ) : (
                'Add Review Document'
              )}
            </button>
          </div>
        </div>

      </div>

    </form>
  )
}
