'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiGrid, FiCode, FiLayers, FiFlame, FiClipboard, 
  FiTrendingUp, FiClock, FiBookOpen, FiArrowUpRight 
} from 'react-icons/fi'

interface Course {
  id: string
  title: string
  description: string
  category: string
  price: string
  duration: string
  lectures: string
  image: string
  isPopular?: boolean
  isFeatured?: boolean
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Categories', icon: FiGrid },
  { id: 'development', label: 'Development', icon: FiCode },
  { id: 'ui-ux', label: 'UI/UX Design', icon: FiLayers },
  { id: 'popular', label: 'Popular', icon: FiFlame },
  { id: 'project-mgmt', label: 'Project Management', icon: FiClipboard },
  { id: 'marketing', label: 'Marketing', icon: FiTrendingUp },
]

const COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Effective Stakeholder Engagement',
    description: 'Gain UI design mastery with hands-on expert mentorship, refining your skills through personalized guidance and feedback.',
    category: 'Development',
    price: '$160.00',
    duration: '2hr 35min',
    lectures: '20 lectures',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    isPopular: true,
    isFeatured: true,
  },
  {
    id: 'course-2',
    title: 'Google Ads & PPC Campaigns',
    description: 'Master advanced digital search campaigns, dynamic keyword insertion, conversion tracking, and high-ROI bidding strategy.',
    category: 'Marketing',
    price: '$140.00',
    duration: '3hr 35min',
    lectures: '25 lectures',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=800',
    isPopular: true,
  },
  {
    id: 'course-3',
    title: 'Introduction to Design Systems',
    description: 'Build scalable typography tokens, reusable component states, unified color palettes, and interactive prototypes in Figma.',
    category: 'UI/UX Design',
    price: '$150.00',
    duration: '3hr 35min',
    lectures: '25 lectures',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800',
    isPopular: true,
  },
  {
    id: 'course-4',
    title: 'HTML, CSS, and Beyond',
    description: 'Master semantic layout standards, grid alignments, advanced CSS selectors, dynamic variables, and responsive design systems.',
    category: 'Development',
    price: '$180.00',
    duration: '4hr 35min',
    lectures: '30 lectures',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800',
    isPopular: true,
  },
]

