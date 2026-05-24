'use client'

import React, { useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiHelpCircle, FiX, FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface FAQItem { id: string; question: string; answer: string; order: number; isActive: boolean }

export default function FAQsPageClient({ initialFaqs }: { initialFaqs: FAQItem[] }) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [order, setOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditingId(null); setQuestion(''); setAnswer(''); setOrder(faqs.length + 1); setIsActive(true); setShowForm(true)
  }
  function openEdit(f: FAQItem) {
    setEditingId(f.id); setQuestion(f.question); setAnswer(f.answer); setOrder(f.order); setIsActive(f.isActive); setShowForm(true)
  }

  async function handleSave() {
    if (!question || !answer) { Swal.fire({ icon: 'warning', title: 'Question and answer required', background: '#121829', color: '#fff' }); return }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, question, answer, order, isActive } : { question, answer, order, isActive }
      const res = await fetch('/api/admin/faqs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingId) {
        setFaqs(prev => prev.map(f => f.id === editingId ? { ...f, question, answer, order, isActive } : f))
      } else {
        setFaqs(prev => [...prev, { id: data.faq._id, question: data.faq.question, answer: data.faq.answer, order: data.faq.order, isActive: data.faq.isActive }])
      }
      Swal.fire({ icon: 'success', title: editingId ? 'FAQ Updated' : 'FAQ Created', timer: 1200, showConfirmButton: false, background: '#121829', color: '#fff' })
      setShowForm(false)
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#121829', color: '#fff' })
    } finally { setSaving(false) }
  }

  async function handleDelete(f: FAQItem) {
    const result = await Swal.fire({ title: 'Delete this FAQ?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#121829', color: '#fff' })
    if (!result.isConfirmed) return
    await fetch('/api/admin/faqs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: f.id }) })
    setFaqs(prev => prev.filter(item => item.id !== f.id))
  }

  async function toggleActive(f: FAQItem) {
    const res = await fetch('/api/admin/faqs', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: f.id, isActive: !f.isActive })
    })
    if (res.ok) setFaqs(prev => prev.map(item => item.id === f.id ? { ...item, isActive: !item.isActive } : item))
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">FAQs Management</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">Manage frequently asked questions shown on the landing page</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer">
          <FiPlus className="h-5 w-5" /> New FAQ
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#121829] border border-[#615fff]/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit FAQ' : 'Create FAQ'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-500 hover:text-white cursor-pointer"><FiX className="h-5 w-5" /></button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-base font-bold text-zinc-300">Question *</label>
            <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. How do I access my course after purchase?"
              className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-base font-bold text-zinc-300">Answer *</label>
            <textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Provide a clear, helpful answer..."
              className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Display Order</label>
              <input type="number" min={0} value={order} onChange={e => setOrder(Number(e.target.value))}
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer mb-1">
              <div className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-[#615fff]' : 'bg-zinc-700'}`} onClick={() => setIsActive(!isActive)}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
              <span className="text-base font-bold text-zinc-300">Active on site</span>
            </label>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-all cursor-pointer disabled:opacity-50">
            <FiSave className="h-4.5 w-4.5" /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create FAQ'}
          </button>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-16 text-center space-y-4">
            <FiHelpCircle className="h-10 w-10 text-zinc-700 mx-auto" />
            <p className="text-base font-semibold text-zinc-500">No FAQs created yet.</p>
          </div>
        ) : faqs.map(f => (
          <div key={f.id} className={`bg-[#121829] border rounded-lg p-5 space-y-3 transition-colors ${f.isActive ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="h-7 w-7 rounded bg-[#615fff]/15 border border-[#615fff]/20 flex items-center justify-center font-bold text-[#615fff] text-sm shrink-0 mt-0.5">{f.order}</span>
                <div className="min-w-0">
                  <p className="font-bold text-white text-base leading-snug">{f.question}</p>
                  <p className="text-base font-semibold text-zinc-400 mt-2 leading-relaxed">{f.answer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(f)} title={f.isActive ? 'Deactivate' : 'Activate'}
                  className={`p-2 rounded border transition-all cursor-pointer ${f.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'text-zinc-500 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 hover:text-white'}`}>
                  {f.isActive ? <FiToggleRight className="h-4.5 w-4.5" /> : <FiToggleLeft className="h-4.5 w-4.5" />}
                </button>
                <button onClick={() => openEdit(f)}
                  className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all cursor-pointer">
                  <FiEdit className="h-4.5 w-4.5" />
                </button>
                <button onClick={() => handleDelete(f)}
                  className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all cursor-pointer">
                  <FiTrash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
