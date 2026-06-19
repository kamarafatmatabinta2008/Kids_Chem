import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getUser } from '@/src/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId, questionId, selectedOption, isCorrect, attemptIteration } = await request.json()

    const student = await prisma.student.findFirst({
      where: { parentId: user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found. Please register first.' }, { status: 400 })
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: student.id,
        quizId,
        questionId,
        selectedOption,
        isCorrect,
        attemptIteration
      }
    })

    return NextResponse.json({ ok: true, id: attempt.id })
  } catch (error: any) {
    console.error('Quiz Attempt API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
