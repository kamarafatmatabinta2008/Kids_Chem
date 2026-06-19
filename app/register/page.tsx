"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [kidName, setKidName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [kidTier, setKidTier] = useState('PRIMARY')
  const [kidWeakness, setKidWeakness] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          password,
          kidName,
          kidTier,
          kidWeakness: kidWeakness || null
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#090A1A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">🧪</div>
      <div className="absolute top-20 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🔬</div>
      <div className="absolute bottom-20 left-20 text-6xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>⚡</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🌿</div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <form onSubmit={handleRegister}>
          <div className="bg-[#12142D] rounded-[3rem] shadow-2xl shadow-[#8CE600]/10 p-8 md:p-10 border border-[#22254F]">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 18, mass: 0.8, delay: 0.1 }}
                className="text-7xl mb-4"
              >
                🧪
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-black text-[#FAF9F6] leading-tight">
                Welcome, Future Scientist!
              </h1>
              <p className="text-[#8888AA] font-medium mt-2 text-lg">
                Ready to explore the wonders of science? 🚀
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#FAF9F6] mb-2">
                  <span className="mr-2">🧑‍🔬</span> What&apos;s your name?
                </label>
                <input
                  type="text"
                  value={kidName}
                  onChange={(e) => setKidName(e.target.value)}
                  className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-2xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium text-lg placeholder:text-[#8888AA] text-[#FAF9F6]"
                  placeholder="Your name here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#FAF9F6] mb-2">
                  <span className="mr-2">📱</span> Parent&apos;s phone number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-2xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium placeholder:text-[#8888AA] text-[#FAF9F6]"
                  placeholder="+232 XX XXX XXX"
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#FAF9F6] mb-2">
                  <span className="mr-2">🔒</span> Create a password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-2xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium placeholder:text-[#8888AA] text-[#FAF9F6]"
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#FAF9F6] mb-2">
                  <span className="mr-2">📚</span> I&apos;m in...
                </label>
                <select
                  value={kidTier}
                  onChange={(e) => setKidTier(e.target.value)}
                  className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-2xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium appearance-none cursor-pointer text-[#FAF9F6]"
                >
                  <option value="PRIMARY" className="bg-[#090A1A] text-[#FAF9F6]">🏫 Primary School</option>
                  <option value="JSS" className="bg-[#090A1A] text-[#FAF9F6]">📖 Junior Secondary (JSS)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#FAF9F6] mb-2">
                  <span className="mr-2">🎯</span> My favorite subject is...
                </label>
                <select
                  value={kidWeakness}
                  onChange={(e) => setKidWeakness(e.target.value)}
                  className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-2xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium appearance-none cursor-pointer text-[#FAF9F6]"
                >
                  <option value="" className="bg-[#090A1A] text-[#FAF9F6]">✨ All of them!</option>
                  <option value="BIOLOGY" className="bg-[#090A1A] text-[#FAF9F6]">🧬 Biology - Living things</option>
                  <option value="CHEMISTRY" className="bg-[#090A1A] text-[#FAF9F6]">⚗️ Chemistry - Reactions!</option>
                  <option value="PHYSICS" className="bg-[#090A1A] text-[#FAF9F6]">🌌 Physics - Energy & Forces</option>
                </select>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-red-400 bg-red-900/30 px-5 py-3 rounded-2xl text-sm font-semibold text-center border border-red-800"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#8CE600] text-[#090A1A] text-xl font-black rounded-2xl shadow-xl shadow-[#8CE600]/30 hover:shadow-2xl hover:shadow-[#8CE600]/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-3 justify-center">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Setting up your lab...
                  </span>
                ) : (
                  '🚀 Start My Adventure!'
                )}
              </button>
            </motion.div>
          </div>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-[#8888AA] font-medium"
        >
          Already a scientist?{' '}
          <Link href="/login" className="text-[#8CE600] hover:text-[#A3FF00] font-bold hover:underline">
            Sign in here
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}
