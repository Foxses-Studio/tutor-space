'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FiDollarSign,
  FiBookOpen,
  FiUsers,
  FiStar,
  FiFolder,
  FiFileText,
  FiHelpCircle,
  FiPlay,
  FiRefreshCw,
  FiAlertCircle,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiBook,
  FiChevronRight,
  FiList,
  FiTrash2,
  FiSearch,
  FiX,
} from 'react-icons/fi'
import Swal from 'sweetalert2'

interface DashboardData {
  role: 'admin' | 'staff' | 'instructor'
  summary: {
    totalCourses?: number
    totalStudents?: number
    totalEnrollments?: number
    totalIncome?: number
    totalRefunded?: number
    netRevenue?: number
    pendingReviews?: number
    totalCategories?: number
    totalBlogs?: number
    totalFAQs?: number
    totalLessons?: number
  }
  recentReviews?: Array<{
    id: string
    studentName: string
    courseTitle: string
    rating: string
    comment: string
    createdAt: string
  }>
  recentEnrollments?: Array<{
    id: string
    studentName: string
    studentEmail: string
    courseTitle: string
    pricePaid: number
    paymentStatus: string
    createdAt: string
  }>
  chartData?: Array<{
    day: string;
    income: number;
  }>
  courses?: Array<{
    id: string
    title: string
    slug: string
    status: string
    price: number
    thumbnail?: string | null
    level: string
    duration: string
  }>
  liveLessons?: Array<{
    id: string
    title: string
    slug: string
    courseTitle: string
    livePlatform: string
    liveUrl: string
    liveDate: string | null
    duration: number
    autoGenerateZoom: boolean
  }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  refunded: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [searchingEnrollments, setSearchingEnrollments] = useState(false)

  async function fetchStats() {
    setError(null)
    try {
      const res = await fetch('/api/admin/dashboard-stats', { cache: 'no-store' })
      if (!res.ok) {
        throw new Error('Failed to load dashboard metrics.')
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleEnrollmentSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollmentSearchQuery.trim()) {
      setSearchResults(null)
      return
    }
    setSearchingEnrollments(true)
    try {
      const res = await fetch(`/api/admin/enrollments?search=${encodeURIComponent(enrollmentSearchQuery)}`)
      if (!res.ok) throw new Error('Search failed')
      const json = await res.json()
      if (json.success) {
        setSearchResults(json.enrollments)
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Search Error',
        text: err.message || 'Failed to search enrollments',
        background: '#1a1a1a',
        color: '#ffffff',
      })
    } finally {
      setSearchingEnrollments(false)
    }
  }

  const handleClearEnrollmentSearch = () => {
    setEnrollmentSearchQuery('')
    setSearchResults(null)
  }

