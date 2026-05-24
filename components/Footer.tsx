import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-12 text-zinc-500 text-sm mt-auto">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>© {new Date().getFullYear()} Tutor Space. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
          <Link href="/admin" className="hover:text-[#615fff] transition-colors">Payload Admin</Link>
        </div>
      </div>
    </footer>
  )
}
