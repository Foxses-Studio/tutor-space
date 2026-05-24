'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

// ─── All 8 unique avatar images ──────────────────────────────────────────────
const AVATAR_SRCS = {
  womanGlasses:  '/icon_image/avatar_woman_glasses.png',
  womanShort:    '/icon_image/avatar_woman_short.png',
  womanLong:     '/icon_image/avatar_woman_long.png',
  manGlasses:    '/icon_image/684d1df60b1a5aba9f4199d9_ea16628fd4ccb1ab45009f0a48f3db69_thumb-13.png',
  manBeard:      '/icon_image/684d1df6da33c11ee4a2b59a_e5e3917d2fc34a0bdcc9f038e4d657fa_thumb-16.png',
  manCasual:     '/icon_image/684d1df6e99d2a34dfccb9f0_87e9f7051517390657f24064fc880a72_thumb-17.png',
  manCurly:      '/icon_image/684d1df69a8e94fe80911163_81fa293d11236c768c8b2c4f6761e9ae_thumb-19.png',
  manClean:      '/icon_image/684d1df6c72366469967e14f_2e85dd11cda79373879f5160a150e551_thumb-12.png',
}

// ─── Left side avatars: scattered across 300×300 relative container ───────────
// Positions mimic the reference: top-left pair, mid-left, bottom-left pair
const LEFT_AVATARS = [
  // top-left: small, pushed to edge
  { src: AVATAR_SRCS.womanShort,   size: 76,  top: 8,   left: 0,   floatY: -8,  dur: 4.1, delay: 0.00 },
  // top-left inner: slightly right, slightly lower
  { src: AVATAR_SRCS.manClean,     size: 60,  top: 20,  left: 100, floatY: -6,  dur: 3.7, delay: 0.12 },
  // middle: larger, anchored left-center
  { src: AVATAR_SRCS.manCasual,    size: 88,  top: 106, left: 56,  floatY: -12, dur: 5.0, delay: 0.22 },
  // bottom-left: pushed to edge
  { src: AVATAR_SRCS.manGlasses,   size: 68,  top: 220, left: 4,   floatY: -7,  dur: 4.6, delay: 0.30 },
  // bottom inner: slightly right
  { src: AVATAR_SRCS.womanGlasses, size: 72,  top: 212, left: 108, floatY: -9,  dur: 3.8, delay: 0.40 },
]

// ─── Right side avatars: mirror scatter ──────────────────────────────────────
const RIGHT_AVATARS = [
  // top-right inner
  { src: AVATAR_SRCS.womanLong,  size: 60,  top: 20,  right: 100, floatY: -7,  dur: 3.9, delay: 0.05 },
  // top-right edge
  { src: AVATAR_SRCS.manBeard,   size: 76,  top: 8,   right: 0,   floatY: -10, dur: 4.3, delay: 0.15 },
  // middle-right: larger
  { src: AVATAR_SRCS.manCurly,   size: 88,  top: 106, right: 56,  floatY: -13, dur: 5.1, delay: 0.25 },
  // bottom-right inner
  { src: AVATAR_SRCS.womanShort, size: 72,  top: 212, right: 108, floatY: -8,  dur: 4.0, delay: 0.33 },
  // bottom-right edge
  { src: AVATAR_SRCS.manGlasses, size: 68,  top: 220, right: 4,   floatY: -11, dur: 3.6, delay: 0.42 },
]

// ─── Floating avatar helper ───────────────────────────────────────────────────
type AvatarProps = {
  src: string
  size: number
  top: number
  left?: number
  right?: number
  floatY: number
  dur: number
  delay: number
  entranceX: number
}

function FloatAvatar({ src, size, top, left, right, floatY, dur, delay, entranceX }: AvatarProps) {
  return (
    <motion.div
      className="absolute"
      style={{ top, left, right, width: size, height: size }}
      initial={{ opacity: 0, x: entranceX, scale: 0.85 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={src}
        alt="Learner"
        animate={{ y: [0, floatY, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.4 }}
        className="w-full h-full object-cover object-top shadow-md pointer-events-none select-none"
        style={{
          width: size,
          height: size,
          borderRadius: 8,
        }}
      />
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function CTASection() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 bg-zinc-100 border-t border-zinc-200/60 select-none">
      <div className="container mx-auto">

        {/* White card */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-100 overflow-visible">
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: '1fr auto 1fr',
              minHeight: 340,
            }}
          >

            {/* ── Left avatars panel ─────────────────────────────────────── */}
            <div className="hidden lg:block relative" style={{ height: 320 }}>
              {LEFT_AVATARS.map((av, i) => (
                <FloatAvatar key={i} {...av} entranceX={-40} />
              ))}
            </div>

            {/* ── Center CTA content ─────────────────────────────────────── */}
            <div className="flex flex-col items-center text-center gap-5 px-8 py-14 lg:py-10" style={{ maxWidth: 400 }}>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight leading-[1.2]"
              >
                Start your learning
                <br />
                journey today!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-base text-zinc-500 leading-relaxed"
                style={{ maxWidth: 300 }}
              >
                Become part of a global community of learners who are enhancing
                their skills and advancing their careers through our expertly.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-700 text-white font-bold text-base rounded-lg transition-all duration-300 group cursor-pointer"
                >
                  <span>Explore All Courses</span>
                  <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

            </div>

            {/* ── Right avatars panel ────────────────────────────────────── */}
            <div className="hidden lg:block relative" style={{ height: 320 }}>
              {RIGHT_AVATARS.map((av, i) => (
                <FloatAvatar key={i} {...av} entranceX={40} />
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