  const handleRemoveEnrollment = async (enrollmentId: string, studentName: string, courseTitle: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will completely remove/unenroll ${studentName} from the course "${courseTitle}". The student will lose all access immediately!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove enrollment',
      cancelButtonText: 'Cancel',
      background: '#1a1a1a',
      color: '#ffffff',
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/enrollments?id=${enrollmentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Failed to unenroll student')
      }

      const json = await res.json()
      if (json.success) {
        Swal.fire({
          icon: 'success',
          title: 'Unenrolled Successfully',
          text: `${studentName} has been removed from "${courseTitle}".`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#1a1a1a',
          color: '#ffffff',
        })

        // Refresh stats
        fetchStats()
        // If showing search results, refresh search results
        if (enrollmentSearchQuery.trim()) {
          const searchRes = await fetch(`/api/admin/enrollments?search=${encodeURIComponent(enrollmentSearchQuery)}`)
          if (searchRes.ok) {
            const searchJson = await searchRes.json()
            if (searchJson.success) {
              setSearchResults(searchJson.enrollments)
            }
          }
        }
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.message || 'Failed to remove enrollment',
        background: '#1a1a1a',
        color: '#ffffff',
      })
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  const handleModerateReview = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/reviews/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id, status: action }),
      })

      if (!res.ok) {
        throw new Error('Failed to update testimonial status.')
      }

      Swal.fire({
        icon: 'success',
        title: `Review ${action === 'approved' ? 'Approved' : 'Rejected'}`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#1a1a1a',
        color: '#ffffff',
      })

      // Reload dashboard stats
      fetchStats()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.message || 'Failed to update review status',
        background: '#1a1a1a',
        color: '#ffffff',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-400">Loading Dashboard Data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md bg-[#18181b] border border-zinc-800 p-6 rounded-lg">
          <FiAlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Dashboard Load Error</h2>
          <p className="text-base font-semibold text-zinc-400 leading-relaxed">{error}</p>
          <button 
            onClick={fetchStats} 
            className="w-full py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base cursor-pointer transition-all duration-200"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { role, summary, recentReviews, recentEnrollments, chartData, courses } = data

  // Render SVG Area Sparkline Chart for Admin role
  const renderRevenueChart = () => {
    if (!chartData || chartData.length === 0) return null

    // Get min and max for scaling
    const incomes = chartData.map((d) => d.income)
    const maxIncome = Math.max(...incomes, 5000) // Fallback min height scale
    const height = 150
    const width = 500

    // Map chartData points into coordinates
    const paddingX = 40
    const paddingY = 20
    const chartWidth = width - paddingX * 2
    const chartHeight = height - paddingY * 2

    const points = chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * chartWidth
      const y = height - paddingY - (d.income / maxIncome) * chartHeight
      return { x, y, label: d.day, val: d.income }
    })

    // Path string
    let pathD = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      // Smooth bezier curves
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2
      const cpY1 = points[i - 1].y
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2
      const cpY2 = points[i].y
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`
    }

    // Closed path string for gradient fill
    const fillPathD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

    return (
      <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Income Trend</h2>
            <p className="text-base font-semibold text-zinc-400 mt-0.5">Last 7 days revenue mapping</p>
          </div>
          <span className="text-base font-bold text-[#615fff] bg-[#615fff]/10 px-2.5 py-1 rounded-lg border border-[#615fff]/20">
            Auto Aggregated
          </span>
        </div>

        {/* Custom Hand-Drawn SVG Chart */}
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
            <defs>
              <linearGradient id="chart-glow-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#615fff" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#615fff" stopOpacity="0.0"/>
              </linearGradient>
            </defs>

            {/* Helper Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
            <line x1={paddingX} y1={(height) / 2} x2={width - paddingX} y2={(height) / 2} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#27272a" strokeWidth="1.5" />

            {/* Gradient Fill Path */}
            <path d={fillPathD} fill="url(#chart-glow-gradient)" />

            {/* Smooth Bezier Stroke Line */}
            <path d={pathD} fill="none" stroke="#615fff" strokeWidth="3" strokeLinecap="round" />

            {/* Interactive Neon Data Dots */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#615fff" stroke="#18181b" strokeWidth="2" className="cursor-pointer" />
                {/* Value tooltip label */}
                {p.val > 0 && (
                  <text x={p.x} y={p.y - 10} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {formatCurrency(p.val).replace('BDT', '')}
                  </text>
                )}
                {/* Horizontal X Axis Labels */}
                <text x={p.x} y={height - 4} fill="#6b7280" fontSize="11" fontWeight="semibold" textAnchor="middle">
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-base font-semibold text-zinc-400 mt-0.5 capitalize">
            Manage Tutor Space core e-learning operations as {role}.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] border border-zinc-800 hover:border-zinc-700 text-zinc-350 hover:text-white font-semibold text-base transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4.5 w-4.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ─── ADMIN DASHBOARD ──────────────────────────────────────────────────── */}
      {role === 'admin' && (
        <>
          {/* KPI grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Income Card */}
            <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-zinc-400">Net Revenue</p>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FiDollarSign className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white leading-tight">
                {formatCurrency(summary.netRevenue || 0)}
              </p>
              <p className="text-base font-semibold text-zinc-500">
                Gross: {formatCurrency(summary.totalIncome || 0)}
              </p>
            </div>

            {/* Enrollments Card */}
            <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-zinc-400">Purchases</p>
                <div className="h-10 w-10 rounded-lg bg-[#615fff]/10 border border-[#615fff]/20 flex items-center justify-center text-[#615fff]">
                  <FiBookOpen className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white leading-tight">
                {summary.totalEnrollments || 0}
              </p>
              <p className="text-base font-semibold text-zinc-500">
                total transactions completed
              </p>
            </div>

            {/* Students Card */}
            <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-zinc-400">Total Students</p>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FiUsers className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white leading-tight">
                {summary.totalStudents || 0}
              </p>
              <p className="text-base font-semibold text-zinc-500">
                individual active learners
              </p>
            </div>

            {/* Pending Reviews Card */}
            <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-zinc-400">Pending Reviews</p>
                <div className={`h-10 w-10 rounded-lg border flex items-center justify-center ${
                  summary.pendingReviews && summary.pendingReviews > 0
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                    : 'bg-zinc-850 text-zinc-500 border-zinc-800'
                }`}>
                  <FiStar className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white leading-tight">
                {summary.pendingReviews || 0}
              </p>
              <p className="text-base font-semibold text-zinc-500">
                testimonials awaiting approval
              </p>
            </div>

          </div>

          {/* SVG Chart & Shortcuts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart Column */}
            <div className="lg:col-span-8">
              {renderRevenueChart()}
            </div>

            {/* Quick Actions Shortcuts Column */}
            <div className="lg:col-span-4 bg-[#18181b] border border-zinc-800 rounded-lg p-5 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white">Operational Shortcuts</h2>
                <p className="text-base font-semibold text-zinc-400 mt-0.5">Quick management routing</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/admin/courses/new"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-850 hover:border-[#615fff]/50 bg-[#121212] hover:bg-[#615fff]/5 text-zinc-350 hover:text-white transition-all duration-200 group text-base font-semibold"
                >
                  <span className="flex items-center gap-3">
                    <FiBookOpen className="h-5 w-5 text-[#615fff]" />
                    Add New Course
                  </span>
                  <FiChevronRight className="h-4 w-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/admin/courses"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-850 hover:border-[#615fff]/50 bg-[#121212] hover:bg-[#615fff]/5 text-zinc-350 hover:text-white transition-all duration-200 group text-base font-semibold"
                >
                  <span className="flex items-center gap-3">
                    <FiBook className="h-5 w-5 text-indigo-400" />
                    Manage Courses ({summary.totalCourses})
                  </span>
                  <FiChevronRight className="h-4 w-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/admin/reviews"
                  className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-850 hover:border-[#615fff]/50 bg-[#121212] hover:bg-[#615fff]/5 text-zinc-350 hover:text-white transition-all duration-200 group text-base font-semibold"
                >
                  <span className="flex items-center gap-3">
                    <FiStar className="h-5 w-5 text-amber-400" />
                    Moderation Queue ({summary.pendingReviews})
                  </span>
                  <FiChevronRight className="h-4 w-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>

          {/* Activity Tables Layout (Recent transactions and reviews) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Sales (8 cols) */}
            <div id="enrollments" className="lg:col-span-8 bg-[#18181b] border border-zinc-800 rounded-lg shadow-sm overflow-hidden scroll-mt-24">
              <div className="px-6 py-5 border-b border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {searchResults !== null ? 'Enrollment Search Results' : 'Recent Sales'}
                  </h2>
                  <p className="text-base font-semibold text-zinc-400 mt-0.5">
                    {searchResults !== null 
                      ? `Found ${searchResults.length} matching enrollments` 
                      : 'Last 5 transaction logs'}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <form onSubmit={handleEnrollmentSearch} className="relative flex items-center w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search student or course..."
                      value={enrollmentSearchQuery}
                      onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-8 py-1.5 bg-[#121212] border border-zinc-800 hover:border-zinc-700 focus:border-[#615fff] rounded-lg text-white text-base font-semibold focus:outline-none placeholder-zinc-500 transition-colors"
                    />
                    <FiSearch className="absolute left-3 text-zinc-500 h-4.5 w-4.5" />
                    {enrollmentSearchQuery && (
                      <button
                        type="button"
                        onClick={handleClearEnrollmentSearch}
                        className="absolute right-3 text-zinc-500 hover:text-white cursor-pointer flex items-center justify-center"
                      >
                        <FiX className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {((searchResults !== null ? searchResults : recentEnrollments) || []).length === 0 ? (
                <div className="p-12 text-center text-zinc-550 font-semibold text-base">
                  {searchResults !== null ? 'No matching enrollment records found.' : 'No enrollment records found.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-base">
                    <thead>
                      <tr className="bg-[#121212] border-b border-zinc-800 text-zinc-400 font-bold text-base uppercase tracking-wider">
                        <th className="px-6 py-3.5">Student</th>
                        <th className="px-6 py-3.5">Course</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5 text-right">Paid</th>
                        <th className="px-6 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {((searchResults !== null ? searchResults : recentEnrollments) || []).map((e) => (
                        <tr key={e.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white">{e.studentName}</p>
                            <p className="text-base font-semibold text-zinc-500 mt-0.5">{e.studentEmail}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-zinc-300 max-w-xs truncate">
                            {e.courseTitle}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-lg text-base font-bold capitalize ${statusColors[e.paymentStatus] || ''}`}>
                              {e.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-400">
                            {formatCurrency(e.pricePaid)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveEnrollment(e.id, e.studentName, e.courseTitle)}
                              className="p-2 text-rose-450 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                              title="Remove Course (Unenroll)"
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

            {/* Testimonials Review Feed (4 cols) */}
            <div className="lg:col-span-4 bg-[#18181b] border border-zinc-800 rounded-lg shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-zinc-850">
                <h2 className="text-lg font-bold text-white">Reviews Pending</h2>
                <p className="text-base font-semibold text-zinc-400 mt-0.5">Testimonial moderation feed</p>
              </div>

              <div className="flex-1 divide-y divide-zinc-800 overflow-y-auto max-h-[360px]">
                {recentReviews && recentReviews.length === 0 ? (
                  <div className="p-8 text-center text-zinc-550 font-semibold text-base h-full flex items-center justify-center">
                    All reviews are moderated!
                  </div>
                ) : (
                  recentReviews?.map((r) => (
                    <div key={r.id} className="p-5 space-y-3.5 hover:bg-zinc-800/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-base">{r.studentName}</p>
                          <p className="text-base font-bold text-[#615fff] uppercase tracking-wider mt-0.5">
                            {r.courseTitle}
                          </p>
                        </div>
                        <div className="flex items-center text-amber-400 gap-1 text-base font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/25">
                          <FiStar className="fill-amber-400 h-3.5 w-3.5" />
                          {r.rating}
                        </div>
                      </div>
                      <p className="text-base text-zinc-350 font-medium italic leading-relaxed">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                      <div className="flex items-center gap-2.5 pt-1.5">
                        <button
                          onClick={() => handleModerateReview(r.id, 'approved')}
                          className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateReview(r.id, 'rejected')}
                          className="flex-1 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-[#121212] hover:bg-zinc-800 text-rose-450 font-bold text-base cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}

      {/* ─── STAFF DASHBOARD ──────────────────────────────────────────────────── */}
      {role === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <FiFolder className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-400">Categories</p>
              <p className="text-2xl font-bold text-white">{summary.totalCategories || 0}</p>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <FiFileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-400">Blog Posts</p>
              <p className="text-2xl font-bold text-white">{summary.totalBlogs || 0}</p>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <FiHelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-400"> accordion FAQs</p>
              <p className="text-2xl font-bold text-white">{summary.totalFAQs || 0}</p>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-lg border border-zinc-800 p-6 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <FiStar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-white">{summary.pendingReviews || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTRUCTOR DASHBOARD ────────────────────────────────────────────── */}
      {role === 'instructor' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-lg shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-[#615fff]/10 border border-[#615fff]/20 flex items-center justify-center text-[#615fff] shrink-0">
                <FiBookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-400">Assigned Courses</p>
                <p className="text-2xl font-bold text-white">{summary.totalCourses || 0}</p>
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-lg shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <FiPlay className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-400">Lessons Created</p>
                <p className="text-2xl font-bold text-white">{summary.totalLessons || 0}</p>
              </div>
            </div>

            <div className="bg-[#18181b] border border-zinc-800 p-6 rounded-lg shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FiUsers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-400">Active Students</p>
                <p className="text-2xl font-bold text-white">{summary.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          {/* Grid Layout: Your Syllabus + Live Classes Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Your Syllabus */}
            <div className="lg:col-span-8 bg-[#18181b] border border-zinc-800 rounded-lg p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Your Syllabus</h2>
                <p className="text-base font-semibold text-zinc-400 mt-0.5">Courses currently assigned to your instruction</p>
              </div>

              {courses && courses.length === 0 ? (
                <div className="text-center py-8 text-zinc-550 font-semibold text-base">
                  No courses assigned to your profile yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-base">
                    <thead>
                      <tr className="bg-[#121212] border-b border-zinc-800 text-zinc-400 font-bold text-sm uppercase tracking-wider">
                        <th className="px-6 py-3.5">Course Title</th>
                        <th className="px-6 py-3.5">Price</th>
                        <th className="px-4 py-3.5 text-center">Visibility</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-semibold text-zinc-200">
                      {courses?.map((c) => (
                        <tr key={c.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {/* Thumbnail */}
                              <div className="h-12 w-20 rounded-md overflow-hidden bg-[#070b16] border border-zinc-800 shrink-0 relative flex items-center justify-center select-none">
                                {c.thumbnail ? (
                                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-zinc-650">Tutor</span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-white text-base leading-snug line-clamp-1">{c.title}</p>
                                <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-wider">
                                  {c.level} • {c.duration}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-base text-[#615fff] font-bold">
                            {formatCurrency(c.price)}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold uppercase select-none ${
                              c.status === 'published' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-zinc-850 text-zinc-450 border border-zinc-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/admin/lessons?courseId=${c.id}`}
                              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-colors"
                            >
                              <FiList className="h-4.5 w-4.5" />
                              <span>Manage Syllabus</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right side: Live Classes Sidebar (Short form) */}
            <div className="lg:col-span-4 bg-[#18181b] border border-zinc-800 rounded-lg p-6 shadow-sm flex flex-col">
              <div className="border-b border-zinc-800/60 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#615fff] animate-pulse" />
                    Live Schedule
                  </h2>
                  <p className="text-base font-semibold text-zinc-400 mt-0.5">Upcoming interactive classes</p>
                </div>
                <span className="px-2 py-0.5 bg-[#615fff]/15 border border-[#615fff]/25 text-[#615fff] text-xs font-bold rounded-md select-none shrink-0">
                  {(data.liveLessons || []).length} Total
                </span>
              </div>

              <div className="flex-1 divide-y divide-zinc-800/50 overflow-y-auto max-h-[380px] mt-3 space-y-4 pr-1">
                {(!data.liveLessons || data.liveLessons.length === 0) ? (
                  <div className="text-center py-12 text-zinc-550 font-semibold text-base">
                    No live classes scheduled.
                  </div>
                ) : (
                  data.liveLessons.map((lesson) => {
                    const dateObj = lesson.liveDate ? new Date(lesson.liveDate) : null
                    const formattedDate = dateObj
                      ? dateObj.toLocaleString('en-BD', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : 'Not Scheduled'

                    const isUpcoming = dateObj ? dateObj.getTime() > Date.now() : false

                    return (
                      <div key={lesson.id} className="pt-4 first:pt-0 flex flex-col gap-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{lesson.title}</h3>
                            <span className="shrink-0 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 select-none">
                              {lesson.livePlatform}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-zinc-500 mt-1 truncate">{lesson.courseTitle}</p>
                        </div>

                        <div className="flex items-center justify-between gap-3 bg-[#0c0e17] border border-zinc-800/40 p-2 rounded-lg">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${isUpcoming ? 'bg-amber-400 animate-pulse' : 'bg-zinc-500'}`} />
                            <span className="text-xs font-bold text-zinc-300">{formattedDate}</span>
                          </div>
                          {lesson.liveUrl ? (
                            <a
                              href={lesson.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1 px-2.5 rounded bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-xs transition-colors shrink-0"
                            >
                              Join
                            </a>
                          ) : (
                            <span className="text-xs font-bold text-zinc-650 shrink-0">Pending</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
