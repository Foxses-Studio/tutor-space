'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiSearch, FiFilter, FiX, FiClock, FiBookOpen,
  FiUsers, FiStar, FiArrowUpRight, FiUser, FiGrid,
  FiList, FiChevronDown,
} from 'react-icons/fi'
import type { CourseDoc, CategoryDoc } from '@/components/Courses'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getImageUrl(thumbnail: CourseDoc['thumbnail']): string {
  if (!thumbnail || typeof thumbnail === 'string') return ''
  return (thumbnail as any).sizes?.card?.url ?? (thumbnail as any).url ?? ''
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

function getLevelLabel(level: string): string {
  const map: Record<string, string> = {
    all: 'All Levels', beginner: 'Beginner',
    intermediate: 'Intermediate', advanced: 'Advanced',
  }
  return map[level] ?? 'All Levels'
}

function getCategoryName(category: CourseDoc['category']): string {
  if (!category || typeof category === 'string') return ''
  return (category as any).name
}

function getCategorySlug(category: CourseDoc['category']): string {
  if (!category || typeof category === 'string') return ''
  return (category as any).slug
}

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced']
const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'popular',   label: 'Most Popular' },
]

// ─── Card ─────────────────────────────────────────────────────────────────────

function CourseCard({ course, view }: { course: CourseDoc; view: 'grid' | 'list' }) {
  const imgUrl = getImageUrl(course.thumbnail)

  if (view === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="bg-white border border-zinc-200/80 rounded-lg p-4 sm:p-5 flex gap-5 items-center hover:border-[#615fff]/25 hover:shadow-md transition-all duration-300 group"
      >
        {/* Thumbnail */}
        <div className="shrink-0 w-32 sm:w-44 aspect-[16/10] rounded-lg overflow-hidden bg-[#f5f8ff] border border-zinc-100 relative">
          {imgUrl ? (
            <img src={imgUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A163A] to-[#1e1b4b] flex items-center justify-center">
              <span className="h-8 w-8 rounded-lg bg-[#615fff]/30 flex items-center justify-center font-bold text-white text-sm">T</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2.5 py-1 bg-[#615fff]/8 text-[#615fff] rounded-lg font-bold text-base border border-[#615fff]/15">
              {getCategoryName(course.category) || 'Course'}
            </span>
            <span className="px-2.5 py-1 bg-zinc-100 text-zinc-500 rounded-lg font-bold text-base">
              {getLevelLabel(course.level)}
            </span>
          </div>
          <h3 className="font-bold text-zinc-900 text-base sm:text-lg leading-snug group-hover:text-[#615fff] transition-colors truncate">
            {course.title}
          </h3>
          <p className="text-base text-zinc-500 line-clamp-1 hidden sm:block">{course.summary}</p>
          <div className="flex flex-wrap items-center gap-4 text-base text-zinc-400 font-semibold">
            {course.duration && (
              <span className="flex items-center gap-1.5"><FiClock className="h-4 w-4" />{course.duration}</span>
            )}
            {(course.enrollmentCount ?? 0) > 0 && (
              <span className="flex items-center gap-1.5"><FiUsers className="h-4 w-4" />{course.enrollmentCount}</span>
            )}
            {(course.avgRating ?? 0) > 0 && (
              <span className="flex items-center gap-1"><FiStar className="h-4 w-4 text-amber-400 fill-amber-400" /><span className="text-zinc-600 font-bold">{course.avgRating}</span></span>
            )}
            {course.instructor && (
              <span className="flex items-center gap-1.5"><FiUser className="h-4 w-4" />{course.instructor.name}</span>
            )}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="shrink-0 flex flex-col items-end gap-3">
          <span className="text-2xl font-bold text-[#615fff]">{formatPrice(course.price)}</span>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#615fff] hover:bg-[#4f4fdd] text-white font-bold text-base transition-colors"
          >
            View <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    )
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="group bg-white rounded-lg border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:border-[#615fff]/20 transition-all duration-300 flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] bg-[#f5f8ff] overflow-hidden border-b border-zinc-100">
        {imgUrl ? (
          <img src={imgUrl} alt={course.title} className="w-full h-full object-cover pointer-events-none group-hover:scale-[1.04] transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A163A] to-[#1e1b4b] flex flex-col items-center justify-center">
            <span className="h-10 w-10 rounded-lg bg-[#615fff]/20 flex items-center justify-center font-bold text-white text-base mb-1.5">T</span>
            <span className="text-base font-bold text-zinc-500 uppercase tracking-wider">Tutor Space</span>
          </div>
        )}
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-zinc-700 font-bold text-base shadow-sm border border-zinc-100">
          {getLevelLabel(course.level)}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-[#615fff]/8 text-[#615fff] rounded-lg font-bold text-base border border-[#615fff]/15">
              {getCategoryName(course.category) || 'Course'}
            </span>
            <span className="text-xl font-bold text-[#615fff]">{formatPrice(course.price)}</span>
          </div>
          <h3 className="font-bold text-zinc-900 text-base sm:text-lg leading-snug group-hover:text-[#615fff] transition-colors">
            {course.title}
          </h3>
          <p className="text-base text-zinc-500 line-clamp-2">{course.summary}</p>
          {course.instructor && (
            <span className="flex items-center gap-1.5 text-base font-semibold text-zinc-400">
              <FiUser className="h-4 w-4" />{course.instructor.name}
            </span>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-zinc-100">
          <div className="flex items-center justify-between text-base font-bold text-zinc-400">
            <div className="flex items-center gap-3">
              {course.duration && (
                <span className="flex items-center gap-1"><FiClock className="h-4 w-4" />{course.duration}</span>
              )}
              {(course.enrollmentCount ?? 0) > 0 && (
                <span className="flex items-center gap-1"><FiUsers className="h-4 w-4" />{course.enrollmentCount}</span>
              )}
            </div>
            <Link
              href={`/courses/${course.slug}`}
              className="h-8 w-8 rounded-full bg-zinc-100 group-hover:bg-[#615fff] flex items-center justify-center text-zinc-500 group-hover:text-white transition-all duration-300"
            >
              <FiArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          {(course.avgRating ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 text-base font-semibold">
              <FiStar className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-zinc-700 font-bold">{course.avgRating}</span>
              {(course.reviewCount ?? 0) > 0 && <span className="text-zinc-400">({course.reviewCount} reviews)</span>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoursesPageClient({
  courses,
  categories,
}: {
  courses: CourseDoc[]
  categories: CategoryDoc[]
}) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeLevel, setActiveLevel] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...courses]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          getCategoryName(c.category).toLowerCase().includes(q)
      )
    }

    // Category
    if (activeCategory !== 'all') {
      result = result.filter((c) => getCategorySlug(c.category) === activeCategory)
    }

    // Level
    if (activeLevel !== 'all') {
      result = result.filter((c) => c.level === activeLevel)
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
        break
      case 'popular':
        result.sort((a, b) => (b.enrollmentCount ?? 0) - (a.enrollmentCount ?? 0))
        break
    }

    return result
  }, [courses, search, activeCategory, activeLevel, sortBy])

  const clearFilters = () => {
    setSearch('')
    setActiveCategory('all')
    setActiveLevel('all')
    setSortBy('newest')
  }

  const hasActiveFilters = search || activeCategory !== 'all' || activeLevel !== 'all' || sortBy !== 'newest'

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">

      {/* ── Hero banner ── */}
      <div className="bg-[#0A163A] text-white relative overflow-hidden pt-28 pb-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#615fff]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4338ca]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <p className="text-base font-bold text-[#a09dff] uppercase tracking-widest mb-3">All Courses</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4">
            Explore Our <span className="text-[#615fff]">Premium</span> Courses
          </h1>
          <p className="text-lg font-semibold text-zinc-300 max-w-xl">
            Browse {courses.length} carefully crafted courses taught by industry experts.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3 max-w-xl focus-within:border-[#615fff]/60 transition-colors">
            <FiSearch className="h-5 w-5 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search courses, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base text-white placeholder:text-zinc-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-6 py-10">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          {/* Left: category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg border font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#615fff] text-white border-transparent shadow-md shadow-[#615fff]/20'
                  : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#615fff]/30 hover:text-zinc-800'
              }`}
            >
              <FiGrid className="inline h-4 w-4 mr-1.5" />All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-lg border font-bold text-base whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-[#615fff] text-white border-transparent shadow-md shadow-[#615fff]/20'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#615fff]/30 hover:text-zinc-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right: filter toggle, sort, view */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-bold text-base transition-all cursor-pointer ${
                showFilters ? 'bg-[#615fff] text-white border-transparent' : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#615fff]/30'
              }`}
            >
              <FiFilter className="h-4 w-4" />
              Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 bg-white border border-zinc-200 rounded-lg text-base font-bold text-zinc-600 outline-none hover:border-[#615fff]/30 cursor-pointer transition-colors"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 transition-colors cursor-pointer ${view === 'grid' ? 'bg-[#615fff] text-white' : 'bg-white text-zinc-400 hover:text-zinc-700'}`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 transition-colors cursor-pointer ${view === 'list' ? 'bg-[#615fff] text-white' : 'bg-white text-zinc-400 hover:text-zinc-700'}`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Expanded filter panel ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-5 flex flex-wrap gap-6 items-start">
                {/* Level */}
                <div className="space-y-2">
                  <p className="text-base font-bold text-zinc-700">Level</p>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setActiveLevel(lvl)}
                        className={`px-3.5 py-1.5 rounded-lg border font-bold text-base transition-all cursor-pointer capitalize ${
                          activeLevel === lvl
                            ? 'bg-[#615fff] text-white border-transparent'
                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#615fff]/30'
                        }`}
                      >
                        {getLevelLabel(lvl)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results meta + clear ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base font-semibold text-zinc-500">
            Showing <span className="font-bold text-zinc-800">{filtered.length}</span> of{' '}
            <span className="font-bold text-zinc-800">{courses.length}</span> courses
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-base font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <FiX className="h-4 w-4" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Course grid / list ── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-28 text-center"
            >
              <div className="h-16 w-16 rounded-lg bg-[#615fff]/8 flex items-center justify-center mb-5">
                <FiBookOpen className="h-7 w-7 text-[#615fff]" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">No courses found</h3>
              <p className="text-base font-semibold text-zinc-400 max-w-xs mb-5">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-[#615fff] text-white font-bold text-base rounded-lg hover:bg-[#4f4fdd] transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} view={view} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
