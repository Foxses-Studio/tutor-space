import React from 'react'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <div className="min-h-[180vh] bg-background text-foreground font-sans relative">
      {/* Scroll-Adaptive Navbar */}
      <Navbar />
    </div>
  )
}
