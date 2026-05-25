'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiRadio, FiRefreshCw, FiExternalLink } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface LiveLesson {
  id: string
  title: string
  slug: string
  courseTitle: string
  livePlatform: string
  liveUrl: string
  liveDate: string | null
  duration: number
  autoGenerateZoom: boolean
}

export default function LiveClassesPageClient() {
  const router = useRouter()
  const [lessons, setLessons] = useState<LiveLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchLiveLessons() {
    try {
      const res = await fetch('/api/admin/live-classes', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setLessons(data.liveLessons)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to load live sessions.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLiveLessons()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLiveLessons()
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/40 pb-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Scheduled Live Classes</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Coordinate and launch your upcoming active interactive lectures and meetings
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#18181b] border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white font-semibold text-base transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4.5 w-4.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Registry
        </button>
      </div>

      {/* Live classes container */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="h-10 w-10 border-2 border-[#615fff] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-base font-semibold text-zinc-500 mt-4">Loading active scheduled logs...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FiRadio className="h-10 w-10 text-zinc-700 mx-auto animate-pulse" />
            <p className="text-base font-semibold text-zinc-500">
              No live classes are scheduled at this time.
            </p>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b border-zinc-800/50 bg-[#0b0e17] flex items-center justify-between">
              <p className="text-base font-bold text-zinc-450">
                Scheduled Streams ({lessons.length} session{lessons.length !== 1 ? 's' : ''})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-[#121212] border-b border-zinc-800 text-zinc-400 font-bold text-sm uppercase tracking-wider font-display">
                    <th className="px-6 py-3.5">Live Class Topic</th>
                    <th className="px-6 py-3.5">Course Name</th>
                    <th className="px-6 py-3.5">Scheduled Date & Time</th>
                    <th className="px-6 py-3.5 text-center">Platform</th>
                    <th className="px-6 py-3.5 text-right w-32">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-semibold text-zinc-200">
                  {lessons.map((lesson) => {
                    const dateObj = lesson.liveDate ? new Date(lesson.liveDate) : null
                    const formattedDate = dateObj
                      ? dateObj.toLocaleString('en-BD', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                          timeZone: 'Asia/Dhaka'
                        })
                      : 'Not Scheduled'

                    const isUpcoming = dateObj ? dateObj.getTime() > Date.now() : false

                    return (
                      <tr key={lesson.id} className="hover:bg-zinc-800/20 transition-colors">
                        {/* Topic */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center shrink-0">
                              <FiRadio className="h-4.5 w-4.5 animate-pulse" />
                            </span>
                            <div>
                              <p className="font-bold text-white text-base leading-snug line-clamp-1">{lesson.title}</p>
                            </div>
                          </div>
                        </td>
                        {/* Course */}
                        <td className="px-6 py-4 text-zinc-350 text-base">
                          {lesson.courseTitle}
                        </td>
                        {/* Scheduled Date */}
                        <td className="px-6 py-4 text-base">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${isUpcoming ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
                            <span className="text-zinc-200 font-bold">{formattedDate}</span>
                          </div>
                        </td>
                        {/* Platform */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 select-none">
                            {lesson.livePlatform}
                          </span>
                        </td>
                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          {lesson.liveUrl ? (
                            <a
                              href={lesson.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-colors"
                            >
                              Join Session
                              <FiExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-sm font-bold text-zinc-550">Link Pending</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
