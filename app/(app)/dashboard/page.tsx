'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiUser, FiLogOut, FiBookOpen, FiClock, FiAward, FiBook, FiExternalLink, FiCalendar, FiArrowRight } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface UserSession {
  id: string
  name: string
  email: string
  phone?: string
  profilePic?: any // Populated media object or ID
  role: string
}

interface CourseItem {
  id: string
  title: string
  summary: string
  price: number
  duration?: string
  level?: string
  thumbnail?: {
    url: string
    alt?: string
  }
  category?: {
    name: string
  }
  instructor?: {
    name: string
  }
}

interface EnrollmentItem {
  id: string
  course: CourseItem
  paymentStatus: string
  createdAt: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSessionAndFetchData() {
      try {
        const sessionRes = await fetch('/api/auth/me')
        const sessionData = await sessionRes.json()

        if (!sessionRes.ok || !sessionData.authenticated || sessionData.user.role !== 'student') {
          router.push('/login')
          return
        }

        setUser(sessionData.user)

        // Fetch student's enrollments with depth=2 to populate course and media details
        const enrollmentsRes = await fetch('/api/enrollments?depth=2')
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json()
          if (enrollmentsData.docs) {
            setEnrollments(enrollmentsData.docs)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSessionAndFetchData()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/students/logout', { method: 'POST' })
      await fetch('/api/users/logout', { method: 'POST' })
      document.cookie = 'payload-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'student-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      
      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have logged out successfully.',
        timer: 1500,
        showConfirmButton: false,
      })
      
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-600">Loading Student Space...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-6 py-8 pb-16">
      {/* Dynamic Premium Header/Banner */}
      <div className="w-full bg-[#0A163A] rounded-lg p-8 md:p-12 relative overflow-hidden select-none mb-10 shadow-lg shadow-[#0A163A]/10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#615fff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#543cdf]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#615fff]/20 border border-[#615fff]/30 text-base font-bold text-[#615fff] uppercase tracking-wider mb-6">
            Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8a88ff] to-white">{user.name}</span>! 👋
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-semibold leading-relaxed">
            {"Ready to unlock more skills? Resume your courses or explore new learning avenues today!"}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Enrolled Courses Stat */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200/80 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-lg bg-[#615fff]/10 flex items-center justify-center text-[#615fff]">
            <FiBookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-500">Enrolled Courses</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-1">{enrollments.length}</h2>
          </div>
        </div>

        {/* Completed Lessons Stat */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200/80 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <FiAward className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-500">Completed Lessons</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-1">{enrollments.length > 0 ? 12 : 0}</h2>
          </div>
        </div>

        {/* Study Time Stat */}
        <div className="bg-white p-6 rounded-lg border border-zinc-200/80 shadow-sm flex items-center gap-5">
          <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FiClock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-500">Learning Hours</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-1">{enrollments.length > 0 ? '45.8 hrs' : '0 hrs'}</h2>
          </div>
        </div>
      </div>

      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Enrolled Courses (takes 2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-800 tracking-tight font-display">My Courses</h2>
            {enrollments.length > 0 && (
              <Link href="/" className="text-[#615fff] hover:text-[#543cdf] font-bold text-base flex items-center gap-1.5 transition-colors">
                Explore More
                <FiExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>

          {enrollments.length === 0 ? (
            /* Beautiful Premium Empty State */
            <div className="bg-white rounded-lg border border-zinc-200/80 p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="h-16 w-16 rounded-full bg-[#615fff]/5 flex items-center justify-center text-[#615fff] mb-6">
                <FiBook className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">No enrolled courses yet</h3>
              <p className="text-zinc-500 text-base font-semibold max-w-sm mb-8 leading-relaxed">
                {"You haven't purchased any courses yet. Browse our premium list of courses to get started!"}
              </p>
              <Link
                href="/"
                className="px-6 py-3.5 rounded-lg bg-[#615fff] hover:bg-[#615fff]/95 text-white font-bold text-base shadow-lg shadow-[#615fff]/15 transition-all duration-300"
              >
                Browse Premium Courses
              </Link>
            </div>
          ) : (
            /* Enrolled Courses Grid list */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => {
                const course = enrollment.course
                if (!course) return null

                const thumbnailSrc = course.thumbnail && typeof course.thumbnail === 'object' && course.thumbnail.url
                  ? course.thumbnail.url
                  : '/placeholder_course.jpg'

                return (
                  <div key={enrollment.id} className="bg-white rounded-lg border border-zinc-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      {/* Thumbnail */}
                      <div className="h-44 w-full bg-zinc-100 overflow-hidden relative">
                        <img 
                          src={thumbnailSrc === '/placeholder_course.jpg' ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop' : thumbnailSrc} 
                          alt={course.title} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'
                          }}
                        />
                        <span className="absolute top-3 left-3 bg-[#615fff] text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                          {course.category && typeof course.category === 'object' ? course.category.name : 'LMS'}
                        </span>
                      </div>

                      {/* Title and summary */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-bold text-zinc-800 line-clamp-2 leading-snug">
                          {course.title}
                        </h3>
                        <p className="text-zinc-400 text-base font-semibold line-clamp-2 leading-relaxed">
                          {course.summary}
                        </p>
                        <div className="flex items-center gap-2 pt-1.5">
                          <span className="text-base font-semibold text-zinc-500">Instructor:</span>
                          <span className="text-base font-bold text-zinc-700">
                            {course.instructor && typeof course.instructor === 'object' ? course.instructor.name : 'Expert'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer with Progress & Action */}
                    <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
                      {/* Progress Bar (Sample static progress for premium feel) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-base font-semibold text-zinc-500">
                          <span>Progress</span>
                          <span>{enrollment.paymentStatus === 'completed' ? '35%' : '0%'}</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#615fff] h-full rounded-full transition-all duration-500" 
                            style={{ width: enrollment.paymentStatus === 'completed' ? '35%' : '0%' }}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          Swal.fire({
                            icon: 'info',
                            title: 'Lesson Player',
                            text: 'Launching lesson streaming interface...',
                            timer: 1800,
                            showConfirmButton: false,
                            confirmButtonColor: '#615fff',
                          })
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-[#615fff] hover:bg-[#615fff] hover:text-white text-[#615fff] font-bold text-base transition-all cursor-pointer"
                      >
                        Resume Learning
                        <FiArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Learning Sidebar Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-800 tracking-tight font-display">Study Hub</h2>
          
          {/* Study Streak Card */}
          <div className="bg-white p-6 rounded-lg border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <span className="text-orange-500">🔥</span> Study Streak
            </h3>
            <p className="text-base font-semibold text-zinc-500 leading-relaxed">
              {"You have logged in 5 days in a row! Keep up the momentum to build consistency."}
            </p>
            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-lg border border-zinc-200/40">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-sm font-bold text-zinc-400">{day}</span>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 5 ? 'bg-orange-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>
                    {idx < 5 ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Live Classes */}
          <div className="bg-white p-6 rounded-lg border border-zinc-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <FiCalendar className="text-[#615fff]" /> Live Webinars
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-zinc-100 bg-zinc-50/50 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <h4 className="text-base font-bold text-zinc-800 leading-snug line-clamp-1">Q&A with Expert Instructors</h4>
                  <span className="bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0">Live</span>
                </div>
                <p className="text-sm font-semibold text-zinc-400">May 21st, 2026 • 04:00 PM</p>
                <button 
                  onClick={() => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Webinar RSVP',
                      text: 'You have registered for the Live Q&A session!',
                      confirmButtonColor: '#615fff',
                    })
                  }}
                  className="text-[#615fff] hover:text-[#543cdf] font-bold text-base mt-2 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Register Seat
                </button>
              </div>

              <div className="p-4 rounded-lg border border-zinc-100 bg-zinc-50/50 space-y-2">
                <h4 className="text-base font-bold text-zinc-800 leading-snug line-clamp-1">Introduction to Full-stack Roadmap</h4>
                <p className="text-sm font-semibold text-zinc-400">May 24th, 2026 • 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
