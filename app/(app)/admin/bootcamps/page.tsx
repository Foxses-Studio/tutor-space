'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiBookOpen, 
  FiUsers, 
  FiX, 
  FiSearch,
  FiCheckCircle,
  FiAward
} from 'react-icons/fi'

interface StudentOption {
  _id: string
  name: string
  email: string
}

interface BootcampItem {
  _id: string
  title: string
  description: string
  course: {
    _id: string
    title: string
  }
  startDate: string
  endDate: string
  totalSeats: number
  price: number
  status: 'upcoming' | 'active' | 'completed'
  students: Array<{
    _id: string
    name: string
    email: string
    phone?: string
  }>
}

export default function BootcampsAdminPage() {
  const router = useRouter()
  // Main lists states
  const [bootcamps, setBootcamps] = useState<BootcampItem[]>([])
  const [allStudents, setAllStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)

  // Selected Bootcamp for manual seat bookings
  const [selectedBootcamp, setSelectedBootcamp] = useState<BootcampItem | null>(null)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [bootcampSearchQuery, setBootcampSearchQuery] = useState('')

  // Inline Notification Banners
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('')

  const bookingManagerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [bootcampsRes, enrolledRes] = await Promise.all([
          fetch('/api/admin/bootcamps'),
          fetch('/api/enrollments?depth=2')
        ])

        if (bootcampsRes.ok) {
          const data = await bootcampsRes.json()
          setBootcamps(data.bootcamps || [])
        }

        if (enrolledRes.ok) {
          const eData = await enrolledRes.json()
          const docs = eData.docs || []
          const uniqueStudentsMap: Record<string, StudentOption> = {}
          docs.forEach((d: any) => {
            if (d.student && typeof d.student === 'object') {
              uniqueStudentsMap[d.student._id] = {
                _id: d.student._id,
                name: d.student.name,
                email: d.student.email,
              }
            }
          })
          setAllStudents(Object.values(uniqueStudentsMap))
        }
      } catch (err) {
        console.error('Failed to load bootcamp management workspace data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleDeleteBootcamp = async (id: string) => {
    const confirm = window.confirm('Are you absolutely sure you want to delete this Bootcamp?')
    if (!confirm) return

    try {
      const res = await fetch(`/api/admin/bootcamps/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok && data.success) {
        setBootcamps(prev => prev.filter(b => b._id !== id))
        if (selectedBootcamp?._id === id) {
          setSelectedBootcamp(null)
        }
      } else {
        throw new Error(data.error || 'Failed to delete bootcamp.')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete bootcamp.')
    }
  }

  const handleSelectBootcampBookings = (bootcamp: BootcampItem) => {
    setSelectedBootcamp(bootcamp)
    setTimeout(() => {
      bookingManagerRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleAddStudentToBootcamp = async (student: StudentOption) => {
    if (!selectedBootcamp) return

    if (selectedBootcamp.students.some(s => s._id === student._id)) {
      setBookingSuccessMsg('Student is already registered for this Bootcamp.')
      setTimeout(() => setBookingSuccessMsg(''), 3000)
      return
    }

    if (selectedBootcamp.students.length >= selectedBootcamp.totalSeats) {
      setBookingSuccessMsg('Booking failed: Bootcamp is fully registered.')
      setTimeout(() => setBookingSuccessMsg(''), 3000)
      return
    }

    const updatedStudentIds = [...selectedBootcamp.students.map(s => s._id), student._id]

    try {
      const res = await fetch(`/api/admin/bootcamps/${selectedBootcamp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedStudentIds })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        const updatedBootcamp = {
          ...selectedBootcamp,
          students: [...selectedBootcamp.students, student]
        }
        setSelectedBootcamp(updatedBootcamp)
        setBootcamps(prev => prev.map(b => b._id === selectedBootcamp._id ? updatedBootcamp : b))

        setBookingSuccessMsg(`Seat successfully booked for ${student.name}.`)
        setTimeout(() => setBookingSuccessMsg(''), 3000)
      }
    } catch (err: any) {
      console.error('Failed to book seat:', err)
    }
  }

  const handleRemoveStudentFromBootcamp = async (studentId: string) => {
    if (!selectedBootcamp) return

    const updatedStudentIds = selectedBootcamp.students.map(s => s._id).filter(id => id !== studentId)

    try {
      const res = await fetch(`/api/admin/bootcamps/${selectedBootcamp._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: updatedStudentIds })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        const updatedBootcamp = {
          ...selectedBootcamp,
          students: selectedBootcamp.students.filter(s => s._id !== studentId)
        }
        setSelectedBootcamp(updatedBootcamp)
        setBootcamps(prev => prev.map(b => b._id === selectedBootcamp._id ? updatedBootcamp : b))

        setBookingSuccessMsg('Student booking registration successfully cancelled.')
        setTimeout(() => setBookingSuccessMsg(''), 3000)
      }
    } catch (err: any) {
      console.error('Failed to remove student booking:', err)
    }
  }

  const filteredBootcamps = bootcamps.filter(b => 
    b.title.toLowerCase().includes(bootcampSearchQuery.toLowerCase()) ||
    b.course?.title.toLowerCase().includes(bootcampSearchQuery.toLowerCase())
  )

  const filteredAvailableStudents = allStudents.filter(student => 
    (student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())) &&
    !(selectedBootcamp?.students.some(s => s._id === student._id))
  )

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-400">Loading Bootcamps Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 pb-16">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 select-none">
        <div>
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#615fff]/15 border border-[#615fff]/30 text-base font-bold text-[#615fff] uppercase tracking-wider mb-3">
            Special Programs
          </span>
          <h1 className="text-3xl font-bold font-display text-white leading-tight">
            Bootcamp Management
          </h1>
          <p className="text-base font-semibold text-zinc-500 mt-1">
            Design live intensive Bootcamps for each course, manage ticket pricing, monitor booked seats, and enroll registered students manually.
          </p>
        </div>

        <button
          onClick={() => router.push('/admin/bootcamps/new')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base rounded-lg transition-colors cursor-pointer border-none shadow-md shadow-[#615fff]/15 shrink-0"
        >
          <FiPlus className="h-5 w-5" />
          <span>Design Bootcamp</span>
        </button>
      </div>

      {/* Main Card View */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        
        {/* Search Toolbar */}
        <div className="p-5 border-b border-zinc-800 flex items-center relative select-none">
          <FiSearch className="absolute left-9 h-5 w-5 text-zinc-500" />
          <input
            type="text"
            value={bootcampSearchQuery}
            onChange={(e) => setBootcampSearchQuery(e.target.value)}
            placeholder="Search bootcamps by title or course name..."
            className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg pl-12 pr-4 py-3.5 text-base font-semibold text-white outline-none placeholder-zinc-500"
          />
        </div>

        {filteredBootcamps.length === 0 ? (
          <div className="p-16 text-center select-none">
            <FiAward className="h-12 w-12 text-zinc-650 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white">No Bootcamps Found</h3>
            <p className="text-base font-semibold text-zinc-500 max-w-sm mx-auto mt-2 leading-relaxed">
              Design and launch your first intensive course-associated Bootcamp using the top action button.
            </p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBootcamps.map((bootcamp) => {
              const booked = bootcamp.students?.length || 0
              const total = bootcamp.totalSeats || 50
              const percent = Math.min(100, Math.round((booked / total) * 100))
              const isSelected = selectedBootcamp?._id === bootcamp._id

              return (
                <div 
                  key={bootcamp._id} 
                  className={`bg-[#121212] border rounded-lg p-5 flex flex-col justify-between transition-all duration-300 ${
                    isSelected ? 'border-[#615fff] shadow-lg shadow-[#615fff]/5 bg-[#615fff]/5' : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Title and status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug line-clamp-1" title={bootcamp.title}>
                          {bootcamp.title}
                        </h3>
                        <span className="text-[#615fff] text-xs font-bold uppercase tracking-wider block mt-1">
                          For Course: {bootcamp.course?.title || 'General'}
                        </span>
                      </div>
                      <span className={`inline-block shrink-0 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        bootcamp.status === 'active' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-455' 
                          : bootcamp.status === 'completed'
                            ? 'bg-zinc-800 text-zinc-400 border border-zinc-750'
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {bootcamp.status}
                      </span>
                    </div>

                    <p className="text-base font-semibold text-zinc-400 line-clamp-2">
                      {bootcamp.description}
                    </p>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 text-base pt-2.5 border-t border-zinc-800/80 text-zinc-350 select-none">
                      <div>
                        <p className="text-zinc-550 text-sm font-semibold">Start & End Dates</p>
                        <p className="font-bold mt-0.5">
                          {new Date(bootcamp.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(bootcamp.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-550 text-sm font-semibold">Seat Fee</p>
                        <p className="font-bold text-[#615fff] mt-0.5">
                          {bootcamp.price > 0 ? `${bootcamp.price} BDT` : 'FREE Entry'}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5 pt-1.5 select-none">
                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold text-zinc-450">Seat Registrations</span>
                        <span className="font-bold text-white">{booked} / {total} booked ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-805 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-5 select-none pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleSelectBootcampBookings(bootcamp)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-base font-bold transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                        isSelected
                          ? 'bg-[#615fff] border-transparent text-white shadow-md'
                          : 'border-zinc-800 hover:border-zinc-700 bg-[#141416] hover:bg-[#222] text-zinc-300 hover:text-white'
                      }`}
                    >
                      <FiUsers className="h-4.5 w-4.5" />
                      <span>Book Student ({booked})</span>
                    </button>

                    <button
                      onClick={() => router.push(`/admin/bootcamps/${bootcamp._id}/edit`)}
                      className="p-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white bg-[#141416] hover:bg-[#222] transition-colors cursor-pointer"
                      title="Edit Bootcamp Details"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteBootcamp(bootcamp._id)}
                      className="p-2.5 rounded-lg border border-red-500/15 hover:border-red-500 bg-[#141416] text-red-500 hover:bg-red-550/10 transition-colors cursor-pointer"
                      title="Delete Bootcamp"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Bottom Section: Seat Booking Manager (100% Inline, zero popups) ── */}
      {selectedBootcamp && (
        <div ref={bookingManagerRef} className="bg-[#18181b] border border-zinc-800 rounded-lg overflow-hidden shadow-sm mt-10 animate-fadeIn">
          
          <div className="px-6 py-5 bg-[#141416] border-b border-zinc-800 flex items-center justify-between select-none">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiUsers className="text-[#615fff]" />
                <span>Seat Booking Manager - {selectedBootcamp.title}</span>
              </h2>
              <p className="text-base font-semibold text-zinc-555 mt-1">
                For Course: <span className="text-white font-bold">{selectedBootcamp.course?.title || 'General'}</span> — book, cancel, or monitor student seat bookings.
              </p>
            </div>
            <button 
              onClick={() => setSelectedBootcamp(null)}
              className="p-2 rounded-lg border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            
            {bookingSuccessMsg && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 font-semibold text-base mb-6 flex items-center gap-2 animate-fadeIn">
                <FiCheckCircle className="shrink-0 h-5 w-5" />
                <span>{bookingSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left Side: Booked Students List */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-300 flex items-center gap-2 select-none">
                  <FiCheckCircle className="text-emerald-500" />
                  <span>Booked Seats ({selectedBootcamp.students?.length || 0} / {selectedBootcamp.totalSeats})</span>
                </h3>
                
                <div className="border border-zinc-800 rounded-lg bg-[#121212] p-4 max-h-[350px] overflow-y-auto space-y-3 pr-2">
                  {selectedBootcamp.students?.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 select-none">
                      <FiUsers className="h-10 w-10 mx-auto mb-2 text-zinc-650 animate-pulse" />
                      <p className="text-base font-semibold">No students booked seats for this Bootcamp yet.</p>
                      <p className="text-sm text-zinc-555 mt-1">Search and enroll a registered student on the right.</p>
                    </div>
                  ) : (
                    selectedBootcamp.students.map((student: any) => (
                      <div key={student._id} className="p-4 rounded-lg bg-[#18181b] border border-zinc-800 flex items-center justify-between gap-3 group">
                        <div className="min-w-0">
                          <p className="text-base font-bold text-white truncate">{student.name}</p>
                          <p className="text-base text-zinc-500 truncate mt-0.5">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudentFromBootcamp(student._id)}
                          className="px-4 py-2 rounded-lg border border-red-500/15 hover:border-red-500 bg-[#121212] text-red-500 hover:bg-red-550/10 text-base font-bold transition-all cursor-pointer select-none"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Side: Search and Enroll */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-zinc-300 flex items-center gap-2 select-none">
                  <FiPlus className="text-[#615fff]" />
                  <span>Book Registered Student Seat</span>
                </h3>

                {/* Search Bar */}
                <div className="relative select-none">
                  <FiSearch className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-500" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search student by name or email address..."
                    className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/60 rounded-lg pl-11 pr-4 py-3 text-base font-semibold text-white outline-none placeholder-zinc-555"
                  />
                </div>

                {/* Search Results list */}
                <div className="border border-zinc-800 rounded-lg bg-[#121212] p-4 max-h-[290px] overflow-y-auto space-y-3 pr-2">
                  {filteredAvailableStudents.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 select-none">
                      <p className="text-base font-semibold">No unregistered student entries found.</p>
                    </div>
                  ) : (
                    filteredAvailableStudents.map(student => (
                      <div key={student._id} className="p-4 rounded-lg bg-[#18181b] border border-zinc-850 hover:border-zinc-800 flex items-center justify-between gap-3 transition-colors">
                        <div className="min-w-0">
                          <p className="text-base font-bold text-white truncate">{student.name}</p>
                          <p className="text-base text-zinc-500 truncate mt-0.5">{student.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddStudentToBootcamp(student)}
                          className="px-5 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white text-base font-bold transition-colors cursor-pointer select-none border-none shadow shadow-[#615fff]/10"
                        >
                          Book Seat
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}
