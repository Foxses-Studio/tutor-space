import React from 'react'

export default function Marquee() {
  return (
    <div className="w-full bg-[#fafafa] border-y border-zinc-100 py-6 overflow-hidden relative select-none z-10">
      <div className="animate-marquee-track flex gap-20">
        
        {/* Marquee Group 1 */}
        <div className="flex gap-20 items-center shrink-0 text-base font-extrabold uppercase tracking-widest text-[#4F5B7C]/40">
          <span>Interactive Lessons</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Expert Instructors</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Flexible Learning</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Lifetime Access</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Verified Certificates</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
        </div>

        {/* Marquee Group 2 (Duplicate for infinite seamless loop) */}
        <div className="flex gap-20 items-center shrink-0 text-base font-extrabold uppercase tracking-widest text-[#4F5B7C]/40" aria-hidden="true">
          <span>Interactive Lessons</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Expert Instructors</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Flexible Learning</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Lifetime Access</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
          <span>Verified Certificates</span>
          <span className="h-2 w-2 rounded-full bg-[#615fff]/40" />
        </div>

      </div>
    </div>
  )
}
