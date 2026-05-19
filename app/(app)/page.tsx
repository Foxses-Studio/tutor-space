import React from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Stats from '@/components/Stats'
import Features from '@/components/Features'
import Courses from '@/components/Courses'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-[#615fff] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Courses />
      </main>
      <Footer />
    </div>
  )
}
