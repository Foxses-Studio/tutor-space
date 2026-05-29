'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBookOpen, FiClock, FiLayers, FiShield, FiGlobe, FiSettings, FiArrowRight } from 'react-icons/fi'
import CTASection from '@/components/CTASection'

export default function AboutClient() {
  const [activeTab, setActiveTab] = useState<'story' | 'mission' | 'vision'>('story')

  // Dynamic tab content for Section 3
  const tabContent = {
    story: {
      paragraphs: [
        'Tutor Space was founded with a simple idea — to make learning easier, more engaging, and results-driven.',
        'What started as a small group of passionate educators is now a growing platform helping thousands of learners around the world gain new skills and opportunities.',
      ]
    },
    mission: {
      paragraphs: [
        'Our mission is to democratize education and make high-quality learning accessible, interactive, and impactful for anyone, anywhere.',
        'We bridge the gap between classroom theory and real-world implementation, providing training designed for current industry needs.',
      ]
    },
    vision: {
      paragraphs: [
        'Our vision is to build the world\'s most supportive and engaging learning ecosystem, where anyone can acquire skills and transition their careers with absolute confidence.',
        'We envision a future where high-quality technical and creative skills are within reach of every aspiring mind.',
      ]
    }
  }

  // Framer Motion Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 35 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
  }

  const statCardVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    }
  }

  return (
    <div className="min-h-screen bg-white select-text">
      
      {/* ── SECTION 1 & 2: ABOUT HEADER & STATS HERO ── */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden bg-white">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[400px] bg-[#615fff]/5 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto space-y-16">
          
          {/* About Centered Header (Screenshot 1) - Staggered reveal */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto space-y-5"
          >
            {/* Centered Breadcrumbs */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-1.5 text-base font-semibold text-zinc-500 mb-2 select-none"
            >
              <Link href="/" className="hover:text-[#615fff] transition-colors">Home</Link>
              <span className="text-zinc-300 font-normal">/</span>
              <span className="text-[#0A163A]">About</span>
            </motion.div>

            {/* Centered Badge Pill */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#615fff]/8 border border-[#615fff]/15 rounded-full select-none shadow-sm shadow-[#615fff]/5"
            >
              <span className="w-2 h-2 rounded-full bg-[#615fff] animate-pulse" />
              <span className="text-sm font-bold text-[#615fff] uppercase tracking-wider">About</span>
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0A163A] tracking-tight leading-[1.2]"
            >
              About <span className="text-[#615fff]">Tutor Space</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg font-semibold text-[#4F5B7C] leading-relaxed max-w-2xl mx-auto"
            >
              Our platform helps learners gain real-world skills from expert instructors through engaging, hands-on lessons.
            </motion.p>
          </motion.div>

          {/* Stats Hero Block (Screenshot 2) */}
          <div className="space-y-12">
            {/* Hero Image - Soft slide and zoom */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[16/7] w-full bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200/50 shadow-md"
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Students collaborating"
                className="w-full h-full object-cover pointer-events-none"
              />
            </motion.div>

            {/* Stats Grid - Staggered entrance on scroll */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-6"
            >
              
              {/* Stat 1 */}
              <motion.div 
                variants={statCardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="p-5 bg-[#615fff]/4 rounded-lg border border-[#615fff]/15 flex flex-col gap-2 transition-all duration-300 hover:border-[#615fff]/35 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span className="text-[#615fff] text-4xl md:text-5xl font-bold">12K+</span>
                <span className="text-[#0A163A] text-lg font-bold">Courses</span>
                <p className="text-[#4F5B7C] text-base font-semibold leading-relaxed">
                  Covering design, business, tech, and more.
                </p>
              </motion.div>

              {/* Stat 2 */}
              <motion.div 
                variants={statCardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="p-5 bg-[#615fff]/4 rounded-lg border border-[#615fff]/15 flex flex-col gap-2 transition-all duration-300 hover:border-[#615fff]/35 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span className="text-[#615fff] text-4xl md:text-5xl font-bold">85K+</span>
                <span className="text-[#0A163A] text-lg font-bold">Learners</span>
                <p className="text-[#4F5B7C] text-base font-semibold leading-relaxed">
                  Growing global community of passionate students.
                </p>
              </motion.div>

              {/* Stat 3 */}
              <motion.div 
                variants={statCardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="p-5 bg-[#615fff]/4 rounded-lg border border-[#615fff]/15 flex flex-col gap-2 transition-all duration-300 hover:border-[#615fff]/35 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span className="text-[#615fff] text-4xl md:text-5xl font-bold">2K+</span>
                <span className="text-[#0A163A] text-lg font-bold">Instructors</span>
                <p className="text-[#4F5B7C] text-base font-semibold leading-relaxed">
                  Learn from top industry professionals.
                </p>
              </motion.div>

              {/* Stat 4 */}
              <motion.div 
                variants={statCardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
                className="p-5 bg-[#615fff]/4 rounded-lg border border-[#615fff]/15 flex flex-col gap-2 transition-all duration-300 hover:border-[#615fff]/35 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span className="text-[#615fff] text-4xl md:text-5xl font-bold">98%</span>
                <span className="text-[#0A163A] text-lg font-bold">Satisfaction</span>
                <p className="text-[#4F5B7C] text-base font-semibold leading-relaxed">
                  Learners love the results and experience.
                </p>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* ── SECTION 3: STORY, MISSION, VISION TABS (Screenshot 3) ── */}
      <section className="py-20 md:py-28 px-6 bg-[#F5F8FF] border-t border-zinc-100 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-0 w-[500px] h-[350px] bg-[#615fff]/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Heading, interactive tabs and paragraph text */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="lg:col-span-6 space-y-8"
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A163A] tracking-tight leading-[1.2]"
              >
                Empowering Learners to Build Skills for the Future
              </motion.h2>

              {/* Dynamic tabs bar */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3">
                
                {/* Tab: Story */}
                <button
                  onClick={() => setActiveTab('story')}
                  className={`px-5 py-2.5 rounded-lg font-bold text-base transition-all duration-300 cursor-pointer ${
                    activeTab === 'story'
                      ? 'bg-[#615fff] text-white shadow-md shadow-[#615fff]/15'
                      : 'bg-white text-[#4F5B7C] border border-zinc-200/80 hover:border-[#615fff]/30 hover:text-[#0A163A]'
                  }`}
                >
                  Our Story
                </button>

                {/* Tab: Mission */}
                <button
                  onClick={() => setActiveTab('mission')}
                  className={`px-5 py-2.5 rounded-lg font-bold text-base transition-all duration-300 cursor-pointer ${
                    activeTab === 'mission'
                      ? 'bg-[#615fff] text-white shadow-md shadow-[#615fff]/15'
                      : 'bg-white text-[#4F5B7C] border border-zinc-200/80 hover:border-[#615fff]/30 hover:text-[#0A163A]'
                  }`}
                >
                  Mission
                </button>

                {/* Tab: Vision */}
                <button
                  onClick={() => setActiveTab('vision')}
                  className={`px-5 py-2.5 rounded-lg font-bold text-base transition-all duration-300 cursor-pointer ${
                    activeTab === 'vision'
                      ? 'bg-[#615fff] text-white shadow-md shadow-[#615fff]/15'
                      : 'bg-white text-[#4F5B7C] border border-zinc-200/80 hover:border-[#615fff]/30 hover:text-[#0A163A]'
                  }`}
                >
                  Vision
                </button>

              </motion.div>

              {/* Dynamic text blocks with smooth transition animation */}
              <motion.div variants={fadeInUp} className="min-h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    {tabContent[activeTab].paragraphs.map((p, idx) => (
                      <p key={idx} className="text-base sm:text-lg font-semibold text-[#4F5B7C] leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

            </motion.div>

            {/* Right side: Photo Collage layout */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="lg:col-span-6"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* Top Left flatlay rectangular image */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.2 } }}
                  className="col-span-7 relative aspect-[4/3] bg-zinc-150 rounded-lg overflow-hidden shadow-sm border border-zinc-200/40 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80"
                    alt="Studying books"
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-103 transition-transform duration-500 ease-out"
                  />
                </motion.div>

                {/* Top Right typing rectangular image */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.2 } }}
                  className="col-span-5 relative aspect-[4/5] bg-zinc-150 rounded-lg overflow-hidden shadow-sm border border-zinc-200/40 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
                    alt="Hands on laptop"
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-103 transition-transform duration-500 ease-out"
                  />
                </motion.div>

                {/* Bottom Left desk rectangular image */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.2 } }}
                  className="col-span-5 relative aspect-[4/5] bg-zinc-150 rounded-lg overflow-hidden shadow-sm border border-zinc-200/40 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80"
                    alt="Studying desk"
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-103 transition-transform duration-500 ease-out"
                  />
                </motion.div>

                {/* Bottom Right tutor explanation rectangular image */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.2 } }}
                  className="col-span-7 relative aspect-[4/3] bg-zinc-150 rounded-lg overflow-hidden shadow-sm border border-zinc-200/40 cursor-pointer group"
                >
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
                    alt="Explaining tutor"
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-103 transition-transform duration-500 ease-out"
                  />
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHAT WE OFFER (Screenshot 4) ── */}
      <section className="py-20 md:py-28 px-6 bg-white border-t border-zinc-100 relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/4 right-0 w-[550px] h-[380px] bg-[#615fff]/4 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto relative z-10 space-y-16">
          
          {/* Header - Staggered reveal */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A163A] tracking-tight leading-[1.2]"
            >
              What We Offer
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg font-semibold text-[#4F5B7C] leading-relaxed max-w-2xl mx-auto"
            >
              Discover a platform built to make learning simple, interactive, and effective — with real-world projects, flexible schedules, and expert-led lessons designed to help you master new skills faster.
            </motion.p>
          </motion.div>

          {/* Offer Grid - 3x2 grid layout animated on scroll */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            
            {/* Card 1 */}
            <motion.div 
              variants={statCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } }}
              className="p-6 bg-gradient-to-br from-[#615fff]/4 to-[#615fff]/8 border border-[#615fff]/10 rounded-lg shadow-sm hover:shadow-md hover:border-[#615fff]/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#615fff] shadow-sm mb-5 transition-transform group-hover:scale-105 duration-300">
                <FiBookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A163A] mb-2.5">Expert-Led Courses</h3>
              <p className="text-base font-semibold text-[#4F5B7C] leading-relaxed">
                Learn from experienced instructors who bring real-world knowledge into every lesson.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              variants={statCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } }}
              className="p-6 bg-gradient-to-br from-[#615fff]/4 to-[#615fff]/8 border border-[#615fff]/10 rounded-lg shadow-sm hover:shadow-md hover:border-[#615fff]/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#615fff] shadow-sm mb-5 transition-transform group-hover:scale-105 duration-300">
                <FiClock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A163A] mb-2.5">Flexible Learning</h3>
              <p className="text-base font-semibold text-[#4F5B7C] leading-relaxed">
                Study anytime, anywhere — pause, resume, and learn at your own pace.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              variants={statCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } }}
              className="p-6 bg-gradient-to-br from-[#615fff]/4 to-[#615fff]/8 border border-[#615fff]/10 rounded-lg shadow-sm hover:shadow-md hover:border-[#615fff]/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#615fff] shadow-sm mb-5 transition-transform group-hover:scale-105 duration-300">
                <FiLayers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A163A] mb-2.5">Hands-On Projects</h3>
              <p className="text-base font-semibold text-[#4F5B7C] leading-relaxed">
                Apply what you learn through real-world projects, quizzes, and exercises.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              variants={statCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } }}
              className="p-6 bg-gradient-to-br from-[#615fff]/4 to-[#615fff]/8 border border-[#615fff]/10 rounded-lg shadow-sm hover:shadow-md hover:border-[#615fff]/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#615fff] shadow-sm mb-5 transition-transform group-hover:scale-105 duration-300">
                <FiShield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A163A] mb-2.5">Verified Certificates</h3>
              <p className="text-base font-semibold text-[#4F5B7C] leading-relaxed">
                Earn recognized certificates to showcase your new skills and boost your career.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div 
              variants={statCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } }}
              className="p-6 bg-gradient-to-br from-[#615fff]/4 to-[#615fff]/8 border border-[#615fff]/10 rounded-lg shadow-sm hover:shadow-md hover:border-[#615fff]/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#615fff] shadow-sm mb-5 transition-transform group-hover:scale-105 duration-300">
                <FiGlobe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A163A] mb-2.5">Global Learning Community</h3>
              <p className="text-base font-semibold text-[#4F5B7C] leading-relaxed">
                Connect, collaborate, and grow with learners and mentors from around the world.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div 
              variants={statCardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' as const } }}
              className="p-6 bg-gradient-to-br from-[#615fff]/4 to-[#615fff]/8 border border-[#615fff]/10 rounded-lg shadow-sm hover:shadow-md hover:border-[#615fff]/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#615fff] shadow-sm mb-5 transition-transform group-hover:scale-105 duration-300">
                <FiSettings className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0A163A] mb-2.5">Personalized Progress Tracking</h3>
              <p className="text-base font-semibold text-[#4F5B7C] leading-relaxed">
                Monitor your learning journey, track progress, and celebrate milestones in your profile.
              </p>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* ── SECTION 5: CTA SECTION (Replicated Homepage Last Section) ── */}
      <CTASection />

    </div>
  )
}
