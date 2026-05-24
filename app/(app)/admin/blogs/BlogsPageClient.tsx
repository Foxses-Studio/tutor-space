'use client'

import React, { useState } from 'react'
import { FiPlus, FiEdit, FiTrash2, FiFileText, FiX, FiSave, FiUploadCloud } from 'react-icons/fi'
import Swal from 'sweetalert2'
import RichTextEditor from '@/components/RichTextEditor'

interface BlogItem {
  id: string; title: string; content: string
  authorName: string; coverImageUrl?: string; publishedDate?: string
  tags?: Array<{ tag: string }>
}

export default function BlogsPageClient({ initialBlogs }: { initialBlogs: BlogItem[] }) {
  const [blogs, setBlogs] = useState<BlogItem[]>(initialBlogs)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [coverImageId, setCoverImageId] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  function openNew() {
    setEditingId(null); setTitle(''); setContent(''); setTagsInput(''); setCoverImageId(''); setCoverImageUrl(''); setShowForm(true)
  }
  function openEdit(b: BlogItem) {
    setEditingId(b.id); setTitle(b.title); setContent(b.content)
    setTagsInput((b.tags || []).map(t => t.tag).join(', '))
    setCoverImageId(''); setCoverImageUrl(b.coverImageUrl || '')
    setShowForm(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const form = new FormData(); form.append('file', file); form.append('alt', title ? `Cover for ${title}` : '')
    try {
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoverImageId(data.media.id); setCoverImageUrl(data.media.url)
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message, background: '#121829', color: '#fff' })
    } finally { setUploading(false) }
  }

  async function handleSave() {
    if (!title || !content) { Swal.fire({ icon: 'warning', title: 'Title and content required', background: '#121829', color: '#fff' }); return }
    setSaving(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(t => ({ tag: t }))
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body: any = { title, content, tags, coverImage: coverImageId || undefined, publishedDate: new Date().toISOString() }
      if (editingId) body.id = editingId
      const res = await fetch('/api/admin/blogs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (editingId) {
        setBlogs(prev => prev.map(b => b.id === editingId ? { ...b, title, content, coverImageUrl, tags } : b))
      } else {
        setBlogs(prev => [{
          id: data.blog._id, title: data.blog.title, content: data.blog.content,
          authorName: 'You', coverImageUrl, tags: data.blog.tags,
          publishedDate: data.blog.publishedDate,
        }, ...prev])
      }
      Swal.fire({ icon: 'success', title: editingId ? 'Blog Updated' : 'Blog Published', timer: 1300, showConfirmButton: false, background: '#121829', color: '#fff' })
      setShowForm(false)
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, background: '#121829', color: '#fff' })
    } finally { setSaving(false) }
  }

  async function handleDelete(blog: BlogItem) {
    const result = await Swal.fire({ title: `Delete "${blog.title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#121829', color: '#fff' })
    if (!result.isConfirmed) return
    await fetch('/api/admin/blogs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: blog.id }) })
    setBlogs(prev => prev.filter(b => b.id !== blog.id))
  }

  return (
    <div className="px-6 py-8 space-y-6 container mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Blog Posts</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">Publish SEO-rich articles and platform announcements</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer">
          <FiPlus className="h-5 w-5" /> Write New Blog
        </button>
      </div>

      {/* Blog form */}
      {showForm && (
        <div className="bg-[#121829] border border-[#615fff]/30 rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Blog Post' : 'Publish New Blog'}</h2>
            <button onClick={() => setShowForm(false)} className="p-1.5 text-zinc-500 hover:text-white cursor-pointer"><FiX className="h-5 w-5" /></button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-base font-bold text-zinc-300">Blog Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Write an engaging, SEO-friendly title..."
              className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
          </div>
          <RichTextEditor
            label="Content"
            required
            rows={10}
            value={content}
            onChange={setContent}
            placeholder="Write your full blog content here. Use clear paragraphs and structure your content well..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Tags (comma-separated)</label>
              <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. Next.js, MongoDB, Tutorial"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/70 text-white rounded-lg p-3 text-base font-semibold outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-base font-bold text-zinc-300">Cover Image</label>
              {coverImageUrl ? (
                <div className="flex items-center gap-3">
                  <img src={coverImageUrl} alt="Cover" className="h-12 w-20 object-cover rounded border border-zinc-800" />
                  <button onClick={() => { setCoverImageId(''); setCoverImageUrl('') }} className="text-zinc-500 hover:text-red-400 cursor-pointer"><FiX className="h-4.5 w-4.5" /></button>
                </div>
              ) : (
                <label className={`flex items-center gap-2 px-3 py-3 bg-[#070b16] border border-zinc-800 hover:border-[#615fff]/60 rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <FiUploadCloud className="h-5 w-5 text-zinc-500" />
                  <span className="text-base font-semibold text-zinc-500">{uploading ? 'Uploading...' : 'Select cover image'}</span>
                </label>
              )}
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base transition-all cursor-pointer disabled:opacity-50">
            <FiSave className="h-4.5 w-4.5" /> {saving ? 'Publishing...' : editingId ? 'Save Changes' : 'Publish Blog Post'}
          </button>
        </div>
      )}

      {/* Blog grid */}
      {blogs.length === 0 ? (
        <div className="bg-[#121829] border border-zinc-800 rounded-lg p-16 text-center space-y-4">
          <FiFileText className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-base font-semibold text-zinc-500">No blog posts yet. Write your first article above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
              {blog.coverImageUrl && (
                <div className="aspect-[16/7] overflow-hidden">
                  <img src={blog.coverImageUrl} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-white text-xl leading-snug line-clamp-2">{blog.title}</h3>
                <p className="text-base font-semibold text-zinc-450 line-clamp-3 leading-relaxed">{blog.content}</p>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.slice(0, 4).map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#615fff]/10 border border-[#615fff]/20 text-[#a09dff] rounded font-bold text-sm">{t.tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                  <div>
                    <p className="text-sm font-bold text-zinc-500">by {blog.authorName}</p>
                    {blog.publishedDate && (
                      <p className="text-sm font-semibold text-zinc-600">{new Date(blog.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(blog)} className="p-2 rounded bg-[#615fff]/10 hover:bg-[#615fff] border border-[#615fff]/20 text-[#615fff] hover:text-white transition-all cursor-pointer">
                      <FiEdit className="h-4.5 w-4.5" />
                    </button>
                    <button onClick={() => handleDelete(blog)} className="p-2 rounded bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-400 hover:text-white transition-all cursor-pointer">
                      <FiTrash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
