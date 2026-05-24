'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiTrash2, FiUploadCloud, FiCheck, FiX, FiInfo } from 'react-icons/fi'
import Swal from 'sweetalert2'
import RichTextEditor from '@/components/RichTextEditor'

interface CategoryOption {
  id: string
  name: string
}

interface InstructorOption {
  id: string
  name: string
  email: string
}

interface CourseFormProps {
  initialData?: any
  categories: CategoryOption[]
  instructors: InstructorOption[]
  user: {
    id: string
    role: 'admin' | 'staff' | 'instructor'
  }
}

export default function CourseFormClient({
  initialData,
  categories,
  instructors,
  user,
}: CourseFormProps) {
  const router = useRouter()
  const isEditMode = !!initialData

  // State parameters matching course schema
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [summary, setSummary] = useState(initialData?.summary || '')
  const [description, setDescription] = useState(
    typeof initialData?.description === 'string'
      ? initialData.description
      : typeof initialData?.description === 'object' && initialData?.description !== null
      ? JSON.stringify(initialData.description) // legacy fallback
      : ''
  )
  const [price, setPrice] = useState(initialData?.price || 0)
  const [duration, setDuration] = useState(initialData?.duration || '')
  const [level, setLevel] = useState<string>(initialData?.level || 'all')
  const [category, setCategory] = useState(
    initialData?.category?._id || initialData?.category || ''
  )
  const [instructor, setInstructor] = useState(
    initialData?.instructor?._id || initialData?.instructor || (user.role === 'instructor' ? user.id : '')
  )
  const [status, setStatus] = useState<string>(initialData?.status || 'draft')

  // Thumbnail state (either Mongoose ID or populated Media doc)
  const [thumbnailId, setThumbnailId] = useState<string>(
    initialData?.thumbnail?._id || initialData?.thumbnail || ''
  )
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    initialData?.thumbnail?.url || ''
  )
  const [thumbnailAlt, setThumbnailAlt] = useState<string>(
    initialData?.thumbnail?.alt || ''
  )
  const [uploadingImage, setUploadingImage] = useState(false)

  // Outcomes & Prerequisites Lists
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<Array<{ outcome: string }>>(
    initialData?.whatYouWillLearn || []
  )
  const [requirements, setRequirements] = useState<Array<{ requirement: string }>>(
    initialData?.requirements || []
  )

  // SEO accordion
  const [metaTitle, setMetaTitle] = useState(initialData?.seo?.metaTitle || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.seo?.metaDescription || '')
  const [keywords, setKeywords] = useState(initialData?.seo?.keywords || '')
  const [seoOpen, setSeoOpen] = useState(false)

  // Slug states
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dynamic host detection state
  const [domainOrigin, setDomainOrigin] = useState('tutorspace.com')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomainOrigin(window.location.host)
    }
  }, [])

  // Automatic title-to-slug generator
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, '') // Trim - from end
  }

  // Handle title change and generate slug in creation mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!isEditMode) {
      setSlug(slugify(val))
    }
  }

  // Asynchronous Slug Check
  useEffect(() => {
    if (!slug) {
      setSlugStatus('idle')
      return
    }

    const delayDebounce = setTimeout(async () => {
      setSlugChecking(true)
      try {
        const url = `/api/admin/courses/check-slug?slug=${slug}${
          isEditMode ? `&excludeId=${initialData._id}` : ''
        }`
        const res = await fetch(url)
        const data = await res.json()

        if (data.available) {
          setSlugStatus('valid')
        } else {
          setSlugStatus('invalid')
        }
      } catch (err) {
        console.error('Slug validation failed:', err)
      } finally {
        setSlugChecking(false)
      }
    }, 500) // Debounce

    return () => clearTimeout(delayDebounce)
  }, [slug, isEditMode, initialData])

  // Dynamic Lists handlers
  const handleAddOutcome = () => {
    setWhatYouWillLearn([...whatYouWillLearn, { outcome: '' }])
  }

  const handleOutcomeChange = (index: number, val: string) => {
    const updated = [...whatYouWillLearn]
    updated[index].outcome = val
    setWhatYouWillLearn(updated)
  }

  const handleRemoveOutcome = (index: number) => {
    setWhatYouWillLearn(whatYouWillLearn.filter((_, i) => i !== index))
  }

  const handleAddRequirement = () => {
    setRequirements([...requirements, { requirement: '' }])
  }

  const handleRequirementChange = (index: number, val: string) => {
    const updated = [...requirements]
    updated[index].requirement = val
    setRequirements(updated)
  }

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  // Direct Mongoose Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', title ? `Cover for ${title}` : '')

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image.')
      }

      setThumbnailId(data.media.id)
      setThumbnailUrl(data.media.url)
      setThumbnailAlt(data.media.alt)

      Swal.fire({
        icon: 'success',
        title: 'Image Uploaded',
        text: 'Course cover photo processed and registered.',
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#ffffff',
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Could not upload media.',
        background: '#121829',
        color: '#ffffff',
      })
    } finally {
      setUploadingImage(false)
    }
  }

  // Form Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !slug || !summary || !description || !category || !thumbnailId) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please complete all required fields, including the Cover Image thumbnail.',
        background: '#121829',
        color: '#ffffff',
      })
      return
    }

    if (slugStatus === 'invalid') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Slug',
        text: 'This course URL slug is already taken. Please provide a unique one.',
        background: '#121829',
        color: '#ffffff',
      })
      return
    }

    setIsSubmitting(true)

    const payload = {
      title,
      slug,
      summary,
      description,
      price: Number(price),
      thumbnail: thumbnailId,
      category,
      instructor: user.role === 'instructor' ? user.id : instructor,
      status,
      duration,
      level,
      whatYouWillLearn: whatYouWillLearn.filter((item) => item.outcome.trim() !== ''),
      requirements: requirements.filter((item) => item.requirement.trim() !== ''),
      seo: {
        metaTitle,
        metaDescription,
        keywords,
      },
    }

    try {
      const url = isEditMode ? `/api/admin/courses/${initialData._id}` : `/api/admin/courses`
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save course.')
      }

      await Swal.fire({
        icon: 'success',
        title: isEditMode ? 'Course Updated' : 'Course Created',
        text: isEditMode ? 'Syllabus parameters successfully edited.' : 'New curriculum published.',
        timer: 1500,
        showConfirmButton: false,
        background: '#121829',
        color: '#ffffff',
      })

      router.push('/admin/courses')
      router.refresh()
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Operation Failed',
        text: err.message || 'Could not complete the write request.',
        background: '#121829',
        color: '#ffffff',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-6 py-8 space-y-6">
      
      {/* Back & Heading panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800/40">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">
            {isEditMode ? `Edit Course: ${initialData.title}` : 'Publish New Course'}
          </h1>
          <p className="text-base font-semibold text-zinc-450 mt-1">
            Build and optimize platform syllabus programs
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/courses')}
          className="px-4 py-2 bg-zinc-850 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 hover:text-white rounded-lg text-base font-bold transition-colors cursor-pointer"
        >
          Cancel & Back
        </button>
      </div>

      {/* Grid of inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (MAIN METADATA) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main info card */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-5">
            <h2 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-3">Course Parameters</h2>

            {/* Title field */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Course Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Master Next.js 16 and Mongoose Database Engineering"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>

            {/* Slug URL selector */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">URL path suffix (Slug) *</label>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-semibold select-none hidden sm:inline">{domainOrigin}/courses/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="master-nextjs-16"
                  className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none flex-1 transition-colors"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold">
                {slugChecking ? (
                  <span className="text-zinc-400">Checking URL availability...</span>
                ) : slugStatus === 'valid' ? (
                  <span className="text-emerald-400 flex items-center gap-1"><FiCheck /> Unique slug registered. URL path suffix is available!</span>
                ) : slugStatus === 'invalid' ? (
                  <span className="text-rose-400 flex items-center gap-1"><FiX /> Slug is taken! This path will overwrite or conflict.</span>
                ) : null}
              </div>
            </div>

            {/* Summary field */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Short Summary *</label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Give a quick, captivating 1-2 sentence sell for this syllabus catalog."
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors resize-none"
              />
            </div>

            {/* Detailed Description */}
            <RichTextEditor
              label="Detailed Description"
              required
              rows={8}
              value={description}
              onChange={setDescription}
              placeholder="Write an absolute premium, highly structured syllabus overview detailing modules, targets, tools, and schedules..."
            />

          </div>

          {/* Outcomes list card */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-xl font-bold text-white tracking-tight">What You Will Learn</h2>
              <button
                type="button"
                onClick={handleAddOutcome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#615fff]/15 hover:bg-[#615fff]/25 text-[#615fff] border border-[#615fff]/20 rounded-lg text-base font-bold transition-colors cursor-pointer"
              >
                <FiPlus className="h-4.5 w-4.5" /> Add Outcome
              </button>
            </div>

            {whatYouWillLearn.length === 0 ? (
              <p className="text-base font-semibold text-zinc-550 py-2">
                No outcomes defined yet. Define what achievements students gain.
              </p>
            ) : (
              <div className="space-y-2.5">
                {whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      value={item.outcome}
                      onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                      placeholder={`e.g. Master React 19 hooks and async Server Actions`}
                      className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none flex-1 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOutcome(idx)}
                      className="p-3 text-zinc-500 hover:text-red-400 bg-[#070b16] border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements list card */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
              <h2 className="text-xl font-bold text-white tracking-tight">Syllabus Requirements</h2>
              <button
                type="button"
                onClick={handleAddRequirement}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#615fff]/15 hover:bg-[#615fff]/25 text-[#615fff] border border-[#615fff]/20 rounded-lg text-base font-bold transition-colors cursor-pointer"
              >
                <FiPlus className="h-4.5 w-4.5" /> Add Requirement
              </button>
            </div>

            {requirements.length === 0 ? (
              <p className="text-base font-semibold text-zinc-550 py-2">
                No prerequisites defined yet. Specify baseline developer competencies.
              </p>
            ) : (
              <div className="space-y-2.5">
                {requirements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      required
                      value={item.requirement}
                      onChange={(e) => handleRequirementChange(idx, e.target.value)}
                      placeholder={`e.g. Fundamental knowledge of JavaScript (ES6)`}
                      className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none flex-1 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-3 text-zinc-500 hover:text-red-400 bg-[#070b16] border border-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Accordion block */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full px-6 py-4 flex items-center justify-between font-bold text-white text-xl hover:bg-zinc-800/10 transition-colors select-none"
            >
              <span>Search Engine Optimization (SEO) parameters</span>
              <span className="text-zinc-500">{seoOpen ? '▲' : '▼'}</span>
            </button>

            {seoOpen && (
              <div className="p-6 border-t border-zinc-850 space-y-4.5 bg-[#0e1322]">
                <div className="flex flex-col gap-2">
                  <label className="text-base font-bold text-zinc-300">SEO Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Search snippet header title"
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-bold text-zinc-300">SEO Meta Description</label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Search snippet summary block (160 characters max recommendation)"
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-base font-bold text-zinc-300">Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Next.js, Mongoose, MongoDB, Course"
                    className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (MEDIA, STATUS, PRICING, SYSTEM INSTRUCTORS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Thumbnail media box */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-2.5">Course Thumbnail Cover</h3>
            
            {thumbnailUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800 bg-[#070b16] flex items-center justify-center">
                  <img src={thumbnailUrl} alt={thumbnailAlt} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailId('')
                      setThumbnailUrl('')
                      setThumbnailAlt('')
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded bg-black/70 hover:bg-red-650 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Remove cover"
                  >
                    <FiX className="h-4.5 w-4.5" />
                  </button>
                </div>
                <div className="text-xs text-zinc-500 font-semibold">
                  <span className="font-bold text-zinc-400">Alt tag:</span> &ldquo;{thumbnailAlt}&rdquo;
                </div>
              </div>
            ) : (
              <div className="relative">
                <label className={`flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-[#615fff]/60 rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  uploadingImage ? 'pointer-events-none opacity-50' : ''
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-2 border-[#615fff] border-t-transparent rounded-full animate-spin" />
                      <p className="text-base font-semibold text-zinc-400">Processing cover with Sharp...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FiUploadCloud className="h-10 w-10 text-zinc-550 mx-auto" />
                      <p className="text-base font-bold text-white">Select Cover Photo</p>
                      <p className="text-sm font-semibold text-zinc-500">Supports PNG, JPEG, WEBP. Resizes automatically.</p>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Pricing & Status controls */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-2.5">Finance & Status</h3>

            {/* Price field */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Price (BDT) *</label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="4500"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>

            {/* Status Select */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Catalog Visibility Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                <option value="draft">Draft (Restricted to Staff/Admin)</option>
                <option value="published">Published (Render on Public Landing Page)</option>
              </select>
            </div>
          </div>

          {/* Categories & Classifications */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight border-b border-zinc-850 pb-2.5">Academic Scope</h3>

            {/* Categories Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Course Category *</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructors Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Lead Mentor (Instructor) *</label>
              {user.role === 'instructor' ? (
                <div className="bg-[#070b16] border border-zinc-800 text-zinc-400 rounded-lg p-3 text-base font-semibold select-none flex items-center gap-2">
                  <FiInfo className="text-[#615fff]" />
                  <span>
                    {instructors.find((ins) => ins.id === user.id)?.name || 'You (Assigned Mentor)'}
                  </span>
                </div>
              ) : (
                <select
                  required
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
                >
                  <option value="">-- Assign Instructor --</option>
                  {instructors.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name} ({ins.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Level Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Audience Tier Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="bg-[#070b16] border border-zinc-800 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Content Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-base font-bold text-zinc-300">Course Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 14 Hours of video lectures"
                className="bg-[#070b16] border border-zinc-800 focus:border-[#615fff]/80 focus:ring-1 focus:ring-[#615fff]/80 text-white rounded-lg p-3 text-base font-semibold outline-none w-full transition-colors"
              />
            </div>
          </div>

          {/* Submit Action block */}
          <div className="bg-[#121829] border border-zinc-800 rounded-lg p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-lg bg-[#615fff] hover:bg-[#5248e8] text-white font-bold text-base shadow-lg shadow-[#615fff]/20 hover:shadow-[#615fff]/30 transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isSubmitting ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving course to Mongoose...</span>
                </div>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Publish Course Cover & Metadata'
              )}
            </button>
          </div>

        </div>

      </div>

    </form>
  )
}
