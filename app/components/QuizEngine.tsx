"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/src/lib/supabase'

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

  const currentQuestion = questions[currentIndex]

  async function handleOptionSelect(option: string) {
    if (showExplanation) return
    setSelectedOption(option)
    const correct = option === currentQuestion.correct_option
    setIsCorrect(correct)
    
    // Track attempts for this question
    const currentAttemptCount = (attempts[currentQuestion.id] || 0) + 1
    setAttempts({ ...attempts, [currentQuestion.id]: currentAttemptCount })

    // Record attempt in Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Find student
        const { data: student } = await supabase
          .from('students')
          .select('id')
          .eq('parent_id', user.id)
          .single()

        if (student) {
          await supabase.from('quiz_attempts').insert({
            student_id: student.id,
            quiz_id: quizId,
            question_id: currentQuestion.id,
            selected_option: option,
            is_correct: correct,
            attempt_iteration: currentAttemptCount
          })
        }
      }
    } catch (e) { console.error('Failed to record attempt', e) }

    if (correct) {
      setScore(s => s + 1)
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          nextQuestion()
        } else {
          onComplete(((score + 1) / questions.length) * 100)
        }
      }, 1500)
    } else {
      setShowExplanation(true)
    }
  }

  function nextQuestion() {
    setCurrentIndex(currentIndex + 1)
    setSelectedOption(null)
    setIsCorrect(null)
    setShowExplanation(false)
  }

  function retryQuestion() {
    setSelectedOption(null)
    setIsCorrect(null)
    setShowExplanation(false)
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <span className="text-blue-400 font-bold text-xs uppercase tracking-widest">Mastery Quiz</span>
          <h3 className="text-xl font-bold">Question {currentIndex + 1} of {questions.length}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400 font-bold uppercase">Score: {score}</div>
          <div className="w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-2xl font-bold text-slate-800 mb-8 leading-tight">
              {currentQuestion.question_text}
            </h4>

            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  disabled={showExplanation || isCorrect === true}
                  className={`w-full p-5 text-left rounded-2xl border-2 transition-all font-bold ${
                    selectedOption === option
                      ? isCorrect 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
                  } ${showExplanation && option === currentQuestion.correct_option ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedOption === option && (
                      <span className="text-2xl">
                        {isCorrect ? '✨' : '❌'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">📖</div>
                <div>
                  <h5 className="font-bold text-blue-800 mb-1">Let's learn more:</h5>
                  <p className="text-blue-700 leading-relaxed mb-4">
                    {currentQuestion.explanations_from_textbook}
                  </p>
                  <button
                    onClick={retryQuestion}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
