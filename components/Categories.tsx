'use client'

import React from 'react'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface CategoryItem {
  label: string
  icon: string
  href: string
}

const CATEGORIES: CategoryItem[] = [
  { label: 'Computer science',       icon: '/svg/computer_icon.svg',           href: '/courses?category=computer-science' },
  { label: 'Programming languages',  icon: '/svg/setings_icon.svg',            href: '/courses?category=programming-languages' },
  { label: 'Software development',   icon: '/svg/block_with_computer_icon.svg',href: '/courses?category=software-development' },
  { label: 'Web development',        icon: '/svg/@_icon.svg',                  href: '/courses?category=web-development' },
  { label: 'Data science & analytics', icon: '/svg/search_icon.svg',           href: '/courses?category=data-science' },
  { label: 'Mobile app development', icon: '/svg/mobile_icon.svg',             href: '/courses?category=mobile-apps' },
  { label: 'Database management',    icon: '/svg/database_icon.svg',           href: '/courses?category=database-management' },
]

// ─── Individual scroll-triggered card using native whileInView ────────────────
function AnimatedCard({ category }: { category: CategoryItem }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      className="h-full"
    >
      <Link
        href={category.href}
        className="bg-white rounded-lg border border-zinc-200/80 p-5 md:p-6 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-[#615fff]/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer h-full"
      >
        <div
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ filter: 'hue-rotate(20deg)' }}
        >
          <img src={category.icon} alt={category.label} className="w-11 h-11 object-contain pointer-events-none" />
        </div>
        <span className="text-base font-bold text-zinc-800 group-hover:text-[#615fff] transition-colors leading-snug">
          {category.label}
        </span>
      </Link>
    </motion.div>
  )
}

// ─── CTA card using native whileInView ────────────────────────────────────────
function AnimatedCTACard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.215, 0.61, 0.355, 1] }}
      className="h-full"
    >
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
  )
}

// ─── Heading + subtext using native whileInView ───────────────────────────────
function AnimatedHeading() {
  return (
    <div className="text-center mb-16 space-y-4 relative z-30 py-2">
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.2] max-w-4xl mx-auto"
      >
        Explore diverse learning paths within our course{' '}
        <span className="relative inline-block text-[#615fff] whitespace-nowrap">
          categories
          <motion.img
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '100%', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            src="/svg/masterlife.jwsuperthemes.com-2.svg"
            alt=""
            className="absolute -bottom-2 left-0 h-auto select-none pointer-events-none"
          />
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="text-base sm:text-lg font-semibold text-zinc-500 max-w-2xl mx-auto pt-2 leading-relaxed"
      >
        Our carefully curated course categories are designed to help you explore different fields, gain new skills, and advance your knowledge.
      </motion.p>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function Categories() {
  return (
    <section className="py-20 md:py-28 px-6 bg-[#f5f8ff]/50 border-t border-zinc-100 relative overflow-hidden select-none">

      {/* Floating keyframe CSS (always works independently of JS mounts) */}
      <style jsx>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-14px); }
        }
        .float-a { animation: floatY 7s ease-in-out infinite; }
        .float-b { animation: floatY 9s ease-in-out infinite 1.5s; }
        .float-c { animation: floatY 8s ease-in-out infinite 3s; }
        .float-d { animation: floatY 10s ease-in-out infinite 4.5s; }
      `}</style>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#615fff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />

      {/* ── 4 floating decorative images, inside the content width, visible & sized ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left */}
        <img
          src="/icon_image/67af701a7fe66816db9422cd_Hero_20Vactor_204.png"
          alt=""
          className="float-a absolute w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ top: '8%', left: '3%' }}
        />
        {/* Top-right */}
        <img
          src="/icon_image/67af701acb74e60e725c6099_Hero_20Vactor_203.png"
          alt=""
          className="float-b absolute w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ top: '6%', right: '3%' }}
        />
        {/* Bottom-left */}
        <img
          src="/icon_image/67af9b9a66f48f117f548b1a_CTA_20Vector.png"
          alt=""
          className="float-c absolute w-20 h-20 md:w-28 md:h-28 object-contain"
          style={{ bottom: '8%', left: '4%' }}
        />
        {/* Bottom-right */}
        <img
          src="/icon_image/man.png"
          alt=""
          className="float-d absolute w-24 h-24 md:w-32 md:h-32 object-contain"
          style={{ bottom: '6%', right: '3%' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto relative z-10">

        <AnimatedHeading />

        {/* Grid: each card has its OWN scroll trigger — reveals one by one as you scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <AnimatedCard key={idx} category={cat} />
          ))}
          <AnimatedCTACard />
        </div>

      </div>
    </section>
  )
}
