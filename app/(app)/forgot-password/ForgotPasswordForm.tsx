'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiMail, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import Swal from 'sweetalert2'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Email',
        text: 'Please enter your email address.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        Swal.fire({
          icon: 'success',
          title: 'Reset Email Sent',
          text: 'If that email exists in our system, we have sent password reset instructions.',
          confirmButtonColor: '#615fff',
        })
      } else {
        throw new Error(data.message || 'Failed to send reset link.')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: err.message || 'Something went wrong.',
        confirmButtonColor: '#615fff',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#615fff/5,_transparent_50%),_radial-gradient(circle_at_bottom_left,_#543cdf/5,_transparent_50%)] bg-[#fafafa] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-zinc-150 rounded-2xl shadow-xl shadow-zinc-200/50 p-8 sm:p-10 relative z-10"
      >
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <span className="h-10 w-10 rounded-xl bg-[#615fff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#615fff]/30 transition-transform group-hover:scale-105 duration-300 text-lg">
              T
            </span>
            <span className="text-2xl font-bold font-display tracking-tight text-zinc-900">
              Tutor Space
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight font-display text-center">
            Reset Password
          </h2>
          <p className="text-zinc-500 font-medium text-base mt-2 text-center">
            {submitted 
              ? "Check your inbox for password reset instructions" 
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email input - 16px min size & 8px+ border radius */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-base font-bold text-zinc-700">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                  <FiMail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-medium text-zinc-800 placeholder-zinc-400 bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#615fff] hover:bg-[#615fff]/95 text-white font-extrabold text-base shadow-lg shadow-[#615fff]/15 hover:shadow-[#615fff]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-emerald-800 text-base font-semibold">
              📩 A password recovery link has been dispatched to <strong>{email}</strong>. Please inspect your inbox and spam folders!
            </div>
            
            <button
              onClick={() => setSubmitted(false)}
              className="text-base font-bold text-[#615fff] hover:text-[#543cdf] transition-colors"
            >
              Didn&apos;t receive it? Try again
            </button>
          </div>
        )}

        {/* Footer info link */}
        <div className="mt-8 text-center text-base font-semibold text-zinc-500 border-t border-zinc-100 pt-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-[#615fff] hover:text-[#543cdf] font-extrabold transition-colors"
          >
            <FiArrowLeft className="h-4.5 w-4.5" />
            Back to Sign In
          </Link>
        </div>

      </motion.div>
    </div>
  )
}
