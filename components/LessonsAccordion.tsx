'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideo, FiRadio, FiEye, FiChevronDown, FiChevronUp, FiClock, FiX, FiPlay, FiLock, FiHelpCircle, FiFileText } from 'react-icons/fi'

interface LessonItem {
  id: string
  title: string
  slug: string
  order: number
  lessonType: 'recorded' | 'live' | 'quiz' | 'assignment'
  duration: number
  isPreviewable: boolean
  livePlatform?: string
  liveDate?: string
  videoUrl?: string
}

function getEmbedUrl(videoUrl: string): string {
  if (!videoUrl) return ''
  
  // YouTube standard & shorts & sharing formats
  const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`
  }
  
  // Vimeo
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  }
  
  return videoUrl
}

export default function LessonsAccordion({
  lessons,
  isEnrolled = false,
  courseSlug,
}: {
  lessons: LessonItem[]
  isEnrolled?: boolean
  courseSlug?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)

  const toggleAccordion = (index: number) => {
    if (openIndex === index) return // Always keep at least one accordion open
    setOpenIndex(index)
  }

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-[#0A163A] mb-1 tracking-tight">Course Curriculum</h2>
        <p className="text-base font-semibold text-zinc-550">
          Explore the lessons and interactive live sessions included in this syllabus
        </p>
      </div>

      <div className="space-y-3 bg-transparent">
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
            <div 
              key={lesson.id} 
              className="bg-white rounded-lg overflow-hidden border-0 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(97,95,255,0.04)] transition-all duration-300 select-text"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors cursor-pointer select-text bg-white"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Format icon */}
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    lesson.lessonType === 'live'
                      ? 'bg-rose-50/8 text-rose-500'
                      : lesson.lessonType === 'quiz'
                      ? 'bg-amber-50/8 text-amber-500'
                      : lesson.lessonType === 'assignment'
                      ? 'bg-[#615fff]/10 text-[#615fff]'
                      : 'bg-zinc-100 text-zinc-550'
                  }`}>
                    {lesson.lessonType === 'live' ? (
                      <FiRadio className="h-4.5 w-4.5" />
                    ) : lesson.lessonType === 'quiz' ? (
                      <FiHelpCircle className="h-4.5 w-4.5" />
                    ) : lesson.lessonType === 'assignment' ? (
                      <FiFileText className="h-4.5 w-4.5" />
                    ) : (
                      <FiVideo className="h-4.5 w-4.5" />
                    )}
                  </span>

                  {/* Title & Format Info */}
                  <div className="min-w-0 flex flex-wrap items-baseline gap-2.5">
                    <h3 className="font-bold text-[#0A163A] text-base leading-snug truncate">
                      {lesson.order}. {lesson.title}
                    </h3>
                    <span className="text-base font-semibold text-zinc-455 whitespace-nowrap">
                      ({lesson.duration} mins)
                    </span>
                    {lesson.lessonType === 'live' && (
                      <span className="text-base font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 shrink-0">
                        Live • {lesson.livePlatform || 'Zoom'}
                      </span>
                    )}
                    {lesson.lessonType === 'quiz' && (
                      <span className="text-base font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 shrink-0">
                        Interactive Quiz
                      </span>
                    )}
                    {lesson.lessonType === 'assignment' && (
                      <span className="text-base font-bold text-[#615fff] bg-[#615fff]/5 px-2 py-0.5 rounded-lg border border-[#615fff]/10 shrink-0">
                        Assignment
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side items (Preview / Lock tag + Chevron) */}
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {/* Preview text or Lock icon */}
                  {lesson.isPreviewable && lesson.videoUrl ? (
                    <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-0.5 text-base font-bold flex items-center gap-1">
                      <FiEye className="h-4 w-4 shrink-0" />
                      <span>Free Preview</span>
                    </span>
                  ) : (
                    <span className="text-zinc-300 flex items-center justify-center shrink-0">
                      <FiLock className="h-4.5 w-4.5 text-zinc-400" />
                    </span>
                  )}
                  
                  <span className="text-zinc-400 shrink-0">
                    {isOpen ? (
                      <FiChevronUp className="h-5 w-5" />
                    ) : (
                      <FiChevronDown className="h-5 w-5" />
                    )}
                  </span>
                </div>
              </button>

              {/* Accordion Body (Smooth Framer Motion Transition) */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-5 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50/30">
                      
                      {!isEnrolled ? (
                        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-50 border border-zinc-200/60 rounded-lg p-5">
                          <div className="space-y-1.5 flex-1">
                            <p className="text-base font-bold text-zinc-700 flex items-center gap-2">
                              <FiLock className="h-4.5 w-4.5 text-[#615fff]" />
                              <span>Lesson Content Locked</span>
                            </p>
                            <p className="text-base font-semibold text-zinc-500 leading-relaxed">
                              {lesson.lessonType === 'live'
                                ? 'Unlock this live webinar session, interactive schedule, and broadcast join links by enrolling in this course.'
                                : 'Unlock this premium high-definition video lesson, worksheets, files, and progress tracking.'}
                            </p>
                          </div>
                          {lesson.isPreviewable && lesson.videoUrl ? (
                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (lesson.videoUrl) setActiveVideoUrl(lesson.videoUrl)
                                }}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#615fff] hover:bg-[#543cdf] text-white border border-transparent font-bold text-base transition-all cursor-pointer shadow-md hover:shadow-lg shadow-[#615fff]/15 hover:scale-[1.02]"
                              >
                                <FiPlay className="h-4.5 w-4.5 fill-white" />
                                <span>Watch Free Preview</span>
                              </button>
                            </div>
                          ) : (
                            <div className="shrink-0 text-base font-bold text-zinc-450 bg-zinc-250/20 border border-zinc-200/60 px-3.5 py-1.5 rounded-lg select-none">
                              Enrolled Members Only
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Left Side: Description Text */}
                          <div className="flex-grow space-y-2">
                            <p className="text-base font-bold text-zinc-450 uppercase tracking-wider">Lesson Details</p>
                            <p className="text-base font-semibold text-zinc-650 leading-relaxed font-sans">
                              {lesson.lessonType === 'live'
                                ? 'Join our interactive Live Lecture broadcasted on ' + (lesson.livePlatform || 'Zoom') + '. You can ask questions in real-time and engage with other students.'
                                : lesson.lessonType === 'quiz'
                                ? 'Test your comprehension with an interactive Multiple Choice Quiz. Secure a passing score to validate your understanding of the lecture topic.'
                                : lesson.lessonType === 'assignment'
                                ? 'Complete this hands-on assignment evaluation task. Once completed, submit your secure Google Drive link in the watch player watch room for teacher grading.'
                                : 'This is a premium pre-recorded high-definition video lesson. Complete the video lectures and hands-on worksheets at your own comfortable pace.'}
                            </p>
                            
                            {lesson.lessonType === 'live' && formattedDate && (
                              <div className="space-y-1 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 max-w-xl">
                                <p className="text-base font-bold text-rose-500 uppercase tracking-wider">Broadcast Schedule</p>
                                <p className="text-base font-bold text-[#0A163A] mt-0.5">
                                  Starts on: {formattedDate} (Bangladesh Standard Time)
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Side: Action Buttons */}
                          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-end">
                            {lesson.videoUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (lesson.videoUrl) setActiveVideoUrl(lesson.videoUrl)
                                }}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-base transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                              >
                                <FiPlay className="h-4.5 w-4.5 text-zinc-700" />
                                <span>Preview Inline</span>
                              </button>
                            )}

                            {courseSlug && (
                              <Link
                                href={`/courses/${courseSlug}/watch?lesson=${lesson.id}`}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#615fff] hover:bg-[#543cdf] text-white border border-transparent font-bold text-base transition-all cursor-pointer shadow-md hover:shadow-lg shadow-[#615fff]/15 hover:scale-[1.02]"
                              >
                                <FiVideo className="h-4.5 w-4.5" />
                                <span>Go to Course Player</span>
                              </Link>
                            )}
                          </div>
                        </>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Video Preview Popup Modal (Glassmorphic Backdrop Blur) */}
      <AnimatePresence>
        {activeVideoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoUrl(null)}
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900 border border-white/10 rounded-lg overflow-hidden shadow-2xl w-full max-w-4xl aspect-video relative z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
              >
                <FiX className="h-5 w-5" />
              </button>

              {/* iframe / Video Box */}
              <div className="w-full h-full relative">
                {getEmbedUrl(activeVideoUrl) ? (
                  <iframe
                    src={getEmbedUrl(activeVideoUrl)}
                    title="Course Video Preview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
                    <p className="text-base font-bold">Unsupported video format or missing URL</p>
                    <p className="text-base text-zinc-400 mt-2 select-text">URL: {activeVideoUrl}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
