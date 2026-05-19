import React from 'react'
import Link from 'next/link'

export default function Courses() {
  return (
    <section id="courses" className="py-24 border-t border-zinc-900 bg-zinc-950/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight mb-4">Our Featured Tracks</h2>
            <p className="text-zinc-400">Step-by-step masterclasses designed to bring you to industry proficiency.</p>
          </div>
          <Link 
            href="/admin" 
            className="text-sm font-semibold text-[#615fff] hover:text-white flex items-center gap-2 group self-start"
          >
            Add your own course in CMS <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Course Card 1 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden flex flex-col group hover:border-zinc-800 transition-all">
            <div className="h-48 bg-gradient-to-br from-[#615fff]/20 to-[#615fff]/5 relative flex items-center justify-center p-6 text-center">
              <span className="text-4xl">🚀</span>
              <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950/80 text-[#615fff] border border-[#615fff]/20">
                DEVELOPMENT
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-[#615fff] transition-colors">Next.js 16 & React 19 Bootcamp</h3>
              <p className="text-zinc-400 text-sm mb-6 flex-1 leading-relaxed">
                Master dynamic routing, server components, compiler upgrades, and advanced animations from scratch.
              </p>
              <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-auto">
                <span className="text-xl font-bold text-white">$99.00</span>
                <Link href="/admin" className="text-xs font-semibold text-[#615fff] hover:text-white transition-colors">
                  Enroll via CMS
                </Link>
              </div>
            </div>
          </div>

          {/* Course Card 2 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden flex flex-col group hover:border-zinc-800 transition-all">
            <div className="h-48 bg-gradient-to-br from-[#615fff]/20 to-[#615fff]/5 relative flex items-center justify-center p-6 text-center">
              <span className="text-4xl">✨</span>
              <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950/80 text-[#615fff] border border-[#615fff]/20">
                DESIGN
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-[#615fff] transition-colors">UX/UI Design Blueprint</h3>
              <p className="text-zinc-400 text-sm mb-6 flex-1 leading-relaxed">
                Learn grid layout frameworks, custom color-palette configurations, high-fidelity responsive layout design, and design systems.
              </p>
              <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-auto">
                <span className="text-xl font-bold text-white">$79.00</span>
                <Link href="/admin" className="text-xs font-semibold text-[#615fff] hover:text-white transition-colors">
                  Enroll via CMS
                </Link>
              </div>
            </div>
          </div>

          {/* Course Card 3 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden flex flex-col group hover:border-zinc-800 transition-all">
            <div className="h-48 bg-gradient-to-br from-[#615fff]/20 to-[#615fff]/5 relative flex items-center justify-center p-6 text-center">
              <span className="text-4xl">🛠️</span>
              <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950/80 text-[#615fff] border border-[#615fff]/20">
                DATABASE
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-[#615fff] transition-colors">Payload CMS Architecture</h3>
              <p className="text-zinc-400 text-sm mb-6 flex-1 leading-relaxed">
                Deep-dive into SQLite configurations, custom collection blueprints, localized routing adapters, and relationship hooks.
              </p>
              <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-auto">
                <span className="text-xl font-bold text-white">$120.00</span>
                <Link href="/admin" className="text-xs font-semibold text-[#615fff] hover:text-white transition-colors">
                  Enroll via CMS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
