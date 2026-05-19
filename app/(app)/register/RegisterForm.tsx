'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiSliders } from 'react-icons/fi'
import Swal from 'sweetalert2'

export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: 'Please fill in all the required fields.',
        confirmButtonColor: '#615fff',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          text: 'Welcome to Tutor Space! Redirecting to login...',
          timer: 2000,
          showConfirmButton: false,
        })
        
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        throw new Error(data.message || 'Registration failed. Email might already exist.')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Sign Up Failed',
        text: err.message || 'Something went wrong.',
        confirmButtonColor: '#615fff',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#615fff/5,_transparent_50%),_radial-gradient(circle_at_bottom_right,_#543cdf/5,_transparent_50%)] bg-[#fafafa] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

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
            Create Account
          </h2>
          <p className="text-zinc-500 font-medium text-base mt-2 text-center">
            Start your learning adventure today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name input - 16px min size & 8px+ border radius */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-base font-bold text-zinc-700">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <FiUser className="h-5 w-5" />
              </span>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-medium text-zinc-800 placeholder-zinc-400 bg-white"
              />
            </div>
          </div>

          {/* Email input - 16px min size & 8px+ border radius */}
          <div className="space-y-1.5">
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

          {/* Password input - 16px min size & 8px+ border radius */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-base font-bold text-zinc-700">
              Password
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

          {/* Role selector - 16px min size & 8px+ border radius */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-base font-bold text-zinc-700">
              I want to join as a
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 pointer-events-none">
                <FiSliders className="h-5 w-5" />
              </span>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 focus:border-[#615fff] focus:ring-3 focus:ring-[#615fff]/10 outline-none text-base transition-all font-semibold text-zinc-700 bg-white cursor-pointer appearance-none"
              >
                <option value="student">Student / Learner</option>
                <option value="instructor">Instructor / Teacher</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
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
                Create Account
                <FiArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 text-center text-base font-semibold text-zinc-500 border-t border-zinc-100 pt-6">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-[#615fff] hover:text-[#543cdf] font-extrabold transition-colors"
          >
            Sign In
          </Link>
        </div>

      </motion.div>
    </div>
  )
}
