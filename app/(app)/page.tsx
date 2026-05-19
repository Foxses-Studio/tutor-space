import React from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0A163A] font-sans relative overflow-hidden flex flex-col">
      
      {/* Scroll-Adaptive Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Infinite Marquee Scrolling Area */}
      <Marquee />

    </div>
  )
}
