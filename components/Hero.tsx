import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#615fff]/10 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#615fff]/20 bg-[#615fff]/5 text-xs font-medium text-[#615fff] mb-6 animate-pulse">
          ✨ Powered by Next.js & Payload CMS 3.x
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
          Build Skills with{' '}
          <span className="bg-gradient-to-r from-[#615fff] via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            Expert Mentors
          </span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Unlock premium courses, interact with real instructors, and accelerate your tech or design career using our state-of-the-art e-learning space.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#courses" 
            className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-8 rounded-xl bg-[#615fff] hover:bg-[#615fff]/90 font-semibold text-white shadow-lg shadow-[#615fff]/20 hover:shadow-[#615fff]/30 transition-all"
          >
            Browse Courses
          </a>
          <Link 
            href="/admin" 
            className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-semibold text-zinc-300 hover:text-white transition-all"
          >
            Manage Platform
          </Link>
        </div>
      </div>
    </section>
  )
}
