'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import Swal from 'sweetalert2'

function ResetPasswordFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Reset Link',
        text: 'The password reset token is missing. Please request a new link.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    if (!password || !confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please enter both password fields.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Mismatch',
        text: 'Passwords do not match. Please enter identical passwords.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Password Updated!',
          text: 'Your password has been successfully reset. Redirecting to login...',
          timer: 2000,
          showConfirmButton: false,
        })
        
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        throw new Error(data.message || 'Failed to reset password. Link might be expired.')
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
          New Password
        </h2>
        <p className="text-zinc-500 font-medium text-base mt-2 text-center">
          Set your new password to regain access
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* New Password input - 16px min size & 8px+ border radius */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-base font-bold text-zinc-700">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
              <FiLock className="h-5 w-5" />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-medium text-zinc-800 placeholder-zinc-400 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password input - 16px min size & 8px+ border radius */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-base font-bold text-zinc-700">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
              <FiLock className="h-5 w-5" />
            </span>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 rounded-xl border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-medium text-zinc-800 placeholder-zinc-400 bg-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl bg-[#615fff] hover:bg-[#615fff]/95 text-white font-extrabold text-base shadow-lg shadow-[#615fff]/15 hover:shadow-[#615fff]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Update Password
              <FiArrowRight className="h-5 w-5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer info link */}
      <div className="mt-8 text-center text-base font-semibold text-zinc-500 border-t border-zinc-100 pt-6">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-[#615fff] hover:text-[#543cdf] font-extrabold transition-colors"
        >
          <FiArrowLeft className="h-4.5 w-4.5" />
          Cancel & Back
        </Link>
      </div>

    </motion.div>
  )
}

export default function ResetPasswordForm() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#615fff/5,_transparent_50%),_radial-gradient(circle_at_bottom_left,_#543cdf/5,_transparent_50%)] bg-[#fafafa] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-zinc-150 rounded-2xl shadow-xl p-8 flex items-center justify-center">
          <div className="h-8 w-8 border-3 border-[#615fff] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordFormContent />
      </Suspense>

    </div>
  )
}
