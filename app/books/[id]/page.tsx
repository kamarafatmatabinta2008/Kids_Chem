"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const BOOKS: Record<number, { title: string; author: string; subject: string; color: string; emoji: string }> = {
  1: { title: "The Wonders of Biology", author: "Dr. Sarah J. Maas", subject: "BIOLOGY", color: "from-emerald-500 to-green-600", emoji: "🌿" },
  2: { title: "Chemistry Magic", author: "Prof. Robert Boyle Jr.", subject: "CHEMISTRY", color: "from-purple-500 to-pink-600", emoji: "🧪" },
  3: { title: "Physics for Future Geniuses", author: "Dr. Lisa R. Einstein", subject: "PHYSICS", color: "from-blue-500 to-cyan-500", emoji: "⚡" },
  4: { title: "Akiola's Animal Kingdom", author: "Akiola Science Press", subject: "BIOLOGY", color: "from-emerald-600 to-teal-500", emoji: "🌿" },
  5: { title: "Akiola's Periodic Adventure", author: "Akiola Science Press", subject: "CHEMISTRY", color: "from-purple-600 to-indigo-500", emoji: "🧪" },
  6: { title: "Akiola's Energy Lab", author: "Akiola Science Press", subject: "PHYSICS", color: "from-blue-600 to-sky-500", emoji: "⚡" },
  7: { title: "Microbe Adventures", author: "Dr. Antonie L.", subject: "BIOLOGY", color: "from-green-500 to-lime-500", emoji: "🌿" },
  8: { title: "Reaction Revolution", author: "Prof. Marie C.", subject: "CHEMISTRY", color: "from-pink-500 to-rose-500", emoji: "🧪" },
  9: { title: "Space & Beyond", author: "Dr. Carl S. Jr.", subject: "PHYSICS", color: "from-indigo-500 to-violet-500", emoji: "⚡" },
}

type TopicContent = {
  id: string
  title: string
  slug: string
  rawTextbookExcerpt: string
  simplified150Story: string
  textbookSource: string
  subject: string
}

