import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const file = path.join(process.cwd(), 'db', 'sample_topics.json')
  const raw = fs.readFileSync(file, 'utf8')
  const topics = JSON.parse(raw)

  console.log(`Seeding ${topics.length} topics...`)

  for (const t of topics) {
    const { error } = await supabase
      .from('topics')
      .upsert({
        id: t.id,
        subject: t.subject,
        tier: t.tier,
        title: t.title,
        slug: t.slug,
        story_content: t.story_content,
        video_url: t.video_url,
        lab_config: t.lab_config,
        sort_order: t.sort_order
      }, { onConflict: 'slug' })

    if (error) {
      console.error(`Error seeding topic ${t.slug}:`, error.message)
    } else {
      console.log(`Successfully seeded: ${t.slug}`)
    }
  }

  console.log('Seeding complete.')
}

seed().catch(console.error)
