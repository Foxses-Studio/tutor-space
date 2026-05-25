'use client'

import React, { useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiTag, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CouponItem {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  expirationDate?: string
  isActive: boolean
  maxUses?: number | string
  usedCount: number
}

export default function CouponsPageClient({
  initialCoupons,
}: {
  initialCoupons: CouponItem[]
}) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null)

  // Form states
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed')
  const [discountValue, setDiscountValue] = useState<number | ''>('')
  const [expirationDate, setExpirationDate] = useState('')
  const [maxUses, setMaxUses] = useState<number | string>('')
  const [isActive, setIsActive] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const openAddModal = () => {
    setEditingCoupon(null)
    setCode('')
    setDiscountType('fixed')
    setDiscountValue('')
    setExpirationDate('')
    setMaxUses('')
    setIsActive(true)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const openEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon)
    setCode(coupon.code)
    setDiscountType(coupon.discountType)
    setDiscountValue(coupon.discountValue)
    setExpirationDate(coupon.expirationDate || '')
    setMaxUses(coupon.maxUses || '')
    setIsActive(coupon.isActive)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  const handleDelete = async (coupon: CouponItem) => {
    const result = await Swal.fire({
      title: `Delete "${coupon.code}"?`,
      text: 'This will permanently remove this coupon code. It cannot be reverted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Delete',
      background: '#121829',
      color: '#fff',
    })
    if (!result.isConfirmed) return

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Coupon successfully deleted.',
          timer: 1200,
          showConfirmButton: false,
          background: '#121829',
          color: '#fff',
        })
      } else {
        throw new Error(data.error || 'Failed to delete coupon.')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to delete coupon.',
        background: '#121829',
        color: '#fff',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!code.trim()) {
      setErrorMsg('Coupon code is required.')
      return
    }
    if (discountValue === '' || discountValue < 0) {
      setErrorMsg('A valid discount value is required.')
      return
    }

    const payload = {
      id: editingCoupon?.id,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      expirationDate: expirationDate || undefined,
      maxUses: maxUses ? Number(maxUses) : undefined,
      isActive,
    }

    try {
      const method = editingCoupon ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        if (editingCoupon) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...data.coupon, id: data.coupon._id || data.coupon.id } : c))
          )
        } else {
          setCoupons((prev) => [
            {
              ...data.coupon,
              id: data.coupon._id || data.coupon.id,
              expirationDate: data.coupon.expirationDate ? data.coupon.expirationDate.split('T')[0] : '',
            },
            ...prev,
          ])
        }

        setIsModalOpen(false)
        Swal.fire({
          icon: 'success',
          title: editingCoupon ? 'Coupon Updated' : 'Coupon Created',
          text: `Coupon code "${payload.code}" was saved successfully.`,
          timer: 1500,
          showConfirmButton: false,
          background: '#121829',
          color: '#fff',
        })
      } else {
        setErrorMsg(data.error || 'Failed to save coupon.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.')
    }
  }

  const toggleStatus = async (coupon: CouponItem) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
        )
      }
    } catch (err) {
      console.error('Failed to toggle coupon status', err)
    }
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Coupons & Promo Codes</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Create and manage promotional discount codes for checkout
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer select-none"
        >
          <FiPlus className="h-5 w-5" /> New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FiTag className="h-10 w-10 text-zinc-700 mx-auto" />
            <p className="text-base font-semibold text-zinc-500">
              No promotional coupons yet. Click above to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead>
                <tr className="bg-[#0b0e17] border-b border-zinc-800/40 text-zinc-450 font-bold text-sm uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Discount Value</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Usage Count</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-[#152347]/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#615fff]/15 border border-[#615fff]/20 flex items-center justify-center shrink-0">
                          <FiTag className="h-4 w-4 text-[#615fff]" />
                        </div>
                        <span className="font-bold text-white text-base tracking-wide font-mono">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-emerald-450 text-base">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% Off`
                          : `$${coupon.discountValue.toFixed(2)} Off`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-400 text-base">
                        {coupon.expirationDate ? coupon.expirationDate : 'Never Expires'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-200">
                          {coupon.usedCount} Uses
                        </span>
                        {coupon.maxUses ? (
                          <span className="text-sm font-semibold text-zinc-500 mt-0.5">
                            Max Limit: {coupon.maxUses}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(coupon)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold transition-all border cursor-pointer select-none ${
                          coupon.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${coupon.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                        {coupon.isActive ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all cursor-pointer"
                        >
                          <FiEdit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all cursor-pointer"
                        >
                          <FiTrash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#121829] border border-zinc-800 rounded-lg shadow-2xl p-6 relative animate-scale-up text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <FiX className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold flex items-center gap-2 mb-2 text-[#615fff]">
              <FiTag className="h-5 w-5" />
              {editingCoupon ? 'Modify Coupon Properties' : 'Create New Promotional Coupon'}
            </h2>
            <p className="text-sm font-semibold text-zinc-400 mb-6">
              Fill out the details below to generate coupon discounts
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-base font-semibold">
                  <FiAlertCircle className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-base font-bold text-zinc-300">Promo Code (Uppercase)</label>
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={code}
                  disabled={!!editingCoupon}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-[#615fff]/60 text-white font-semibold text-base font-mono focus:outline-none disabled:opacity-50"
                  required
                />
              </div>

              {/* Discount Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-zinc-300">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-[#615fff]/60 text-white font-semibold text-base focus:outline-none"
                  >
                    <option value="fixed">Fixed Cash ($)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-zinc-300">
                    {discountType === 'percentage' ? 'Percent Value (%)' : 'Dollar Value ($)'}
                  </label>
                  <input
                    type="number"
                    placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 15.00'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value === '' ? '' : Number(e.target.value))}
                    min="0"
                    step="any"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-[#615fff]/60 text-white font-semibold text-base focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Advanced Limits Group */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-zinc-300">Max Limit Uses</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value === '' ? '' : Number(e.target.value))}
                    min="1"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-[#615fff]/60 text-white font-semibold text-base focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-base font-bold text-zinc-300">Expiry Date</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-[#615fff]/60 text-white font-semibold text-base focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 accent-[#615fff] rounded cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-base font-bold text-zinc-300 cursor-pointer select-none">
                  Enable coupon immediately
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/60 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-base transition-all cursor-pointer select-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-all cursor-pointer select-none flex items-center gap-2"
                >
                  <FiCheck className="h-5 w-5" />
                  {editingCoupon ? 'Apply Changes' : 'Generate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
