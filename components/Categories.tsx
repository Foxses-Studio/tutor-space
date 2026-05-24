'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import {
  FiCode, FiLayers, FiTrendingUp, FiClipboard, FiZap,
  FiPackage, FiMonitor, FiSmartphone, FiDatabase, FiSearch,
  FiSettings, FiGlobe, FiCamera, FiMusic, FiBookOpen,
  FiPenTool, FiDollarSign, FiBarChart2, FiBriefcase, FiCpu,
  FiShield, FiUsers, FiVideo, FiImage, FiBox, FiGrid,
} from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { motion } from 'framer-motion'

// ─── Icon sub-component with SVG → react-icon fallback ────────────────────────

type IconData =
  | { type: 'svg'; src: string }
  | { type: 'icon'; Icon: IconType }

function CategoryIconEl({
  iconData,
  name,
  fallbackIndex,
}: {
  iconData: IconData
  name: string
  fallbackIndex: number
}) {
  const [svgFailed, setSvgFailed] = useState(false)

  if (iconData.type === 'icon' || svgFailed) {
    const FallbackIcon = iconData.type === 'icon' ? iconData.Icon : getFallbackIcon(fallbackIndex)
    return <FallbackIcon className="w-7 h-7 text-[#615fff]" />
  }

  return (
    <img
      src={iconData.src}
      alt={name}
      className="w-8 h-8 object-contain pointer-events-none"
      style={{
        filter:
          'invert(37%) sepia(93%) saturate(600%) hue-rotate(220deg) brightness(95%) contrast(100%)',
      }}
      onError={() => setSvgFailed(true)}
    />
  )
}

export interface CategoryItem {
  id: string
  name: string
  slug: string
}

interface CategoriesProps {
  categories: CategoryItem[]
}

// ─── SVG file icons (original design assets) ─────────────────────────────────

const SLUG_SVG_MAP: Record<string, string> = {
  'computer-science':        '/svg/computer_icon.svg',
  'programming-languages':   '/svg/setings_icon.svg',
  'software-development':    '/svg/block_with_computer_icon.svg',
  'web-development':         '/svg/@_icon.svg',
  'data-science':            '/svg/search_icon.svg',
  'data-science-analytics':  '/svg/search_icon.svg',
  'data-analytics':          '/svg/search_icon.svg',
  'mobile-apps':             '/svg/mobile_icon.svg',
  'mobile-development':      '/svg/mobile_icon.svg',
  'mobile-app-development':  '/svg/mobile_icon.svg',
  'database-management':     '/svg/database_icon.svg',
  'database':                '/svg/database_icon.svg',
  'web-design':              '/svg/@_icon.svg',
  'design':                  '/svg/block_with_computer_icon.svg',
}

// ─── React-icons fallback pool (slug → icon) ─────────────────────────────────

const SLUG_ICON_MAP: Record<string, IconType> = {
  'machine-learning': FiZap,
  'artificial-intelligence': FiZap,
  'ai': FiZap,
  'cybersecurity': FiShield,
  'security': FiShield,
  'cloud-computing': FiBox,
  'devops': FiSettings,
  'ui-ux': FiLayers,
  'ui-ux-design': FiPenTool,
  'graphic-design': FiImage,
  'photography': FiCamera,
  'video': FiVideo,
  'video-editing': FiVideo,
  'business': FiBriefcase,
  'marketing': FiTrendingUp,
  'digital-marketing': FiTrendingUp,
  'finance': FiDollarSign,
  'management': FiClipboard,
  'project-management': FiClipboard,
  'entrepreneurship': FiTrendingUp,
  'hr': FiUsers,
  'music': FiMusic,
  'language': FiBookOpen,
  'languages': FiBookOpen,
  'personal-development': FiUsers,
  'health': FiSearch,
  'seo': FiSearch,
  'programming': FiCode,
}

const FALLBACK_ICONS: IconType[] = [
  FiGrid, FiCode, FiLayers, FiTrendingUp, FiClipboard,
  FiDatabase, FiZap, FiShield, FiGlobe, FiPackage,
  FiCpu, FiMonitor, FiBarChart2, FiBookOpen, FiBriefcase,
]

function getCategoryIcon(slug: string): { type: 'svg'; src: string } | { type: 'icon'; Icon: IconType } {
  const lower = slug.toLowerCase()

  // 1. Exact SVG match
  if (SLUG_SVG_MAP[lower]) return { type: 'svg', src: SLUG_SVG_MAP[lower] }

  // 2. Partial SVG match
  for (const [key, src] of Object.entries(SLUG_SVG_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return { type: 'svg', src }
  }

  // 3. Exact react-icon match
  if (SLUG_ICON_MAP[lower]) return { type: 'icon', Icon: SLUG_ICON_MAP[lower] }

  // 4. Partial react-icon match
  for (const [key, Icon] of Object.entries(SLUG_ICON_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return { type: 'icon', Icon }
  }

  return { type: 'icon', Icon: FiGrid }
}

function getFallbackIcon(index: number): IconType {
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
}

const subTextVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] as const } },
}

const underlineVariants = {
  hidden: { scaleX: 0, opacity: 0, originX: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.55, delay: 0.3, ease: 'easeOut' as const } },
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] as const } },
}

// ─── Main Section ─────────────────────────────────────────────────────────────

