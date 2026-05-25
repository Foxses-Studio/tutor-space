'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiSave, FiX, FiVideo, FiRadio } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CourseOption {
  id: string
  title: string
}

interface LessonFormProps {
  courses: CourseOption[]
  initialData?: {
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
    courseId: string
    autoGenerateZoom?: boolean
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default function LessonFormClient({ courses, initialData }: LessonFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = !!initialData

  // Determine active course
  const defaultCourseId = initialData?.courseId || searchParams.get('courseId') || ''

  // Form states
  const [courseId, setCourseId] = useState(defaultCourseId)
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [order, setOrder] = useState(initialData?.order || 1)
  const [lessonType, setLessonType] = useState<'recorded' | 'live'>(
    initialData?.lessonType || 'recorded'
  )
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '')
  const [livePlatform, setLivePlatform] = useState(initialData?.livePlatform || 'zoom')
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || '')
  const [liveDate, setLiveDate] = useState(
    initialData?.liveDate ? initialData.liveDate.slice(0, 16) : ''
  )
  const [duration, setDuration] = useState(initialData?.duration || 60)
  const [isPreviewable, setIsPreviewable] = useState(initialData?.isPreviewable || false)
  const [autoGenerateZoom, setAutoGenerateZoom] = useState(initialData?.autoGenerateZoom || false)
  const [saving, setSaving] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!isEditMode) {
      setSlug(slugify(val))
    }
  }

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim()
    if (val.startsWith('<iframe')) {
      const match = val.match(/src="([^"]+)"/)
      if (match && match[1]) {
        setVideoUrl(match[1])
        return
      }
    }
    setVideoUrl(val)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !slug.trim() || !courseId) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Course, lesson title, and slug are required.',
        background: '#121829',
        color: '#fff',
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        title,
        slug,
        course: courseId,
        order,
        lessonType,
        videoUrl: lessonType === 'recorded' ? videoUrl : undefined,
        livePlatform: lessonType === 'live' ? livePlatform : undefined,
        liveUrl: lessonType === 'live' ? liveUrl : undefined,
        liveDate: lessonType === 'live' && liveDate ? liveDate : undefined,
        duration,
        isPreviewable,
        autoGenerateZoom: lessonType === 'live' && livePlatform === 'zoom' ? autoGenerateZoom : false,
      }

      const url = isEditMode ? `/api/admin/lessons/${initialData?.id}` : '/api/admin/lessons'
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Lesson Updated' : 'Lesson Created',
        text: isEditMode
          ? 'Syllabus lesson has been successfully updated.'
          : 'Syllabus lesson has been successfully created.',
        timer: 1200,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })

      router.push(`/admin/lessons?courseId=${courseId}`)
      router.refresh()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save lesson.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Back & Heading panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">
            {isEditMode ? 'Edit Lesson' : 'Add Lesson'}
          </h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Build and sequence premium syllabus catalog programs
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(courseId ? `/admin/lessons?courseId=${courseId}` : '/admin/lessons')}
          className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-350 hover:text-white rounded-lg text-base font-bold transition-colors cursor-pointer"
        >
          Cancel & Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-3">Lesson Parameters</h2>

            {/* Course Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Target Syllabus Course *</label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Lesson Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Introduction to Next.js routing structures"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>

            {/* Slug & Order Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300">URL path suffix (Slug) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="intro-to-routing"
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors font-mono"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300">Display / Lecture Order *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                />
              </div>
            </div>

            {/* Lesson Format / Type Selector */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-base font-bold text-zinc-300">Lesson Format</label>
              <div className="flex gap-3">
                {(['recorded', 'live'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLessonType(type)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-base border transition-all cursor-pointer ${
                      lessonType === type
                        ? 'bg-[#615fff] border-[#615fff] text-white shadow-md shadow-[#615fff]/20'
                        : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {type === 'recorded' ? (
                      <FiVideo className="h-5 w-5" />
                    ) : (
                      <FiRadio className="h-5 w-5" />
                    )}
                    {type === 'recorded' ? 'Recorded Video' : 'Live Interactive Session'}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional fields depending on format */}
            {lessonType === 'recorded' ? (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <label className="text-base font-bold text-zinc-300">Video CDN / Embed URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={handleVideoUrlChange}
                  placeholder="https://www.youtube.com/embed/..."
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors font-mono"
                />
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-base font-bold text-zinc-300">Live Meeting Platform</label>
                    <select
                      value={livePlatform}
                      onChange={(e) => setLivePlatform(e.target.value)}
                      className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
                    >
                      <option value="zoom">Zoom</option>
                      <option value="meet">Google Meet</option>
                      <option value="teams">Microsoft Teams</option>
                      <option value="other">Other / Custom</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-base font-bold text-zinc-300">Scheduled Time & Date</label>
                    <input
                      type="datetime-local"
                      value={liveDate}
                      onChange={(e) => setLiveDate(e.target.value)}
                      className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                    />
                  </div>
                </div>
                {livePlatform === 'zoom' && (
                  <div className="bg-[#070b16] border border-zinc-800/80 rounded-lg p-4 flex flex-col gap-3 animate-fadeIn">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          autoGenerateZoom ? 'bg-[#615fff]' : 'bg-zinc-700'
                        }`}
                        onClick={() => setAutoGenerateZoom(!autoGenerateZoom)}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            autoGenerateZoom ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </div>
                      <span className="text-base font-bold text-zinc-300">Auto-generate Zoom Meeting Link</span>
                    </label>
                    <p className="text-sm font-semibold text-zinc-400">
                      When enabled, Tutor Space will automatically create a Zoom meeting using your Server-to-Server OAuth credentials.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-base font-bold text-zinc-300">
                    {autoGenerateZoom ? 'Meeting Join URL (Auto-generated)' : 'Meeting Join URL'}
                  </label>
                  <input
                    type="url"
                    value={liveUrl || ''}
                    disabled={autoGenerateZoom}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder={autoGenerateZoom ? 'Will be automatically generated upon save' : 'https://zoom.us/j/...'}
                    className={`bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors font-mono ${
                      autoGenerateZoom ? 'opacity-50 cursor-not-allowed select-none' : ''
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Lecture Duration (Minutes)</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Sidebar settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-2.5">Settings</h3>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isPreviewable ? 'bg-[#615fff]' : 'bg-zinc-700'
                }`}
                onClick={() => setIsPreviewable(!isPreviewable)}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isPreviewable ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className="text-base font-bold text-zinc-300">Free Preview Lecture</span>
            </label>
          </div>

          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-lg shadow-[#615fff]/20 hover:shadow-[#615fff]/30 transition-all duration-300 cursor-pointer flex items-center justify-center ${
                saving ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Lesson'
              )}
            </button>
          </div>
        </div>

      </div>

    </form>
  )
}
