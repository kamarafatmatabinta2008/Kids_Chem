import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function seed() {
  const file = path.join(process.cwd(), 'db', 'sample_topics.json')
  const raw = fs.readFileSync(file, 'utf8')
  const topics = JSON.parse(raw)

  console.log(`Seeding ${topics.length} topics with Prisma...`)

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
    console.log(`Successfully seeded: ${t.slug}`)
  }

  console.log('Seeding complete.')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