// ─── 7 default categories (original design) ─────────────────────────────────
const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '__default_1', name: 'Computer science',        slug: 'computer-science' },
  { id: '__default_2', name: 'Programming languages',   slug: 'programming-languages' },
  { id: '__default_3', name: 'Software development',    slug: 'software-development' },
  { id: '__default_4', name: 'Web development',         slug: 'web-development' },
  { id: '__default_5', name: 'Data science & analytics',slug: 'data-science' },
  { id: '__default_6', name: 'Mobile app development',  slug: 'mobile-app-development' },
  { id: '__default_7', name: 'Database management',     slug: 'database-management' },
]

export default function Categories({ categories }: CategoriesProps) {
  // Always show all 7 default categories.
  // If DB has a matching slug → use DB name (keeps it up-to-date).
  // If DB has extra slugs not in defaults → append them (up to 7 total).
  const dbBySlug = new Map((categories ?? []).map((c) => [c.slug, c]))

  // Start from defaults, override name from DB if slug matches
  const fromDefaults: CategoryItem[] = DEFAULT_CATEGORIES.map((d) => {
    const dbMatch = dbBySlug.get(d.slug)
    return dbMatch ? { ...d, id: dbMatch.id, name: dbMatch.name } : d
  })

  // Append any extra DB categories whose slugs aren't in defaults (up to 7 total)
  const defaultSlugs = new Set(DEFAULT_CATEGORIES.map((d) => d.slug))
  const extras = (categories ?? []).filter((c) => !defaultSlugs.has(c.slug))
  const allCategories = [...fromDefaults, ...extras].slice(0, 7)

  return (
    <section className="py-20 md:py-28 px-6 bg-[#f5f8ff] border-t border-zinc-100 relative overflow-hidden select-none">

      <style jsx>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        .float-a { animation: floatY 7s ease-in-out infinite; }
        .float-b { animation: floatY 9s ease-in-out infinite 1.5s; }
        .float-c { animation: floatY 8s ease-in-out infinite 3s; }
        .float-d { animation: floatY 10s ease-in-out infinite 4.5s; }
      `}</style>

      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#615fff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />

      {/* Floating decoration images */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img src="/icon_image/67af701a7fe66816db9422cd_Hero_20Vactor_204.png" alt=""
          className="float-a absolute w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ top: '8%', left: '3%' }} />
        <img src="/icon_image/67af701acb74e60e725c6099_Hero_20Vactor_203.png" alt=""
          className="float-b absolute w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ top: '6%', right: '3%' }} />
        <img src="/icon_image/67af9b9a66f48f117f548b1a_CTA_20Vector.png" alt=""
          className="float-c absolute w-20 h-20 md:w-28 md:h-28 object-contain"
          style={{ bottom: '8%', left: '4%' }} />
        <img src="/icon_image/man.png" alt=""
          className="float-d absolute w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ bottom: '6%', right: '3%' }} />
      </div>

      <div className="container mx-auto relative z-10">

        {/* ── Heading ── */}
        <div className="text-center mb-16 space-y-4 relative z-30 py-2">
          <motion.h2
            variants={headingVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.2] max-w-4xl mx-auto"
          >
            Explore diverse learning paths within our course{' '}
            <span className="relative inline-block text-[#FF6B2C] whitespace-nowrap">
              categories
              {/* Wavy orange underline */}
              <motion.svg
                variants={underlineVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 w-full pointer-events-none"
                style={{ height: '10px' }}
              >
                <path
                  d="M0,6 C25,0 50,12 75,6 C100,0 125,12 150,6 C175,0 200,10 200,6"
                  fill="none"
                  stroke="#FF6B2C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            </span>
          </motion.h2>

          <motion.p
            variants={subTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-base sm:text-lg font-semibold text-zinc-500 max-w-2xl mx-auto pt-2 leading-relaxed"
          >
            Our carefully curated course categories are designed to help you explore different fields,
            gain new skills, and advance your knowledge.
          </motion.p>
        </div>

        {/* ── Category Grid ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {allCategories.map((cat, index) => {
            const iconData = getCategoryIcon(cat.slug)

            return (
              <motion.div key={cat.id} variants={cardVariants} className="h-full">
                <Link
                  href={`/courses?category=${cat.slug}`}
                  className="bg-white rounded-lg border border-zinc-200 p-5 md:p-6 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[#615fff]/30 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full"
                >
                  {/* Icon container — light lavender square matching original design */}
                  <div
                    className="shrink-0 w-14 h-14 flex items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ background: 'rgba(97, 95, 255, 0.08)' }}
                  >
                    <CategoryIconEl iconData={iconData} name={cat.name} fallbackIndex={index} />
                  </div>

                  <span className="text-base font-bold text-zinc-800 group-hover:text-[#615fff] transition-colors leading-snug">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            )
          })}

          {/* CTA card — solid purple matching original */}
          <motion.div variants={cardVariants} className="h-full">
            <Link
              href="/courses"
              className="bg-[#615fff] hover:bg-[#5248e8] rounded-lg p-5 md:p-6 flex items-center justify-center shadow-lg shadow-[#615fff]/20 hover:shadow-xl hover:shadow-[#615fff]/30 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full"
            >
              <div className="flex items-center gap-2 text-white font-bold text-base md:text-lg">
                <span>Explore all categories</span>
                <FiArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
