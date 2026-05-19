'use client'

import React from 'react'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-[160vh] bg-[#ffffff] text-[#0A163A] font-sans relative overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 bg-[url('/svg/pattern.svg')] bg-cover bg-center opacity-[0.03] pointer-events-none" 
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Scroll-Adaptive Navbar */}
      <Navbar />

      {/* Hero Section Container */}
      <main className="container mx-auto px-6 pt-32 md:pt-48 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Main Heading in Plus Jakarta Sans */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-center text-[#0A163A] leading-[1.15] md:leading-[1.12] max-w-5xl mx-auto mb-8 relative">
          
          {/* Row 1: Learn Easily [Avatar] */}
          <span className="block relative mb-3 md:mb-5">
            {/* Purple Curved Pointing Arrow (heading-svg.svg) */}
            <span className="absolute -left-14 -top-8 w-20 h-20 pointer-events-none hidden lg:block transform -rotate-12">
              <img src="/svg/heading-svg.svg" alt="arrow pointer" className="w-full h-full object-contain" />
            </span>

            <span className="align-middle">Learn </span>
            
            {/* Golden Pill Highlighter */}
            <span className="inline-flex items-center bg-[#FDBF2D] text-[#0A163A] px-6 md:px-8 py-2 md:py-3.5 rounded-full mx-2 align-middle relative">
              Easily
            </span>

            {/* Avatar right next to Easily */}
            <span className="inline-block align-middle ml-1">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Instructor" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-white shadow-md object-cover"
              />
            </span>

            {/* Purple Lines Spark (heading-svg2.svg) */}
            <span className="absolute right-6 -top-4 w-12 h-12 pointer-events-none hidden lg:block">
              <img src="/svg/heading-svg2.svg" alt="spark accents" className="w-full h-full object-contain" />
            </span>
          </span>

          {/* Row 2: Anywhere [Avatars] and Anytime */}
          <span className="block">
            <span className="align-middle">Anywhere </span>

            {/* Double Overlapping Avatars */}
            <span className="inline-flex items-center justify-center align-middle mx-1 md:mx-2 translate-y-1">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Student 1" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-white shadow-md object-cover -mr-4 relative z-20"
              />
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Student 2" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full border-3 border-white shadow-md object-cover relative z-10"
              />
            </span>

            <span className="align-middle"> and Anytime</span>
          </span>

        </h1>

        {/* Subheading/Subtitle in Nunito (Minimum size 16px/text-base) */}
        <p className="text-base sm:text-lg md:text-xl text-[#4F5B7C] font-semibold text-center max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          On my website, you'll find resources and trainings to help you find aliveness and vitality in your relationships.
        </p>

        {/* Action Button - Minimum border radius 8px/rounded-lg (using rounded-2xl) */}
        <div>
          <button className="px-8 py-4 rounded-2xl bg-[#543CDF] hover:bg-[#543CDF]/95 text-white font-extrabold text-base shadow-lg shadow-[#543CDF]/25 hover:shadow-[#543CDF]/35 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
            Start Learning Today
          </button>
        </div>

      </main>

      {/* Bottom Corner Accent Elements */}
      
      {/* Lower Left Purple Gradient Card/Pill Shape (border-radius > 8px) */}
      <div 
        className="fixed -left-20 -bottom-20 w-52 h-52 rounded-[2.5rem] bg-gradient-to-tr from-[#9B51E0] to-[#543CDF] opacity-90 hidden md:block z-0 pointer-events-none"
        style={{ transform: 'rotate(15deg)' }}
      />

      {/* Lower Right Photo Card Wrapper (border-radius > 8px) */}
      <div 
        className="fixed -right-16 -bottom-16 w-60 h-60 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl overflow-hidden hidden md:block z-0 pointer-events-none"
        style={{ transform: 'rotate(-10deg)' }}
      >
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=300&h=300" 
          alt="Students studying together" 
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  )
}
