'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CategoryFormProps {
  initialData?: {
    id: string
    name: string
    slug: string
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export default function CategoryFormClient({ initialData }: CategoryFormProps) {
  const router = useRouter()
  const isEditMode = !!initialData

  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [saving, setSaving] = useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!isEditMode) {
      setSlug(slugify(val))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !slug.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Category name and slug are required.',
        background: '#121829',
        color: '#fff',
      })
      return
    }

    setSaving(true)
    try {
      const method = isEditMode ? 'PUT' : 'POST'
      const body = isEditMode ? { id: initialData?.id, name, slug } : { name, slug }

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Category Updated' : 'Category Created',
        text: isEditMode
          ? 'Category has been updated successfully.'
          : 'Category has been created successfully.',
        timer: 1200,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })

      router.push('/admin/categories')
      router.refresh()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to save category.',
        background: '#121829',
        color: '#fff',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Back & Heading panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">
            {isEditMode ? 'Edit Category' : 'New Category'}
          </h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Build and optimize syllabus catalog category classifications
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="px-4 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-350 hover:text-white rounded-lg text-base font-bold transition-colors cursor-pointer"
        >
          Cancel & Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-3">Category Classification</h2>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Web Development"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">URL path suffix (Slug) *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="e.g. web-development"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors font-mono"
              />
            </div>

          </div>
        </div>

        {/* Sidebar settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6">
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-3.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-lg shadow-[#615fff]/20 hover:shadow-[#615fff]/30 transition-all duration-300 cursor-pointer flex items-center justify-center ${
                saving ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving category...</span>
                </div>
              ) : (
                'Save Category'
              )}
            </button>
          </div>
        </div>

      </div>

    </form>
  )
}
