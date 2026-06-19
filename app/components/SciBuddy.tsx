"use client"
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: { source: string; page?: string; content: string }[]
}

export default function SciBuddy({ topicId }: { topicId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          topicId,
          history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()
      if (data.content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          sources: data.sources
        }])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! My brain is a bit fuzzy right now. Can we try that again?"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl shadow-purple-500/30 z-50 flex items-center justify-center text-3xl hover:shadow-purple-500/50 transition-shadow"
      >
        {isOpen ? '✕' : '🤖'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-28 right-8 w-96 h-[600px] bg-white rounded-2xl shadow-2xl shadow-slate-900/20 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 p-6 text-white flex items-center gap-4 flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
                🤖
              </div>
              <div>
                <h3 className="font-black text-lg leading-none">Sci-Buddy</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">AI Science Tutor</p>
              </div>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white"
            >
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="text-5xl mb-4">👋</div>
                  <p className="text-slate-500 font-semibold text-lg">
                    Hi! I'm Sci-Buddy. Ask me anything about today's lesson!
                  </p>
                </motion.div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}>
                    {m.content}
                  </div>

                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {m.sources.map((s, si) => (
                        <div
                          key={si}
                          className="group relative cursor-help"
                        >
                          <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full hover:bg-purple-100 transition-colors border border-purple-200">
                            📚 Ref {si + 1}
                          </span>
                          <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-900 text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl shadow-slate-900/30">
                            <strong className="text-purple-300 block mb-1">
                              {s.source}{s.page ? ` (p. ${s.page})` : ''}
                            </strong>
                            <span className="text-slate-300">
                              &ldquo;{s.content.substring(0, 80)}...&rdquo;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-5 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm">
                    <div className="flex gap-1.5">
                      <motion.div
                        className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.div
                        className="w-2.5 h-2.5 bg-purple-400 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium text-sm transition-all placeholder:text-slate-400"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                🚀
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
