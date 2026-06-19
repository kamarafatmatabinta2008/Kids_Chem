"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
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
    <main className="min-h-screen bg-[#090A1A] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#12142D] rounded-[2.5rem] shadow-2xl shadow-[#8CE600]/10 border border-[#22254F] p-10">
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, mass: 0.8, delay: 0.1 }}
              className="text-6xl mb-4"
            >
              🧪
            </motion.div>
            <h1 className="text-3xl font-black text-[#FAF9F6] mb-2">Welcome Back!</h1>
            <p className="text-[#8888AA] font-medium">Ready for some science? 🚀</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#FAF9F6] mb-2 uppercase tracking-tight">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium text-[#FAF9F6] placeholder:text-[#8888AA]"
                placeholder="+232 XX XXX XXX"
                autoComplete="tel"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#FAF9F6] mb-2 uppercase tracking-tight">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-[#090A1A] border-2 border-[#22254F] rounded-xl focus:ring-2 focus:ring-[#8CE600] focus:border-[#8CE600] outline-none transition-all font-medium text-[#FAF9F6] placeholder:text-[#8888AA]"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 bg-red-900/30 px-4 py-3 rounded-xl text-sm font-semibold text-center border border-red-800"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#8CE600] text-[#090A1A] font-bold rounded-2xl shadow-lg shadow-[#8CE600]/30 hover:bg-[#A3FF00] transition-all disabled:opacity-50 text-lg hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? 'Entering Lab...' : '🔬 Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-[#8888AA] font-medium">
            New here?{' '}
            <Link href="/register" className="text-[#8CE600] hover:text-[#A3FF00] font-bold hover:underline">
              Create a student account
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
