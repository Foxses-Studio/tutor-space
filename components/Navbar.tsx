'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiLogOut, FiLayout, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

interface User {
  id: string
  name: string
  email: string
  role: string
  profilePic?: string
}

const NAV_LINKS = [
  { label: 'Home',        href: '/',            match: '/' },
  { label: 'Courses',     href: '/courses',     match: '/courses' },
  { label: 'Instructors', href: '/instructors', match: '/instructors' },
  { label: 'About Us',    href: '/about',       match: '/about' },
  { label: 'Contact Us',  href: '/contact',     match: '/contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Active link check
  const isActive = (match: string): boolean => {
    if (match === '/') return pathname === '/'
    return pathname === match || pathname.startsWith(match + '/')
  }

  // Track scroll position for transparent to sticky background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.success && data.authenticated) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Failed to check auth status', err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setUserMenuOpen(false)
      window.location.reload()
    } catch (err) {
      console.error('Failed to logout', err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md shadow-zinc-200/30 py-0'
          : 'bg-transparent py-1'
      }`}
    >
      <div className="container mx-auto px-6 h-22 flex items-center justify-between">

        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="h-9 w-9 rounded-lg bg-[#615fff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#615fff]/35 transition-transform group-hover:scale-105 duration-300 text-base">
            T
          </span>
          <span className={`text-xl font-bold font-display tracking-tight transition-colors duration-300 ${
            isScrolled ? 'text-zinc-900' : 'text-[#0A163A]'
          }`}>
            Tutor Space
          </span>
        </Link>

        {/* Middle: Navigation Menu (Desktop) */}
        <nav className="hidden lg:flex items-center gap-8 text-base font-semibold">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.match)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1.5 pt-1 transition-colors duration-200 group ${
                  active
                    ? 'text-[#615fff]'
                    : isScrolled
                      ? 'text-zinc-500 hover:text-zinc-900'
                      : 'text-[#0A163A]/80 hover:text-[#0A163A]'
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[#615fff] transition-all duration-300 origin-left ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            )
          })}
        </nav>

        {/* Right Side: User Icon & Mobile Toggle */}
        <div className="flex items-center gap-4">
          
          {/* Dashboard Button next to Profile Pic (Visible when logged in) */}
          {!loading && user && (
            <Link
              href={user.role === 'student' ? '/dashboard' : '/admin'}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#615fff]/10 hover:bg-[#615fff] text-[#615fff] hover:text-white font-bold text-base transition-all duration-300 cursor-pointer gap-2 shadow-sm shadow-[#615fff]/5"
            >
              <FiLayout className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}

          {/* User Profile / Login Menu (User icon acts as Login trigger) */}
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-zinc-100 animate-pulse" />
            ) : user ? (
              // Authenticated User Avatar Trigger
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 focus:outline-none group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-xs font-bold text-[#615fff] shadow-md shadow-[#615fff]/10 transition-all overflow-hidden">
                  {user.profilePic ? (
                    <img 
                      src={typeof user.profilePic === 'object' && (user.profilePic as any).url ? (user.profilePic as any).url : user.profilePic} 
                      alt={user.name} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <FiChevronDown className={`h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              // Anonymous User Trigger (Takes them directly to /login page)
              <Link
                href="/login"
                className={`p-2 transition-colors duration-200 group cursor-pointer flex items-center justify-center ${
                  isScrolled ? 'text-zinc-500 hover:text-zinc-900' : 'text-[#0A163A]/70 hover:text-[#0A163A]'
                }`}
              >
                <FiUser className="h-5 w-5 group-hover:scale-105 transition-transform" />
              </Link>
            )}

            {/* Framer Motion Profile Dropdown Menu - Borderless Premium design */}
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-64 rounded-lg bg-white p-3 shadow-2xl shadow-zinc-300/60 z-50 text-zinc-800"
                >
                  {user ? (
                    // Logged In Options
                    <>
                      <div className="px-3 py-2.5 bg-zinc-50/70 rounded-lg mb-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-base font-bold text-zinc-800 truncate">{user.name}</p>
                        <p className="text-base text-zinc-500 truncate">{user.email}</p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-lg bg-[#615fff]/10 text-xs font-bold text-[#615fff] uppercase">
                          {['admin', 'staff', 'instructor'].includes(user.role) ? 'student' : user.role}
                        </span>
                      </div>

                      {user.role === 'admin' ? (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-semibold text-zinc-650 hover:text-[#121212] hover:bg-zinc-50 transition-all duration-200"
                          >
                            <FiLayout className="h-4.5 w-4.5 text-[#615fff]" />
                            Admin Console
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-semibold text-zinc-650 hover:text-[#121212] hover:bg-zinc-50 transition-all duration-200"
                          >
                            <FiUser className="h-4.5 w-4.5 text-[#615fff]" />
                            Student Portal
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={user.role === 'student' ? '/dashboard' : '/admin'}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-semibold text-zinc-650 hover:text-[#121212] hover:bg-zinc-50 transition-all duration-200"
                        >
                          <FiLayout className="h-4.5 w-4.5 text-[#615fff]" />
                          Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 text-left cursor-pointer"
                      >
                        <FiLogOut className="h-4.5 w-4.5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    // Logged Out Options
                    <>
                      <div className="px-3 py-2.5 bg-zinc-50/70 rounded-lg mb-3">
                        <p className="text-base font-bold text-[#0A163A]">Welcome</p>
                        <p className="text-base text-zinc-550 font-semibold mt-0.5">Join Tutor Space to access premium courses.</p>
                      </div>

                      <Link
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-center px-3 py-2.5 rounded-lg text-base font-bold bg-[#615fff] hover:bg-[#615fff]/90 text-white shadow-md shadow-[#615fff]/15 transition-all mb-2"
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-center px-3 py-2.5 rounded-lg text-base font-bold bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-all"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Register Button (Visible when logged out) - Max 8px border radius */}
          {!loading && !user && (
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center justify-center px-10 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#615fff]/95 text-white font-bold text-base shadow-md shadow-[#615fff]/15 hover:shadow-[#615fff]/25 transition-all duration-300 cursor-pointer"
            >
              Register
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 lg:hidden transition-colors ${
              isScrolled ? 'text-zinc-500 hover:text-zinc-900' : 'text-[#0A163A]/70 hover:text-[#0A163A]'
            }`}
          >
            {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>

        </div>
      </div>

      {/* Framer Motion Mobile Drawer Menu - Borderless Pill Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden bg-white px-6 py-4 shadow-2xl shadow-zinc-200/50 overflow-hidden"
          >
            <nav className="flex flex-col gap-2 text-base font-semibold">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.match)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-4 transition-all rounded-lg ${
                      active
                        ? 'text-[#615fff] bg-[#615fff]/8 font-bold'
                        : 'text-zinc-600 hover:text-[#0A163A]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  )
}
