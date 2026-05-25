'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function ClientNavbarFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Define route prefixes that should be excluded from the global Navbar & Footer wrapper
  const excludePrefixes = [
    '/admin',
    '/admin-report',
    '/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ]

  const shouldExclude = excludePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (shouldExclude) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  )
}
