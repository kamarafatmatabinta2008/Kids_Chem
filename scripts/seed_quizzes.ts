import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function seedQuizzes() {
  const file = path.join(process.cwd(), 'db', 'sample_quizzes.json')
  const quizzes = JSON.parse(fs.readFileSync(file, 'utf8'))

  for (const q of quizzes) {
    // 1. Get topic ID
    const topic = await prisma.topic.findUnique({
      where: { slug: q.topic_slug }
    })

    if (!topic) {
      console.log(`Topic ${q.topic_slug} not found, skipping.`)
      continue
    }

    // 2. Create Quiz
    const quiz = await prisma.quiz.upsert({
      where: { topicId: topic.id },
      update: { passingScore: 80 },
      create: { topicId: topic.id, passingScore: 80 }
    })

    // 3. Create Questions
    for (const quest of q.questions) {
      await prisma.quizQuestion.upsert({
        where: {
          quizId_questionText: {
            quizId: quiz.id,
            questionText: quest.question_text
          }
        },
        update: {
          options: quest.options,
          correctOption: quest.correct_option,
          explanationsFromTextbook: quest.explanation
        },
        create: {
          quizId: quiz.id,
          questionText: quest.question_text,
          options: quest.options,
          correctOption: quest.correct_option,
          explanationsFromTextbook: quest.explanation
        }
      })
    }
    console.log(`Seeded quiz for ${q.topic_slug}`)
  }
}

seedQuizzes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
