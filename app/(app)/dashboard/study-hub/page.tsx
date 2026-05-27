'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiCalendar, FiClock, FiRadio, FiExternalLink } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface UserSession {
  id: string
  name: string
  email: string
  role: string
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

export default function StudyHubPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [webinars, setWebinars] = useState<LiveWebinar[]>([])
  const [streakCount, setStreakCount] = useState(5)
  const [loginDates, setLoginDates] = useState<string[]>([])

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

        // Fetch upcoming live webinars
        const webinarsRes = await fetch('/api/live-webinars')
        if (webinarsRes.ok) {
          const webinarsData = await webinarsRes.json()
          if (webinarsData.liveLessons) {
            setWebinars(webinarsData.liveLessons)
          }
        }

        // Fetch real login streak from DB API
        const progressRes = await fetch('/api/progress')
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          const loginDatesFromAPI: string[] = progressData.loginDates || []
          setLoginDates(loginDatesFromAPI)

          let streak = 0
          let checkDate = new Date()
          while (true) {
            const checkStr = checkDate.toISOString().split('T')[0]
            if (loginDatesFromAPI.includes(checkStr)) {
              streak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
          setStreakCount(streak || 1)
        }

      } catch (error) {
        console.error('Error fetching study hub data:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSessionAndFetchData()
  }, [router])

  const handleRegisterSeat = (webinarTitle: string) => {
    Swal.fire({
      icon: 'success',
      title: 'Seat Reserved!',
      text: `You have successfully registered for: ${webinarTitle}. Join links are active below!`,
      confirmButtonColor: '#615fff',
      background: '#121829',
      color: '#ffffff',
    })
  }

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-650">Loading Study Hub...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-6 py-8 pb-16">

      {/* Dynamic Premium Header/Banner */}
      <div className="w-full bg-[#0A163A] rounded-lg p-8 md:p-12 relative overflow-hidden mb-10 border border-zinc-800/20">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#615fff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#543cdf]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#615fff]/20 border border-[#615fff]/30 text-base font-bold text-[#615fff] uppercase tracking-wider mb-6">
            LMS Platform
          </span>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
            Tutor Space <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8a88ff] to-white font-bold">Study Hub</span> ⚡
          </h1>
          <p className="text-zinc-400 text-base md:text-lg font-semibold leading-relaxed">
            Monitor your daily study streaks, participate in live webinar streams, and manage interactive lessons.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Study Streak (Left Column) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 border border-zinc-200/80 rounded-lg space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                <span className="text-orange-500">🔥</span> Study Streak Calendar
              </h3>
              <p className="text-base font-semibold text-zinc-450 mt-1 leading-relaxed">
                Log in and watch course lessons daily to build consistency. You have kept this streak active!
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-6 bg-zinc-50/50 rounded-lg border border-zinc-100">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Active Streak</span>
              <span className="text-5xl font-bold text-orange-500 mt-2 font-display">{streakCount} Days</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              {getWeekDays().map((day, idx) => {
                const isActive = loginDates.includes(day.dateStr)
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-zinc-450 uppercase">{day.label}</span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive ? 'bg-orange-500 text-white' : 'bg-zinc-200 text-zinc-400'}`}>
                      {isActive ? '✓' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Live Webinars (Right Column) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 border border-zinc-200/80 rounded-lg space-y-6">
            <div>
              <h3 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                <FiCalendar className="text-[#615fff]" /> Live Webinar Broadcasts
              </h3>
              <p className="text-base font-semibold text-zinc-450 mt-1 leading-relaxed">
                Join active webinar classrooms to ask live questions, share comments, and review assignments.
              </p>
            </div>
            
            <div className="space-y-4">
              {webinars.length === 0 ? (
                <div className="text-center py-10 bg-zinc-50/50 rounded-lg border border-zinc-100/60 p-6">
                  <p className="text-base font-semibold text-zinc-450">No upcoming live classes are scheduled for your enrolled courses.</p>
                </div>
              ) : (
                webinars.map((webinar) => {
                  const dateObj = webinar.liveDate ? new Date(webinar.liveDate) : null
                  const formattedDate = dateObj
                    ? dateObj.toLocaleString('en-BD', {
                        weekday: 'short',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : 'Not Scheduled'

                  const isUpcoming = dateObj ? dateObj.getTime() > Date.now() : false

                  return (
                    <div key={webinar.id} className="p-5 rounded-lg bg-zinc-50/50 border border-zinc-150/80 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-base font-bold text-zinc-850 leading-snug line-clamp-2">{webinar.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                          isUpcoming ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-200 text-zinc-500'
                        }`}>
                          {isUpcoming ? 'Upcoming' : 'Ended'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-zinc-500 truncate">{webinar.courseTitle}</p>
                      <p className="text-sm font-bold text-[#615fff]">{formattedDate} ({webinar.livePlatform.toUpperCase()})</p>
                      
                      {isUpcoming && webinar.liveUrl && (
                        <div className="flex items-center gap-3 pt-2">
                          <button 
                            onClick={() => handleRegisterSeat(webinar.title)}
                            className="px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white text-sm font-bold transition-colors cursor-pointer border-none"
                          >
                            RSVP Seat
                          </button>
                          <a 
                            href={webinar.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-lg bg-zinc-150 hover:bg-zinc-200 text-zinc-700 text-sm font-bold transition-colors inline-flex items-center gap-1"
                          >
                            <span>Join Webinar</span>
                            <FiExternalLink className="h-4 w-4" />
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
