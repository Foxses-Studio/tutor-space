'use client'

import React, { useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiBookmark, FiX, FiSave } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface CategoryItem { id: string; name: string; slug: string }

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
}

export default function CategoriesPageClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [saving, setSaving] = useState(false)

  function openNew() { setEditingId(null); setName(''); setSlug(''); setShowForm(true) }
  function openEdit(cat: CategoryItem) { setEditingId(cat.id); setName(cat.name); setSlug(cat.slug); setShowForm(true) }

  async function handleSave() {
    if (!name || !slug) { Swal.fire({ icon: 'warning', title: 'Name and slug required', background: '#121829', color: '#fff' }); return }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, name, slug } : { name, slug }
      const res = await fetch('/api/admin/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingId) {
        setCategories(prev => prev.map(c => c.id === editingId ? { ...c, name, slug } : c))
      } else {
        setCategories(prev => [...prev, { id: data.category._id, name: data.category.name, slug: data.category.slug }])
      }
      Swal.fire({ icon: 'success', title: editingId ? 'Updated' : 'Category Created', timer: 1200, showConfirmButton: false, background: '#121829', color: '#fff' })
      setShowForm(false)
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#121829', color: '#fff' })
    } finally { setSaving(false) }
  }

  async function handleDelete(cat: CategoryItem) {
    const result = await Swal.fire({ title: `Delete "${cat.name}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#121829', color: '#fff' })
    if (!result.isConfirmed) return
    const res = await fetch('/api/admin/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: cat.id }) })
    if (res.ok) setCategories(prev => prev.filter(c => c.id !== cat.id))
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Course Categories</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">Group and organise your course catalog tracks</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer">
          <FiPlus className="h-5 w-5" /> New Category
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="bg-[#121829] border border-[#615fff]/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Category' : 'Create Category'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-500 hover:text-white cursor-pointer"><FiX className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Category Name *</label>
              <input type="text" value={name}
                onChange={e => { setName(e.target.value); if (!editingId) setSlug(slugify(e.target.value)) }}
                placeholder="e.g. Web Development"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">URL Slug *</label>
              <input type="text" value={slug} onChange={e => setSlug(slugify(e.target.value))}
                placeholder="e.g. web-development"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-all cursor-pointer disabled:opacity-50">
            <FiSave className="h-4.5 w-4.5" /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FiBookmark className="h-10 w-10 text-zinc-700 mx-auto" />
            <p className="text-base font-semibold text-zinc-500">No categories yet. Create your first category above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead>
                <tr className="bg-[#0b0e17] border-b border-zinc-800/40 text-zinc-450 font-bold text-sm uppercase tracking-wider">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-[#152347]/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#615fff]/15 border border-[#615fff]/20 flex items-center justify-center shrink-0">
                          <FiBookmark className="h-4 w-4 text-[#615fff]" />
                        </div>
                        <span className="font-bold text-white text-base">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-400 text-base font-mono">{cat.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button onClick={() => openEdit(cat)}
                          className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all cursor-pointer">
                          <FiEdit className="h-4.5 w-4.5" />
                        </button>
                        <button onClick={() => handleDelete(cat)}
                          className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all cursor-pointer">
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
    </div>
  )
}
