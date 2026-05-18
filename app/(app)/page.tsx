import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">T</span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Tutor Space</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#instructors" className="hover:text-white transition-colors">Instructors</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 bg-indigo-950/30 px-3.5 py-1.5 rounded-full transition-all"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs font-medium text-indigo-400 mb-6 animate-pulse">
            ✨ Powered by Next.js & Payload CMS 3.x
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            Build Skills with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Expert Mentors
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Unlock premium courses, interact with real instructors, and accelerate your tech or design career using our state-of-the-art e-learning space.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#courses" 
              className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
            >
              Browse Courses
            </a>
            <Link 
              href="/admin" 
              className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 hover:text-white transition-all"
            >
              Manage Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">15+</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">Premium Tracks</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">5K+</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">Active Learners</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">Course Rating</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">100%</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">Job Success</div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Why Tutor Space?</h2>
          <p className="text-slate-400">A learning experience crafted to give you the highest industry outcomes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/30 hover:border-indigo-500/20 hover:bg-slate-900/20 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Elite Instructors</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Learn from verified developers and designers working in world-class companies.</p>
          </div>
          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/30 hover:border-indigo-500/20 hover:bg-slate-900/20 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Lexical Content</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Interact with dynamic courses, rich codes, block structures, and quizzes.</p>
          </div>
          <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/30 hover:border-indigo-500/20 hover:bg-slate-900/20 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              🚀
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Local REST API</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Direct server-side data fetching bypasses HTTP latency for rapid loading times.</p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="py-24 border-t border-slate-900 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Our Featured Tracks</h2>
              <p className="text-slate-400">Step-by-step masterclasses designed to bring you to industry proficiency.</p>
            </div>
            <Link 
              href="/admin" 
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 group self-start"
            >
              Add your own course in CMS <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/50 overflow-hidden flex flex-col group hover:border-slate-800 transition-all">
              <div className="h-48 bg-gradient-to-br from-indigo-900 to-purple-950 relative flex items-center justify-center p-6 text-center">
                <span className="text-4xl">🚀</span>
                <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-slate-900/80 text-indigo-300 border border-indigo-500/20">
                  DEVELOPMENT
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">Next.js 16 & React 19 Bootcamp</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">
                  Master dynamic routing, server components, compiler upgrades, and advanced animations from scratch.
                </p>
                <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-auto">
                  <span className="text-xl font-bold text-white">$99.00</span>
                  <Link href="/admin" className="text-xs font-semibold text-indigo-400 hover:text-white transition-colors">
                    Enroll via CMS
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/50 overflow-hidden flex flex-col group hover:border-slate-800 transition-all">
              <div className="h-48 bg-gradient-to-br from-purple-900 to-pink-950 relative flex items-center justify-center p-6 text-center">
                <span className="text-4xl">✨</span>
                <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-slate-900/80 text-pink-300 border border-pink-500/20">
                  DESIGN
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">UX/UI Design Blueprint</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">
                  Learn grid layout frameworks, custom color-palette configurations, high-fidelity responsive layout design, and design systems.
                </p>
                <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-auto">
                  <span className="text-xl font-bold text-white">$79.00</span>
                  <Link href="/admin" className="text-xs font-semibold text-pink-400 hover:text-white transition-colors">
                    Enroll via CMS
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/50 overflow-hidden flex flex-col group hover:border-slate-800 transition-all">
              <div className="h-48 bg-gradient-to-br from-blue-900 to-cyan-950 relative flex items-center justify-center p-6 text-center">
                <span className="text-4xl">🛠️</span>
                <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-slate-900/80 text-blue-300 border border-blue-500/20">
                  DATABASE
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Payload CMS Architecture</h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">
                  Deep-dive into SQLite configurations, custom collection blueprints, localized routing adapters, and relationship hooks.
                </p>
                <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-auto">
                  <span className="text-xl font-bold text-white">$120.00</span>
                  <Link href="/admin" className="text-xs font-semibold text-blue-400 hover:text-white transition-colors">
                    Enroll via CMS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>© {new Date().getFullYear()} Tutor Space. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <Link href="/admin" className="hover:text-indigo-400 transition-colors">Payload Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
