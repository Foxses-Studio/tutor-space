import React from 'react'

export default function Stats() {
  return (
    <section className="border-y border-zinc-900 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Premium Tracks</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">5K+</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Active Learners</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Course Rating</div>
        </div>
        <div>
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Job Success</div>
        </div>
      </div>
    </section>
  )
}
