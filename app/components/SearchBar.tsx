"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type SearchResult = {
  id: string
  slug: string
  title: string
  subject: string
  simplified150Story: string
  textbookSource: string
}

const SUBJECT_EMOJI: Record<string, string> = { CHEMISTRY: '🧪', PHYSICS: '⚡', BIOLOGY: '🌿' }

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (timer.current) clearTimeout(timer.current)

    if (value.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
        const data = await res.json()
        setResults(data.results || [])
        setTotalCount(data.totalCount || 0)
        setOpen(true)
      } catch { /* ignore */ }
      setLoading(false)
    }, 250)
  }

  return (
    <div ref={ref} className="relative w-full md:w-72">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true) }}
          placeholder="Search topics..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A1A] border border-[#22254F] text-[#FAF9F6] text-sm font-medium placeholder:text-[#8888AA] focus:outline-none focus:border-[#8CE600] focus:ring-1 focus:ring-[#8CE600]/30 transition-all"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-[#8CE600]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12142D] border border-[#22254F] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="max-h-80 overflow-y-auto">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/topics/${r.slug}`}
                onClick={() => { setOpen(false); setQuery('') }}
                className="flex items-start gap-3 p-4 hover:bg-[#8CE600]/5 border-b border-[#22254F] last:border-0 transition-colors group"
              >
                <span className="text-xl mt-0.5">{SUBJECT_EMOJI[r.subject] || '🔬'}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#FAF9F6] text-sm group-hover:text-[#8CE600] transition-colors truncate">
                    {r.title}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#8888AA] mt-0.5">
                    {r.textbookSource}
                  </div>
                  <p className="text-xs text-[#8888AA] mt-1 line-clamp-1">{r.simplified150Story}</p>
                </div>
              </Link>
            ))}
          </div>
          {totalCount > results.length && (
            <div className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-[#8888AA] bg-[#090A1A]">
              {totalCount - results.length} more results — refine your search
            </div>
          )}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12142D] border border-[#22254F] rounded-2xl shadow-2xl shadow-black/50 p-6 text-center z-50">
          <span className="text-2xl block mb-2">🔍</span>
          <p className="text-[#8888AA] text-sm font-medium">No topics found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
