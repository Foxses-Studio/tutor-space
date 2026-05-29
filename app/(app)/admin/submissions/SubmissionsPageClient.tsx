'use client'

import React, { useState, useEffect } from 'react'
import { FiCheckCircle, FiClock, FiFileText, FiAward, FiEye, FiSearch, FiX, FiCheck, FiChevronRight } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface SubmissionItem {
  id: string
  student: {
    id: string
    name: string
    email: string
    phone: string
  } | null
  course: {
    id: string
    title: string
  } | null
  lesson: {
    id: string
    title: string
    totalMarks: number
  } | null
  type: 'quiz' | 'assignment'
  googleDriveLink: string | null
  status: 'pending' | 'graded'
  feedback: string
  totalMarks: number
  marksObtained: number
  quizCorrectAnswers: number
  quizTotalQuestions: number
  submittedAt: string
  gradedAt: string | null
}

export default function SubmissionsPageClient() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all')

  // Grading modal state
  const [activeSubmission, setActiveSubmission] = useState<SubmissionItem | null>(null)
  const [marksInput, setMarksInput] = useState<number>(0)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [editDriveLink, setEditDriveLink] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchSubmissions() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/submissions')
      const data = await res.json()
      if (res.ok && data.success) {
        setSubmissions(data.submissions || [])
      } else {
        throw new Error(data.error || 'Failed to load submissions.')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Error occurred while loading submissions.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleOpenGradeModal = (sub: SubmissionItem) => {
    setActiveSubmission(sub)
    setMarksInput(sub.status === 'graded' ? sub.marksObtained : sub.lesson?.totalMarks || 100)
    setFeedbackInput(sub.feedback || '')
    setEditDriveLink(sub.googleDriveLink || '')
  }

  const handleCloseGradeModal = () => {
    setActiveSubmission(null)
  }

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeSubmission) return

    const maxMarks = activeSubmission.lesson?.totalMarks || 100
    if (marksInput < 0 || marksInput > maxMarks) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: `Marks obtained must be between 0 and ${maxMarks}.`,
        background: '#121829',
        color: '#fff',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/submissions/${activeSubmission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marksObtained: Number(marksInput),
          feedback: feedbackInput,
          googleDriveLink: editDriveLink,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit grade.')

      await Swal.fire({
        icon: 'success',
        title: 'Graded Successfully',
        text: 'Student submission grade and feedback saved.',
        timer: 1200,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })

      handleCloseGradeModal()
      fetchSubmissions()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save grade.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setSaving(false)
    }
  }

  // Filter logic
  const filtered = submissions.filter((sub) => {
    // Search filter
    const studentName = sub.student?.name?.toLowerCase() || ''
    const courseTitle = sub.course?.title?.toLowerCase() || ''
    const lessonTitle = sub.lesson?.title?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    const matchesSearch = studentName.includes(query) || courseTitle.includes(query) || lessonTitle.includes(query)

    // Status filter
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Counters
  const totalCount = submissions.length
  const pendingCount = submissions.filter((s) => s.status === 'pending').length
  const gradedCount = submissions.filter((s) => s.status === 'graded').length

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Heading Section */}
      <div className="border-b border-zinc-800/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Grading & Submissions</h1>
          <p className="text-base font-semibold text-zinc-455 mt-1">
            Grade student assignment submissions and drive links
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-zinc-400">Total Submissions</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-[#615fff]/10 flex items-center justify-center text-[#8a88ff]">
            <FiFileText className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-zinc-400">Pending Review</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <FiClock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-zinc-400">Graded & Complete</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{gradedCount}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <FiCheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search row */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-3.5 text-zinc-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by student name or lesson title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg pl-10 pr-4 py-2.5 text-base font-semibold outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Status Filter Buttons */}
          <div className="flex bg-[#070b16] border border-zinc-800 rounded-lg p-1">
            {(['all', 'pending', 'graded'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-base font-bold transition-all cursor-pointer capitalize ${
                  statusFilter === s
                    ? 'bg-[#615fff] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-semibold text-zinc-400">Loading submissions registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-450 space-y-2">
            <FiFileText className="mx-auto h-12 w-12 text-zinc-600" />
            <p className="text-lg font-bold text-zinc-300">No submissions found</p>
            <p className="text-base font-medium">Try matching search items or toggling filter query states.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#070b16]/50 text-zinc-400 select-none">
                  <th className="px-6 py-4 text-base font-bold">Student</th>
                  <th className="px-6 py-4 text-base font-bold">Course / Lesson</th>
                  <th className="px-6 py-4 text-base font-bold text-center">Submission Link</th>
                  <th className="px-6 py-4 text-base font-bold text-center">Score / Marks</th>
                  <th className="px-6 py-4 text-base font-bold text-center">Status</th>
                  <th className="px-6 py-4 text-base font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#070b16]/20 transition-colors">
                    {/* Student details */}
                    <td className="px-6 py-4">
                      <p className="text-base font-bold text-white">{sub.student?.name || 'Anonymous'}</p>
                      <p className="text-base font-semibold text-zinc-500 mt-0.5">{sub.student?.email || 'N/A'}</p>
                    </td>

                    {/* Course/Lesson details */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-base font-bold text-white truncate" title={sub.lesson?.title}>{sub.lesson?.title || 'Unknown Lesson'}</p>
                      <p className="text-base font-semibold text-zinc-500 mt-0.5 truncate" title={sub.course?.title}>{sub.course?.title || 'Unknown Course'}</p>
                    </td>

                    {/* Google Drive submission Link */}
                    <td className="px-6 py-4 text-center">
                      {sub.googleDriveLink ? (
                        <a
                          href={sub.googleDriveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#615fff]/10 hover:bg-[#615fff]/20 border border-[#615fff]/20 text-[#8a88ff] hover:text-white rounded-lg text-base font-bold transition-all cursor-pointer"
                        >
                          <FiEye className="h-4.5 w-4.5" /> View Drive Link
                        </a>
                      ) : (
                        <span className="text-base text-zinc-600 font-semibold">—</span>
                      )}
                    </td>

                    {/* Grade score display */}
                    <td className="px-6 py-4 text-center">
                      {sub.status === 'graded' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-bold text-emerald-400">{sub.marksObtained} Marks</span>
                          <span className="text-base font-semibold text-zinc-500 mt-0.5">out of {sub.totalMarks}</span>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-amber-500">Not Graded</span>
                      )}
                    </td>

                    {/* Status indicator */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-base font-bold select-none ${
                        sub.status === 'graded'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {sub.status === 'graded' ? <FiCheckCircle /> : <FiClock />}
                        {sub.status === 'graded' ? 'Graded' : 'Pending'}
                      </span>
                    </td>

                    {/* Grading Actions trigger */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className="px-4 py-2 bg-gradient-to-r from-[#615fff] to-[#5248e8] hover:from-[#5248e8] hover:to-[#4338ca] text-white rounded-lg text-base font-bold shadow-md shadow-[#615fff]/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
                      >
                        {sub.status === 'graded' ? 'Update Grade' : 'Grade Assignment'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-850 p-5 bg-[#070b16]/40 select-none">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiAward className="text-[#615fff]" /> Grade Student Submission
                </h3>
                <p className="text-base font-semibold text-zinc-400 mt-0.5">
                  Review and award marks for assignment tasks
                </p>
              </div>
              <button
                onClick={handleCloseGradeModal}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveGrade} className="p-6 space-y-5">
              {/* Context Summary */}
              <div className="bg-[#070b16] border border-zinc-850 rounded-lg p-4 space-y-2.5">
                <div className="flex justify-between text-base">
                  <span className="font-bold text-zinc-450">Student:</span>
                  <span className="font-bold text-white">{activeSubmission.student?.name}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-zinc-455">Task:</span>
                  <span className="font-bold text-[#8a88ff]">{activeSubmission.lesson?.title}</span>
                </div>
                {activeSubmission.googleDriveLink && (
                  <div className="flex justify-between text-base border-t border-zinc-850/60 pt-2.5 items-center">
                    <span className="font-bold text-zinc-450">Drive Link:</span>
                    <a
                      href={activeSubmission.googleDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#615fff]/10 hover:bg-[#615fff]/20 border border-[#615fff]/20 text-[#8a88ff] hover:text-white rounded-lg text-base font-bold transition-all cursor-pointer"
                    >
                      <FiEye className="h-4 w-4" /> Open Attachment
                    </a>
                  </div>
                )}
              </div>

              {/* Marks input */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300 flex justify-between items-center select-none">
                  <span>Marks Awarded *</span>
                  <span className="text-zinc-500 font-semibold">Max possible: {activeSubmission.lesson?.totalMarks || 100}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={activeSubmission.lesson?.totalMarks || 100}
                  required
                  value={marksInput}
                  onChange={(e) => setMarksInput(Number(e.target.value))}
                  placeholder="e.g. 85"
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                />
              </div>

              {/* Google Drive Link input */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300 select-none">
                  Google Drive Submission Link
                </label>
                <input
                  type="url"
                  value={editDriveLink}
                  onChange={(e) => setEditDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors font-mono"
                />
              </div>

              {/* Feedback input */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300 select-none">Feedback / Review Notes</label>
                <textarea
                  rows={4}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Provide guidance, point out mistakes, or share encouragement..."
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={handleCloseGradeModal}
                  className="px-5 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-base font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-[#615fff] hover:bg-[#5248e8] text-white rounded-lg text-base font-bold shadow-md shadow-[#615fff]/20 transition-all cursor-pointer border-none"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-5 w-5" /> Save Grade & Return
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
