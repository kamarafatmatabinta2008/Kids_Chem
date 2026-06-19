import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function seedTopics() {
  const file = path.join(process.cwd(), 'db', 'sample_topics.json')
  const raw = fs.readFileSync(file, 'utf8')
  const topics = JSON.parse(raw)

  console.log(`Seeding ${topics.length} topics...`)
  for (const t of topics) {
    await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {
        subject: t.subject,
        tier: t.tier,
        title: t.title,
        textbookSource: t.textbook_source,
        rawTextbookExcerpt: t.raw_textbook_excerpt,
        simplified150Story: t.simplified_150_story,
        labMatrixConfig: t.lab_matrix_config,
        videoCdnUrl: t.video_cdn_url,
        sortOrder: t.sort_order
      },
      create: {
        id: t.id,
        subject: t.subject,
        tier: t.tier,
        title: t.title,
        slug: t.slug,
        textbookSource: t.textbook_source,
        rawTextbookExcerpt: t.raw_textbook_excerpt,
        simplified150Story: t.simplified_150_story,
        labMatrixConfig: t.lab_matrix_config,
        videoCdnUrl: t.video_cdn_url,
        sortOrder: t.sort_order
      }
    })
    console.log(`  ✓ Topic: ${t.slug}`)
  }
}

async function seedQuizzes() {
  const file = path.join(process.cwd(), 'db', 'sample_quizzes.json')
  const raw = fs.readFileSync(file, 'utf8')
  const quizzes = JSON.parse(raw)

  console.log(`\nSeeding ${quizzes.length} quizzes...`)
  for (const q of quizzes) {
    const topic = await prisma.topic.findUnique({
      where: { slug: q.topic_slug }
    })
    if (!topic) {
      console.log(`  ✗ Topic ${q.topic_slug} not found, skipping.`)
      continue
    }

    const quiz = await prisma.quiz.upsert({
      where: { topicId: topic.id },
      update: { passingScore: 80 },
      create: { topicId: topic.id, passingScore: 80 }
    })

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
    console.log(`  ✓ Quiz for: ${q.topic_slug}`)
  }
}

async function seedTestUser() {
  const testUserId = '00000000-0000-0000-0000-000000000001'
  const testStudentId = '00000000-0000-0000-0000-000000000010'

  const existing = await prisma.profile.findUnique({ where: { id: testUserId } })
  if (existing) {
    console.log(`\nTest profile already exists, updating email/password...`)
    await prisma.profile.update({
      where: { id: testUserId },
      data: {
        phoneNumber: '+232000000001',
        passwordHash: '$2a$12$LJ3m4ys3Lg3YOCwI2kYOYO1mDkVx7YqGHgfOXQqCZa3gNVKLlIF2e', // "test123"
      }
    })
    return
  }

  console.log(`\nSeeding test profile & student...`)

  await prisma.profile.create({
    data: {
      id: testUserId,
      phoneNumber: '+232000000001',
      passwordHash: '$2a$12$LJ3m4ys3Lg3YOCwI2kYOYO1mDkVx7YqGHgfOXQqCZa3gNVKLlIF2e', // "test123"
      fullName: 'Test Parent',
      role: 'parent',
      students: {
        create: {
          id: testStudentId,
          fullName: 'Junior Scientist',
          tier: 'PRIMARY',
          targetedWeakness: 'CHEMISTRY',
          continuousStreakDays: 5
        }
      },
      subscriptions: {
        create: {
          isProActive: true,
          tierPriceLeones: 5,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    }
  })
  console.log(`  ✓ Profile: Test Parent`)
  console.log(`  ✓ Student: Junior Scientist`)
  console.log(`  ✓ Subscription: Pro (7 days)`)

  // Seed quiz attempts (mark oxygen-combustion & states-of-matter as mastered)
  const topics = await prisma.topic.findMany({
    where: { slug: { in: ['oxygen-combustion', 'states-of-matter'] } },
    include: { quiz: { include: { questions: true } } }
  })

  console.log(`\nSeeding quiz attempts for mastery demo...`)
  for (const topic of topics) {
    if (!topic.quiz) continue
    for (const question of topic.quiz.questions) {
      await prisma.quizAttempt.create({
        data: {
          studentId: testStudentId,
          quizId: topic.quiz.id,
          questionId: question.id,
          selectedOption: question.correctOption,
          isCorrect: true,
          attemptIteration: 1
        }
      })
    }
    console.log(`  ✓ Mastered: ${topic.slug}`)
  }
}

async function main() {
  console.log('=== Comprehensive Neon DB Seed ===\n')
  await seedTopics()
  await seedQuizzes()
  await seedTestUser()
  console.log('\n=== Seeding Complete ===')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
