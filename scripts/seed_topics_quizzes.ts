import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

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

  console.log(`Seeding ${quizzes.length} quizzes...`)

  for (const q of quizzes) {
    const topic = await prisma.topic.findUnique({
      where: { slug: q.topic_slug }
    })

    if (!topic) {
      console.log(`  ✗ Topic ${q.topic_slug} not found, skipping quiz.`)
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

async function main() {
  console.log('Seeding Neon DB (non-Supabase)...\n')
  await seedTopics()
  console.log()
  await seedQuizzes()
  console.log('\nSeeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
