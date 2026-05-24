'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiUserPlus } from 'react-icons/fi'
import Swal from 'sweetalert2'

export default function StaffRegisterFormClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'staff' | 'instructor' | 'admin'>('staff')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password || !role) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Account Registered',
        text: `Successfully created a new ${role} account for ${name}.`,
        background: '#1a1a1a',
        color: '#ffffff',
        confirmButtonColor: '#615fff',
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'rounded-lg text-base font-bold px-6 py-2.5 bg-[#615fff]',
        },
      })

      // Reset form on success
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setRole('staff')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-base font-sans">
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-base font-sans">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-zinc-300">Full Name *</label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550 h-5 w-5" />
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3 text-base font-semibold outline-none transition-colors"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-zinc-300">Email Address *</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550 h-5 w-5" />
            <input
              type="email"
              required
              placeholder="e.g. jane@tutorspace.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3 text-base font-semibold outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phone Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-zinc-300">Phone Number (Optional)</label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550 h-5 w-5" />
            <input
              type="tel"
              placeholder="e.g. +88017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3 text-base font-semibold outline-none transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-base font-bold text-zinc-300">Default Password *</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-550 h-5 w-5" />
            <input
              type="text"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3 text-base font-semibold outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Account Security Privilege Level */}
      <div className="flex flex-col gap-2">
        <label className="text-base font-bold text-zinc-300">Security Privilege Level *</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Staff Option */}
          <label
            onClick={() => setRole('staff')}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              role === 'staff'
                ? 'bg-[#615fff]/5 border-[#615fff] text-white'
                : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <input
              type="radio"
              name="role"
              checked={role === 'staff'}
              onChange={() => setRole('staff')}
              className="hidden"
            />
            <FiShield className={`h-5 w-5 ${role === 'staff' ? 'text-[#615fff]' : 'text-zinc-500'}`} />
            <div className="text-left">
              <p className="font-bold text-base leading-none">Console Staff</p>
              <p className="text-sm font-medium text-zinc-500 mt-1">Manage FAQs, Blogs, Categories</p>
            </div>
          </label>

          {/* Instructor Option */}
          <label
            onClick={() => setRole('instructor')}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              role === 'instructor'
                ? 'bg-[#615fff]/5 border-[#615fff] text-white'
                : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <input
              type="radio"
              name="role"
              checked={role === 'instructor'}
              onChange={() => setRole('instructor')}
              className="hidden"
            />
            <FiShield className={`h-5 w-5 ${role === 'instructor' ? 'text-[#615fff]' : 'text-zinc-500'}`} />
            <div className="text-left">
              <p className="font-bold text-base leading-none">Course Instructor</p>
              <p className="text-sm font-medium text-zinc-500 mt-1">Manage Syllabus, Create Lessons</p>
            </div>
          </label>

          {/* Admin Option */}
          <label
            onClick={() => setRole('admin')}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
              role === 'admin'
                ? 'bg-[#615fff]/5 border-[#615fff] text-white'
                : 'bg-[#121212] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <input
              type="radio"
              name="role"
              checked={role === 'admin'}
              onChange={() => setRole('admin')}
              className="hidden"
            />
            <FiShield className={`h-5 w-5 ${role === 'admin' ? 'text-[#615fff]' : 'text-zinc-500'}`} />
            <div className="text-left">
              <p className="font-bold text-base leading-none">Root Operations</p>
              <p className="text-sm font-medium text-zinc-500 mt-1">Full control, Add new staff & admins</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-colors duration-200 cursor-pointer disabled:opacity-50"
      >
        <FiUserPlus className="h-5 w-5" />
        {loading ? 'Registering Member...' : 'Register Faculty Account'}
      </button>
    </form>
  )
}
