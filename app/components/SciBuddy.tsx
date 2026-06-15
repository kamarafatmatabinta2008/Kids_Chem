"use client"
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: { source: string; page?: string; content: string }[]
}

export default function SciBuddy({ topicId }: { topicId: string }) {
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! My brain is a bit fuzzy right now. Can we try that again?" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl z-50 flex items-center justify-center text-3xl"
      >
        {isOpen ? '❌' : '🤖'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-[2rem] shadow-2xl z-50 flex flex-col border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
              <div>
                <h3 className="font-black text-lg leading-none">Sci-Buddy</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">AI Science Tutor</p>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50"
            >
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4">👋</div>
                  <p className="text-slate-500 font-medium">Hi! I'm Sci-Buddy. Ask me anything about today's lesson!</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl font-medium text-sm leading-relaxed shadow-sm ${
                    m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'
                  }`}>
                    {m.content}
                  </div>
                  
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {m.sources.map((s, si) => (
                        <div 
                          key={si}
                          className="group relative cursor-help"
                        >
                          <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                            Ref {si + 1}
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <strong>{s.source} {s.page ? `(p. ${s.page})` : ''}:</strong><br/>
                            "{s.content.substring(0, 60)}..."
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                🚀
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
