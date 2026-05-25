'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  FiLayout,
  FiBookOpen,
  FiList,
  FiStar,
  FiBookmark,
  FiHelpCircle,
  FiFileText,
  FiImage,
  FiLogOut,
  FiHome,
  FiMenu,
  FiX,
  FiUser,
  FiUserPlus,
  FiRadio,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface AdminSessionUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'instructor'
  profilePic?: string | null
  permissions?: string[]
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminSessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isPublicAdminRoute = pathname === '/admin/login' || pathname.startsWith('/admin/super-admin')

  useEffect(() => {
    if (isPublicAdminRoute) {
      setLoading(false)
      return
    }

    async function verifyAdminSession() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()

        if (!res.ok || !data.authenticated || !['admin', 'staff', 'instructor'].includes(data.user.role)) {
          // If not authenticated or not staff/admin/instructor, boot to admin login
          router.push('/admin/login')
          return
        }

        setUser(data.user)
      } catch (err) {
        console.error('Admin layout session check error:', err)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }
    verifyAdminSession()
  }, [router, pathname, isPublicAdminRoute])

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' })
      // Clear token cookies
      document.cookie = 'payload-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      document.cookie = 'student-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'

      Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'Administrative session ended.',
        timer: 1500,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#ffffff',
      })

      setTimeout(() => {
        window.location.href = '/admin/login'
      }, 1500)
    } catch (err) {
      console.error('Admin logout failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-300">Verifying Admin Access...</p>
        </div>
      </div>
    )
  }

  if (isPublicAdminRoute) {
    return <>{children}</>
  }

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  // Filter links based on custom permissions and role authorization
  const sidebarLinks = [
    { label: 'Overview', href: '/admin', icon: FiLayout, roles: ['admin', 'staff', 'instructor'], permission: 'overview' },
    { label: 'Courses', href: '/admin/courses', icon: FiBookOpen, roles: ['admin', 'instructor'], permission: 'courses' },
    { label: 'Lessons Syllabus', href: '/admin/lessons', icon: FiList, roles: ['admin', 'instructor'], permission: 'lessons' },
    { label: 'Live Classes', href: '/admin/live-classes', icon: FiRadio, roles: ['admin', 'instructor'], permission: 'live-classes' },
    { label: 'Reviews Moderate', href: '/admin/reviews', icon: FiStar, roles: ['admin', 'staff'], permission: 'reviews' },
    { label: 'Categories', href: '/admin/categories', icon: FiBookmark, roles: ['admin', 'staff'], permission: 'categories' },
    { label: 'FAQs Landing', href: '/admin/faqs', icon: FiHelpCircle, roles: ['admin', 'staff'], permission: 'faqs' },
    { label: 'Blog Posts', href: '/admin/blogs', icon: FiFileText, roles: ['admin', 'staff'], permission: 'blogs' },
    { label: 'Media Library', href: '/admin/media', icon: FiImage, roles: ['admin', 'staff'], permission: 'media' },
    { label: 'Staff Registry', href: '/admin/staff-register', icon: FiUserPlus, roles: ['admin'], permission: 'staff-register' },
  ].filter((link) => {
    // 1. Root admin has access to everything
    if (user.role === 'admin') return true

    // 2. If user has custom permissions array, check if it contains the permission key
    if (user.permissions && user.permissions.length > 0) {
      if (link.permission === 'overview') return true
      return user.permissions.includes(link.permission)
    }

    // 3. Fallback: Role-based authorization if permissions array is empty or undefined
    return link.roles.includes(user.role)
  })

  return (
    <div className="h-screen bg-[#121212] flex font-sans overflow-hidden text-zinc-100">
      
      {/* ── Desktop Sidebar Navigation (Sleek Dark Zinc) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#18181b] border-r border-zinc-800 shrink-0 select-none h-full">
        
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-zinc-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="h-9 w-9 rounded-lg bg-[#615fff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#615fff]/30 transition-transform group-hover:scale-105 duration-300 text-base">
              T
            </span>
            <span className="text-xl font-bold font-display tracking-tight text-white">
              Tutor Space
            </span>
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="text-base font-bold text-zinc-500 uppercase tracking-wider px-3 mb-4">Management</p>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-base font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#615fff] text-white shadow-md shadow-[#615fff]/20 border border-[#615fff]/20' 
                    : 'text-zinc-400 hover:bg-[#27272a] hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-zinc-800 bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[#615fff]/35 bg-[#27272a] flex items-center justify-center text-base font-bold text-white overflow-hidden shrink-0">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-white truncate leading-tight">{user.name}</p>
              <p className="text-base font-semibold text-[#615fff] truncate mt-0.5 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/25 hover:border-red-500 bg-red-550/5 hover:bg-red-550/10 text-red-400 font-bold text-base transition-all duration-200 cursor-pointer"
          >
            <FiLogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* ── Mobile Sidebar Drawer Overlay ── */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Mobile Sidebar Drawer Panel ── */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#18181b] border-r border-zinc-800 flex flex-col justify-between select-none transition-transform duration-350 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="h-20 flex items-center px-6 border-b border-zinc-800 justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-lg bg-[#615fff] flex items-center justify-center font-bold text-white text-base">
                T
              </span>
              <span className="text-xl font-bold font-display tracking-tight text-white">
                Tutor Space
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#27272a] text-zinc-400 hover:text-white"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <nav className="px-4 py-6 space-y-2">
            <p className="text-base font-bold text-zinc-500 uppercase tracking-wider px-3 mb-4">Management</p>
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-base font-semibold transition-all duration-200 group ${
                    isActive 
                      ? 'bg-[#615fff] text-white shadow-md' 
                      : 'text-zinc-400 hover:bg-[#27272a] hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[#615fff]/35 bg-[#27272a] flex items-center justify-center text-base font-bold text-white overflow-hidden shrink-0">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-white truncate leading-none">{user.name}</p>
              <p className="text-base font-semibold text-[#615fff] truncate mt-1 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/25 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold text-base transition-all duration-200 cursor-pointer"
          >
            <FiLogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main View Panel Container ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#121212]">
        
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 w-full h-20 bg-[#121212]/80 backdrop-blur-md border-b border-zinc-800/60 px-6 flex items-center justify-between select-none shrink-0">
          
          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white bg-[#18181b] cursor-pointer"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-[#615fff] flex items-center justify-center font-bold text-white text-sm">
                T
              </span>
              <span className="text-lg font-bold font-display tracking-tight text-white">
                Tutor Space
              </span>
            </Link>
          </div>

          {/* Page Badge Title Indicator */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-bold text-zinc-450 uppercase tracking-widest">
              Live Console
            </span>
          </div>

          {/* Header Action Shortcuts */}
          <div className="flex items-center gap-4.5 ml-auto lg:ml-0">
            
            {/* View Homepage Shortcut */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-base font-semibold text-zinc-400 hover:text-white hover:bg-[#18181b] border border-transparent hover:border-zinc-800 transition-all duration-200"
            >
              <FiHome className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Portal Homepage</span>
            </Link>

            {/* Admin Badge Info */}
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-4.5">
              <div className="h-10 w-10 rounded-full border border-[#615fff]/30 bg-[#18181b] flex items-center justify-center overflow-hidden shrink-0">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <FiUser className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-base font-bold text-white leading-none">{user.name}</p>
                <p className="text-base font-semibold text-[#615fff] mt-1 capitalize">{user.role} Account</p>
              </div>
            </div>

          </div>

        </header>

        {/* Scrollable Dashboard View */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>

    </div>
  )
}
