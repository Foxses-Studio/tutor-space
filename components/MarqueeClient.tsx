'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MarqueeClientProps {
  items: string[]
}

export default function MarqueeClient({ items }: MarqueeClientProps) {
  const [startScroll, setStartScroll] = useState(false)

  useEffect(() => {
    // Trigger infinite scrolling exactly after the sweep animation finishes (1.2s)
    const timer = setTimeout(() => {
      setStartScroll(true)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div 
      initial={{ clipPath: 'inset(0 0 0 100%)', rotate: 0 }}
      animate={{ clipPath: 'inset(0 0 0 0%)', rotate: -5 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-[#615fff] py-6 overflow-hidden relative select-none z-10 origin-center my-8 border-y border-white/10 shadow-lg shadow-[#615fff]/20 transform-gpu backface-hidden will-change-transform"
      style={{
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransformStyle: 'preserve-3d',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Sequenced Text Container */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className={`flex gap-20 ${startScroll ? 'animate-marquee-track' : ''}`}
        style={{
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
      >
        
        {/* Marquee Group 1 */}
        <div 
          className="flex gap-20 items-center shrink-0 text-base font-bold uppercase tracking-widest text-white subpixel-antialiased"
          style={{
            WebkitFontSmoothing: 'subpixel-antialiased',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          {items.map((item, index) => (
            <React.Fragment key={`g1-${index}`}>
              <span>{item}</span>
              <img src="/svg/sparkle.png" alt="sparkle" className="h-6 w-6 object-contain shrink-0 filter brightness-0 invert" />
            </React.Fragment>
          ))}
        </div>

        {/* Marquee Group 2 (Duplicate for infinite seamless loop) */}
        <div 
          className="flex gap-20 items-center shrink-0 text-base font-bold uppercase tracking-widest text-white subpixel-antialiased" 
          aria-hidden="true"
          style={{
            WebkitFontSmoothing: 'subpixel-antialiased',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          }}
        >
          {items.map((item, index) => (
            <React.Fragment key={`g2-${index}`}>
              <span>{item}</span>
              <img src="/svg/sparkle.png" alt="sparkle" className="h-6 w-6 object-contain shrink-0 filter brightness-0 invert" />
            </React.Fragment>
          ))}
        </div>

      </motion.div>
    </motion.div>
  )
}
