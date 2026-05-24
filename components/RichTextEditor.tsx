'use client'

import React, { useState, useRef, useEffect } from 'react'
import { FiEye, FiEdit3, FiBold, FiItalic, FiCode, FiList, FiChevronsRight } from 'react-icons/fi'

interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
  label?: string
  required?: boolean
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content here...',
  rows = 8,
  label,
  required = false
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Selection wrapping helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    const replacement = prefix + (selectedText || 'text') + suffix
    const newValue = text.substring(0, start) + replacement + text.substring(end)

    onChange(newValue)

    // Focus and select the modified text range
    setTimeout(() => {
      textarea.focus()
      const offsetStart = start + prefix.length
      const offsetEnd = offsetStart + (selectedText || 'text').length
      textarea.setSelectionRange(offsetStart, offsetEnd)
    }, 10)
  }

  // Basic markdown to HTML helper for preview rendering
  const renderMarkdown = (md: string) => {
    if (!md) return '<p class="text-zinc-550 italic">Nothing to preview yet...</p>'

    let html = md
      // Escaping HTML characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code inline
      .replace(/`(.*?)`/g, '<code class="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Headers
      .replace(/^### (.*?)$/gm, '<h4 class="text-lg font-bold text-white mt-4 mb-2">$1</h4>')
      .replace(/^## (.*?)$/gm, '<h3 class="text-xl font-bold text-white mt-5 mb-2.5">$1</h3>')
      .replace(/^# (.*?)$/gm, '<h2 class="text-2xl font-bold text-white mt-6 mb-3">$1</h2>')
      // Blockquotes
      .replace(/^&gt; (.*?)$/gm, '<blockquote class="border-l-4 border-[#615fff]/60 pl-4 py-1 my-3 text-zinc-300 italic bg-zinc-950/20 rounded-r">$1</blockquote>')
      // Lists
      .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-zinc-300">$1</li>')
      // Paragraphs (newlines to br or p)
      .split('\n')
      .map(line => {
        if (line.trim().startsWith('<h') || line.trim().startsWith('<blockquote') || line.trim().startsWith('<li')) {
          return line
        }
        return line.trim() ? `<p class="mb-3 text-zinc-300 leading-relaxed">${line}</p>` : ''
      })
      .join('\n')

    return html
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-base font-bold text-zinc-300 flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-[#070b16] focus-within:border-[#615fff]/60 transition-colors">
        
        {/* Editor Toolbar Header */}
        <div className="bg-[#121829] border-b border-zinc-850 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
          
          {/* Format tools */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer"
              title="Bold"
              disabled={activeTab === 'preview'}
            >
              <FiBold className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer"
              title="Italic"
              disabled={activeTab === 'preview'}
            >
              <FiItalic className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer"
              title="Inline Code"
              disabled={activeTab === 'preview'}
            >
              <FiCode className="h-4.5 w-4.5" />
            </button>
            <span className="h-5 w-px bg-zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('## ')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer flex items-center justify-center h-8.5 w-8.5"
              title="Heading 2"
              disabled={activeTab === 'preview'}
            >
              <span className="font-mono text-sm font-bold tracking-tighter select-none leading-none">H2</span>
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer"
              title="Bullet List"
              disabled={activeTab === 'preview'}
            >
              <FiList className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('&gt; ')}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/40 rounded transition-colors cursor-pointer"
              title="Blockquote"
              disabled={activeTab === 'preview'}
            >
              <FiChevronsRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Toggle View Tabs */}
          <div className="flex bg-[#070b16] border border-zinc-800 p-0.5 rounded-lg select-none">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-[#615fff] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FiEdit3 className="h-3.5 w-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#615fff] text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FiEye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          </div>

        </div>

        {/* Editor Area */}
        <div className="relative">
          {activeTab === 'write' ? (
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              required={required}
              className="bg-transparent border-none outline-none w-full p-4 text-base font-semibold text-white leading-relaxed placeholder-zinc-550 resize-y"
            />
          ) : (
            <div
              className="w-full p-4 text-base font-semibold overflow-y-auto bg-[#070b16]/40 leading-relaxed font-sans prose prose-invert select-text"
              style={{ minHeight: rows * 26 + 32 }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
            />
          )}
        </div>

      </div>
    </div>
  )
}