export default function BookReaderPage() {
  const { id } = useParams<{ id: string }>()
  const bookId = Number(id)
  const book = BOOKS[bookId]

  const [topics, setTopics] = useState<TopicContent[]>([])
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [view, setView] = useState<'textbook' | 'simplified'>('simplified')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!book) return
    fetch(`/api/book-content?bookId=${bookId}`)
      .then(r => r.json())
      .then(data => {
        if (data.topics) {
          setTopics(data.topics)
          if (data.topics.length > 0) setActiveTopic(data.topics[0].id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [bookId, book])

  if (!book) return (
    <main className="min-h-screen bg-[#090A1A] flex flex-col items-center justify-center p-8">
      <span className="text-6xl mb-4">📕</span>
      <h1 className="text-2xl font-black text-[#FAF9F6] mb-2">Book not found</h1>
      <Link href="/books" className="text-[#8CE600] font-bold hover:underline">← Back to library</Link>
    </main>
  )

  const currentTopic = topics.find(t => t.id === activeTopic)

  return (
    <main className="min-h-screen bg-[#090A1A]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Top nav */}
        <Link href="/books" className="inline-flex items-center gap-2 text-sm font-bold text-[#8888AA] hover:text-[#8CE600] mb-6 transition-colors">
          <span>←</span> Back to Library
        </Link>

        {/* Book Header */}
        <div className={`bg-gradient-to-br ${book.color} rounded-[2rem] p-8 md:p-10 text-white mb-8 shadow-xl relative overflow-hidden`}>
          <div className="absolute -right-10 -bottom-10 text-8xl opacity-10">{book.emoji}</div>
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1.5 rounded-full inline-block mb-3">
              {book.subject}
            </span>
            <h1 className="text-3xl md:text-4xl font-black mb-2">{book.title}</h1>
            <p className="text-white/70 font-semibold">by {book.author}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 bg-[#8CE600] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">📝</span>
            <h2 className="text-xl font-black text-[#FAF9F6] mb-2">No content yet</h2>
            <p className="text-[#8888AA]">Topics for this subject are being prepared. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chapter List */}
            <div className="lg:col-span-1">
              <div className="bg-[#12142D] rounded-2xl border border-[#22254F] p-4 sticky top-24">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8CE600] mb-3 px-2">Chapters</h3>
                <div className="space-y-1">
                  {topics.map((t, i) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTopic(t.id); setView('simplified') }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        activeTopic === t.id
                          ? 'bg-[#8CE600]/10 text-[#8CE600] border border-[#8CE600]/30'
                          : 'text-[#8888AA] hover:text-[#FAF9F6] hover:bg-[#22254F]/50'
                      }`}
                    >
                      {i + 1}. {t.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reader Content */}
            <div className="lg:col-span-3">
              {currentTopic && (
                <>
                  {/* View Toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setView('simplified')}
                      className={`px-5 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all ${
                        view === 'simplified'
                          ? 'bg-[#8CE600] text-[#090A1A] shadow-lg'
                          : 'bg-[#12142D] border border-[#22254F] text-[#8888AA] hover:text-[#FAF9F6]'
                      }`}
                    >
                      🔬 Simplified
                    </button>
                    <button
                      onClick={() => setView('textbook')}
                      className={`px-5 py-2.5 rounded-xl font-black text-sm tracking-wide transition-all ${
                        view === 'textbook'
                          ? 'bg-[#8CE600] text-[#090A1A] shadow-lg'
                          : 'bg-[#12142D] border border-[#22254F] text-[#8888AA] hover:text-[#FAF9F6]'
                      }`}
                    >
                      📘 Textbook
                    </button>
                  </div>

                  {/* Content */}
                  <div className="bg-[#12142D] rounded-[2rem] border border-[#22254F] p-8 shadow-lg">
                    <h2 className="text-2xl font-black text-[#FAF9F6] mb-2">{currentTopic.title}</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8888AA] bg-[#090A1A] px-2 py-1 rounded-full inline-block mb-6">
                      {currentTopic.textbookSource}
                    </span>

                    {view === 'textbook' ? (
                      <div className="prose prose-invert max-w-none">
                        <div className="bg-[#090A1A]/50 rounded-2xl p-6 border border-[#22254F] mb-6">
                          <h3 className="text-sm font-black text-[#8CE600] uppercase tracking-widest mb-3">📘 Textbook Excerpt</h3>
                          <p className="text-[#FAF9F6]/80 leading-relaxed text-base whitespace-pre-line">
                            {currentTopic.rawTextbookExcerpt}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#1a2a0a]/30 rounded-2xl p-6 border border-[#8CE600]/20">
                        <h3 className="text-sm font-black text-[#A3FF00] uppercase tracking-widest mb-3">🔬 Kid-Friendly Summary</h3>
                        <p className="text-[#FAF9F6] leading-relaxed text-base whitespace-pre-line">
                          {currentTopic.simplified150Story}
                        </p>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-[#22254F]">
                      <button
                        onClick={() => {
                          const idx = topics.findIndex(t => t.id === activeTopic)
                          if (idx > 0) { setActiveTopic(topics[idx - 1].id); setView('simplified') }
                        }}
                        disabled={topics.findIndex(t => t.id === activeTopic) === 0}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#22254F] text-[#FAF9F6] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2a2d5a] transition-all"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => {
                          const idx = topics.findIndex(t => t.id === activeTopic)
                          if (idx < topics.length - 1) { setActiveTopic(topics[idx + 1].id); setView('simplified') }
                        }}
                        disabled={topics.findIndex(t => t.id === activeTopic) === topics.length - 1}
                        className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#8CE600] text-[#090A1A] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#A3FF00] transition-all"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
