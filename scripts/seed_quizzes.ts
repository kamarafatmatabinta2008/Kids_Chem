import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedQuizzes() {
  const file = path.join(process.cwd(), 'db', 'sample_quizzes.json')
  const quizzes = JSON.parse(fs.readFileSync(file, 'utf8'))

  for (const q of quizzes) {
    // 1. Get topic ID
    const { data: topic } = await supabase
      .from('topics')
      .select('id')
      .eq('slug', q.topic_slug)
      .single()

    if (!topic) {
      console.log(`Topic ${q.topic_slug} not found, skipping.`)
      continue
    }

    // 2. Create Quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .upsert({ topic_id: topic.id, passing_score: 80 }, { onConflict: 'topic_id' })
      .select()
      .single()

    if (quizError) {
      console.error(`Error creating quiz for ${q.topic_slug}:`, quizError.message)
      continue
    }

    // 3. Create Questions
    for (const quest of q.questions) {
      const { error: questError } = await supabase
        .from('quiz_questions')
        .upsert({
          quiz_id: quiz.id,
          question_text: quest.question_text,
          options: quest.options,
          correct_option: quest.correct_option,
          explanations_from_textbook: quest.explanation
        }, { onConflict: 'quiz_id, question_text' }) // Note: You might need a unique constraint on these for upsert to work properly or just delete/insert

      if (questError) {
        console.error(`Error adding question to ${q.topic_slug}:`, questError.message)
      }
    }
    console.log(`Seeded quiz for ${q.topic_slug}`)
  }
}

seedQuizzes().catch(console.error)
