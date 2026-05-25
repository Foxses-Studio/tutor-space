'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export default function CTASection() {
  return (
    <section className="relative bg-gradient-to-br from-[#E2DCFE] via-[#F1EEFF] to-[#E2DCFE] border-t border-[#D1C9FF] overflow-hidden select-text py-20 md:py-28 w-full">
      {/* Subtle vertical glow columns on the sides */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#CFC6FF]/20 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#CFC6FF]/20 to-transparent pointer-events-none" />

      {/* Dot Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#7C3AED 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 75%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto w-full">
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-[#0F172A] tracking-tight leading-[1.15]"
        >
          Start Your Learning Journey Today
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 md:mt-6 text-base md:text-lg text-[#475569] max-w-2xl font-normal leading-relaxed"
        >
          Gain new skills, explore creative fields, and achieve your career goals — all in one platform.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
        >
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 pl-6 pr-2 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base rounded-lg transition-all duration-300 shadow-[0_4px_14px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
          >
            <span>Browse Course</span>
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#7C3AED] transition-transform duration-300 group-hover:translate-x-0.5">
              <FiArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-base rounded-lg transition-all duration-300 border border-zinc-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
