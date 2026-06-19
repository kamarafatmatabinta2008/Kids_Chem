import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function check() {
  const topics = await prisma.topic.count()
  const quizzes = await prisma.quiz.count()
  const questions = await prisma.quizQuestion.count()
  console.log('Topics:', topics)
  console.log('Quizzes:', quizzes)
  console.log('Questions:', questions)
  await prisma.$disconnect()
}
check()
