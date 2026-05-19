'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { FiShoppingCart, FiUser, FiLogOut, FiLayout, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'

interface User {
  id: string
  name: string
  email: string
  role: string
  profilePic?: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount] = useState(2) // Static indicator for cart items
  const [isScrolled, setIsScrolled] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Track scroll position for transparent to sticky background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    // Set initial scroll state in case page is refreshed while scrolled down
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
      await fetch('/api/users/logout', { method: 'POST' })
      setUser(null)
      setUserMenuOpen(false)
      window.location.reload()
    } catch (err) {
      console.error('Failed to logout', err)
    }
  }

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm py-0' 
          : 'bg-transparent border-b border-transparent py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="h-9 w-9 rounded-xl bg-[#615fff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#615fff]/30 transition-transform group-hover:scale-105 duration-300">
            T
          </span>
          <span className="text-xl font-bold font-display tracking-tight text-zinc-900 transition-all">
            Tutor Space
          </span>
        </Link>

        {/* Middle: Navigation Menu (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#courses" className="text-zinc-500 hover:text-[#121212] hover:shadow-[0_1.5px_0_0_#615fff] pb-1 transition-all duration-200">
            Courses
          </Link>
          <Link href="#features" className="text-zinc-500 hover:text-[#121212] hover:shadow-[0_1.5px_0_0_#615fff] pb-1 transition-all duration-200">
            Features
          </Link>
          <Link href="#instructors" className="text-zinc-500 hover:text-[#121212] hover:shadow-[0_1.5px_0_0_#615fff] pb-1 transition-all duration-200">
            Instructors
          </Link>
        </nav>

        {/* Right Side: Cart, User Icon & Mobile Toggle */}
        <div className="flex items-center gap-4">
          
          {/* Cart Icon */}
          <Link href="#cart" className="relative p-2 text-zinc-500 hover:text-[#121212] transition-colors duration-200 group">
            <FiShoppingCart className="h-5 w-5 group-hover:scale-105 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-[#615fff] text-[10px] font-bold text-white flex items-center justify-center animate-pulse border border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login Menu */}
          <div className="relative" ref={dropdownRef}>
            {loading ? (
              <div className="h-8 w-8 rounded-full border border-zinc-200 bg-zinc-50 animate-pulse" />
            ) : user ? (
              // Authenticated User Avatar Trigger
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 focus:outline-none group"
              >
                <div className="h-8 w-8 rounded-full border border-[#615fff]/30 bg-zinc-50 flex items-center justify-center text-xs font-bold text-[#615fff] shadow-md shadow-[#615fff]/10 group-hover:border-[#615fff] transition-all overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                <FiChevronDown className={`h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              // Anonymous User Dropdown Trigger
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-zinc-500 hover:text-[#121212] focus:outline-none transition-colors duration-200 group"
              >
                <FiUser className="h-5 w-5 group-hover:scale-105 transition-transform" />
              </button>
            )}

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-xl border border-zinc-100 bg-white p-2 shadow-xl shadow-zinc-200/50 animate-in fade-in-50 duration-200 z-50">
                {user ? (
                  // Logged In Options
                  <>
                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-bold text-zinc-800 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-[#615fff]/10 border border-[#615fff]/20 text-[10px] font-semibold text-[#615fff] uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-200"
                    >
                      <FiLayout className="h-4 w-4 text-[#615fff]" />
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 text-left"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  // Logged Out Options
                  <>
                    <div className="px-3 py-2 border-b border-zinc-100 mb-2">
                      <p className="text-sm font-bold text-zinc-800">Welcome</p>
                      <p className="text-xs text-zinc-500">Join Tutor Space to access premium courses.</p>
                    </div>

                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full text-center px-3 py-2 rounded-lg text-sm font-semibold bg-[#615fff] hover:bg-[#615fff]/90 text-white shadow-md shadow-[#615fff]/15 transition-all mb-1.5"
                    >
                      Sign In
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full text-center px-3 py-2 rounded-lg text-sm font-semibold border border-zinc-200 hover:border-zinc-350 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-500 hover:text-[#121212] md:hidden transition-colors"
          >
            {mobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-6 py-4 shadow-md animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4 text-base font-medium">
            <Link
              href="#courses"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-500 hover:text-zinc-900 py-1 transition-colors"
            >
              Courses
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-500 hover:text-zinc-900 py-1 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#instructors"
              onClick={() => setMobileMenuOpen(false)}
              className="text-zinc-500 hover:text-zinc-900 py-1 transition-colors"
            >
              Instructors
            </Link>
          </nav>
        </div>
      )}

    </header>
  )
}
