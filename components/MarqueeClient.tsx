'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface MarqueeClientProps {
  items: string[]
}

export default function MarqueeClient({ items }: MarqueeClientProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, rotate: 0 }}
      animate={{ opacity: 1, scale: 1.02, rotate: -5 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full bg-[#615fff]/95 backdrop-blur-md py-6 overflow-hidden relative select-none z-10 origin-center my-8 border-y border-white/10 shadow-lg shadow-[#615fff]/20 transform-gpu backface-hidden will-change-transform"
      style={{
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransformStyle: 'preserve-3d',
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="animate-marquee-track flex gap-20">
        
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

      </div>
    </motion.div>
  )
}
