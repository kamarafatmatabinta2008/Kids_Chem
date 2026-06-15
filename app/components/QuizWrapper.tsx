"use client"
import React, { useState } from 'react'
import QuizEngine from './QuizEngine'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuizWrapper({ quizId, questions }: { quizId: string; questions: any[] }) {
  const [status, setStatus] = useState<'idle' | 'active' | 'completed'>('idle')
  const [finalScore, setFinalScore] = useState(0)

  return (
    <div className="mt-12">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-4 border-blue-500 rounded-[2rem] p-10 text-center shadow-2xl shadow-blue-100"
          >
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">Ready for the Mastery Challenge?</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto font-medium">
              Prove your science skills and earn your mastery badge for this topic!
            </p>
            <button
              onClick={() => setStatus('active')}
              className="px-10 py-5 bg-blue-600 text-white text-xl font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              Start Quiz
            </button>
          </motion.div>
        )}

        {status === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <QuizEngine 
              quizId={quizId} 
              questions={questions} 
              onComplete={(score) => {
                setFinalScore(score)
                setStatus('completed')
              }}
            />
          </motion.div>
        )}

        {status === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-600 rounded-[2rem] p-12 text-center text-white shadow-2xl shadow-emerald-100"
          >
            <div className="text-7xl mb-6">🏆</div>
            <h3 className="text-4xl font-black mb-4">Topic Mastered!</h3>
            <p className="text-emerald-100 text-xl mb-8">
              Amazing job! You scored <strong>{Math.round(finalScore)}%</strong> and demonstrated great scientific understanding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStatus('idle')}
                className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                Review Quiz
              </button>
              <a
                href="/"
                className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Back to Dashboard
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
