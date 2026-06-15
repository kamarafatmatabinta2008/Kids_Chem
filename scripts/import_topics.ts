import fs from 'fs'
import path from 'path'

// Simple admin import script: reads db/sample_topics.json and outputs SQL insert statements
// Intended as a developer helper for Phase 2. For production use, replace with Supabase client calls.

const file = path.join(process.cwd(), 'db', 'sample_topics.json')
const raw = fs.readFileSync(file, 'utf8')
const topics = JSON.parse(raw)

for (const t of topics) {
  const labConfig = JSON.stringify(t.lab_config).replace(/'/g, "''")
  const story = t.story_content.replace(/'/g, "''")
  const sql = `INSERT INTO public.topics (id, subject, tier, title, slug, story_content, video_url, lab_config, sort_order) VALUES ('${t.id}', '${t.subject}', '${t.tier}', '${t.title.replace(/'/g, "''")}', '${t.slug}', '${story}', '${t.video_url}', '${labConfig}', ${t.sort_order});`
  console.log(sql)
}

console.log('\n-- Done. Pipe output into psql or use Supabase SQL editor.')
