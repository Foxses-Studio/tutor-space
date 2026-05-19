'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import Swal from 'sweetalert2'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please enter both your email and password.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: 'You have signed in successfully.',
          timer: 1500,
          showConfirmButton: false,
        })
        
        // Redirect to dashboard or home
        setTimeout(() => {
          router.push('/admin')
          router.refresh()
        }, 1500)
      } else {
        throw new Error(data.message || 'Invalid credentials. Please try again.')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Sign In Failed',
        text: err.message || 'Something went wrong.',
        confirmButtonColor: '#615fff',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 relative overflow-hidden">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white border border-zinc-150 rounded-lg shadow-md p-8 sm:p-10 relative z-10"
      >
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <span className="h-10 w-10 rounded-lg bg-[#615fff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#615fff]/30 transition-transform group-hover:scale-105 duration-300 text-lg">
              T
            </span>
            <span className="text-2xl font-bold font-display tracking-tight text-zinc-900">
              Tutor Space
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight font-display text-center">
            Welcome Back!
          </h2>
          <p className="text-zinc-500 font-semibold text-base mt-2 text-center">
            Sign in to your student learning workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email input */}
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
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-medium text-zinc-800 placeholder-zinc-400 bg-white"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-base font-bold text-zinc-700">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-base font-bold text-[#615fff] hover:text-[#543cdf] transition-colors"
              >
                Forgot?
              </Link>
            </div>
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
                className="w-full pl-11 pr-11 py-3 rounded-lg border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-medium text-zinc-800 placeholder-zinc-400 bg-white"
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

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#615fff] hover:bg-[#615fff]/95 text-white font-bold text-base shadow-lg shadow-[#615fff]/15 hover:shadow-[#615fff]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <FiArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 text-center text-base font-semibold text-zinc-500 border-t border-zinc-100 pt-6">
          Don&apos;t have an account?{' '}
          <Link 
            href="/register" 
            className="text-[#615fff] hover:text-[#543cdf] font-bold transition-colors"
          >
            Sign Up
          </Link>
        </div>

      </motion.div>
    </div>
  )
}
