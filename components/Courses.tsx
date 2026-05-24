'use client'

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  FiGrid, FiCode, FiLayers, FiClipboard,
  FiTrendingUp, FiClock, FiBookOpen, FiArrowUpRight,
  FiZap, FiPackage, FiStar, FiUsers, FiUser,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'

// ─── Exported Types (used in page.tsx) ─────────────────────────────────────

interface MediaSize {
  url?: string | null
}

interface ThumbnailDoc {
  id: string
  url?: string | null
  alt?: string | null
  sizes?: {
    thumbnail?: MediaSize | null
    card?: MediaSize | null
    hero?: MediaSize | null
  }
}

export interface CategoryDoc {
  id: string
  name: string
  slug: string
}

export interface CourseDoc {
  id: string
  title: string
  slug: string
  summary: string
  price: number
  thumbnail: ThumbnailDoc | string | null
  category: CategoryDoc | string | null
  instructor?: { id: string; name: string } | null
  duration?: string | null
  level: 'all' | 'beginner' | 'intermediate' | 'advanced'
  status: 'draft' | 'published'
  enrollmentCount?: number
  avgRating?: number
  reviewCount?: number
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface CoursesProps {
  initialCourses: CourseDoc[]
  categories: CategoryDoc[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getImageUrl(thumbnail: CourseDoc['thumbnail']): string {
  if (!thumbnail || typeof thumbnail === 'string') return ''
  return thumbnail.sizes?.card?.url ?? thumbnail.url ?? ''
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

function getLevelLabel(level: CourseDoc['level']): string {
  const map: Record<string, string> = {
    all: 'All Levels',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  }
  return map[level] ?? 'All Levels'
}

function getCategoryName(category: CourseDoc['category']): string {
  if (!category || typeof category === 'string') return ''
  return category.name
}

function getCategorySlug(category: CourseDoc['category']): string {
  if (!category || typeof category === 'string') return ''
  return category.slug
}

function getIconForCategory(slug: string): IconType {
  const map: Record<string, IconType> = {
    development: FiCode,
    programming: FiCode,
    'web-development': FiCode,
    design: FiLayers,
    'ui-ux': FiLayers,
    'ui-ux-design': FiLayers,
    marketing: FiTrendingUp,
    'digital-marketing': FiTrendingUp,
    business: FiTrendingUp,
    management: FiClipboard,
    'project-management': FiClipboard,
    'project-mgmt': FiClipboard,
    data: FiZap,
    'data-science': FiZap,
    science: FiZap,
  }
  return map[slug] ?? FiPackage
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
      delay: i * 0.1,
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18 } },
}

const sectionHeadVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: d, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Courses({ initialCourses, categories }: CoursesProps) {
  const [activeTab, setActiveTab] = useState('all')

  // Scroll-triggered gate: cards only animate when section enters viewport
  const cardsRef = useRef<HTMLDivElement>(null)
  const cardsInView = useInView(cardsRef, { once: true, amount: 0.05 })

  // Heading ref for stagger control
  const headRef = useRef<HTMLDivElement>(null)
  const headInView = useInView(headRef, { once: true, amount: 0.3 })

  // Build dynamic tabs: "All" always first, then DB categories
  const tabs = [
    { id: 'all', label: 'All Courses', icon: FiGrid },
    ...categories.map((cat) => ({
      id: cat.slug,
      label: cat.name,
      icon: getIconForCategory(cat.slug),
    })),
  ]

  // Filter courses by active tab
  const filteredCourses = initialCourses.filter((course) => {
    if (activeTab === 'all') return true
    return getCategorySlug(course.category) === activeTab
  })

  // First course is featured, rest go to the grid
  const featuredCourse = filteredCourses[0] ?? null
  const regularCourses = filteredCourses.slice(1)

  return (
    <section
      id="courses"
      className="py-20 md:py-28 px-6 bg-[#ffffff] border-t border-zinc-100 relative overflow-hidden select-none"
    >

      {/* Background spotlights */}
      <div className="absolute top-1/3 right-0 w-112.5 h-112.5 bg-[#615fff]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-112.5 h-112.5 bg-[#615fff]/4 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto relative z-10">

        {/* Section Title */}
        <div className="text-center mb-12" ref={headRef}>
          <motion.p
            custom={0}
            variants={sectionHeadVariants}
            initial="hidden"
            animate={headInView ? 'visible' : 'hidden'}
            className="text-base font-bold text-[#615fff] mb-3 tracking-wide uppercase"
          >
            Featured Courses
          </motion.p>
          <motion.h2
            custom={0.12}
            variants={sectionHeadVariants}
            initial="hidden"
            animate={headInView ? 'visible' : 'hidden'}
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans text-zinc-900 tracking-tight leading-[1.2]"
          >
            Become In Demand On the <br className="hidden sm:block" /> Job Market Today!
          </motion.h2>
        </div>

        {/* Category Tabs */}
        <motion.div
          custom={0.22}
          variants={sectionHeadVariants}
          initial="hidden"
          animate={headInView ? 'visible' : 'hidden'}
          className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-4 mb-12 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`relative flex items-center gap-2 px-5 py-3.5 rounded-lg border font-bold text-base whitespace-nowrap transition-colors duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-[#615fff] text-white border-transparent shadow-md shadow-[#615fff]/20'
                    : 'bg-white text-zinc-500 border-zinc-200/80 hover:border-[#615fff]/30 hover:text-zinc-800 hover:bg-[#615fff]/4'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{tab.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Course Grid / Empty State */}
        <div ref={cardsRef} />
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="h-16 w-16 rounded-lg bg-[#615fff]/8 flex items-center justify-center mb-5">
                <FiBookOpen className="h-7 w-7 text-[#615fff]" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">No courses yet</h3>
              <p className="text-base font-semibold text-zinc-400 max-w-xs">
                Courses in this category will appear here once published.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Featured Wide Card */}
              {featuredCourse && (
                <motion.div
                  custom={0}
                  variants={cardVariants}
                  initial="hidden"
                  animate={cardsInView ? 'visible' : 'hidden'}
                  whileHover={{ y: -3, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  className="bg-white rounded-lg border border-zinc-200/80 p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-[#615fff]/20 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                    {/* Image */}
                    <div className="lg:col-span-6 relative aspect-[16/10] bg-[#f5f8ff] rounded-lg overflow-hidden border border-zinc-100">
                      {getImageUrl(featuredCourse.thumbnail) ? (
                        <img
                          src={getImageUrl(featuredCourse.thumbnail)}
                          alt={featuredCourse.title}
                          className="w-full h-full object-cover pointer-events-none"
                          onError={(e) => {
                            // Clear src so we can render the CSS fallback instead of a broken image
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('.css-placeholder');
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`css-placeholder w-full h-full bg-gradient-to-br from-[#0A163A] to-[#121212] flex flex-col items-center justify-center border border-white/5 absolute inset-0 ${getImageUrl(featuredCourse.thumbnail) ? 'hidden' : ''}`}>
                        <span className="h-14 w-14 rounded-lg bg-[#615fff]/20 flex items-center justify-center font-bold text-white shadow-lg text-lg mb-2">
                          T
                        </span>
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Tutor Space</span>
                      </div>
                      {/* Level badge on image */}
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-zinc-700 font-bold text-base shadow-sm border border-zinc-100">
                        {getLevelLabel(featuredCourse.level)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
                      <div className="space-y-4">

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3.5 py-1.5 bg-[#615fff]/8 text-[#615fff] rounded-lg font-bold text-base border border-[#615fff]/15">
                            {getCategoryName(featuredCourse.category) || 'Course'}
                          </span>
                          <span className="px-3.5 py-1.5 bg-zinc-950 text-white rounded-lg font-bold text-base flex items-center gap-1.5 shadow-sm">
                            <FiZap className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span>Featured</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug tracking-tight">
                          {featuredCourse.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-base sm:text-lg font-semibold text-zinc-500 leading-relaxed max-w-xl line-clamp-3">
                          {featuredCourse.summary}
                        </p>

                        {/* Meta stats */}
                        <div className="flex flex-wrap items-center gap-5 pt-2 border-b border-zinc-100 pb-4 text-base font-bold text-zinc-500">
                          {featuredCourse.duration && (
                            <span className="flex items-center gap-2">
                              <FiClock className="h-5 w-5 text-zinc-400" />
                              <span>{featuredCourse.duration}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-2">
                            <FiBookOpen className="h-5 w-5 text-zinc-400" />
                            <span>{getLevelLabel(featuredCourse.level)}</span>
                          </span>
                          {(featuredCourse.enrollmentCount ?? 0) > 0 && (
                            <span className="flex items-center gap-2">
                              <FiUsers className="h-5 w-5 text-zinc-400" />
                              <span>{featuredCourse.enrollmentCount} students</span>
                            </span>
                          )}
                          {(featuredCourse.avgRating ?? 0) > 0 && (
                            <span className="flex items-center gap-1.5">
                              <FiStar className="h-5 w-5 text-amber-400 fill-amber-400" />
                              <span className="text-zinc-700">{featuredCourse.avgRating}</span>
                              {(featuredCourse.reviewCount ?? 0) > 0 && (
                                <span className="text-zinc-400 font-semibold">({featuredCourse.reviewCount})</span>
                              )}
                            </span>
                          )}
                          {featuredCourse.instructor && (
                            <span className="flex items-center gap-2">
                              <FiUser className="h-5 w-5 text-zinc-400" />
                              <span>{featuredCourse.instructor.name}</span>
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-3xl font-bold text-[#615fff]">
                          {formatPrice(featuredCourse.price)}
                        </span>
                        <Link
                          href={`/courses/${featuredCourse.slug}`}
                          className="px-5 py-3 border border-zinc-200 rounded-lg font-bold text-base text-zinc-800 hover:border-[#615fff]/30 hover:bg-[#615fff]/4 transition-all flex items-center gap-3 bg-white shadow-sm group"
                        >
                          <span>View Details</span>
                          <span className="h-7 w-7 rounded-full bg-zinc-950 group-hover:bg-[#615fff] flex items-center justify-center text-white transition-colors duration-300">
                            <FiArrowUpRight className="h-4 w-4" />
                          </span>
                        </Link>
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* Regular Grid */}
              {regularCourses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularCourses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      custom={i + 1}
                      variants={cardVariants}
                      initial="hidden"
                      animate={cardsInView ? 'visible' : 'hidden'}
                      className="group bg-white rounded-lg border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#615fff]/20 transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[16/10] bg-[#f5f8ff] overflow-hidden border-b border-zinc-100">
                        {getImageUrl(course.thumbnail) ? (
                          <img
                            src={getImageUrl(course.thumbnail)}
                            alt={course.title}
                            className="w-full h-full object-cover pointer-events-none group-hover:scale-[1.03] transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const fallback = parent.querySelector('.css-placeholder');
                                if (fallback) fallback.classList.remove('hidden');
                              }
                            }}
                          />
                        ) : null}
                        <div className={`css-placeholder w-full h-full bg-gradient-to-br from-[#0A163A] to-[#121212] flex flex-col items-center justify-center border border-white/5 absolute inset-0 ${getImageUrl(course.thumbnail) ? 'hidden' : ''}`}>
                          <span className="h-10 w-10 rounded-lg bg-[#615fff]/20 flex items-center justify-center font-bold text-white shadow-lg text-base mb-1.5">
                            T
                          </span>
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tutor Space</span>
                        </div>
                        {/* Level chip */}
                        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-zinc-600 font-bold text-base shadow-sm border border-zinc-100">
                          {getLevelLabel(course.level)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-3">

                          {/* Category & Price */}
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-[#615fff]/8 text-[#615fff] rounded-lg font-bold text-base border border-[#615fff]/15">
                              {getCategoryName(course.category) || 'Course'}
                            </span>
                            <span className="text-xl font-bold text-[#615fff]">
                              {formatPrice(course.price)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug tracking-tight group-hover:text-[#615fff] transition-colors duration-300">
                            {course.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-base font-semibold text-zinc-500 leading-relaxed line-clamp-2">
                            {course.summary}
                          </p>

                          {/* Instructor */}
                          {course.instructor && (
                            <span className="flex items-center gap-1.5 text-base font-semibold text-zinc-400">
                              <FiUser className="h-4 w-4" />
                              <span>{course.instructor.name}</span>
                            </span>
                          )}

                        </div>

                        {/* Footer meta + CTA */}
                        <div className="space-y-3 pt-4 border-t border-zinc-100">
                          <div className="flex items-center justify-between text-base font-bold text-zinc-400">
                            <div className="flex items-center gap-4">
                              {course.duration && (
                                <span className="flex items-center gap-1.5">
                                  <FiClock className="h-4 w-4" />
                                  <span>{course.duration}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <FiBookOpen className="h-4 w-4" />
                                <span>{getLevelLabel(course.level)}</span>
                              </span>
                            </div>
                            <Link
                              href={`/courses/${course.slug}`}
                              className="h-8 w-8 rounded-full bg-zinc-100 group-hover:bg-[#615fff] flex items-center justify-center text-zinc-500 group-hover:text-white transition-all duration-300"
                            >
                              <FiArrowUpRight className="h-4 w-4" />
                            </Link>
                          </div>

                          {/* Rating & enrollment row */}
                          {((course.avgRating ?? 0) > 0 || (course.enrollmentCount ?? 0) > 0) && (
                            <div className="flex items-center gap-4 text-base font-semibold text-zinc-400">
                              {(course.avgRating ?? 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <FiStar className="h-4 w-4 text-amber-400 fill-amber-400" />
                                  <span className="text-zinc-600 font-bold">{course.avgRating}</span>
                                  {(course.reviewCount ?? 0) > 0 && (
                                    <span>({course.reviewCount})</span>
                                  )}
                                </span>
                              )}
                              {(course.enrollmentCount ?? 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <FiUsers className="h-4 w-4" />
                                  <span>{course.enrollmentCount} students</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex justify-center mt-16"
        >
          <Link
            href="/courses"
            className="px-6 py-4 bg-zinc-950 hover:bg-[#615fff] text-white font-bold text-base rounded-lg shadow-lg hover:shadow-[#615fff]/25 transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer"
          >
            <span>View All Courses</span>
            <span className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-zinc-950 group-hover:text-[#615fff] transition-colors duration-300">
              <FiArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
