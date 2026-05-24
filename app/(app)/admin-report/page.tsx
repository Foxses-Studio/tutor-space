'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiUsers,
  FiBookOpen,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiArrowLeft,
} from 'react-icons/fi'

interface Summary {
  totalEnrollments: number
  completedEnrollments: number
  pendingEnrollments: number
  refundedEnrollments: number
  totalIncome: number
  totalRefunded: number
  uniqueStudents: number
}

interface CourseBreakdown {
  title: string
  enrollments: number
  income: number
}

interface RecentEnrollment {
  id: string
  studentName: string
  studentEmail: string
  courseTitle: string
  pricePaid: number
  paymentStatus: string
  createdAt: string
}

interface ReportData {
  summary: Summary
  courseBreakdown: CourseBreakdown[]
  recentEnrollments: RecentEnrollment[]
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

const statusStyles: Record<string, string> = {
  completed: 'bg-green-50 text-green-700 border border-green-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  refunded: 'bg-red-50 text-red-700 border border-red-200',
}

export default function AdminReportPage() {
  const router = useRouter()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchReport() {
    setLoading(true)
    setError(null)
    try {
      const authRes = await fetch('/api/auth/me')
      const authData = await authRes.json()

      if (!authData.authenticated || authData.user.role !== 'admin') {
        router.push('/login')
        return
      }

      const res = await fetch('/api/admin/report')
      if (!res.ok) {
        setError('Failed to load report data.')
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-[#615fff] border-t-transparent rounded-full animate-spin" />
          <p className="text-base font-bold text-zinc-600">Loading Admin Report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-base font-bold text-zinc-700">{error}</p>
          <button onClick={fetchReport} className="px-5 py-2.5 rounded-lg bg-[#615fff] text-white font-bold text-base cursor-pointer">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { summary, courseBreakdown, recentEnrollments } = data

  const conversionRate =
    summary.totalEnrollments > 0
      ? ((summary.completedEnrollments / summary.totalEnrollments) * 100).toFixed(1)
      : '0'

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-semibold text-base transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            Admin Panel
          </Link>
          <span className="text-zinc-300">|</span>
          <h1 className="text-xl font-bold text-zinc-800">Enrollment & Revenue Report</h1>
        </div>
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 hover:border-[#615fff]/50 hover:bg-[#615fff]/5 text-zinc-600 hover:text-[#615fff] font-semibold text-base transition-all cursor-pointer"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-500">Total Income</p>
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <FiDollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-800">{formatCurrency(summary.totalIncome)}</p>
            <p className="text-base font-semibold text-zinc-400">from {summary.completedEnrollments} paid enrollments</p>
          </div>

          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-500">Total Enrollments</p>
              <div className="h-10 w-10 rounded-lg bg-[#615fff]/10 flex items-center justify-center text-[#615fff]">
                <FiBookOpen className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-800">{summary.totalEnrollments}</p>
            <p className="text-base font-semibold text-zinc-400">{conversionRate}% conversion rate</p>
          </div>

          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-500">Unique Students</p>
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FiUsers className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-800">{summary.uniqueStudents}</p>
            <p className="text-base font-semibold text-zinc-400">individual learners</p>
          </div>

          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-zinc-500">Refunded</p>
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                <FiTrendingUp className="h-5 w-5 rotate-180" />
              </div>
            </div>
            <p className="text-2xl font-bold text-zinc-800">{formatCurrency(summary.totalRefunded)}</p>
            <p className="text-base font-semibold text-zinc-400">from {summary.refundedEnrollments} refunds</p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <FiCheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-500">Completed</p>
              <p className="text-2xl font-bold text-zinc-800">{summary.completedEnrollments}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <FiClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-500">Pending</p>
              <p className="text-2xl font-bold text-zinc-800">{summary.pendingEnrollments}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-zinc-200 p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <FiAlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-500">Refunded</p>
              <p className="text-2xl font-bold text-zinc-800">{summary.refundedEnrollments}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Course Breakdown Table */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-800">Revenue by Course</h2>
              <p className="text-base font-semibold text-zinc-400 mt-0.5">Sorted by income, highest first</p>
            </div>
            {courseBreakdown.length === 0 ? (
              <div className="px-6 py-12 text-center text-base font-semibold text-zinc-400">
                No enrollment data yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="text-left px-6 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Course</th>
                      <th className="text-center px-4 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Enrollments</th>
                      <th className="text-right px-6 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {courseBreakdown.map((course, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                        <td className="px-6 py-4 font-semibold text-zinc-800 max-w-xs truncate">{course.title}</td>
                        <td className="px-4 py-4 text-center font-bold text-zinc-700">{course.enrollments}</td>
                        <td className="px-6 py-4 text-right font-bold text-green-700">{formatCurrency(course.income)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-50 border-t border-zinc-200">
                      <td className="px-6 py-4 font-bold text-zinc-800">Total</td>
                      <td className="px-4 py-4 text-center font-bold text-zinc-800">{summary.totalEnrollments}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-700">{formatCurrency(summary.totalIncome)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Net Revenue Summary Card */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-[#0A163A] rounded-lg p-6 text-white space-y-5 shadow-lg">
              <h2 className="text-lg font-bold text-white">Net Revenue Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-zinc-400">Gross Income</span>
                  <span className="text-base font-bold text-green-400">{formatCurrency(summary.totalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-zinc-400">Total Refunded</span>
                  <span className="text-base font-bold text-red-400">- {formatCurrency(summary.totalRefunded)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Net Revenue</span>
                  <span className="text-xl font-bold text-[#8a88ff]">
                    {formatCurrency(summary.totalIncome - summary.totalRefunded)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-zinc-800">Avg. Per Enrollment</h2>
              <p className="text-3xl font-bold text-[#615fff]">
                {summary.completedEnrollments > 0
                  ? formatCurrency(Math.round(summary.totalIncome / summary.completedEnrollments))
                  : formatCurrency(0)}
              </p>
              <p className="text-base font-semibold text-zinc-400">average revenue per completed sale</p>
            </div>
          </div>
        </div>

        {/* Recent Enrollments Table */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-800">Recent Enrollments</h2>
            <p className="text-base font-semibold text-zinc-400 mt-0.5">Last 10 transactions across all courses</p>
          </div>
          {recentEnrollments.length === 0 ? (
            <div className="px-6 py-12 text-center text-base font-semibold text-zinc-400">
              No enrollments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="text-left px-6 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Student</th>
                    <th className="text-left px-6 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Course</th>
                    <th className="text-center px-4 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-3 font-bold text-zinc-500 text-sm uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recentEnrollments.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-zinc-800">{e.studentName}</p>
                        <p className="text-sm font-semibold text-zinc-400 mt-0.5">{e.studentEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-700 max-w-xs">
                        <span className="line-clamp-1">{e.courseTitle}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold capitalize ${statusStyles[e.paymentStatus] || ''}`}>
                          {e.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-zinc-800">
                        {formatCurrency(e.pricePaid)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-zinc-500">
                        {formatDate(e.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
