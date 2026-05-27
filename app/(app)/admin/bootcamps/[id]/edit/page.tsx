'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiSave, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiAward
} from 'react-icons/fi'

interface CourseItem {
  _id: string
  title: string
}

interface Props {
  params: Promise<{ id: string }>
}

export default function EditBootcampPage({ params }: Props) {
  const router = useRouter()
  const { id: bootcampId } = React.use(params)

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)

  // Form Fields
  const [bootcampTitle, setBootcampTitle] = useState('')
  const [bootcampDesc, setBootcampDesc] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalSeats, setTotalSeats] = useState('50')
  const [price, setPrice] = useState('0')
  const [status, setStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming')

  // Notification Banners (Strictly zero popup alerts!)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesRes, bootcampRes] = await Promise.all([
          fetch('/api/admin/courses'),
          fetch(`/api/admin/bootcamps`)
        ])

        if (coursesRes.ok) {
          const data = await coursesRes.json()
          setCourses(data.courses || [])
        }

        // Fetch bootcamp specifics from the list of bootcamps
        if (bootcampRes.ok) {
          const data = await bootcampRes.json()
          const bList: any[] = data.bootcamps || []
          const bObj = bList.find(b => b._id === bootcampId)
          if (bObj) {
            setBootcampTitle(bObj.title)
            setBootcampDesc(bObj.description)
            setSelectedCourseId(bObj.course?._id || '')
            setStartDate(bObj.startDate.split('T')[0])
            setEndDate(bObj.endDate.split('T')[0])
            setTotalSeats(bObj.totalSeats.toString())
            setPrice(bObj.price.toString())
            setStatus(bObj.status)
          }
        }
      } catch (err) {
        console.error('Failed to load bootcamp details for editing:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [bootcampId])

  const handleUpdateBootcamp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bootcampTitle.trim() || !bootcampDesc.trim() || !selectedCourseId || !startDate || !endDate || !totalSeats) {
      setErrorMsg('Please fill in all required fields.')
      setTimeout(() => setErrorMsg(''), 4000)
      return
    }

    const payload = {
      title: bootcampTitle,
      description: bootcampDesc,
      course: selectedCourseId,
      startDate,
      endDate,
      totalSeats: Number(totalSeats),
      price: Number(price || 0),
      status,
    }

    try {
      const res = await fetch(`/api/admin/bootcamps/${bootcampId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccessMsg('Intensive Bootcamp successfully updated. Redirecting...')
        setTimeout(() => {
          router.push('/admin/bootcamps')
        }, 1500)
      } else {
        throw new Error(data.error || 'Failed to update bootcamp.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed. Please try again.')
      setTimeout(() => setErrorMsg(''), 4000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-400">Loading Bootcamp details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 pb-16">
      
      {/* Header toolbar */}
      <div className="flex items-center justify-between mb-8 select-none">
        <button 
          onClick={() => router.push('/admin/bootcamps')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-[#18181b] hover:bg-[#222] text-zinc-350 hover:text-white font-bold text-base transition-colors cursor-pointer"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span>Back to Bootcamps</span>
        </button>
        <span className="text-base font-bold text-[#615fff] bg-[#615fff]/10 px-4 py-1.5 rounded-lg uppercase tracking-wider">
          Edit Mode
        </span>
      </div>

      <div className="bg-[#18181b] border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 bg-[#141416] border-b border-zinc-800 flex items-center gap-2.5 select-none">
          <FiAward className="text-[#615fff] h-6 w-6" />
          <h1 className="text-xl font-bold text-white">Update Course Bootcamp</h1>
        </div>

        <form onSubmit={handleUpdateBootcamp} className="p-8 space-y-6">
          
          {successMsg && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 font-semibold text-base flex items-center gap-2 animate-fadeIn">
              <FiCheckCircle className="shrink-0 h-5 w-5" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-455 font-semibold text-base flex items-center gap-2 animate-fadeIn">
              <FiAlertCircle className="shrink-0 h-5 w-5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-zinc-355 block select-none">Bootcamp Title *</label>
            <input
              type="text"
              required
              value={bootcampTitle}
              onChange={(e) => setBootcampTitle(e.target.value)}
              placeholder="e.g. Next.js 16 Production Bootcamp"
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none"
            />
          </div>

          {/* Associated Course */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-zinc-350 block select-none">Design For Course *</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none cursor-pointer"
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-zinc-350 block select-none">Short Highlights / Details *</label>
            <textarea
              required
              value={bootcampDesc}
              onChange={(e) => setBootcampDesc(e.target.value)}
              placeholder="Highlights of key topics covered, prerequisites, or projects."
              rows={4}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none resize-none"
            />
          </div>

          {/* Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-base font-bold text-zinc-350 block select-none">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none cursor-pointer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-base font-bold text-zinc-350 block select-none">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Capacity and Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-base font-bold text-zinc-350 block select-none">Seat Capacity *</label>
              <input
                type="number"
                required
                min={1}
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-base font-bold text-zinc-355 block select-none">Booking Price (BDT) *</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 0 for Free"
                className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg px-4 py-3.5 text-base font-semibold text-white outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-base font-bold text-zinc-350 block select-none">Event status</label>
            <div className="flex items-center gap-2 bg-[#121212] border border-zinc-800 p-1.5 rounded-lg select-none">
              {['upcoming', 'active', 'completed'].map((st) => (
                <label 
                  key={st}
                  className={`flex-1 flex items-center justify-center py-3 rounded-lg text-base font-bold uppercase tracking-wide cursor-pointer transition-all ${
                    status === st 
                      ? 'bg-[#615fff] text-white shadow shadow-[#615fff]/20' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={st}
                    checked={status === st}
                    onChange={() => setStatus(st as any)}
                    className="hidden"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-zinc-800 select-none">
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-colors inline-flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-[#615fff]/15"
            >
              <FiSave className="h-5 w-5" />
              <span>Update Bootcamp Details</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  )
}
