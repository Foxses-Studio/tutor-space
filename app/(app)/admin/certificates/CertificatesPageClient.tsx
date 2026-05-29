'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  FiAward, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiSearch, 
  FiUploadCloud, 
  FiTrash2, 
  FiEdit3, 
  FiExternalLink, 
  FiX, 
  FiInfo 
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface Student {
  id: string
  name: string
  email: string
  phone: string
}

interface Course {
  id: string
  title: string
}

interface CertificateRequest {
  id: string
  student: Student | null
  course: Course | null
  status: 'pending' | 'approved' | 'rejected'
  progress: number
  certificateUrl: string | null
  adminNotes: string
  createdAt: string
}

export default function CertificatesPageClient() {
  const [requests, setRequests] = useState<CertificateRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // Modal states
  const [activeRequest, setActiveRequest] = useState<CertificateRequest | null>(null)
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [certificateUrl, setCertificateUrl] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/certificates')
      const data = await res.json()
      if (data.success) {
        setRequests(data.requests)
      } else {
        throw new Error(data.error || 'Failed to fetch requests.')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Could not load certificate requests.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenManageModal = (req: CertificateRequest) => {
    setActiveRequest(req)
    setStatus(req.status)
    setCertificateUrl(req.certificateUrl || '')
    setAdminNotes(req.adminNotes || '')
  }

  const handleCloseModal = () => {
    setActiveRequest(null)
  }

  // Direct PDF Uploader
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please select a valid PDF document.',
        background: '#121829',
        color: '#fff',
      })
      return
    }

    setUploadingPdf(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', activeRequest ? `Certificate for ${activeRequest.student?.name} - ${activeRequest.course?.title}` : 'Certificate PDF')

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to upload PDF.')
      
      setCertificateUrl(data.media.url)
      Swal.fire({
        icon: 'success',
        title: 'PDF Uploaded',
        text: 'Certificate document uploaded successfully.',
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Failed to upload certificate document.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setUploadingPdf(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest) return

    if (status === 'approved' && !certificateUrl.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Document',
        text: 'Please upload a certificate PDF or provide a URL before approving.',
        background: '#121829',
        color: '#fff',
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/certificates/${activeRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          certificateUrl: certificateUrl.trim() || null,
          adminNotes: adminNotes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update request.')

      // Update state list
      setRequests(prev => prev.map(r => r.id === activeRequest.id ? {
        ...r,
        status,
        certificateUrl: certificateUrl.trim() || null,
        adminNotes: adminNotes.trim(),
      } : r))

      Swal.fire({
        icon: 'success',
        title: 'Request Updated',
        text: 'Student certificate request has been successfully modified.',
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })

      handleCloseModal()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: err.message || 'Failed to update certificate status.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (req: CertificateRequest) => {
    const result = await Swal.fire({
      title: 'Delete Request?',
      text: 'Are you sure you want to permanently delete this certificate request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete',
      background: '#121829',
      color: '#fff',
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/certificates/${req.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete request.')

      setRequests(prev => prev.filter(r => r.id !== req.id))
      Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Request successfully removed.',
        timer: 1200,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete request.',
        background: '#121829',
        color: '#fff',
      })
    }
  }

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const nameMatch = req.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      req.student?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const courseMatch = req.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = statusFilter === 'all' || req.status === statusFilter
    
    return (nameMatch || courseMatch) && statusMatch
  })

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-white flex items-center gap-2">
            <FiAward className="text-[#615fff]" /> Student Certificate Requests
          </h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Review student lecture progress and upload completed PDF certificates
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#121829] border border-zinc-800 p-5 rounded-lg">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <FiSearch className="absolute left-3 top-3.5 text-zinc-500 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or course..."
            className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 text-white rounded-lg pl-10 pr-4 py-3 text-base font-semibold outline-none w-full transition-colors"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <label className="text-base font-bold text-zinc-300 hidden sm:inline whitespace-nowrap">Filter Status</label>
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full md:w-48 cursor-pointer"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests table grid */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="h-10 w-10 border-2 border-[#615fff] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-base font-semibold text-zinc-550 mt-4">Loading certificate requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FiAward className="h-12 w-12 text-zinc-700 mx-auto" />
            <p className="text-base font-semibold text-zinc-500">
              No matching certificate requests found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-base">
              <thead>
                <tr className="bg-[#070b16] border-b border-zinc-800 text-zinc-400 font-bold text-sm uppercase tracking-wider font-display">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Syllabus Course</th>
                  <th className="px-6 py-4 text-center">Progress</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Requested Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 font-semibold text-zinc-200">
                {filteredRequests.map((req) => {
                  const requestDate = new Date(req.createdAt).toLocaleString('en-BD', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })

                  return (
                    <tr key={req.id} className="hover:bg-zinc-800/10 transition-colors">
                      {/* Student Details */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white text-base leading-snug">{req.student?.name || 'Unknown'}</p>
                          <p className="text-zinc-500 text-xs font-semibold mt-0.5">{req.student?.email || 'N/A'}</p>
                          <p className="text-zinc-500 text-xs font-semibold">{req.student?.phone || ''}</p>
                        </div>
                      </td>
                      {/* Course */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-base max-w-sm line-clamp-1">{req.course?.title || 'Unknown Course'}</p>
                      </td>
                      {/* Progress */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`inline-flex h-9 w-14 rounded-lg items-center justify-center font-bold text-sm border ${
                            req.progress === 100 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-[#8a88ff]'
                          }`}>
                            {req.progress}%
                          </span>
                          <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                req.progress === 100 ? 'bg-emerald-500' : 'bg-[#615fff]'
                              }`}
                              style={{ width: `${req.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider select-none ${
                          req.status === 'approved'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : req.status === 'rejected'
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}>
                          {req.status === 'approved' && <FiCheckCircle className="h-3.5 w-3.5" />}
                          {req.status === 'rejected' && <FiXCircle className="h-3.5 w-3.5" />}
                          {req.status === 'pending' && <FiClock className="h-3.5 w-3.5 animate-pulse" />}
                          {req.status}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {requestDate}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenManageModal(req)}
                            className="p-2.5 rounded-lg bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 text-[#615fff] hover:text-white transition-all inline-flex items-center cursor-pointer shadow-sm"
                            title="Review & Upload Certificate"
                          >
                            <FiEdit3 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(req)}
                            className="p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-450 hover:text-white transition-all inline-flex items-center cursor-pointer shadow-sm"
                            title="Delete request"
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
        )}
      </div>

      {/* Review Modal Dialog Backdrop */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={handleCloseModal}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden shadow-2xl w-full max-w-xl relative z-10 animate-scaleUp">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-zinc-850 bg-[#070b16] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiAward className="text-[#615fff]" /> Review Request
              </h3>
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Student info box */}
              <div className="bg-[#070b16] border border-zinc-850 p-4 rounded-lg space-y-2 select-text">
                <p className="text-xs font-bold text-zinc-450 uppercase tracking-widest">Student Information</p>
                <p className="text-base font-bold text-white">{activeRequest.student?.name}</p>
                <p className="text-sm font-semibold text-zinc-400">{activeRequest.student?.email} | {activeRequest.student?.phone}</p>
                <p className="text-sm font-bold text-indigo-400 pt-1 border-t border-zinc-850/50 mt-2">
                  Course: <span className="text-white">{activeRequest.course?.title}</span>
                </p>
              </div>

              {/* Progress and status overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#070b16] border border-zinc-850 p-3.5 rounded-lg text-center">
                  <p className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Student Progress</p>
                  <p className={`text-2xl font-bold mt-1.5 ${
                    activeRequest.progress === 100 ? 'text-emerald-400' : 'text-[#8a88ff]'
                  }`}>
                    {activeRequest.progress}% Complete
                  </p>
                </div>
                <div className="bg-[#070b16] border border-zinc-850 p-3.5 rounded-lg text-center">
                  <p className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Current Request Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider mt-2.5 ${
                    activeRequest.status === 'approved'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : activeRequest.status === 'rejected'
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {activeRequest.status}
                  </span>
                </div>
              </div>

              {/* Status Update Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300">Set Request Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full cursor-pointer"
                >
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approve & Release Certificate</option>
                  <option value="rejected">Reject Request</option>
                </select>
              </div>

              {/* Certificate URL with PDF Uploader */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300 flex items-center justify-between">
                  <span>Certificate PDF Document URL</span>
                  {certificateUrl && (
                    <a 
                      href={certificateUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-[#615fff] flex items-center gap-1 hover:underline"
                    >
                      View Document <FiExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={certificateUrl}
                    onChange={(e) => setCertificateUrl(e.target.value)}
                    placeholder="https://tutorspace.com/media/certificate.pdf"
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none flex-1 font-mono"
                  />
                  
                  {/* Hidden input trigger */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingPdf}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-white rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer select-none disabled:opacity-50"
                  >
                    {uploadingPdf ? (
                      <div className="h-5 w-5 border-2 border-[#615fff] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiUploadCloud className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs font-semibold text-zinc-500">
                  Upload the completed student PDF certificate directly or paste an external hosted link.
                </p>
              </div>

              {/* Admin Notes */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-bold text-zinc-300">Administrative Notes / Reasons</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Excellent work! Certificate approved and released to the dashboard."
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-3 border border-zinc-800 hover:border-zinc-700 bg-transparent text-zinc-300 hover:text-white font-bold text-base rounded-lg flex-1 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base rounded-lg flex-1 cursor-pointer transition-all shadow-md shadow-[#615fff]/15"
                >
                  {saving ? 'Saving...' : 'Save Updates'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
