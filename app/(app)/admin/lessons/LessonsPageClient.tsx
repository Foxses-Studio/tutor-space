'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPlus, FiEdit, FiTrash2, FiVideo, FiRadio, FiEye, FiHelpCircle } from 'react-icons/fi'
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
  moduleName?: string
  lessonType: 'recorded' | 'live' | 'quiz'
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
          moduleName: l.moduleName,
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
              <div className="px-6 py-4 border-b border-zinc-800/50 bg-[#0b0e17] flex items-center justify-between">
                <p className="text-base font-bold text-zinc-450">
                  Syllabus Registry ({lessons.length} lesson{lessons.length !== 1 ? 's' : ''})
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-base">
                  <thead>
                    <tr className="bg-[#121212] border-b border-zinc-800 text-zinc-400 font-bold text-sm uppercase tracking-wider font-display">
                      <th className="px-6 py-3.5 text-center w-16">Order</th>
                      <th className="px-6 py-3.5">Lesson Title</th>
                      <th className="px-6 py-3.5">Module</th>
                      <th className="px-6 py-3.5">Format</th>
                      <th className="px-6 py-3.5">Duration</th>
                      <th className="px-6 py-3.5 text-right w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-semibold text-zinc-200">
                    {lessons
                      .sort((a, b) => a.order - b.order)
                      .map((lesson) => {
                        const dateObj = lesson.liveDate ? new Date(lesson.liveDate) : null
                        const formattedDate = dateObj
                          ? dateObj.toLocaleString('en-BD', {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : '—'

                        return (
                          <tr key={lesson.id} className="hover:bg-zinc-800/20 transition-colors">
                            {/* Order */}
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex h-9 w-9 rounded-lg bg-[#615fff]/15 border border-[#615fff]/20 items-center justify-center font-bold text-[#615fff]">
                                {lesson.order}
                              </span>
                            </td>
                            {/* Lesson Title */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  lesson.lessonType === 'live'
                                    ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450'
                                    : lesson.lessonType === 'quiz'
                                    ? 'bg-amber-500/10 border border-amber-500/20 text-amber-450'
                                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450'
                                }`}>
                                  {lesson.lessonType === 'live' ? (
                                    <FiRadio className="h-4.5 w-4.5" />
                                  ) : lesson.lessonType === 'quiz' ? (
                                    <FiHelpCircle className="h-4.5 w-4.5" />
                                  ) : (
                                    <FiVideo className="h-4.5 w-4.5" />
                                  )}
                                </span>
                                <div>
                                  <p className="font-bold text-white text-base leading-snug line-clamp-1">{lesson.title}</p>
                                </div>
                              </div>
                            </td>
                            {/* Module */}
                            <td className="px-6 py-4">
                              <span className="text-zinc-350 bg-zinc-800/40 border border-zinc-700/50 rounded px-2.5 py-1 text-sm select-none">
                                {lesson.moduleName || 'General Module'}
                              </span>
                            </td>
                            {/* Format */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold capitalize px-2.5 py-1 rounded border select-none ${
                                  lesson.lessonType === 'live'
                                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                    : lesson.lessonType === 'quiz'
                                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                }`}>
                                  {lesson.lessonType === 'live'
                                    ? `Live • ${lesson.livePlatform || 'zoom'}`
                                    : lesson.lessonType === 'quiz'
                                    ? 'Quiz'
                                    : 'Recorded'}
                                </span>
                                {lesson.isPreviewable && (
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 select-none items-center gap-1">
                                    <FiEye className="h-3 w-3" />
                                    Preview
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Duration */}
                            <td className="px-6 py-4 text-zinc-300">
                              {lesson.duration} mins
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <Link
                                  href={`/admin/lessons/${lesson.id}/edit`}
                                  className="p-2 rounded-lg bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 text-[#615fff] hover:text-white transition-all duration-200 hover:scale-105 inline-flex items-center shadow-sm cursor-pointer"
                                >
                                  <FiEdit className="h-4.5 w-4.5" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(lesson)}
                                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all duration-200 hover:scale-105 inline-flex items-center shadow-sm cursor-pointer"
                                >
                                  <FiTrash2 className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
