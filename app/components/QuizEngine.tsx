"use client"
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Question = {
  id: string
  question_text: string
  options: string[]
  correct_option: string
  explanations_from_textbook: string
}

type QuizProps = {
  quizId: string
  questions: Question[]
  onComplete: (_percent: number) => void
}

export default function QuizEngine({ quizId, questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState<Record<string, number>>({})
  const scoreRef = useRef(0)

  const currentQuestion = questions[currentIndex]

  async function handleOptionSelect(option: string) {
    if (showExplanation) return
    setSelectedOption(option)
    const correct = option === currentQuestion.correct_option
    setIsCorrect(correct)

    const currentAttemptCount = (attempts[currentQuestion.id] || 0) + 1
    setAttempts(prev => ({ ...prev, [currentQuestion.id]: currentAttemptCount }))

    try {
      await fetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          questionId: currentQuestion.id,
          selectedOption: option,
          isCorrect: correct,
          attemptIteration: currentAttemptCount
        })
      })
    } catch (e) { console.error('Failed to record attempt', e) }

    if (correct) {
      const newScore = scoreRef.current + 1
      scoreRef.current = newScore
      setScore(newScore)
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          nextQuestion()
        } else {
          onComplete((newScore / questions.length) * 100)
        }
      }, 1500)
    } else {
      setShowExplanation(true)
    }
  }

  function nextQuestion() {
    setCurrentIndex(prev => prev + 1)
    setSelectedOption(null)
    setIsCorrect(null)
    setShowExplanation(false)
  }

  function retryQuestion() {
    setSelectedOption(null)
    setIsCorrect(null)
    setShowExplanation(false)
  }

  const progressPercent = ((currentIndex + 1) / questions.length) * 100
  const scorePercent = (score / questions.length) * 100

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-[2rem] shadow-2xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-white/80 font-bold text-xs uppercase tracking-[0.2em]">Mastery Quiz</span>
            <h3 className="text-2xl font-black mt-1">
              Question {currentIndex + 1} of {questions.length}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-lg font-black flex items-center gap-2">
              🏆 Score: {score}/{questions.length}
            </div>
            <div className="w-32 h-3 bg-white/30 rounded-full mt-2 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
        {/* Question progress bar */}
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question Body */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h4 className="text-2xl font-black text-white mb-8 leading-tight">
              {currentQuestion.question_text}
            </h4>

            <div className="space-y-4">
              {currentQuestion.options.map((option, idx) => {
                const labels = ['A', 'B', 'C', 'D']
                const isSelected = selectedOption === option
                const isOptionCorrect = option === currentQuestion.correct_option
                const showCorrectHighlight = showExplanation && isOptionCorrect

                let borderColor = 'border-white/20'
                let bgColor = 'bg-white/10'
                let textColor = 'text-white'
                let labelColor = 'bg-white/20 text-white'

                if (isSelected && isCorrect === true) {
                  borderColor = 'border-emerald-400'
                  bgColor = 'bg-emerald-500/20'
                  textColor = 'text-emerald-300'
                  labelColor = 'bg-emerald-400 text-white'
                } else if (isSelected && isCorrect === false) {
                  borderColor = 'border-red-400'
                  bgColor = 'bg-red-500/20'
                  textColor = 'text-red-300'
                  labelColor = 'bg-red-400 text-white'
                } else if (showCorrectHighlight) {
                  borderColor = 'border-emerald-400'
                  bgColor = 'bg-emerald-500/20'
                  textColor = 'text-emerald-300'
                  labelColor = 'bg-emerald-400 text-white'
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    disabled={showExplanation || isCorrect === true}
                    whileHover={!showExplanation && isCorrect !== true ? { scale: 1.02, x: 4 } : {}}
                    whileTap={!showExplanation && isCorrect !== true ? { scale: 0.98 } : {}}
                    className={`w-full p-5 text-left rounded-2xl border-2 transition-all font-bold flex items-center gap-4 ${borderColor} ${bgColor} ${textColor}`}
                  >
                    <span className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${labelColor}`}>
                      {labels[idx] || idx + 1}
                    </span>
                    <span className="flex-1 text-lg">{option}</span>
                    {isSelected && isCorrect === true && (
                      <span className="text-3xl flex-shrink-0">✨</span>
                    )}
                    {isSelected && isCorrect === false && (
                      <span className="text-3xl flex-shrink-0">❌</span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Explanation Panel */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-8 p-8 bg-gradient-to-br from-blue-900/80 to-indigo-900/80 rounded-2xl border border-blue-400/30 backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">📖</div>
                <div>
                  <h5 className="font-black text-blue-300 text-lg mb-2 flex items-center gap-2">
                    💡 Let's Learn More!
                  </h5>
                  <p className="text-blue-100 leading-relaxed mb-6 text-base">
                    {currentQuestion.explanations_from_textbook}
                  </p>
                  <motion.button
                    onClick={retryQuestion}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-xl shadow-lg hover:shadow-emerald-500/30 transition-all text-lg"
                  >
                    🔄 Try Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Celebration for correct answer */}
        <AnimatePresence>
          {isCorrect === true && !showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center"
            >
              <span className="inline-block text-4xl">🎉</span>
              <span className="block text-emerald-300 font-bold mt-1">Great job! 🎉</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
