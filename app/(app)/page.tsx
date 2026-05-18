import Link from 'next/link'
import React from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-brand selection:text-white">
      {/* Navbar */}
      <header className="border-b border-zinc-900 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white shadow-lg shadow-brand/30">T</span>
            <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Tutor Space</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#instructors" className="hover:text-white transition-colors">Instructors</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="text-xs font-semibold text-brand hover:text-white border border-brand/30 hover:border-brand/60 bg-brand/10 px-3.5 py-1.5 rounded-full transition-all"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 bg-brand/5 text-xs font-medium text-brand mb-6 animate-pulse">
            ✨ Powered by Next.js & Payload CMS 3.x
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            Build Skills with{' '}
            <span className="bg-gradient-to-r from-brand via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Expert Mentors
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Unlock premium courses, interact with real instructors, and accelerate your tech or design career using our state-of-the-art e-learning space.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#courses" 
              className="w-full sm:w-auto h-12 inline-flex items-center justify-center px-8 rounded-xl bg-brand hover:bg-brand/90 font-semibold text-white shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-all"
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

      {/* Stats Section */}
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

      {/* Feature Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight mb-4">Why Tutor Space?</h2>
          <p className="text-zinc-400">A learning experience crafted to give you the highest industry outcomes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-brand/20 hover:bg-zinc-900/20 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-3">Elite Instructors</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Learn from verified developers and designers working in world-class companies.</p>
          </div>
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-brand/20 hover:bg-zinc-900/20 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-3">Lexical Content</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Interact with dynamic courses, rich codes, block structures, and quizzes.</p>
          </div>
          <div className="p-8 rounded-2xl border border-zinc-900 bg-zinc-950/30 hover:border-brand/20 hover:bg-zinc-900/20 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-3">Local REST API</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Direct server-side data fetching bypasses HTTP latency for rapid loading times.</p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="courses" className="py-24 border-t border-zinc-900 bg-zinc-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight mb-4">Our Featured Tracks</h2>
              <p className="text-zinc-400">Step-by-step masterclasses designed to bring you to industry proficiency.</p>
            </div>
            <Link 
              href="/admin" 
              className="text-sm font-semibold text-brand hover:text-white flex items-center gap-2 group self-start"
            >
              Add your own course in CMS <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden flex flex-col group hover:border-zinc-800 transition-all">
              <div className="h-48 bg-gradient-to-br from-brand/20 to-brand/5 relative flex items-center justify-center p-6 text-center">
                <span className="text-4xl">🚀</span>
                <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950/80 text-brand border border-brand/20">
                  DEVELOPMENT
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-brand transition-colors">Next.js 16 & React 19 Bootcamp</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-1 leading-relaxed">
                  Master dynamic routing, server components, compiler upgrades, and advanced animations from scratch.
                </p>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-auto">
                  <span className="text-xl font-bold text-white">$99.00</span>
                  <Link href="/admin" className="text-xs font-semibold text-brand hover:text-white transition-colors">
                    Enroll via CMS
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden flex flex-col group hover:border-zinc-800 transition-all">
              <div className="h-48 bg-gradient-to-br from-brand/20 to-brand/5 relative flex items-center justify-center p-6 text-center">
                <span className="text-4xl">✨</span>
                <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950/80 text-brand border border-brand/20">
                  DESIGN
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-brand transition-colors">UX/UI Design Blueprint</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-1 leading-relaxed">
                  Learn grid layout frameworks, custom color-palette configurations, high-fidelity responsive layout design, and design systems.
                </p>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-auto">
                  <span className="text-xl font-bold text-white">$79.00</span>
                  <Link href="/admin" className="text-xs font-semibold text-brand hover:text-white transition-colors">
                    Enroll via CMS
                  </Link>
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/50 overflow-hidden flex flex-col group hover:border-zinc-800 transition-all">
              <div className="h-48 bg-gradient-to-br from-brand/20 to-brand/5 relative flex items-center justify-center p-6 text-center">
                <span className="text-4xl">🛠️</span>
                <div className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded bg-zinc-950/80 text-brand border border-brand/20">
                  DATABASE
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-brand transition-colors">Payload CMS Architecture</h3>
                <p className="text-zinc-400 text-sm mb-6 flex-1 leading-relaxed">
                  Deep-dive into SQLite configurations, custom collection blueprints, localized routing adapters, and relationship hooks.
                </p>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-auto">
                  <span className="text-xl font-bold text-white">$120.00</span>
                  <Link href="/admin" className="text-xs font-semibold text-brand hover:text-white transition-colors">
                    Enroll via CMS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 text-zinc-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>© {new Date().getFullYear()} Tutor Space. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
            <Link href="/admin" className="hover:text-brand transition-colors">Payload Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
