'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  FiVideo, 
  FiRadio, 
  FiChevronRight, 
  FiCheckCircle, 
  FiClock, 
  FiCheck, 
  FiArrowLeft, 
  FiAward, 
  FiBookOpen, 
  FiPlay, 
  FiLock, 
  FiCalendar, 
  FiExternalLink,
  FiMaximize,
  FiMonitor
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface LessonItem {
  id: string
  title: string
  slug: string
  order: number
  lessonType: 'recorded' | 'live'
  duration: number
  isPreviewable: boolean
  livePlatform?: string
  liveDate?: string
  videoUrl?: string
}

interface CourseItem {
  id: string
  title: string
  slug: string
  summary?: string
  category?: {
    name: string
  }
  instructor?: {
    name: string
  }
}

interface CoursePlayerClientProps {
  course: CourseItem
  lessons: LessonItem[]
  student?: {
    name: string
    email: string
  }
}

function getEmbedUrl(videoUrl: string): string {
  if (!videoUrl) return ''
  
  // YouTube standard & shorts & sharing formats
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  
  // Vimeo
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  
  return videoUrl
}

export default function CoursePlayerClient({ course, lessons, student }: CoursePlayerClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State for active lesson
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null)
  
  // State for completed lessons (IDs list)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  
  // State for Screen modes (Theater, Fullscreen)
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Floating Watermark position state for anti-piracy
  const [watermarkPos, setWatermarkPos] = useState({ top: '80%', left: '3%' })

  // Active blackout state to shield video when user switches tabs or takes screenshots
  const [isBlackout, setIsBlackout] = useState(false)

  // Sort lessons by order
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  // Initialize active lesson from query search params or default to first lesson
  useEffect(() => {
    if (sortedLessons.length > 0) {
      const lessonIdFromUrl = searchParams.get('lesson')
      if (lessonIdFromUrl) {
        const found = sortedLessons.find(l => l.id === lessonIdFromUrl)
        if (found) {
          setActiveLesson(found)
          return
        }
      }
      setActiveLesson(sortedLessons[0])
    }
  }, [searchParams, lessons])

  // Load completed lessons from DB API on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/progress')
        if (res.ok) {
          const data = await res.json()
          const ids: string[] = data.completedLessons?.[course.id] || []
          setCompletedLessonIds(ids)
        }
      } catch (err) {
        console.error('Failed to load progress from API', err)
      }
    }
    loadProgress()
  }, [course.id])

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Keyboard shortcut listener (T and F keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack keyboard shortcuts if typing in inputs/textareas
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      const key = e.key.toLowerCase()

      // 't' key (Theater Mode)
      if (key === 't') {
        e.preventDefault()
        setIsTheaterMode(prev => !prev)
        Swal.fire({
          icon: 'info',
          title: !isTheaterMode ? 'Theater Mode Enabled' : 'Standard Mode Enabled',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          background: '#1a1a1a',
          color: '#ffffff',
        })
      }

      // 'f' key (Fullscreen Mode)
      if (key === 'f') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTheaterMode])

  // Watermark repositioning timer for anti-screen capture security
  useEffect(() => {
    if (!student) return
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 85) + 5 // 5% to 90%
      const randomLeft = Math.floor(Math.random() * 60) + 5 // 5% to 65%
      setWatermarkPos({ top: `${randomTop}%`, left: `${randomLeft}%` })
    }, 5000)

    return () => clearInterval(interval)
  }, [student])


  // DevTools, screenshots, copy and contextmenu blockade listeners
  useEffect(() => {
    // 1. Right Click Prevention
    const handleContextMenu = (e: MouseEvent) => {
      if (!window.location.pathname.includes('/watch')) return
      e.preventDefault()
    }
    document.addEventListener('contextmenu', handleContextMenu)

    // 2. DevTools & Ctrl+U Block
    const handleDevTools = (e: KeyboardEvent) => {
      if (!window.location.pathname.includes('/watch')) return
      const key = e.key.toLowerCase()
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'i' || key === 'c' || key === 'j')) ||
        ((e.ctrlKey || e.metaKey) && key === 'u')
      ) {
        e.preventDefault()
        Swal.fire({
          icon: 'warning',
          title: 'Security Alert',
          text: 'Developer tools are disabled on this page to protect content copyright.',
          timer: 2000,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#ffffff',
        })
      }
    }
    window.addEventListener('keydown', handleDevTools)

    // 3. Prevent Copying
    const handleCopy = (e: ClipboardEvent) => {
      if (!window.location.pathname.includes('/watch')) return
      e.clipboardData?.setData('text/plain', 'Tutor Space Anti-Piracy Shield: Copying content is disabled on this player.')
      e.preventDefault()
    }
    document.addEventListener('copy', handleCopy)

    // 4. PrintScreen & active screenshot keys detection (keydown triggers blackout instantly)
    const handleScreenshotKeyDown = (e: KeyboardEvent) => {
      if (!window.location.pathname.includes('/watch')) return
      const key = e.key.toLowerCase()
      if (
        e.key === 'PrintScreen' ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (key === 's' || key === '3' || key === '4' || key === '5')) ||
        ((e.ctrlKey || e.metaKey) && key === 'p')
      ) {
        setIsBlackout(true)
        if (key === 'p') {
          e.preventDefault()
        }
        setTimeout(() => {
          setIsBlackout(false)
        }, 3000)
      }
    }
    window.addEventListener('keydown', handleScreenshotKeyDown)

    // 5. PrintScreen KeyUp clipboard overwrite
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!window.location.pathname.includes('/watch')) return
      if (e.key === 'PrintScreen') {
        setIsBlackout(true)
        navigator.clipboard.writeText('Protected Content - Tutor Space Screen Captures Restricted.').catch(() => {})
        Swal.fire({
          icon: 'warning',
          title: 'Screenshot Restricted',
          text: 'Taking screenshots is disabled on this player to protect copyright.',
          timer: 2000,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#ffffff',
        })
        setTimeout(() => {
          setIsBlackout(false)
        }, 3000)
      }
    }
    window.addEventListener('keyup', handleKeyUp)

    // 6. Focus & blur window detection (blackout screen when focus is lost)
    const handleBlur = () => {
      if (!window.location.pathname.includes('/watch')) return
      // Small timeout to allow document.activeElement to update
      setTimeout(() => {
        const activeEl = document.activeElement
        if (activeEl && (activeEl.tagName === 'IFRAME' || activeEl instanceof HTMLIFrameElement)) {
          // Focus shifted inside the video player iframe, do not blackout
          return
        }
        setIsBlackout(true)
      }, 200)
    }

    const handleFocus = () => {
      if (!window.location.pathname.includes('/watch')) return
      setTimeout(() => {
        setIsBlackout(false)
      }, 1000)
    }

    const handleVisibilityChange = () => {
      if (!window.location.pathname.includes('/watch')) return
      if (document.visibilityState === 'hidden') {
        setIsBlackout(true)
      } else {
        setTimeout(() => {
          setIsBlackout(false)
        }, 1000)
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      window.removeEventListener('keydown', handleDevTools)
      document.removeEventListener('copy', handleCopy)
      window.removeEventListener('keydown', handleScreenshotKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Handle Mark as Completed — persists to DB
  const handleToggleComplete = async (lessonId: string) => {
    const willBeCompleted = !completedLessonIds.includes(lessonId)
    const updatedCompleted = willBeCompleted
      ? [...completedLessonIds, lessonId]
      : completedLessonIds.filter(id => id !== lessonId)

    // Optimistically update UI
    setCompletedLessonIds(updatedCompleted)

    // Persist to DB
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          lessonId,
          completed: willBeCompleted,
        }),
      })
    } catch (err) {
      console.error('Failed to save progress to API', err)
      // Revert optimistic update on error
      setCompletedLessonIds(completedLessonIds)
    }

    if (willBeCompleted) {
      Swal.fire({
        icon: 'success',
        title: 'Outstanding Work!',
        text: 'Lesson marked as completed. Keep up the streak!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        background: '#1a1a1a',
        color: '#ffffff',
      })
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Status Updated',
        text: 'Lesson marked as incomplete.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#1a1a1a',
        color: '#ffffff',
      })
    }
  }

  if (sortedLessons.length === 0) {
    return (
      <div className="container mx-auto px-6 py-12 text-center max-w-xl bg-white border border-zinc-200 rounded-lg shadow-sm">
        <FiLock className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-800 mb-2">No Syllabus Published</h2>
        <p className="text-base font-semibold text-zinc-500 mb-6 leading-relaxed">
          The instructor is currently constructing the curriculum for this course. Please check back shortly!
        </p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 py-2.5 px-4.5 rounded-lg bg-[#615fff] text-white font-bold text-base shadow-md whitespace-nowrap">
          <FiArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Study Hub</span>
        </Link>
      </div>
    )
  }

  const currentLesson = activeLesson || sortedLessons[0]
  const completedCount = completedLessonIds.length
  const progressPercentage = Math.round((completedCount / sortedLessons.length) * 100)

  // Date parsing for live classes
  const liveDateObj = currentLesson.liveDate ? new Date(currentLesson.liveDate) : null
  const formattedLiveDate = liveDateObj
    ? liveDateObj.toLocaleString('en-BD', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null

  const isLiveUpcoming = liveDateObj ? liveDateObj.getTime() > Date.now() : false

  // ─── Render Sub-Components for clean split layouts ───
  const renderPlayer = () => (
    <div ref={videoContainerRef} className="bg-slate-900 border border-slate-950 rounded-lg overflow-hidden shadow-xl aspect-video relative">
      
      {/* Full Black Screen overlay on focus loss or screenshot keys */}
      {isBlackout && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
          <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-lg p-6 max-w-sm shadow-2xl backdrop-blur-md">
            <FiLock className="h-10 w-10 text-[#615fff] mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">Screen Shield Active</h3>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed">
              Screen capturing premium course video is restricted. Return your mouse/focus to this tab to resume playing.
            </p>
          </div>
        </div>
      )}

      {currentLesson.lessonType === 'recorded' && currentLesson.videoUrl ? (
        // Embed Player (YouTube/Vimeo)
        getEmbedUrl(currentLesson.videoUrl) ? (
          <iframe
            src={getEmbedUrl(currentLesson.videoUrl)}
            title={currentLesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full animate-fade-in"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-950 p-6 text-center select-text">
            <FiVideo className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-base font-bold">Watch Video Stream</p>
            <p className="text-base text-zinc-500 mt-2">
              Please use the link below to watch the premium content:
            </p>
            <a 
              href={currentLesson.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-[#615fff] hover:bg-[#543cdf] text-white font-bold text-base whitespace-nowrap transition-colors"
            >
              <span>Watch on External Host</span>
              <FiExternalLink className="h-4.5 w-4.5" />
            </a>
          </div>
        )
      ) : currentLesson.lessonType === 'live' ? (
        // Premium Live Session Dashboard Card inside Video Box
        <div className="w-full h-full bg-gradient-to-br from-[#0F1B40] via-[#08102B] to-[#0A163A] text-white p-8 sm:p-12 flex flex-col justify-between select-none relative overflow-hidden">
          {/* Decorative glowing grid background */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#615fff 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#615fff]/20 rounded-full blur-2xl" />
          
          {/* Top platform bar */}
          <div className="flex justify-between items-center relative z-10">
            <span className="px-3.5 py-1.5 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm font-bold rounded-lg flex items-center gap-2 uppercase tracking-wide">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              Live Stream
            </span>
            <span className="text-base font-bold text-slate-400 uppercase tracking-widest">
              {currentLesson.livePlatform || 'Zoom Broadcast'}
            </span>
          </div>

          {/* Middle class details block */}
          <div className="space-y-4 max-w-xl relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold font-display leading-tight text-white">
              {currentLesson.order}. {currentLesson.title}
            </h3>
            <p className="text-base font-semibold text-slate-350 leading-relaxed font-sans">
              Join our live class and interact directly with your instructor in real time! Ask questions, work through code challenges, and participate in Q&A sessions.
            </p>
          </div>

          {/* Bottom dynamic RSVP/Join button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 border-t border-white/5 relative z-10">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Broadcast Time</p>
              <p className="text-base font-bold text-[#b2b0ff] flex items-center gap-1.5 mt-0.5">
                <FiCalendar className="h-4.5 w-4.5" />
                <span>{formattedLiveDate || 'TBD (Not Scheduled)'}</span>
              </p>
            </div>

            {currentLesson.videoUrl ? (
              <a 
                href={currentLesson.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="py-2.5 px-4.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base whitespace-nowrap transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#615fff]/15 cursor-pointer inline-flex items-center gap-2"
              >
                <FiRadio className="h-5 w-5 animate-pulse" />
                <span>Join Live Broadcast</span>
              </a>
            ) : (
              <div className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-base font-bold select-none">
                Link Activating at Class Time
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-slate-950">
          <p className="text-base font-bold">Unsupported lesson style or format</p>
        </div>
      )}

      {/* Immersive Floating Moving Anti-Piracy Watermark Overlay (Declared at bottom and z-30 to render on top of iframes) */}
      {student && (
        <div 
          className="absolute pointer-events-none select-none z-30 transition-all duration-1000 ease-in-out"
          style={{
            top: watermarkPos.top,
            left: watermarkPos.left,
            color: 'rgba(97, 95, 255, 0.65)',
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
          }}
        >
          {student.email}
        </div>
      )}
    </div>
  )

  const renderDetails = () => (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
            {currentLesson.order}. {currentLesson.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-base font-semibold text-zinc-500">
            <span className="flex items-center gap-1.5 text-zinc-650">
              <FiClock className="h-4 w-4 shrink-0" />
              <span>{currentLesson.duration} minutes duration</span>
            </span>
            <span>•</span>
            <span className="capitalize">{currentLesson.lessonType} lesson</span>
          </div>
        </div>
        
        {/* Complete lesson button */}
        <button
          type="button"
          onClick={() => handleToggleComplete(currentLesson.id)}
          className={`inline-flex items-center gap-2 px-4.5 py-2 rounded-lg border font-bold text-base whitespace-nowrap transition-all cursor-pointer shadow-sm hover:scale-[1.01] ${
            completedLessonIds.includes(currentLesson.id)
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
              : 'bg-[#615fff] border-transparent text-white hover:bg-[#5248e8]'
          }`}
        >
          <FiCheck className="h-5 w-5" />
          <span>
            {completedLessonIds.includes(currentLesson.id) 
              ? 'Completed (Click to undo)' 
              : 'Mark as Completed'}
          </span>
        </button>
      </div>

      {/* Lesson Overview Description */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-zinc-700 uppercase tracking-widest">Lesson Overview</h3>
        <p className="text-base font-semibold text-zinc-600 leading-relaxed font-sans select-text">
          {currentLesson.lessonType === 'live'
            ? 'Join this dynamic live webinar class. Be sure to log in a few minutes before the schedule, ensure your internet connection is robust, and have your code editor prepared. This live stream incorporates instructor coding demonstrations, conceptual deep dives, and student code review. Recordings are automatically catalogued here once the broadcast concludes.'
            : 'This high-definition recorded syllabus session includes detailed explanations and step-by-step instructions. We strongly advise pausing the video to implement matching exercises, reviewing linked reference materials, and working through the assignments at your own comfortable pace.'}
        </p>
      </div>

      {/* Verified Instructor footer within widget */}
      <div className="border-t border-slate-100 pt-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-[#615fff]/8 border border-[#615fff]/15 flex items-center justify-center font-bold text-base text-[#615fff] uppercase shrink-0">
          {course.instructor?.name ? course.instructor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'EX'}
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-450 uppercase tracking-wider">Assigned Instructor</p>
          <p className="text-base font-bold text-zinc-800 leading-tight">{course.instructor?.name || 'Expert Instructor'}</p>
        </div>
      </div>
    </div>
  )

  const renderSidebar = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col max-h-[750px]">
      <div className="px-6 py-5 border-b border-slate-100 select-none">
        <h2 className="text-lg font-bold text-zinc-900">Syllabus Curriculum</h2>
        <p className="text-sm font-semibold text-zinc-450 mt-0.5">Explore dynamic course lessons</p>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-4 space-y-2 max-h-[650px] pr-2">
        {sortedLessons.map((lesson) => {
          const isActive = lesson.id === currentLesson.id
          const isCompleted = completedLessonIds.includes(lesson.id)
          
          return (
            <div
              key={lesson.id}
              onClick={() => {
                setActiveLesson(lesson)
                router.replace(`/courses/${course.slug}/watch?lesson=${lesson.id}`)
              }}
              className={`w-full flex items-start gap-3.5 p-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-[#615fff]/8 border border-[#615fff]/25 text-zinc-900 shadow-sm' 
                  : 'hover:bg-slate-50 border border-transparent text-zinc-700 hover:text-zinc-900'
              }`}
            >
              {/* Completion Check or type icon */}
              <div className="shrink-0 mt-0.5">
                {isCompleted ? (
                  <FiCheckCircle className="h-5 w-5 text-emerald-600 fill-emerald-50 shrink-0" />
                ) : lesson.lessonType === 'live' ? (
                  <FiRadio className={`h-5 w-5 shrink-0 ${isActive ? 'text-rose-500' : 'text-rose-400'}`} />
                ) : (
                  <FiVideo className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#615fff]' : 'text-zinc-400'}`} />
                )}
              </div>

              {/* Lesson Meta Data */}
              <div className="min-w-0 flex-1 space-y-0.5 select-none">
                <h4 className={`text-base font-bold leading-snug line-clamp-2 ${isActive ? 'text-zinc-900 font-bold' : 'text-zinc-700 font-semibold'}`}>
                  {lesson.order}. {lesson.title}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-450 uppercase tracking-wide">
                  <span>{lesson.duration} mins</span>
                  <span>•</span>
                  <span className={lesson.lessonType === 'live' ? 'text-rose-500' : ''}>
                    {lesson.lessonType === 'live' ? 'Live Webinar' : 'Pre-recorded'}
                  </span>
                </div>
              </div>

              {/* Simple chevron or check visual */}
              <div className="shrink-0 flex items-center justify-center text-zinc-350 self-center">
                <FiChevronRight className="h-4.5 w-4.5" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-zinc-800 pb-16 relative">
      
      {/* ─── Top Course Navigation Bar (Premium Glassmorphism) ─── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
          {/* Back button and title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link 
              href={`/courses/${course.slug}`} 
              className="h-10 w-10 border border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-center text-zinc-650 hover:text-zinc-800 bg-white hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
              title="Back to Landing Page"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#615fff] uppercase tracking-wider bg-[#615fff]/8 border border-[#615fff]/12 px-2.5 py-0.5 rounded-lg">
                {course.category?.name || 'Course Player'}
              </span>
              <h1 className="text-lg font-bold text-zinc-900 truncate mt-1 leading-tight max-w-lg">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Controls Toggles and Progress Indicator */}
          <div className="flex items-center gap-6 shrink-0">
            
            {/* Screen Toggles Action Group (Moved to the Top Navigation Bar) */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsTheaterMode(prev => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border font-bold text-base whitespace-nowrap transition-all cursor-pointer shadow-sm ${
                  isTheaterMode 
                    ? 'bg-[#615fff] text-white border-transparent' 
                    : 'bg-white border-slate-200 text-zinc-650 hover:bg-slate-50'
                }`}
                title="Toggle Theater Mode (T)"
              >
                <FiMonitor className="h-4 w-4" />
                <span className="hidden sm:inline">Theater</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-zinc-650 font-bold text-base whitespace-nowrap transition-all cursor-pointer shadow-sm"
                title="Toggle Fullscreen (F)"
              >
                <FiMaximize className="h-4 w-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Progress</p>
                <p className="text-xs font-semibold text-zinc-450 mt-0.5">
                  {completedCount}/{sortedLessons.length} ({progressPercentage}%)
                </p>
              </div>
              <div className="w-20 sm:w-28 bg-zinc-200 h-2 rounded-lg overflow-hidden shrink-0">
                <div 
                  className="bg-[#615fff] h-full rounded-lg transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Main Viewport Grid ─── */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {isTheaterMode ? (
            <>
              {/* Theater Mode: Full-width top player column (12 cols) */}
              <div className="lg:col-span-12">
                {renderPlayer()}
              </div>

              {/* Theater Mode details split columns at bottom */}
              <div className="lg:col-span-8">
                {renderDetails()}
              </div>
              
              <div className="lg:col-span-4">
                {renderSidebar()}
              </div>
            </>
          ) : (
            <>
              {/* Classic split screen side-by-side layout */}
              <div className="lg:col-span-8 space-y-6">
                {renderPlayer()}
                {renderDetails()}
              </div>
              
              <div className="lg:col-span-4">
                {renderSidebar()}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
