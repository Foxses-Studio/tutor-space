import React from 'react'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-[180vh] bg-background text-foreground font-sans selection:bg-[#615fff]/10 selection:text-[#615fff] relative">
      {/* Scroll-Adaptive Navbar */}
      <Navbar />

      {/* Minimal Top Hero/Scroll Guide */}
      <div className="pt-48 flex flex-col items-center justify-start max-w-xl mx-auto text-center px-6">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#615fff] bg-[#615fff]/5 border border-[#615fff]/10 px-3.5 py-1.5 rounded-full mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[#615fff] animate-ping" />
          Test Scroll Behavior
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-zinc-900 mb-4">
          Tutor Space
        </h1>
        <p className="text-zinc-500 font-medium leading-relaxed mb-10 text-sm md:text-base">
          This page is now completely clean. Scroll down to watch the transparent navbar smoothly transition into a sticky glassmorphic light header.
        </p>
        
        {/* Animated Scroll indicator */}
        <div className="flex flex-col items-center gap-1.5 text-zinc-400">
          <span className="text-xs font-semibold tracking-wider uppercase">Scroll Down</span>
          <span className="h-6 w-4 rounded-full border border-zinc-300 flex items-start justify-center p-1">
            <span className="h-1.5 w-1 rounded-full bg-[#615fff] animate-bounce" />
          </span>
        </div>
      </div>

      {/* Subtle Visual Guides to mark scroll progress */}
      <div className="absolute top-[80vh] left-0 right-0 flex flex-col items-center gap-24 pointer-events-none text-zinc-200">
        <div className="text-xs font-bold tracking-widest uppercase flex flex-col items-center gap-2">
          <span>Scroll Marker</span>
          <span className="h-8 w-px bg-zinc-100" />
        </div>
        <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-400">
          50%
        </div>
      </div>
    </div>
  )
}
