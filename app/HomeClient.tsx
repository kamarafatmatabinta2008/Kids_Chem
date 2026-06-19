"use client"
import React from 'react'
import SciBuddy from './components/SciBuddy'

export default function HomeClient({
  studentName,
  streakDays,
  masteredCount,
  totalTopics,
  children
}: {
  studentName: string
  streakDays: number
  masteredCount: number
  totalTopics: number
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-gradient-to-br from-[#1a1c3a] via-[#12142D] to-[#0a0b1e] rounded-[3rem] p-8 md:p-12 text-[#FAF9F6] shadow-2xl mb-12 relative overflow-hidden border border-[#22254F]">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#8CE600]/5 rounded-full blur-3xl" />
          <div className="absolute -left-10 -top-10 w-60 h-60 bg-[#8CE600]/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Science Adventure Map 🚀
              </h1>
              <p className="text-[#8888AA] text-lg md:text-xl mb-6 leading-relaxed">
                Hey {studentName}! Your mission is to explore every topic,
                watch videos, read books, and collect all the Mastery Badges!
              </p>
              <a
                href="/topics/oxygen-combustion"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#8CE600] text-[#090A1A] font-black rounded-2xl shadow-xl hover:bg-[#A3FF00] transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Continue Mission →
              </a>
            </div>
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-[#8CE600]/10 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border border-[#8CE600]/20">
                <span className="text-3xl mb-1">🔥</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8CE600]">Streak</span>
                <span className="text-2xl font-black text-[#FAF9F6]">{streakDays}d</span>
              </div>
              <div className="w-32 h-32 bg-[#8CE600]/10 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center border border-[#8CE600]/20">
                <span className="text-3xl mb-1">🏅</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8CE600]">Mastered</span>
                <span className="text-2xl font-black text-[#FAF9F6]">{masteredCount}/{totalTopics}</span>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>

      <SciBuddy topicId="home" />
    </main>
  )
}
