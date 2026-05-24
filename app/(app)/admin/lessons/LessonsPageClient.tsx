'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  FiPlus, FiEdit, FiTrash2, FiVideo, FiRadio,
  FiSave, FiX, FiChevronDown, FiArrowUp, FiArrowDown, FiEye
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CourseOption { id: string; title: string; status: string }
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

function slugify(text: string) {
  return text.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '')
}

export default function LessonsPageClient({ courses }: { courses: CourseOption[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCourseId = searchParams.get('courseId') || ''

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId)
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formOrder, setFormOrder] = useState(1)
  const [formType, setFormType] = useState<'recorded' | 'live'>('recorded')
  const [formVideoUrl, setFormVideoUrl] = useState('')
  const [formPlatform, setFormPlatform] = useState('zoom')
  const [formLiveUrl, setFormLiveUrl] = useState('')
  const [formLiveDate, setFormLiveDate] = useState('')
  const [formDuration, setFormDuration] = useState(60)
  const [formPreviewable, setFormPreviewable] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (selectedCourseId) fetchLessons(selectedCourseId)
    else setLessons([])
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
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function openNewForm() {
    setEditingLesson(null)
    setFormTitle(''); setFormSlug(''); setFormOrder(lessons.length + 1)
    setFormType('recorded'); setFormVideoUrl(''); setFormPlatform('zoom')
    setFormLiveUrl(''); setFormLiveDate(''); setFormDuration(60); setFormPreviewable(false)
    setShowForm(true)
  }

  function openEditForm(lesson: LessonItem) {
    setEditingLesson(lesson)
    setFormTitle(lesson.title); setFormSlug(lesson.slug); setFormOrder(lesson.order)
    setFormType(lesson.lessonType); setFormVideoUrl(lesson.videoUrl || ''); setFormPlatform(lesson.livePlatform || 'zoom')
    setFormLiveUrl(lesson.liveUrl || ''); setFormLiveDate(lesson.liveDate ? lesson.liveDate.slice(0, 16) : '')
    setFormDuration(lesson.duration); setFormPreviewable(lesson.isPreviewable)
    setShowForm(true)
  }

  async function handleSave() {
    if (!formTitle || !formSlug || !selectedCourseId) {
      Swal.fire({ icon: 'warning', title: 'Required Fields Missing', background: '#121829', color: '#fff' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: formTitle, slug: formSlug, course: selectedCourseId, order: formOrder,
        lessonType: formType, videoUrl: formType === 'recorded' ? formVideoUrl : undefined,
        livePlatform: formType === 'live' ? formPlatform : undefined,
        liveUrl: formType === 'live' ? formLiveUrl : undefined,
        liveDate: formType === 'live' && formLiveDate ? formLiveDate : undefined,
        duration: formDuration, isPreviewable: formPreviewable,
      }
      const url = editingLesson ? `/api/admin/lessons/${editingLesson.id}` : '/api/admin/lessons'
      const method = editingLesson ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      Swal.fire({ icon: 'success', title: editingLesson ? 'Lesson Updated' : 'Lesson Created', timer: 1400, showConfirmButton: false, background: '#121829', color: '#fff' })
      setShowForm(false)
      fetchLessons(selectedCourseId)
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.message, background: '#121829', color: '#fff' })
    } finally { setSaving(false) }
  }

  async function handleDelete(lesson: LessonItem) {
    const result = await Swal.fire({
      title: `Delete "${lesson.title}"?`, icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#ef4444', confirmButtonText: 'Delete', background: '#121829', color: '#fff'
    })
    if (!result.isConfirmed) return
    await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' })
    setLessons(prev => prev.filter(l => l.id !== lesson.id))
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Lessons Syllabus Hub</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">Organise, sequence and schedule your course content</p>
        </div>
        {selectedCourseId && (
          <button onClick={openNewForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer">
            <FiPlus className="h-5 w-5" /> Add New Lesson
          </button>
        )}
      </div>

      {/* Course selector */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg p-5">
        <label className="text-base font-bold text-zinc-300 block mb-2">Select Course to Manage Syllabus</label>
        <select
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
          className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full max-w-xl transition-colors cursor-pointer"
        >
          <option value="">-- Choose a Course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title} {c.status === 'draft' ? '(Draft)' : ''}</option>
          ))}
        </select>
      </div>

      {/* Lesson Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1322] border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer"><FiX className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-bold text-zinc-300">Lesson Title *</label>
                <input type="text" value={formTitle}
                  onChange={e => { setFormTitle(e.target.value); if (!editingLesson) setFormSlug(slugify(e.target.value)) }}
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
              </div>
              {/* Slug & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-bold text-zinc-300">URL Slug *</label>
                  <input type="text" value={formSlug} onChange={e => setFormSlug(slugify(e.target.value))}
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-bold text-zinc-300">Order Number *</label>
                  <input type="number" min={1} value={formOrder} onChange={e => setFormOrder(Number(e.target.value))}
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
                </div>
              </div>
              {/* Lesson Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-base font-bold text-zinc-300">Lesson Format</label>
                <div className="flex gap-3">
                  {(['recorded', 'live'] as const).map(type => (
                    <button key={type} type="button" onClick={() => setFormType(type)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-base border transition-all cursor-pointer ${
                        formType === type ? 'bg-[#615fff] border-[#615fff] text-white' : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:text-white'}`}>
                      {type === 'recorded' ? <FiVideo className="h-5 w-5" /> : <FiRadio className="h-5 w-5" />}
                      {type === 'recorded' ? 'Recorded Video' : 'Live Session'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Conditional fields */}
              {formType === 'recorded' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-bold text-zinc-300">Video URL (YouTube / Vimeo / CDN)</label>
                  <input type="url" value={formVideoUrl} onChange={e => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-base font-bold text-zinc-300">Live Platform</label>
                      <select value={formPlatform} onChange={e => setFormPlatform(e.target.value)}
                        className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none cursor-pointer">
                        {['zoom', 'meet', 'teams', 'other'].map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-base font-bold text-zinc-300">Scheduled Date & Time</label>
                      <input type="datetime-local" value={formLiveDate} onChange={e => setFormLiveDate(e.target.value)}
                        className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-base font-bold text-zinc-300">Join Link (Meeting URL)</label>
                    <input type="url" value={formLiveUrl} onChange={e => setFormLiveUrl(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
                  </div>
                </div>
              )}
              {/* Duration & Previewable */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-base font-bold text-zinc-300">Duration (minutes) *</label>
                  <input type="number" min={1} value={formDuration} onChange={e => setFormDuration(Number(e.target.value))}
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
                </div>
                <div className="flex flex-col gap-1.5 justify-end">
                  <label className="flex items-center gap-3 cursor-pointer mt-5">
                    <div className={`relative w-12 h-6 rounded-full transition-colors ${formPreviewable ? 'bg-[#615fff]' : 'bg-zinc-700'}`}
                      onClick={() => setFormPreviewable(!formPreviewable)}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${formPreviewable ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-base font-bold text-zinc-300">Free Preview</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3.5 mt-2 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? (<><div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Saving...</span></>) : (<><FiSave className="h-5 w-5" />{editingLesson ? 'Save Changes' : 'Create Lesson'}</>)}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <p className="text-base font-semibold text-zinc-500">No lessons created yet. Add your first lesson above.</p>
            </div>
          ) : (
            <div>
              <div className="px-6 py-4 border-b border-zinc-800/50 bg-[#0b0e17]">
                <p className="text-base font-bold text-zinc-400">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} in syllabus</p>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#152347]/10 transition-colors">
                    {/* Order badge */}
                    <div className="h-9 w-9 rounded-lg bg-[#615fff]/15 border border-[#615fff]/20 flex items-center justify-center font-bold text-[#615fff] text-base shrink-0">
                      {lesson.order}
                    </div>
                    {/* Type icon */}
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      lesson.lessonType === 'live' ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                      {lesson.lessonType === 'live'
                        ? <FiRadio className="h-4.5 w-4.5 text-rose-400" />
                        : <FiVideo className="h-4.5 w-4.5 text-emerald-400" />}
                    </div>
                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base truncate">{lesson.title}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-sm font-bold capitalize px-2 py-0.5 rounded border ${
                          lesson.lessonType === 'live' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                          {lesson.lessonType === 'live' ? `Live • ${lesson.livePlatform}` : 'Recorded'}
                        </span>
                        <span className="text-sm font-semibold text-zinc-500">{lesson.duration} min</span>
                        {lesson.isPreviewable && (
                          <span className="text-sm font-bold text-amber-400 flex items-center gap-1"><FiEye className="h-3.5 w-3.5" />Preview</span>
                        )}
                        {lesson.liveDate && (
                          <span className="text-sm font-semibold text-zinc-500">
                            {new Date(lesson.liveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditForm(lesson)}
                        className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all cursor-pointer">
                        <FiEdit className="h-4.5 w-4.5" />
                      </button>
                      <button onClick={() => handleDelete(lesson)}
                        className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all cursor-pointer">
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
