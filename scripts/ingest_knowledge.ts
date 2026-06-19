import { PrismaClient } from '@prisma/client'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const KNOWLEDGE_BASE = [
  {
    topic_slug: 'oxygen-combustion',
    facts: [
      "Combustion is a chemical process where a substance reacts rapidly with oxygen and gives off heat.",
      "Oxygen is a gas that makes up about 21% of the Earth's atmosphere.",
      "A fire triangle consists of three things: Heat, Fuel, and Oxygen. If you remove any of these, the fire goes out.",
      "Plants produce oxygen through photosynthesis, which is why having a leaf in a closed container can help replenish oxygen if there is light.",
      "When a candle burns, it produces carbon dioxide and water vapor as byproducts."
    ]
  },
  {
    topic_slug: 'states-of-matter',
    facts: [
      "Everything around us is made of matter. Matter is anything that has mass and takes up space.",
      "The three main states of matter are solid, liquid, and gas.",
      "In a solid, particles are packed very tightly and can only vibrate in place. This gives solids a fixed shape.",
      "In a liquid, particles are close together but can slide past each other. This is why liquids can flow and take the shape of their container.",
      "In a gas, particles are far apart and move very fast. Gases expand to fill whatever container they are in."
    ]
  }
]

async function ingest() {
  console.log('Starting knowledge ingestion with Prisma...')

  for (const item of KNOWLEDGE_BASE) {
    const topic = await prisma.topic.findUnique({
      where: { slug: item.topic_slug }
    })

    if (!topic) {
      console.log(`Topic ${item.topic_slug} not found, skipping.`)
      continue
    }

    console.log(`Ingesting knowledge for: ${item.topic_slug}`)

    for (const fact of item.facts) {
      // 1. Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: fact,
      })
      const embedding = embeddingResponse.data[0].embedding
      const vectorStr = `[${embedding.join(',')}]`

      // 2. Store in DB using Raw SQL for vector (Prisma doesn't support vector types yet)
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO topic_embeddings (id, topic_id, content, embedding, metadata, created_at)
          VALUES (gen_random_uuid(), '${topic.id}'::uuid, $1, '${vectorStr}'::vector, $2, NOW())
        `, fact, { source: 'textbook-v1', type: 'core-fact' })

        console.log(`Successfully stored fact: ${fact.substring(0, 30)}...`)
      } catch (error: any) {
        console.error(`Error storing fact: ${error.message}`)
      }
    }
  }

  console.log('Ingestion complete.')
}

ingest()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
