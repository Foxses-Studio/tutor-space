'use client'

import React, { useState, useRef } from 'react'
import { FiUploadCloud, FiImage, FiSearch, FiCopy, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import Swal from 'sweetalert2'

interface MediaItem {
  id: string
  filename: string
  url: string
  alt: string
  mimeType: string
  filesize: number
  width: number | null
  height: number | null
  thumbnailUrl: string
  createdAt: string
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function MediaLibraryClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialMedia)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = mediaItems.filter(m =>
    m.filename.toLowerCase().includes(search.toLowerCase()) ||
    m.alt.toLowerCase().includes(search.toLowerCase())
  )

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)

    const uploaded: MediaItem[] = []
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      try {
        const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (res.ok && data.media) {
          uploaded.push({
            id: data.media.id,
            filename: data.media.filename,
            url: data.media.url,
            alt: data.media.alt,
            mimeType: file.type,
            filesize: file.size,
            width: null,
            height: null,
            thumbnailUrl: data.media.sizes?.thumbnail?.url || data.media.url,
            createdAt: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error('Upload error:', err)
      }
    }

    if (uploaded.length > 0) {
      setMediaItems(prev => [...uploaded, ...prev])
      Swal.fire({
        icon: 'success',
        title: `${uploaded.length} file${uploaded.length > 1 ? 's' : ''} uploaded`,
        timer: 1400,
        showConfirmButton: false,
        background: '#121829',
        color: '#fff',
      })
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleCopyUrl(item: MediaItem) {
    await navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(item: MediaItem) {
    const result = await Swal.fire({
      title: 'Delete this media asset?',
      text: `"${item.filename}" will be removed from the registry. The physical file on disk may need manual cleanup.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete from DB',
      background: '#121829',
      color: '#fff',
    })
    if (!result.isConfirmed) return

    // We'll do a simple DELETE to a general media cleanup endpoint
    // For now remove from local state only (file stays on disk but DB cleaned)
    try {
      const res = await fetch(`/api/admin/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      })
      if (res.ok || res.status === 404) {
        setMediaItems(prev => prev.filter(m => m.id !== item.id))
        if (selected?.id === item.id) setSelected(null)
      }
    } catch {
      // Optimistic UI — remove from view
      setMediaItems(prev => prev.filter(m => m.id !== item.id))
      if (selected?.id === item.id) setSelected(null)
    }
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Media Library</h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            {mediaItems.length} asset{mediaItems.length !== 1 ? 's' : ''} registered — upload, browse and copy URLs
          </p>
        </div>
        <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-md shadow-[#615fff]/20 transition-all cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          <input ref={fileInputRef} type="file" accept="image/*,video/*,application/pdf" multiple onChange={handleUpload} className="hidden" />
          {uploading ? (
            <><div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Uploading...</span></>
          ) : (
            <><FiUploadCloud className="h-5 w-5" /><span>Upload Files</span></>
          )}
        </label>
      </div>

      {/* Search & Dropzone zone */}
      <div className="flex items-center gap-2.5 bg-[#121829] border border-zinc-800 px-4 py-3 rounded-lg focus-within:border-[#615fff]/50 transition-colors">
        <FiSearch className="h-5 w-5 text-zinc-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by filename or alt text..."
          className="bg-transparent border-none outline-none w-full text-base font-semibold text-white placeholder-zinc-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white cursor-pointer shrink-0">
            <FiX className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Media Grid */}
        <div className={`flex-1 min-w-0 ${selected ? 'lg:max-w-[calc(100%-320px)]' : ''}`}>
          {filtered.length === 0 ? (
            <div className="bg-[#121829] border-2 border-dashed border-zinc-800 rounded-lg p-20 text-center space-y-4">
              <FiImage className="h-12 w-12 text-zinc-700 mx-auto" />
              <p className="text-base font-semibold text-zinc-500">
                {search ? 'No assets match your search.' : 'No media assets yet. Upload your first file above.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map(item => {
                const isImg = item.mimeType.startsWith('image/')
                const isSelected = selected?.id === item.id
                const isCopied = copiedId === item.id

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={`group relative cursor-pointer rounded-lg overflow-hidden border transition-all duration-200 ${
                      isSelected
                        ? 'border-[#615fff] shadow-lg shadow-[#615fff]/20 ring-1 ring-[#615fff]/40'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-[#0e1322] flex items-center justify-center overflow-hidden">
                      {isImg ? (
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <FiImage className="h-8 w-8 text-zinc-600 mb-1" />
                          <span className="text-xs font-bold text-zinc-600 uppercase">
                            {item.mimeType.split('/')[1]?.slice(0, 4) || 'file'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quick copy button on hover */}
                    <button
                      onClick={e => { e.stopPropagation(); handleCopyUrl(item) }}
                      title="Copy URL"
                      className="absolute top-1.5 right-1.5 p-1.5 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {isCopied ? <FiCheck className="h-3.5 w-3.5 text-emerald-400" /> : <FiCopy className="h-3.5 w-3.5" />}
                    </button>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#615fff]/10 pointer-events-none" />
                    )}

                    {/* Filename label */}
                    <div className="p-2 bg-[#0e1322]">
                      <p className="text-xs font-bold text-zinc-400 truncate">{item.filename}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail sidebar */}
        {selected && (
          <div className="hidden lg:flex flex-col w-80 shrink-0">
            <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden sticky top-6">
              {/* Preview */}
              <div className="aspect-square bg-[#0e1322] flex items-center justify-center overflow-hidden">
                {selected.mimeType.startsWith('image/') ? (
                  <img src={selected.url} alt={selected.alt} className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiImage className="h-12 w-12 text-zinc-600" />
                    <span className="text-sm font-bold text-zinc-600 uppercase">{selected.mimeType.split('/')[1]}</span>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="p-5 space-y-3 border-t border-zinc-800">
                <div className="flex items-start justify-between">
                  <p className="font-bold text-white text-base leading-snug flex-1 min-w-0 pr-2 break-all">{selected.filename}</p>
                  <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white cursor-pointer shrink-0">
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-2 text-sm font-semibold">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Alt text</span>
                    <span className="text-zinc-300 truncate max-w-[60%] text-right">{selected.alt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Size</span>
                    <span className="text-zinc-300">{formatBytes(selected.filesize)}</span>
                  </div>
                  {selected.width && selected.height && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Dimensions</span>
                      <span className="text-zinc-300">{selected.width} × {selected.height}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Type</span>
                    <span className="text-zinc-300">{selected.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Uploaded</span>
                    <span className="text-zinc-300">
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>

                {/* URL field */}
                <div className="mt-2 space-y-1.5">
                  <p className="text-sm font-bold text-zinc-500">Public URL</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={selected.url}
                      className="flex-1 min-w-0 bg-[#070b16] border border-zinc-800 text-zinc-400 rounded-lg px-3 py-2 text-sm font-semibold outline-none truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(selected)}
                      className="px-3 py-2 rounded-lg bg-[#615fff]/15 hover:bg-[#615fff] border border-[#615fff]/25 hover:border-[#615fff] text-[#615fff] hover:text-white transition-all cursor-pointer shrink-0"
                    >
                      {copiedId === selected.id ? <FiCheck className="h-4.5 w-4.5 text-emerald-400" /> : <FiCopy className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(selected)}
                  className="w-full mt-2 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="h-4.5 w-4.5" />
                  Remove from Library
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
