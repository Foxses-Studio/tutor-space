import React from 'react'

export default function Features() {
  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight mb-4">Why Tutor Space?</h2>
        <p className="text-zinc-400">A learning experience crafted to give you the highest industry outcomes.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-[#615fff]/20 hover:bg-zinc-900/20 transition-all group">
          <div className="h-12 w-12 rounded-xl bg-[#615fff]/10 text-[#615fff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            🎓
          </div>
          <h3 className="text-xl font-bold font-display text-white mb-3">Elite Instructors</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Learn from verified developers and designers working in world-class companies.</p>
        </div>
        <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-[#615fff]/20 hover:bg-zinc-900/20 transition-all group">
          <div className="h-12 w-12 rounded-xl bg-[#615fff]/10 text-[#615fff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            🎓
          </div>
          <h3 className="text-xl font-bold font-display text-white mb-3">Lexical Content</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Interact with dynamic courses, rich codes, block structures, and quizzes.</p>
        </div>
        <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-[#615fff]/20 hover:bg-zinc-900/20 transition-all group">
          <div className="h-12 w-12 rounded-xl bg-[#615fff]/10 text-[#615fff] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            🎓
          </div>
          <h3 className="text-xl font-bold font-display text-white mb-3">Local REST API</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">Direct server-side data fetching bypasses HTTP latency for rapid loading times.</p>
        </div>
      </div>
    </section>
  )
}
