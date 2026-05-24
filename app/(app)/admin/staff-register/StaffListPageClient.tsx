'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiUserPlus, FiSearch, FiMail, FiPhone, FiTrash2, FiUser, FiCalendar, FiFilter } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface StaffMember {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'staff' | 'instructor'
  createdAt: string
  profilePic?: {
    url: string
  }
}

interface StaffListPageClientProps {
  initialStaff: StaffMember[]
}

export default function StaffListPageClient({ initialStaff }: StaffListPageClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'instructor'>('all')

  const handleDeleteStaff = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${name}'s faculty account? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      background: '#121829',
      color: '#ffffff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3f3f46',
      customClass: {
        popup: 'rounded-lg border border-zinc-800',
        confirmButton: 'rounded-lg text-base font-bold px-6 py-2.5 bg-rose-600',
        cancelButton: 'rounded-lg text-base font-bold px-6 py-2.5',
      },
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete staff member.')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${name}'s account has been successfully deleted.`,
        background: '#121829',
        color: '#ffffff',
        confirmButtonColor: '#615fff',
        timer: 1500,
        showConfirmButton: false,
      })

      router.refresh()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Could not delete staff member.',
        background: '#121829',
        color: '#ffffff',
        confirmButtonColor: '#615fff',
      })
    }
  }

  // Filter Logic
  const filteredStaff = initialStaff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase()) ||
      (member.phone && member.phone.includes(search))
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121829] border border-zinc-800 rounded-lg p-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-550 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070b16] border border-zinc-850 focus:border-[#615fff]/70 text-white rounded-lg pl-10 pr-4 py-2.5 text-base font-semibold outline-none transition-colors"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#070b16] border border-zinc-850 p-1.5 rounded-lg">
            <FiFilter className="text-zinc-500 h-4.5 w-4.5 ml-2" />
            <div className="flex gap-1">
              {(['all', 'admin', 'instructor', 'staff'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded text-sm font-bold capitalize select-none cursor-pointer transition-all ${
                    roleFilter === r
                      ? 'bg-[#615fff] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/admin/staff-register/new')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base rounded-lg transition-colors cursor-pointer select-none"
          >
            <FiUserPlus className="h-5 w-5" />
            Register Faculty
          </button>
        </div>
      </div>

      {/* Faculty and Staff Table */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <FiUser className="h-12 w-12 text-zinc-700 mx-auto" />
            <p className="text-base font-semibold text-zinc-450">No faculty or staff members match the query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base font-sans border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold bg-[#0e1322]/50 text-sm tracking-wider uppercase">
                  <th className="px-6 py-4">Faculty Member</th>
                  <th className="px-6 py-4">Privilege Role</th>
                  <th className="px-6 py-4">Contact Details</th>
                  <th className="px-6 py-4">Date Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-semibold text-zinc-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-[#070b16]/30 transition-colors">
                    {/* Member Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {member.profilePic?.url ? (
                          <img src={member.profilePic.url} alt={member.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-[#615fff]/15 flex items-center justify-center font-bold text-base text-[#615fff] uppercase shrink-0 select-none">
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-bold text-base">{member.name}</p>
                          <p className="text-zinc-550 text-sm font-semibold mt-0.5">ID: {member.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold capitalize select-none ${
                        member.role === 'admin'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          : member.role === 'instructor'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-850 text-zinc-350 border border-zinc-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>

                    {/* Contact Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-zinc-300 text-base">
                          <FiMail className="h-4 w-4 text-zinc-500 shrink-0" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                            <FiPhone className="h-3.5 w-3.5 text-zinc-650 shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      <div className="flex items-center gap-1.5 text-base">
                        <FiCalendar className="h-4.5 w-4.5 text-zinc-550" />
                        <span>
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteStaff(member.id, member.name)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-500/20 inline-flex items-center"
                        title="Delete Account"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
