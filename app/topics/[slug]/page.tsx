import { createClient } from '@/src/lib/supabase-server'
import EnhancedLabBox from '@/app/components/EnhancedLabBox'
import QuizWrapper from '@/app/components/QuizWrapper'
import SciBuddy from '@/app/components/SciBuddy'
import Link from 'next/link'

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  
  // 1. Fetch topic
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (topicError || !topic) return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Topic not found</h1>
      <Link href="/" className="mt-4 text-blue-600 hover:underline">Go back home</Link>
    </main>
  )

  // 2. Fetch quiz and questions
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('topic_id', topic.id)
    .single()

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Progress Indicator */}
      <div className="sticky top-0 w-full h-2 bg-gray-200 z-50">
        <div className="h-full bg-blue-500 w-1/3 transition-all duration-1000" title="Progress: 33%" />
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-flex items-center gap-1 font-medium transition-colors">
          <span>←</span> Back to Dashboard
        </Link>
        
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {topic.subject}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              {topic.tier}
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">{topic.title}</h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-10">
            {topic.video_url && (
              <section className="rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-video flex items-center justify-center text-white border-8 border-slate-800">
                <div className="text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Video Lesson</p>
                </div>
              </section>
            )}

            <article className="prose prose-slate lg:prose-xl max-w-none bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-slate-900 font-black mb-6">The Story</h2>
              <p className="whitespace-pre-line leading-relaxed text-slate-700">{topic.story_content}</p>
            </article>

            {quiz && quiz.quiz_questions && (
              <section id="quiz" className="scroll-mt-10">
                <QuizWrapper 
                  quizId={quiz.id} 
                  questions={quiz.quiz_questions} 
                />
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <div className="sticky top-24">
              <EnhancedLabBox 
                storageKey={`lab_state_${topic.slug}`} 
                config={topic.lab_config} 
              />
              
              <div className="mt-8 bg-emerald-600 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="font-bold text-xl mb-2">Sci-Buddy Tip 🤖</h4>
                  <p className="text-emerald-50 text-sm leading-relaxed">
                    "Remember, scientist! Oxygen is the 'fuel' for fire. Without it, even the strongest flame will sleep."
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 rotate-12">🧬</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      <SciBuddy topicId={topic.id} />
    </main>
  )
}
