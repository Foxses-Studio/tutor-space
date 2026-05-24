'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiPhone, FiLock, FiShield, FiUserPlus, FiArrowLeft } from 'react-icons/fi'
import Swal from 'sweetalert2'

export default function StaffRegisterFormClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'staff' | 'instructor' | 'admin'>('staff')
  const [permissions, setPermissions] = useState<string[]>(['reviews', 'categories', 'faqs', 'blogs', 'media'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = (newRole: 'staff' | 'instructor' | 'admin') => {
    setRole(newRole)
    if (newRole === 'staff') {
      setPermissions(['reviews', 'categories', 'faqs', 'blogs', 'media'])
    } else if (newRole === 'instructor') {
      setPermissions(['courses', 'lessons'])
    } else if (newRole === 'admin') {
      setPermissions(['courses', 'lessons', 'reviews', 'categories', 'faqs', 'blogs', 'media'])
    }
  }

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
          permissions: role === 'admin' ? ['courses', 'lessons', 'reviews', 'categories', 'faqs', 'blogs', 'media'] : permissions,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Account Registered',
        text: `Successfully created a new ${role} account for ${name} and sent credentials email.`,
        background: '#121829',
        color: '#ffffff',
        confirmButtonColor: '#615fff',
        customClass: {
          popup: 'rounded-lg border border-zinc-800',
          confirmButton: 'rounded-lg text-base font-bold px-6 py-2.5 bg-[#615fff]',
        },
      })

      router.push('/admin/staff-register')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-[#121829] border border-zinc-800 rounded-lg p-6 md:p-8 shadow-xl space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#615fff]/15 flex items-center justify-center">
            <FiUserPlus className="text-[#615fff] h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-none">Add Faculty Member</h2>
            <p className="text-sm font-semibold text-zinc-450 mt-1">Register a new administrative or teacher account</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/staff-register')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-755 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-sm font-bold transition-all cursor-pointer"
        >
          <FiArrowLeft className="h-4.5 w-4.5" />
          Back to Registry
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-base font-sans">
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-base">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Row 1: Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3.5 text-base font-semibold outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Email Address *</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. jane@tutorspace.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3.5 text-base font-semibold outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Phone and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Phone Number (Optional)</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  type="tel"
                  placeholder="e.g. +88017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3.5 text-base font-semibold outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Default Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  type="text"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg pl-11 pr-4 py-3.5 text-base font-semibold outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Role Privilege Level */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-base font-bold text-zinc-300">Security Privilege Level *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Staff Option */}
              <label
                onClick={() => handleRoleChange('staff')}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                  role === 'staff'
                    ? 'bg-[#615fff]/5 border-[#615fff] text-white shadow-sm shadow-[#615fff]/5'
                    : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'staff'}
                  onChange={() => handleRoleChange('staff')}
                  className="hidden"
                />
                <FiShield className={`h-5 w-5 shrink-0 mt-0.5 ${role === 'staff' ? 'text-[#615fff]' : 'text-zinc-500'}`} />
                <div className="text-left">
                  <p className="font-bold text-base leading-none">Console Staff</p>
                  <p className="text-xs font-semibold text-zinc-500 mt-2 leading-relaxed">Manage FAQs, Blogs, Categories</p>
                </div>
              </label>

              {/* Instructor Option */}
              <label
                onClick={() => handleRoleChange('instructor')}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                  role === 'instructor'
                    ? 'bg-[#615fff]/5 border-[#615fff] text-white shadow-sm shadow-[#615fff]/5'
                    : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'instructor'}
                  onChange={() => handleRoleChange('instructor')}
                  className="hidden"
                />
                <FiShield className={`h-5 w-5 shrink-0 mt-0.5 ${role === 'instructor' ? 'text-[#615fff]' : 'text-zinc-500'}`} />
                <div className="text-left">
                  <p className="font-bold text-base leading-none">Instructor</p>
                  <p className="text-xs font-semibold text-zinc-500 mt-2 leading-relaxed">Manage Syllabus, Create Lessons</p>
                </div>
              </label>

              {/* Admin Option */}
              <label
                onClick={() => handleRoleChange('admin')}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                  role === 'admin'
                    ? 'bg-[#615fff]/5 border-[#615fff] text-white shadow-sm shadow-[#615fff]/5'
                    : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'admin'}
                  onChange={() => handleRoleChange('admin')}
                  className="hidden"
                />
                <FiShield className={`h-5 w-5 shrink-0 mt-0.5 ${role === 'admin' ? 'text-[#615fff]' : 'text-zinc-500'}`} />
                <div className="text-left">
                  <p className="font-bold text-base leading-none">Operations</p>
                  <p className="text-xs font-semibold text-zinc-500 mt-2 leading-relaxed">Full system access, Add other staff</p>
                </div>
              </label>
            </div>
          </div>

          {/* Row 4: Custom Page Permissions */}
          {role !== 'admin' && (
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/80">
              <div>
                <label className="text-base font-bold text-zinc-300">Custom Page Permissions</label>
                <p className="text-xs font-semibold text-zinc-500 mt-1">Configure exactly which pages this administrative account can read and write</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'courses', label: 'Courses Management' },
                  { key: 'lessons', label: 'Lessons Syllabus' },
                  { key: 'reviews', label: 'Reviews Moderate' },
                  { key: 'categories', label: 'Categories' },
                  { key: 'faqs', label: 'FAQs Landing' },
                  { key: 'blogs', label: 'Blog Posts' },
                  { key: 'media', label: 'Media Library' },
                ].map((perm) => {
                  const isChecked = permissions.includes(perm.key)
                  return (
                    <label
                      key={perm.key}
                      className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer select-none transition-all duration-200 ${
                        isChecked
                          ? 'bg-[#615fff]/5 border-[#615fff]/40 text-white'
                          : 'bg-[#070b16] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setPermissions(permissions.filter((p) => p !== perm.key))
                          } else {
                            setPermissions([...permissions, perm.key])
                          }
                        }}
                        className="h-4.5 w-4.5 rounded border-zinc-700 text-[#615fff] focus:ring-[#615fff]/30 accent-[#615fff] cursor-pointer"
                      />
                      <span className="text-sm font-bold">{perm.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            <FiUserPlus className="h-5 w-5" />
            {loading ? 'Registering Faculty...' : 'Register Faculty Account'}
          </button>
        </div>
      </form>
    </div>
  )
}
