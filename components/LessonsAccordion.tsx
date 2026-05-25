'use client'

import React, { useState } from 'react'
import { FiVideo, FiRadio, FiEye, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi'

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

export default function LessonsAccordion({ lessons }: { lessons: LessonItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Course Curriculum</h2>
        <p className="text-base font-semibold text-zinc-400">
          Explore the lessons and interactive live sessions included in this syllabus
        </p>
      </div>

      <div className="border border-zinc-200 rounded-lg overflow-hidden divide-y divide-zinc-200 bg-white">
        {sortedLessons.map((lesson, idx) => {
          const isOpen = openIndex === idx
          const dateObj = lesson.liveDate ? new Date(lesson.liveDate) : null
          const formattedDate = dateObj
            ? dateObj.toLocaleString('en-BD', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })
            : null

          return (
            <div key={lesson.id} className="transition-all">
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Sequence Order */}
                  <span className="h-8 w-8 rounded-lg bg-[#615fff]/10 flex items-center justify-center font-bold text-[#615fff] text-sm shrink-0">
                    {lesson.order}
                  </span>

                  {/* Format icon */}
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    lesson.lessonType === 'live'
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {lesson.lessonType === 'live' ? (
                      <FiRadio className="h-4.5 w-4.5" />
                    ) : (
                      <FiVideo className="h-4.5 w-4.5" />
                    )}
                  </span>

                  {/* Title & Format Info */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-800 text-base leading-snug truncate">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {lesson.duration} mins
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border select-none ${
                        lesson.lessonType === 'live'
                          ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                          : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                      }`}>
                        {lesson.lessonType === 'live' ? `Live • ${lesson.livePlatform}` : 'Recorded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side icons */}
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {lesson.isPreviewable && (
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25 select-none items-center gap-1">
                      <FiEye className="h-3 w-3" />
                      Free Preview
                    </span>
                  )}
                  {isOpen ? (
                    <FiChevronUp className="h-5 w-5 text-zinc-400" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-6 py-5 bg-zinc-50 border-t border-zinc-100 space-y-3.5 animate-fadeIn">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Lesson Type</p>
                    <p className="text-base font-semibold text-zinc-700">
                      {lesson.lessonType === 'live'
                        ? 'Interactive Live Lecture session on ' + (lesson.livePlatform || 'Zoom') + '.'
                        : 'Pre-recorded Video Tutorial.'}
                    </p>
                  </div>

                  {lesson.lessonType === 'live' && formattedDate && (
                    <div className="space-y-1 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3">
                      <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Broadcast Schedule</p>
                      <p className="text-base font-bold text-zinc-800 mt-0.5">
                        Starts on: {formattedDate} (Bangladesh Time)
                      </p>
                    </div>
                  )}

                  {lesson.isPreviewable && lesson.videoUrl && (
                    <div className="pt-2">
                      <a
                        href={lesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-sm transition-colors cursor-pointer"
                      >
                        <FiEye className="h-4.5 w-4.5" />
                        Watch Free Preview
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
