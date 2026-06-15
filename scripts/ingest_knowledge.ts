import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
  console.log('Starting knowledge ingestion...')

  for (const item of KNOWLEDGE_BASE) {
    const { data: topic } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', item.topic_slug)
      .single()

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

      // 2. Store in DB
      const { error } = await supabase
        .from('topic_embeddings')
        .insert({
          topic_id: topic.id,
          content: fact,
          embedding,
          metadata: { source: 'textbook-v1', type: 'core-fact' }
        })

      if (error) {
        console.error(`Error storing fact: ${error.message}`)
      } else {
        console.log(`Successfully stored fact: ${fact.substring(0, 30)}...`)
      }
    }
  }

  console.log('Ingestion complete.')
}

ingest().catch(console.error)
