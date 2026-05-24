'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiVideo, FiRadio, FiEye } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CourseOption {
  id: string
  title: string
  status: string
}

interface LessonItem {
  id: string
  title: string
  slug: string
  order: number
  lessonType: 'recorded' | 'live'
  videoUrl?: string
  livePlatform?: string
  liveUrl?: string
  liveDate?: string
  duration: number
  isPreviewable: boolean
  courseTitle?: string
}

export default function LessonsPageClient({ courses }: { courses: CourseOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCourseId = searchParams.get('courseId') || ''

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId)
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCourseId) {
      fetchLessons(selectedCourseId)
      // Sync search param with router to keep state on refresh/back
      const params = new URLSearchParams(window.location.search)
      params.set('courseId', selectedCourseId)
      router.replace(`?${params.toString()}`)
    } else {
      setLessons([])
      const params = new URLSearchParams(window.location.search)
      params.delete('courseId')
      router.replace(`?${params.toString()}`)
    }
  }, [selectedCourseId])

  async function fetchLessons(courseId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/lessons?courseId=${courseId}`)
      const data = await res.json()
      if (data.success) {
        const mapped = data.lessons.map((l: any) => ({
          id: l._id,
          title: l.title,
          slug: l.slug,
          order: l.order,
          lessonType: l.lessonType,
          videoUrl: l.videoUrl,
          livePlatform: l.livePlatform,
          liveUrl: l.liveUrl,
          liveDate: l.liveDate,
          duration: l.duration,
          isPreviewable: l.isPreviewable,
          courseTitle: l.course?.title,
        }))
        setLessons(mapped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(lesson: LessonItem) {
    const result = await Swal.fire({
      title: `Delete "${lesson.title}"?`,
      text: 'This action will delete the lesson permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
      background: '#121829',
      color: '#fff',
    })
    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' })
      if (res.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== lesson.id))
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Lesson successfully deleted.',
          timer: 1200,
          showConfirmButton: false,
          background: '#121829',
          color: '#fff',
        })
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete lesson.',
        background: '#121829',
        color: '#fff',
      })
    }
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Lessons Syllabus Hub</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Organise, sequence and schedule your course content
          </p>
        </div>
        {selectedCourseId && (
          <Link
            href={`/admin/lessons/new?courseId=${selectedCourseId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer"
          >
            <FiPlus className="h-5 w-5" /> Add New Lesson
          </Link>
        )}
      </div>

      {/* Course selector */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg p-5">
        <label className="text-base font-bold text-zinc-300 block mb-2">
          Select Course to Manage Syllabus
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full max-w-xl transition-colors cursor-pointer"
        >
          <option value="">-- Choose a Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} {c.status === 'draft' ? '(Draft)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Lessons list */}
      {selectedCourseId && (
        <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-10 w-10 border-2 border-[#615fff] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-base font-semibold text-zinc-500 mt-4">Loading syllabus...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <FiVideo className="h-10 w-10 text-zinc-700 mx-auto" />
              <p className="text-base font-semibold text-zinc-500">
                No lessons created yet. Add your first lesson above.
              </p>
            </div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-zinc-800/50 bg-[#0b0e17]">
                <p className="text-base font-bold text-zinc-450">
                  {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in syllabus
                </p>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-[#152347]/10 transition-colors"
                    >
                      {/* Order badge */}
                      <div className="h-9 w-9 rounded-lg bg-[#615fff]/15 border border-[#615fff]/20 flex items-center justify-center font-bold text-[#615fff] text-base shrink-0">
                        {lesson.order}
                      </div>
                      {/* Type icon */}
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          lesson.lessonType === 'live'
                            ? 'bg-rose-500/10 border border-rose-500/20'
                            : 'bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        {lesson.lessonType === 'live' ? (
                          <FiRadio className="h-4.5 w-4.5 text-rose-400" />
                        ) : (
                          <FiVideo className="h-4.5 w-4.5 text-emerald-400" />
                        )}
                      </div>
                      {/* Lesson info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-base truncate">{lesson.title}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span
                            className={`text-sm font-bold capitalize px-2 py-0.5 rounded border ${
                              lesson.lessonType === 'live'
                                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            }`}
                          >
                            {lesson.lessonType === 'live'
                              ? `Live • ${lesson.livePlatform}`
                              : 'Recorded'}
                          </span>
                          <span className="text-sm font-semibold text-zinc-550">
                            {lesson.duration} min
                          </span>
                          {lesson.isPreviewable && (
                            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                              <FiEye className="h-3.5 w-3.5" />
                              Preview
                            </span>
                          )}
                          {lesson.liveDate && (
                            <span className="text-sm font-semibold text-zinc-550">
                              {new Date(lesson.liveDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/admin/lessons/${lesson.id}/edit`}
                          className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all cursor-pointer"
                        >
                          <FiEdit className="h-4.5 w-4.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(lesson)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all cursor-pointer"
                        >
                          <FiTrash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
