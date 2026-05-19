import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans selection:bg-[#615fff]/15 selection:text-[#615fff]">
      <div className="text-center px-6">
        {/* Logo Tag */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-zinc-100 bg-zinc-50/50 text-xs font-semibold text-zinc-500 mb-6 tracking-wide uppercase">
          <span className="h-2 w-2 rounded-full bg-[#615fff] animate-pulse" />
          Platform Ready
        </div>

        {/* Heading in Plus Jakarta Sans (Display Font) */}
        <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-[#121212] mb-4">
          Welcome to <span className="text-[#615fff] bg-gradient-to-r from-[#615fff] to-indigo-500 bg-clip-text text-transparent">Tutor Space</span>
        </h1>

        {/* Subtitle in Nunito (Sans Font) */}
        <p className="text-base md:text-lg text-zinc-500 font-medium max-w-lg mx-auto mb-8 leading-relaxed">
          Your clean canvas is ready. Start building a premium, modern e-learning experience using Next.js and Payload CMS.
        </p>

        {/* Action Button */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-[#615fff] hover:bg-[#615fff]/95 font-semibold text-white shadow-lg shadow-[#615fff]/15 hover:shadow-[#615fff]/25 transition-all text-sm duration-300"
          >
            Access CMS Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
