'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FiSave, FiX, FiVideo, FiRadio, FiHelpCircle, FiPlus, FiTrash2, FiFileText } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CourseOption {
  id: string
  title: string
}

interface QuizQuestion {
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

interface LessonFormProps {
  courses: CourseOption[]
  initialData?: {
    id: string
    title: string
    slug: string
    order: number
    moduleName?: string
    lessonType: 'recorded' | 'live' | 'quiz' | 'assignment'
    videoUrl?: string
    livePlatform?: string
    liveUrl?: string
    liveDate?: string
    duration: number
    isPreviewable: boolean
    courseId: string
    autoGenerateZoom?: boolean
    quizQuestions?: QuizQuestion[]
    totalMarks?: number
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
  const [moduleName, setModuleName] = useState(initialData?.moduleName || 'General Module')
  const [order, setOrder] = useState(initialData?.order || 1)
  const [lessonType, setLessonType] = useState<'recorded' | 'live' | 'quiz' | 'assignment'>(
    initialData?.lessonType || 'recorded'
  )
  const [totalMarks, setTotalMarks] = useState<number>(initialData?.totalMarks || 100)
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '')
  const [livePlatform, setLivePlatform] = useState(initialData?.livePlatform || 'zoom')
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || '')
  const [liveDate, setLiveDate] = useState(
    initialData?.liveDate ? initialData.liveDate.slice(0, 16) : ''
  )
  const [duration, setDuration] = useState(initialData?.duration || 60)
  const [isPreviewable, setIsPreviewable] = useState(initialData?.isPreviewable || false)
  const [autoGenerateZoom, setAutoGenerateZoom] = useState(initialData?.autoGenerateZoom || false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    initialData?.quizQuestions || [
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }
    ]
  )
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

    if (lessonType === 'quiz') {
      const invalid = quizQuestions.some(q => !q.questionText.trim() || q.options.some(o => !o.trim()))
      if (invalid) {
        Swal.fire({
          icon: 'warning',
          title: 'Validation Error',
          text: 'Please fill in all quiz question texts and option answers.',
          background: '#121829',
          color: '#fff',
        })
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        title,
        slug,
        course: courseId,
        order,
        moduleName,
        lessonType,
        videoUrl: lessonType === 'recorded' ? videoUrl : undefined,
        livePlatform: lessonType === 'live' ? livePlatform : undefined,
        liveUrl: lessonType === 'live' ? liveUrl : undefined,
        liveDate: lessonType === 'live' && liveDate ? liveDate : undefined,
        duration,
        isPreviewable,
        autoGenerateZoom: lessonType === 'live' && livePlatform === 'zoom' ? autoGenerateZoom : false,
        quizQuestions: lessonType === 'quiz' ? quizQuestions : undefined,
        totalMarks: (lessonType === 'quiz' || lessonType === 'assignment') ? totalMarks : undefined,
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

            {/* Module Name */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Module Name (e.g. Module 1: Introduction) *</label>
              <input
                type="text"
                required
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Module 1: Introduction to JavaScript"
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
              <div className="flex flex-wrap gap-3">
                {(['recorded', 'live', 'quiz', 'assignment'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setLessonType(type)
                      if (type === 'quiz') {
                        setDuration(15) // default duration for quiz
                      } else if (type === 'assignment') {
                        setDuration(30) // default duration for assignment
                      }
                    }}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-base border transition-all cursor-pointer ${
                      lessonType === type
                        ? 'bg-[#615fff] border-[#615fff] text-white shadow-md shadow-[#615fff]/20'
                        : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {type === 'recorded' ? (
                      <FiVideo className="h-5 w-5" />
                    ) : type === 'live' ? (
                      <FiRadio className="h-5 w-5" />
                    ) : type === 'quiz' ? (
                      <FiHelpCircle className="h-5 w-5" />
                    ) : (
                      <FiFileText className="h-5 w-5" />
                    )}
                    {type === 'recorded'
                      ? 'Recorded Video'
                      : type === 'live'
                      ? 'Live Session'
                      : type === 'quiz'
                      ? 'Interactive Quiz'
                      : 'Assignment'}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional fields depending on format */}
            {lessonType === 'recorded' ? (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <label className="text-base font-bold text-zinc-300">Video Source (Embed URL or Private R2 Key)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={handleVideoUrlChange}
                  placeholder="https://www.youtube.com/embed/...  or  videos/lesson-1.mp4"
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors font-mono"
                />
                <p className="text-base font-medium text-zinc-500 leading-relaxed">
                  Paste a <span className="text-zinc-300 font-semibold">YouTube / Vimeo / any platform URL</span> to embed it,
                  or a <span className="text-zinc-300 font-semibold">private R2 object key</span> (e.g. <span className="font-mono text-[#8a88ff]">videos/lesson-1.mp4</span>) to stream it securely with link protection.
                </p>
              </div>
            ) : lessonType === 'live' ? (
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
                    <p className="text-base font-medium text-zinc-400">
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
            ) : lessonType === 'assignment' ? (
              <div className="space-y-4 border border-[#615fff]/25 rounded-lg p-6 bg-gradient-to-b from-[#121829] to-[#0d1222] shadow-2xl shadow-[#615fff]/5 animate-fadeIn">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-zinc-850 pb-3">
                  <FiFileText className="text-[#615fff] h-6 w-6" /> Assignment Configuration
                </h3>
                
                <div className="flex flex-col gap-2">
                  <label className="text-base font-bold text-zinc-300">Assignment Evaluation Marks *</label>
                  <input
                    type="number"
                    min={1}
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors animate-fadeIn"
                  />
                </div>
                <p className="text-base font-semibold text-zinc-400">
                  Students will see this assignment and submit a secure Google Drive link containing their work for grading.
                </p>
              </div>
            ) : (
              <div className="space-y-6 border border-[#615fff]/25 rounded-lg p-6 bg-gradient-to-b from-[#121829] to-[#0d1222] shadow-2xl shadow-[#615fff]/5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FiHelpCircle className="text-[#615fff] h-6 w-6" /> Quiz Questions Builder
                    </h3>
                    <p className="text-base font-medium text-zinc-400 mt-1">
                      Configure dynamic evaluation queries with dynamic option selection
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Quiz Total Marks */}
                    <div className="flex items-center gap-2 bg-[#070b16] border border-zinc-800 px-3.5 py-2.5 rounded-lg">
                      <span className="text-base font-bold text-zinc-400">Quiz Marks:</span>
                      <input
                        type="number"
                        min={1}
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(Number(e.target.value))}
                        className="bg-transparent border-none text-white w-16 text-base font-bold outline-none text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuizQuestions([...quizQuestions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 }])}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#615fff] to-[#5248e8] hover:from-[#5248e8] hover:to-[#4338ca] text-white rounded-lg text-base font-bold shadow-lg shadow-[#615fff]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
                    >
                      <FiPlus className="h-5 w-5" /> Add Question
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {quizQuestions.map((q, qIdx) => (
                    <div 
                      key={qIdx} 
                      className="bg-slate-950/40 backdrop-blur border border-zinc-800/80 hover:border-[#615fff]/30 p-6 rounded-lg space-y-6 transition-all duration-300 relative"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-zinc-850/50">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#615fff] to-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 select-none">
                            {String(qIdx + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <span className="text-base font-bold text-white block">Question Details</span>
                            <span className="text-base font-medium text-zinc-400 block mt-0.5">Define your question and choices below</span>
                          </div>
                        </div>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuizQuestions(quizQuestions.filter((_, idx) => idx !== qIdx))
                            }}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center"
                            title="Delete question"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div className="flex flex-col gap-2">
                        <label className="text-base font-bold text-zinc-300">Question Title / Text *</label>
                        <input
                          type="text"
                          required
                          value={q.questionText}
                          onChange={(e) => {
                            const newQuestions = [...quizQuestions]
                            newQuestions[qIdx].questionText = e.target.value
                            setQuizQuestions(newQuestions)
                          }}
                          placeholder="e.g. What does CSS stand for in web development?"
                          className="bg-[#121829] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3.5 text-base font-semibold outline-none w-full transition-colors"
                        />
                      </div>

                      {/* Options Section Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                        <div>
                          <h4 className="text-base font-bold text-zinc-300">Configure Options / Answers *</h4>
                          <p className="text-base font-medium text-zinc-400 mt-0.5">Add up to 6 options and mark the correct one.</p>
                        </div>
                        {q.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newQuestions = [...quizQuestions]
                              newQuestions[qIdx].options.push('')
                              setQuizQuestions(newQuestions)
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#615fff]/10 hover:bg-[#615fff]/20 border border-[#615fff]/20 hover:border-[#615fff]/40 text-[#8a88ff] hover:text-white rounded-lg text-base font-bold transition-all cursor-pointer"
                          >
                            <FiPlus className="h-5 w-5" /> Add Choice
                          </button>
                        )}
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isCorrect = q.correctAnswerIndex === optIdx
                          return (
                            <div 
                              key={optIdx} 
                              className={`p-4 bg-[#121829] border rounded-lg flex flex-col gap-3.5 transition-all duration-300 relative group/opt ${
                                isCorrect
                                  ? 'border-emerald-500/50 bg-emerald-950/10 shadow-sm shadow-emerald-500/5'
                                  : 'border-zinc-800/80 hover:border-zinc-700/80'
                              }`}
                            >
                              <div className="flex items-center justify-between select-none">
                                <span className={`text-base font-bold ${
                                  isCorrect ? 'text-emerald-400' : 'text-zinc-400'
                                }`}>
                                  Option {String.fromCharCode(65 + optIdx)} *
                                </span>
                                
                                <div className="flex items-center gap-2">
                                  {/* Set Correct Trigger */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newQuestions = [...quizQuestions]
                                      newQuestions[qIdx].correctAnswerIndex = optIdx
                                      setQuizQuestions(newQuestions)
                                    }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-bold transition-all border cursor-pointer ${
                                      isCorrect
                                        ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                                        : 'bg-zinc-850 border-zinc-800 text-zinc-550 hover:text-zinc-350'
                                    }`}
                                  >
                                    {isCorrect ? '✓ Correct' : 'Set Correct'}
                                  </button>

                                  {/* Delete Option Trigger */}
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newQuestions = [...quizQuestions]
                                        const deletedIdx = optIdx
                                        const oldCorrect = newQuestions[qIdx].correctAnswerIndex
                                        
                                        newQuestions[qIdx].options = newQuestions[qIdx].options.filter((_, idx) => idx !== optIdx)
                                        
                                        if (oldCorrect === deletedIdx) {
                                          newQuestions[qIdx].correctAnswerIndex = 0
                                        } else if (oldCorrect > deletedIdx) {
                                          newQuestions[qIdx].correctAnswerIndex = oldCorrect - 1
                                        }
                                        
                                        setQuizQuestions(newQuestions)
                                      }}
                                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                      title="Delete choice"
                                    >
                                      <FiTrash2 className="h-5 w-5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => {
                                  const newQuestions = [...quizQuestions]
                                  newQuestions[qIdx].options[optIdx] = e.target.value
                                  setQuizQuestions(newQuestions)
                                }}
                                placeholder={`Enter Option ${String.fromCharCode(65 + optIdx)} answer`}
                                className={`bg-[#070b16] border rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors ${
                                  isCorrect 
                                    ? 'border-emerald-500/30 focus:border-emerald-500 text-white focus:ring-1 focus:ring-emerald-500' 
                                    : 'border-zinc-800/80 focus:border-zinc-700/80 text-zinc-300 focus:text-white focus:ring-1 focus:ring-zinc-700'
                                }`}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
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
