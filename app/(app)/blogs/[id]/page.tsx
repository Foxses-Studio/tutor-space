import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connectToDatabase } from '@/lib/db/mongodb'
import { Blog } from '@/lib/db/models/Blog'
import { FiCalendar, FiUser, FiClock, FiArrowLeft, FiTag } from 'react-icons/fi'
import ShareButton from '@/components/ShareButton'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ id: string }>
}

// Format date helper: "14 Jan 2026"
function formatDate(dateStr?: Date | string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Calculate reading time
function calculateReadingTime(htmlContent: string): number {
  if (!htmlContent) return 1
  const words = htmlContent.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).length
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  await connectToDatabase()
  
  try {
    const blog = await Blog.findById(id).lean()
    if (!blog) return { title: 'Article Not Found - Tutor Space' }
    
    return {
      title: `${blog.title} - Tutor Space`,
      description: blog.seo?.metaDescription || `${blog.title} educational article on Tutor Space.`,
      keywords: blog.seo?.keywords || '',
    }
  } catch (err) {
    return { title: 'Blog Details - Tutor Space' }
  }
}

// ─── Page Component ────────────────────────────────────────────────────────────

export default async function BlogDetailsPage({ params }: Props) {
  const { id } = await params
  await connectToDatabase()

  let blogDoc: any = null
  try {
    blogDoc = await Blog.findById(id)
      .populate({
        path: 'author',
        select: 'name profilePic role',
        populate: { path: 'profilePic', select: 'url' }
      })
      .populate({ path: 'coverImage', select: 'url alt' })
      .lean()
  } catch (err) {
    // Cast or query error leads to 404
  }

  if (!blogDoc) {
    notFound()
  }

  // Fetch 3 recommended/other articles
  const recommendedDocs = await Blog.find({ _id: { $ne: id } })
    .populate({ path: 'author', select: 'name' })
    .populate({ path: 'coverImage', select: 'url' })
    .sort({ publishedDate: -1, createdAt: -1 })
    .limit(3)
    .lean()

  const recommendedBlogs = JSON.parse(JSON.stringify(
    (recommendedDocs as any[]).map(b => ({
      id: b._id.toString(),
      title: b.title || '',
      content: b.content || '',
      authorName: b.author?.name || 'Unknown',
      coverImageUrl: b.coverImage?.url || '',
      publishedDate: b.publishedDate ? b.publishedDate.toISOString() : '',
    }))
  ))

  const formattedDate = formatDate(blogDoc.publishedDate || blogDoc.createdAt)
  const readingTime = calculateReadingTime(blogDoc.content)
  const authorPicUrl = blogDoc.author?.profilePic?.url || ''

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0A163A] font-sans relative overflow-hidden pt-28 pb-20">
      
      {/* Dynamic atmospheric ambient glows */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#615fff]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-bold text-zinc-500 hover:text-[#615fff] transition-colors"
          >
            <FiArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Knowledge Hub</span>
          </Link>
        </div>

        {/* ── Header Details ── */}
        <div className="max-w-4xl mb-12 space-y-6">
          {/* Article Category / Tags */}
          {blogDoc.tags && blogDoc.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blogDoc.tags.map((t: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#615fff]/10 text-[#615fff] font-bold text-xs rounded-lg uppercase tracking-wider"
                >
                  #{typeof t === 'string' ? t : (t.tag || '')}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-500 font-bold text-xs rounded-lg uppercase tracking-wider">
              <FiTag className="h-3.5 w-3.5" />
              Article
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.15]">
            {blogDoc.title}
          </h1>

          {/* Author Meta Details */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-3">
              {authorPicUrl ? (
                <img
                  src={authorPicUrl}
                  alt={blogDoc.author?.name}
                  className="h-9 w-9 rounded-full object-cover shrink-0 border border-zinc-200"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[#615fff]/10 flex items-center justify-center text-[#615fff] font-bold uppercase text-sm shrink-0">
                  {blogDoc.author?.name?.[0] || 'T'}
                </div>
              )}
              <div className="text-sm">
                <p className="text-zinc-900 font-bold leading-none">{blogDoc.author?.name || 'Unknown Author'}</p>
                <p className="text-zinc-400 font-semibold text-xs mt-0.5 uppercase tracking-wide">{blogDoc.author?.role || 'Staff'}</p>
              </div>
            </div>

            <span className="h-4 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-4 text-sm font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <FiCalendar className="h-4 w-4 text-zinc-400" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock className="h-4 w-4 text-zinc-400" />
                {readingTime} min read
              </span>
            </div>
          </div>
        </div>

        {/* ── Widescreen Banner ── */}
        <div className="aspect-[21/9] w-full overflow-hidden bg-zinc-50 rounded-lg mb-16 shadow-md border border-zinc-150">
          {blogDoc.coverImage?.url ? (
            <img
              src={blogDoc.coverImage.url}
              alt={blogDoc.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
              <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2v3m2 3V10m0 0l-3-3m3 3h-3" />
              </svg>
            </div>
          )}
        </div>

        {/* ── Main content grid layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main content body (Left column) */}
          <main className="lg:col-span-8 space-y-8">
            <div
              className="prose max-w-none text-base font-medium text-zinc-700 leading-relaxed space-y-6 blog-details-html pb-12 border-b border-zinc-100"
              dangerouslySetInnerHTML={{ __html: blogDoc.content }}
            />
            
            {/* Sharing Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <span className="text-base font-bold text-zinc-900">
                Enjoyed the article? Share it with others!
              </span>
              <div className="flex gap-2">
                <ShareButton />
              </div>
            </div>
          </main>

          {/* Sidebar Area (Right column) */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Author Profile card */}
            <div className="bg-[#f8fafc] border border-zinc-150 rounded-lg p-6 space-y-4">
              <h3 className="text-base font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-200">
                About The Author
              </h3>
              <div className="flex items-center gap-3">
                {authorPicUrl ? (
                  <img
                    src={authorPicUrl}
                    alt={blogDoc.author?.name}
                    className="h-12 w-12 rounded-full object-cover border border-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#615fff]/10 flex items-center justify-center text-[#615fff] font-bold uppercase shrink-0">
                    {blogDoc.author?.name?.[0] || 'T'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-zinc-900 leading-tight">{blogDoc.author?.name || 'Tutor Space Expert'}</h4>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">{blogDoc.author?.role || 'Contributor'}</p>
                </div>
              </div>
              <p className="text-base font-medium text-zinc-550 leading-relaxed">
                Tutor Space educator dedicated to delivering top-tier learning resources, code tutorials, and developmental practices to help software engineers thrive.
              </p>
              <Link
                href="/courses"
                className="block text-center w-full py-2.5 bg-[#615fff]/10 hover:bg-[#615fff] text-[#615fff] hover:text-white font-bold text-sm rounded-lg transition-colors"
              >
                Browse My Courses
              </Link>
            </div>

            {/* Recommended Articles Widget */}
            {recommendedBlogs.length > 0 && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-200">
                  Recommended Reads
                </h3>
                
                <div className="space-y-5">
                  {recommendedBlogs.map((rec: any) => (
                    <Link
                      key={rec.id}
                      href={`/blogs/${rec.id}`}
                      className="group flex gap-4 items-start cursor-pointer block"
                    >
                      <div className="h-16 w-20 rounded-lg overflow-hidden bg-zinc-55 border border-zinc-150 shrink-0">
                        {rec.coverImageUrl ? (
                          <img
                            src={rec.coverImageUrl}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-300 bg-zinc-100">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2v3m2 3V10m0 0l-3-3m3 3h-3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 space-y-1">
                        <h4 className="font-bold text-zinc-900 leading-snug text-sm group-hover:text-[#615fff] transition-colors line-clamp-2" title={rec.title}>
                          {rec.title}
                        </h4>
                        <p className="text-xs font-semibold text-zinc-400">
                          {formatDate(rec.publishedDate)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>
        </div>

      </div>

      {/* Styled rich-text HTML styles inside article */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-details-html h1, .blog-details-html h2, .blog-details-html h3 {
          font-weight: 700;
          color: #0f172a;
          margin-top: 2rem;
          margin-bottom: 0.85rem;
          letter-spacing: -0.025em;
        }
        .blog-details-html h1 { font-size: 1.65rem; line-height: 1.3; }
        .blog-details-html h2 { font-size: 1.45rem; line-height: 1.35; }
        .blog-details-html h3 { font-size: 1.25rem; line-height: 1.4; }
        .blog-details-html p {
          margin-bottom: 1.25rem;
          font-size: 1rem;
          line-height: 1.75;
          color: #334155;
        }
        .blog-details-html strong {
          font-weight: 700;
          color: #0f172a;
        }
        .blog-details-html ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
        }
        .blog-details-html ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 1.25rem;
        }
        .blog-details-html li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }
        .blog-details-html blockquote {
          border-left: 4px solid #615fff;
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          color: #475569;
          font-style: italic;
          background-color: #f8fafc;
          border-top-right-radius: 6px;
          border-bottom-right-radius: 6px;
        }
        .blog-details-html pre {
          background-color: #0f172a;
          color: #f8fafc;
          border-radius: 8px;
          padding: 1.25rem;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.9em;
          margin: 1.5rem 0;
        }
        .blog-details-html code {
          background-color: #f1f5f9;
          color: #ef4444;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.9em;
        }
        .blog-details-html pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
        }
        .blog-details-html table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .blog-details-html th {
          background-color: #f8fafc;
          font-weight: 700;
          padding: 0.85rem 1.15rem;
          border: 1px solid #e2e8f0;
          text-align: left;
        }
        .blog-details-html td {
          padding: 0.85rem 1.15rem;
          border: 1px solid #e2e8f0;
        }
        .blog-details-html tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .blog-details-html img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .blog-details-html iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 8px;
          margin: 1.5rem 0;
          border: none;
        }
      `}} />
    </div>
  )
}
