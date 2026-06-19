import fs from 'fs'
import path from 'path'

const file = path.join(process.cwd(), 'db', 'sample_topics.json')
const raw = fs.readFileSync(file, 'utf8')
const topics = JSON.parse(raw)

for (const t of topics) {
  const labMatrixConfig = JSON.stringify(t.lab_matrix_config).replace(/'/g, "''")
  const textbookSource = t.textbook_source.replace(/'/g, "''")
  const rawTextbookExcerpt = t.raw_textbook_excerpt.replace(/'/g, "''")
  const simplified150Story = t.simplified_150_story.replace(/'/g, "''")
  const sql = `INSERT INTO public.topics (id, subject, tier, textbook_source, title, slug, raw_textbook_excerpt, simplified_150_story, lab_matrix_config, video_cdn_url, sort_order) VALUES ('${t.id}', '${t.subject}', '${t.tier}', '${textbookSource}', '${t.title.replace(/'/g, "''")}', '${t.slug}', '${rawTextbookExcerpt}', '${simplified150Story}', '${labMatrixConfig}', '${t.video_cdn_url || ''}', ${t.sort_order});`
  console.log(sql)
}

console.log('\n-- Done. Pipe output into psql or use SQL editor.')
