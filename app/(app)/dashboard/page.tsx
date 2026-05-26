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
  slug: string
  totalLessons?: number
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

interface LiveWebinar {
  id: string
  title: string
  slug: string
  courseTitle: string
  livePlatform: string
  liveUrl: string
  liveDate: string | null
  duration: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Interactive Live Data State
  const [webinars, setWebinars] = useState<LiveWebinar[]>([])
  const [streakCount, setStreakCount] = useState(5)
  const [loginDates, setLoginDates] = useState<string[]>([])
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    async function checkSessionAndFetchData() {
      try {
        const sessionRes = await fetch('/api/auth/me')
        const sessionData = await sessionRes.json()

        if (!sessionRes.ok || !sessionData.authenticated || (sessionData.user.role !== 'student' && sessionData.user.role !== 'admin')) {
          router.push('/login')
          return
        }

        setUser(sessionData.user)

        // Fetch student's enrollments with depth=2 to populate course and media details
        const enrollmentsRes = await fetch('/api/enrollments?depth=2')
        let fetchedEnrollments: EnrollmentItem[] = []
        if (enrollmentsRes.ok) {
          const enrollmentsData = await enrollmentsRes.json()
          if (enrollmentsData.docs) {
            fetchedEnrollments = enrollmentsData.docs
            setEnrollments(fetchedEnrollments)
          }
        }

        // Fetch upcoming live webinars for enrolled courses
        const webinarsRes = await fetch('/api/live-webinars')
        if (webinarsRes.ok) {
          const webinarsData = await webinarsRes.json()
          if (webinarsData.liveLessons) {
            setWebinars(webinarsData.liveLessons)
          }
        }

        // Load completed lessons from localStorage and calculate actual percentage progress
        const savedProgress = localStorage.getItem('ts-course-progress')
        let progressMap: Record<string, number> = savedProgress ? JSON.parse(savedProgress) : {}
        let updated = false

        fetchedEnrollments.forEach((e) => {
          if (e.course && e.course.id) {
            const completedList = localStorage.getItem(`ts-completed-lessons-${e.course.id}`)
            const completedCount = completedList ? JSON.parse(completedList).length : 0
            const totalLessons = e.course.totalLessons || 1
            const percentage = Math.min(Math.round((completedCount / totalLessons) * 100), 100)
            
            if (progressMap[e.course.id] !== percentage) {
              progressMap[e.course.id] = percentage
              updated = true
            }
          }
        })

        if (updated) {
          localStorage.setItem('ts-course-progress', JSON.stringify(progressMap))
        }
        setCourseProgress(progressMap)

        // Calculate actual daily login streaks
        const today = new Date().toISOString().split('T')[0]
        const savedHistory = localStorage.getItem('ts-login-history')
        let history: string[] = savedHistory ? JSON.parse(savedHistory) : []
        
        if (!history.includes(today)) {
          history.push(today)
          if (history.length > 30) history = history.slice(-30)
          localStorage.setItem('ts-login-history', JSON.stringify(history))
        }
        setLoginDates(history)

        let streak = 0
        let checkDate = new Date()
        while (true) {
          const checkStr = checkDate.toISOString().split('T')[0]
          if (history.includes(checkStr)) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }
        setStreakCount(streak || 1)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSessionAndFetchData()
  }, [router])

  const handleResumeLearning = (courseId: string, slug: string) => {
    Swal.fire({
      icon: 'success',
      title: 'Resuming Course',
      text: 'Loading curriculum and interactive lesson streams...',
      timer: 800,
      showConfirmButton: false,
      background: '#121829',
      color: '#ffffff',
    })

    setTimeout(() => {
      router.push(`/courses/${slug}/watch`)
    }, 800)
  }

  const handleRegisterSeat = (webinarTitle: string) => {
    Swal.fire({
      icon: 'success',
      title: 'Seat Reserved!',
      text: `You have successfully registered for: ${webinarTitle}. Join links are active below!`,
      confirmButtonColor: '#615fff',
    })
  }

