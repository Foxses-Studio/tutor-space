import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth/auth'
import { FiUserPlus } from 'react-icons/fi'
import StaffRegisterFormClient from './StaffRegisterFormClient'

export const metadata = {
  title: 'Staff Registry - Tutor Space Admin',
  description: 'Register and manage administrative, teaching, and support accounts.',
}

export default async function StaffRegisterPage() {
  const cookieStore = await cookies()
  const payloadToken = cookieStore.get('payload-token')?.value

  if (!payloadToken) {
    redirect('/admin/login')
  }

  const decoded = verifyToken(payloadToken)
  if (!decoded || !decoded.id || decoded.role !== 'admin') {
    // Only Root Admin is allowed to register new staff accounts
    redirect('/admin')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FiUserPlus className="text-[#615fff] h-6 w-6" />
            Staff & Faculty Registry
          </h1>
          <p className="text-base font-semibold text-zinc-400 mt-1">
            Create new administrator, staff, or instructor profiles with defined security privileges.
          </p>
        </div>
      </div>

      {/* Render the Client-Side Staff Form */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-6 shadow-sm">
        <StaffRegisterFormClient />
      </div>
    </div>
  )
}
