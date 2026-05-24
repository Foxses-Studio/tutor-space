'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FiSearch,
  FiEdit,
  FiList,
  FiTrash2,
  FiZap,
  FiBookOpen,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CourseItem {
  id: string
  title: string
  slug: string
  price: number
  status: 'draft' | 'published'
  level: string
  duration: string
  categoryName: string
  instructorName: string
  thumbnail: string | null
  createdAt: string | null
}

interface Props {
  initialCourses: CourseItem[]
  userRole: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function CoursesGridClient({ initialCourses, userRole }: Props) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Filter courses based on search term and status
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.categoryName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Quick toggle course draft/published status
  const handleToggleStatus = async (id: string, currentStatus: 'draft' | 'published') => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'

    const result = await Swal.fire({
      title: 'Update Course Visibility?',
      text: `Are you sure you want to change this course status to "${nextStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#615fff',
      cancelButtonColor: '#1f2937',
      confirmButtonText: `Yes, ${nextStatus === 'published' ? 'Publish' : 'Draft'} it`,
      background: '#121829',
      color: '#ffffff',
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/courses/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, status: nextStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update course status.')
      }

      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
      )

      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Course is now saved as ${nextStatus}.`,
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#ffffff',
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.message || 'Could not update status.',
        background: '#121829',
        color: '#ffffff',
      })
    }
  }

  // Delete Course
  const handleDeleteCourse = async (id: string, title: string) => {
    if (userRole !== 'admin') {
      Swal.fire({
        icon: 'error',
        title: 'Permission Denied',
        text: 'Only system Admins can delete courses.',
        background: '#121829',
        color: '#ffffff',
      })
      return
    }

    const result = await Swal.fire({
      title: 'Delete Course Permanently?',
      text: `Warning: Deleting "${title}" will remove its syllabus, student enrollments, and reviews. This action CANNOT be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#1f2937',
      confirmButtonText: 'Yes, Delete Course',
      background: '#121829',
      color: '#ffffff',
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete course document.')
      }

      setCourses((prev) => prev.filter((c) => c.id !== id))

      Swal.fire({
        icon: 'success',
        title: 'Course Deleted',
        text: 'Course successfully removed from database.',
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#ffffff',
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: err.message || 'Could not remove course.',
        background: '#121829',
        color: '#ffffff',
      })
    }
  }

  return (
    <div className="space-y-5">
      
      {/* Search and Filters panel */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-[#121829] border border-zinc-800 p-4 rounded-lg shadow-sm">
        
        {/* Search Input */}
        <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-[#070b16] border border-zinc-800 focus-within:border-[#615fff]/60 rounded-lg transition-colors">
          <FiSearch className="h-4.5 w-4.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by title, category, or mentor name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-base font-semibold text-zinc-150 placeholder-zinc-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-[#070b16] border border-zinc-850 p-1 rounded-lg">
          {(['all', 'published', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-1.5 rounded-md text-base font-bold capitalize transition-all duration-200 cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#615fff] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* Courses Catalog Table */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 font-semibold text-base space-y-4">
            <FiBookOpen className="h-10 w-10 text-zinc-700 mx-auto" />
            <p>No courses match your filter keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-base">
              <thead>
                <tr className="bg-[#0b0e17] border-b border-zinc-800/40 text-zinc-450 font-bold text-sm uppercase tracking-wider">
                  <th className="px-6 py-4">Course Preview</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Instructor</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-[#152347]/10 transition-colors">
                    {/* Preview details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail */}
                        <div className="h-12 w-20 rounded-md overflow-hidden bg-[#070b16] border border-zinc-800 shrink-0 relative flex items-center justify-center">
                          {c.thumbnail ? (
                            <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-650">Tutor</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-snug line-clamp-1">{c.title}</p>
                          <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-wider">
                            {c.level} • {c.duration}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-bold text-[#615fff]">
                      {formatCurrency(c.price)}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 font-semibold text-zinc-300">
                      {c.categoryName}
                    </td>

                    {/* Instructor */}
                    <td className="px-6 py-4 font-semibold text-zinc-300">
                      {c.instructorName}
                    </td>

                    {/* Status Badge with Click-Toggle Action */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                          c.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700/80 hover:bg-zinc-750'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>

                    {/* Actions Panel */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        
                        {/* Syllabus Config */}
                        <Link
                          href={`/admin/lessons?courseId=${c.id}`}
                          title="Manage Syllabus Lessons"
                          className="p-2 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        >
                          <FiList className="h-4.5 w-4.5" />
                        </Link>

                        {/* Edit Course details */}
                        <Link
                          href={`/admin/courses/${c.id}/edit`}
                          title="Edit Course Parameters"
                          className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all duration-200"
                        >
                          <FiEdit className="h-4.5 w-4.5" />
                        </Link>

                        {/* Delete course (Admin exclusively) */}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            title="Delete Course Permanently"
                            className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white transition-all duration-200 cursor-pointer"
                          >
                            <FiTrash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                        
                      </div>
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