  // Calculate dynamic stats based on actual course progress
  const totalCompletedLessons = enrollments.reduce((sum, e) => {
    if (!e.course || !e.course.id) return sum
    const completedList = localStorage.getItem(`ts-completed-lessons-${e.course.id}`)
    const completedCount = completedList ? JSON.parse(completedList).length : 0
    return sum + completedCount
  }, 0)

  const totalLearningHours = enrollments.reduce((sum, e) => {
    if (!e.course || !e.course.id) return sum
    const completedList = localStorage.getItem(`ts-completed-lessons-${e.course.id}`)
    const completedCount = completedList ? JSON.parse(completedList).length : 0
    // Estimate 1.25 hours per completed lesson, or fallback to default
    return sum + Number((completedCount * 1.25).toFixed(1))
  }, 0)

  const getWeekDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const result = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = days[d.getDay()]
      result.push({ dateStr, label })
    }
    return result
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-650">Loading Student Space...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-6 py-8 pb-16">
      
      {/* Dynamic Premium Header/Banner */}
      <div className="w-full bg-[#0A163A] rounded-lg p-8 md:p-12 relative overflow-hidden mb-10 shadow-lg shadow-[#0A163A]/10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#615fff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#543cdf]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#615fff]/20 border border-[#615fff]/30 text-base font-bold text-[#615fff] uppercase tracking-wider mb-6">
            Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8a88ff] to-white font-bold">{user.name}</span>! 👋
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-semibold leading-relaxed">
            Ready to unlock more skills? Resume your courses or explore new learning avenues today!
          </p>
        </div>
      </div>

      {/* Quick Stats Grid - Completely borderless as per public page rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Enrolled Courses Stat */}
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="h-12 w-12 rounded-lg bg-[#615fff]/10 flex items-center justify-center text-[#615fff] shadow-sm">
            <FiBookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-500">Enrolled Courses</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-1">{enrollments.length}</h2>
          </div>
        </div>

        {/* Completed Lessons Stat */}
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 shadow-sm">
            <FiAward className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-500">Completed Lessons</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-1">{totalCompletedLessons}</h2>
          </div>
        </div>

        {/* Study Time Stat */}
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm">
            <FiClock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-500">Learning Hours</p>
            <h2 className="text-2xl font-bold text-zinc-800 mt-1">{totalLearningHours} hrs</h2>
          </div>
        </div>
      </div>

      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Enrolled Courses (takes 2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 id="courses" className="text-2xl font-bold text-zinc-800 tracking-tight font-display scroll-mt-24">My Courses</h2>
            {enrollments.length > 0 && (
              <Link href="/" className="text-[#615fff] hover:text-[#543cdf] font-bold text-base flex items-center gap-1.5 transition-colors">
                Explore More
                <FiExternalLink className="h-4.5 w-4.5" />
              </Link>
            )}
          </div>

          {enrollments.length === 0 ? (
            /* Beautiful Premium Empty State */
            <div className="bg-white rounded-lg p-12 text-center flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <div className="h-16 w-16 rounded-full bg-[#615fff]/5 flex items-center justify-center text-[#615fff] mb-6">
                <FiBook className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">No enrolled courses yet</h3>
              <p className="text-zinc-500 text-base font-semibold max-w-sm mb-8 leading-relaxed">
                You haven't purchased any courses yet. Browse our premium list of courses to get started!
              </p>
              <Link
                href="/"
                className="px-6 py-3.5 rounded-lg bg-[#615fff] hover:bg-[#615fff]/95 text-white font-bold text-base shadow-lg shadow-[#615fff]/15 transition-all duration-300"
              >
                Browse Premium Courses
              </Link>
            </div>
          ) : (
            /* Enrolled Courses Grid list - Completely borderless cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrollments.map((enrollment) => {
                const course = enrollment.course
                if (!course) return null

                const thumbnailSrc = course.thumbnail && typeof course.thumbnail === 'object' && course.thumbnail.url
                  ? course.thumbnail.url
                  : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'

                const progress = courseProgress[course.id] ?? 15

                return (
                  <div key={enrollment.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      {/* Thumbnail */}
                      <div className="h-44 w-full bg-zinc-100 overflow-hidden relative">
                        <img 
                          src={thumbnailSrc} 
                          alt={course.title} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'
                          }}
                        />
                        <span className="absolute top-3 left-3 bg-[#615fff] text-white px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm">
                          {course.category && typeof course.category === 'object' ? course.category.name : 'LMS'}
                        </span>
                      </div>

                      {/* Title and summary */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-bold text-zinc-800 line-clamp-2 leading-snug hover:text-[#615fff] transition-colors cursor-pointer" onClick={() => handleResumeLearning(course.id, course.slug)}>
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
                    <div className="p-5 bg-zinc-50/50 space-y-4">
                      {/* Progress Bar (Dynamic tracking from localStorage) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-base font-semibold text-zinc-500">
                          <span>Syllabus Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-2 rounded-lg overflow-hidden">
                          <div 
                            className="bg-[#615fff] h-full rounded-lg transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => handleResumeLearning(course.id, course.slug)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md border-none"
                      >
                        <span>Resume Learning</span>
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
          <h2 id="study-hub" className="text-2xl font-bold text-zinc-800 tracking-tight font-display scroll-mt-24">Study Hub</h2>
          
          {/* Study Streak Card - Completely borderless */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-4">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <span className="text-orange-500">🔥</span> Study Streak
            </h3>
            <p className="text-base font-semibold text-zinc-500 leading-relaxed">
              You have logged in {streakCount} {streakCount === 1 ? 'day' : 'days'} in a row! Keep up the momentum to build consistency.
            </p>
            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-lg">
              {getWeekDays().map((day, idx) => {
                const isActive = loginDates.includes(day.dateStr)
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-sm font-bold text-zinc-450">{day.label}</span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${isActive ? 'bg-orange-500 text-white font-bold' : 'bg-zinc-200 text-zinc-400 font-bold'}`}>
                      {isActive ? '✓' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming Live Classes - Completely dynamic from Mongoose */}
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow space-y-4">
            <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
              <FiCalendar className="text-[#615fff]" /> Live Webinars
            </h3>
            
            <div className="space-y-4">
              {webinars.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-base font-semibold text-zinc-400">No upcoming live classes scheduled for your courses.</p>
                </div>
              ) : (
                webinars.map((webinar) => {
                  const dateObj = webinar.liveDate ? new Date(webinar.liveDate) : null
                  const formattedDate = dateObj
                    ? dateObj.toLocaleString('en-BD', {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : 'Not Scheduled'

                  const isUpcoming = dateObj ? dateObj.getTime() > Date.now() : false

                  return (
                    <div key={webinar.id} className="p-4 rounded-lg bg-zinc-50/50 space-y-2">
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-base font-bold text-zinc-800 leading-snug line-clamp-2">{webinar.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 shadow-sm ${
                          isUpcoming ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-200 text-zinc-500'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'Ended'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-450 truncate">{webinar.courseTitle}</p>
                      <p className="text-sm font-bold text-[#615fff]">{formattedDate} ({webinar.livePlatform.toUpperCase()})</p>
                      
                      {isUpcoming && webinar.liveUrl && (
                        <div className="flex items-center gap-3 pt-2">
                          <button 
                            onClick={() => handleRegisterSeat(webinar.title)}
                            className="px-3.5 py-2 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white text-sm font-bold transition-colors cursor-pointer border-none shadow-sm"
                          >
                            RSVP Seat
                          </button>
                          <a 
                            href={webinar.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-lg bg-zinc-150 hover:bg-zinc-200 text-zinc-700 text-sm font-bold transition-colors shadow-sm"
                          >
                            Join Webinar
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