export default function Courses() {
  const [activeTab, setActiveTab] = useState('all')

  // Filter logic
  const filteredCourses = COURSES.filter((course) => {
    if (activeTab === 'all') return true
    if (activeTab === 'popular') return course.isPopular
    if (activeTab === 'ui-ux') return course.category === 'UI/UX Design'
    if (activeTab === 'project-mgmt') return course.category === 'Project Management'
    return course.category.toLowerCase() === activeTab
  })

  // Separate featured course for separate card rendering
  const featuredCourse = filteredCourses.find((c) => c.isFeatured)
  const regularCourses = filteredCourses.filter((c) => !c.isFeatured)

  return (
    <section id="courses" className="py-20 md:py-28 px-6 bg-[#ffffff] border-t border-zinc-100 relative overflow-hidden select-none">
      
      {/* Background spotlights */}
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-[#615fff]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[450px] h-[450px] bg-[#009670]/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-sans text-zinc-900 tracking-tight leading-[1.2]"
          >
            Become In Demand On the <br className="hidden sm:block" /> Job Market Today!
          </motion.h2>
        </div>

        {/* Category Tabs Scroll Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto pb-4 mb-12 no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-lg border font-bold text-base whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#009670] text-white border-transparent shadow-sm'
                    : 'bg-white text-zinc-500 border-zinc-200/80 hover:border-zinc-300 hover:text-zinc-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Grid and Animation Container */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            
            {/* 1. Featured Wide Course Card */}
            {featuredCourse && (
              <motion.div
                key={featuredCourse.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
                className="bg-white rounded-lg border border-zinc-200/80 p-5 md:p-6 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Image wrapper */}
                  <div className="lg:col-span-6 relative aspect-[16/10] bg-[#f5f8ff] rounded-lg overflow-hidden border border-zinc-100 flex items-center justify-center p-6">
                    <img
                      src={featuredCourse.image}
                      alt={featuredCourse.title}
                      className="w-full h-full object-cover rounded-lg pointer-events-none"
                    />
                  </div>

                  {/* Right Column: Detailed info */}
                  <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-4">
                      
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3.5 py-1.5 bg-zinc-100 rounded-lg text-zinc-700 font-bold text-base">
                          {featuredCourse.category}
                        </span>
                        <span className="px-3.5 py-1.5 bg-zinc-950 text-white rounded-lg font-bold text-base flex items-center gap-1.5 shadow-sm">
                          <FiFlame className="h-4.5 w-4.5 text-[#ff5b5b] fill-[#ff5b5b]" />
                          <span>Popular</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-snug tracking-tight">
                        {featuredCourse.title}
                      </h3>

                      {/* Description */}
                      <p className="text-base sm:text-lg font-semibold text-zinc-500 leading-relaxed max-w-xl">
                        {featuredCourse.description}
                      </p>

                      {/* Stats meta info */}
                      <div className="flex flex-wrap items-center gap-6 pt-2 border-b border-zinc-100 pb-4 text-base font-bold text-zinc-500">
                        <span className="flex items-center gap-2">
                          <FiClock className="h-5 w-5 text-zinc-400" />
                          <span>{featuredCourse.duration}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <FiBookOpen className="h-5 w-5 text-zinc-400" />
                          <span>{featuredCourse.lectures}</span>
                        </span>
                      </div>

                    </div>

                    {/* Price and Details button */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-3xl font-bold text-[#009670]">
                        {featuredCourse.price}
                      </span>
                      
                      <Link
                        href={`/courses/${featuredCourse.id}`}
                        className="px-5 py-3 border border-zinc-200 rounded-lg font-bold text-base text-zinc-800 hover:border-zinc-300 transition-all flex items-center gap-3 bg-white hover:bg-zinc-50 shadow-sm"
                      >
                        <span>View Details</span>
                        <span className="h-7 w-7 rounded-full bg-zinc-950 flex items-center justify-center text-white">
                          <FiArrowUpRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}

            {/* 2. Regular Grid Courses Row */}
            {regularCourses.length > 0 && (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {regularCourses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
                    className="bg-white rounded-lg border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col h-full"
                  >
                    
                    {/* Top banner image wrapper */}
                    <div className="relative aspect-[16/10] bg-[#f5f8ff] overflow-hidden border-b border-zinc-100 flex items-center justify-center p-4">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg pointer-events-none"
                      />
                    </div>

                    {/* Main content */}
                    <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        
                        {/* Category & Price badge row */}
                        <div className="flex items-center justify-between">
                          <span className="px-3.5 py-1.5 bg-zinc-100 rounded-lg text-zinc-700 font-bold text-base">
                            {course.category}
                          </span>
                          <span className="text-xl font-bold text-[#009670]">
                            {course.price}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 leading-snug tracking-tight group-hover:text-[#009670] transition-colors">
                          {course.title}
                        </h3>

                        {/* Description */}
                        <p className="text-base font-semibold text-zinc-500 leading-relaxed line-clamp-2">
                          {course.description}
                        </p>

                      </div>

                      {/* Footer stats metadata */}
                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-base font-bold text-zinc-500">
                        <span className="flex items-center gap-2">
                          <FiClock className="h-5 w-5 text-zinc-400" />
                          <span>{course.duration}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <FiBookOpen className="h-5 w-5 text-zinc-400" />
                          <span>{course.lectures}</span>
                        </span>
                      </div>

                    </div>

                  </motion.div>
                ))}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* View All Courses primary button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="flex justify-center mt-16"
        >
          <Link
            href="/courses"
            className="px-6 py-4 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group cursor-pointer"
          >
            <span>View All Courses</span>
            <span className="h-7 w-7 rounded-full bg-white flex items-center justify-center text-zinc-950">
              <FiArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
