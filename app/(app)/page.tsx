'use client'

import React from 'react'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0A163A] font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Dynamic Marquee Keyframes Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
      `}} />

      {/* Scroll-Adaptive Navbar */}
      <Navbar />

      {/* Hero Section Container */}
      <main className="container mx-auto px-6 pt-36 md:pt-48 pb-20 relative z-10 flex flex-col items-center flex-grow justify-center">
        
        {/* Main Animated Heading in Plus Jakarta Sans */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-center text-[#0A163A] leading-[1.15] md:leading-[1.12] max-w-5xl mx-auto mb-8 relative"
        >
          
          {/* Row 1: Learn Easily [Avatar] */}
          <span className="block relative mb-3 md:mb-5">
            {/* Purple Curved Pointing Arrow (heading-svg.svg) - Made Larger & Animated */}
            <motion.span 
              initial={{ opacity: 0, scale: 0.8, rotate: -25 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
              className="absolute -left-24 -top-12 w-32 h-32 pointer-events-none hidden lg:block"
            >
              <img src="/svg/heading-svg.svg" alt="arrow pointer" className="w-full h-full object-contain" />
            </motion.span>

            <span className="align-middle">Learn </span>
            
            {/* Golden Pill Highlighter - Smooth Zoom in */}
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center bg-[#FDBF2D] text-[#0A163A] px-8 md:px-16 py-2 md:py-[6px] rounded-full mx-2 align-middle relative "
            >
              Easily
            </motion.span>

            {/* Avatar right next to Easily - Animated Pop-In */}
            <motion.span 
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 120 }}
              className="inline-block align-middle -ml-[30px] relative -top-2 md:-top-0 z-10"
            >
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Instructor" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-white shadow-md object-cover"
              />
            </motion.span>

            {/* Purple Lines Spark (heading-svg2.svg) - Animated Zoom */}
            <motion.span 
              initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
              className="absolute right-2 -top-8 w-20 h-20 pointer-events-none hidden lg:block"
            >
              <img src="/svg/heading-svg2.svg" alt="spark accents" className="w-full h-full object-contain" />
            </motion.span>
          </span>

          {/* Row 2: Anywhere [Avatars] and Anytime */}
          <span className="block">
            <span className="align-middle">Anywhere </span>

            {/* Double Overlapping Avatars - Staggered entrance */}
            <span className="inline-flex items-center justify-center align-middle mx-1 md:mx-2 translate-y-1">
              <motion.img 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Student 1" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-white shadow-md object-cover -mr-4 relative z-20"
              />
              <motion.img 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Student 2" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-white shadow-md object-cover relative z-10"
              />
            </span>

            <span className="align-middle"> and Anytime</span>
          </span>

        </motion.h1>

        {/* Subheading/Subtitle in Nunito (Fade in from bottom) */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          className="text-base sm:text-lg md:text-xl text-[#4F5B7C] font-semibold text-center max-w-3xl mx-auto mb-10 leading-relaxed font-sans"
        >
          {"On my website, you'll find resources and trainings to help you find"} <br className="hidden md:block" /> {"aliveness and vitality in your relationships."}
        </motion.p>

        {/* Action Button - Zoom pop in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: 'easeOut' }}
        >
          <button className="px-8 py-4 rounded-2xl bg-[#543CDF] hover:bg-[#543CDF]/95 text-white font-extrabold text-base shadow-lg shadow-[#543CDF]/25 hover:shadow-[#543CDF]/35 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
            Start Learning Today
          </button>
        </motion.div>

      </main>

      {/* Infinite Marquee Scrolling Area below Hero */}
      <div className="w-full bg-[#fafafa] border-y border-zinc-100 py-6 overflow-hidden relative select-none z-10">
        <div className="animate-marquee-track flex gap-20">
          
          {/* Marquee Group 1 */}
          <div className="flex gap-20 items-center shrink-0 text-base font-extrabold uppercase tracking-widest text-[#4F5B7C]/40">
            <span>Interactive Lessons</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Expert Instructors</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Flexible Learning</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Lifetime Access</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Verified Certificates</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          </div>

          {/* Marquee Group 2 (Duplicate for infinite seamless loop) */}
          <div className="flex gap-20 items-center shrink-0 text-base font-extrabold uppercase tracking-widest text-[#4F5B7C]/40" aria-hidden="true">
            <span>Interactive Lessons</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Expert Instructors</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Flexible Learning</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Lifetime Access</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
            <span>Verified Certificates</span>
            <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          </div>

        </div>
      </div>

    </div>
  )
}
