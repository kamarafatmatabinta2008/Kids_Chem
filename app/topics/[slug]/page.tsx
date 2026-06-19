import { prisma } from '@/src/lib/prisma'
import EnhancedLabBox from '@/app/components/EnhancedLabBox'
import QuizWrapper from '@/app/components/QuizWrapper'
import SciBuddy from '@/app/components/SciBuddy'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/src/lib/auth'

const SUBJECT_META: Record<string, { emoji: string; gradient: string; badge: string }> = {
  CHEMISTRY: { emoji: '🧪', gradient: 'from-purple-600 to-purple-800', badge: 'bg-purple-900/50 text-purple-300' },
  PHYSICS: { emoji: '⚡', gradient: 'from-blue-600 to-cyan-600', badge: 'bg-blue-900/50 text-blue-300' },
  BIOLOGY: { emoji: '🌿', gradient: 'from-emerald-600 to-green-700', badge: 'bg-emerald-900/50 text-emerald-300' }
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  const user = await getUser()
  if (!user) redirect('/register')

  const topic = await prisma.topic.findUnique({
    where: { slug: params.slug },
    include: { quiz: { include: { questions: true } } }
  })

  if (!topic) return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center bg-[#090A1A]">
      <div className="text-6xl mb-6">🔍</div>
      <h1 className="text-2xl font-black text-[#FAF9F6]">Topic not found</h1>
      <p className="text-[#8888AA] mt-2 font-medium">This science adventure doesn&apos;t exist yet!</p>
      <Link href="/" className="mt-6 px-8 py-4 bg-[#8CE600] text-[#090A1A] font-bold rounded-2xl shadow-lg hover:bg-[#A3FF00] transition-all">
        Go back home
      </Link>
    </main>
  )

  const meta = SUBJECT_META[topic.subject] || { emoji: '🔬', gradient: 'from-slate-600 to-slate-800', badge: 'bg-slate-800 text-slate-400' }

  return (
    <main className="min-h-screen bg-[#090A1A]">
      <div className="max-w-7xl mx-auto p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#8888AA] hover:text-[#8CE600] mb-6 transition-colors">
          <span>←</span> Back to Learning Path
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${meta.badge}`}>
                  {meta.emoji} {topic.subject}
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8CE600] bg-[#8CE600]/10 px-3 py-1.5 rounded-full border border-[#8CE600]/30">
                  {topic.tier}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#FAF9F6] tracking-tight leading-tight">
                {topic.title}
              </h1>
            </div>

            {/* Dual-Pane Textbook View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="bg-[#12142D] p-6 md:p-8 rounded-[2rem] shadow-lg border border-[#22254F]">
                <h2 className="text-lg font-black text-[#8CE600] mb-3 flex items-center gap-2">
                  <span>📘</span> Textbook
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8888AA] bg-[#090A1A] px-2 py-1 rounded-full mb-4 inline-block">
                  {topic.textbookSource}
                </span>
                <p className="text-[#FAF9F6]/80 leading-relaxed text-base whitespace-pre-line">
                  {topic.rawTextbookExcerpt}
                </p>
              </article>
              <article className="bg-[#1a2a0a]/50 p-6 md:p-8 rounded-[2rem] shadow-lg border border-[#8CE600]/20">
                <h2 className="text-lg font-black text-[#A3FF00] mb-3 flex items-center gap-2">
                  <span>🔬</span> Simplified
                </h2>
                <p className="text-[#FAF9F6] leading-relaxed text-base whitespace-pre-line">
                  {topic.simplified150Story}
                </p>
              </article>
            </div>

            {/* Video Section */}
            {topic.videoCdnUrl && (
              <section className="rounded-3xl overflow-hidden shadow-xl bg-[#12142D] border-8 border-[#22254F]">
                <div className="aspect-video flex items-center justify-center text-[#FAF9F6]">
                  {topic.videoCdnUrl.includes('youtube') || topic.videoCdnUrl.includes('youtu.be') ? (
                    <iframe src={topic.videoCdnUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">📺</div>
                      <p className="text-[#8888AA] font-bold uppercase tracking-widest text-sm">Video Lesson</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Quiz */}
            {topic.quiz && topic.quiz.questions && topic.quiz.questions.length > 0 && (
              <section id="quiz" className="scroll-mt-10">
                <QuizWrapper quizId={topic.quiz.id} questions={topic.quiz.questions} />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="xl:sticky xl:top-24">
              <EnhancedLabBox
                storageKey={`lab_state_${topic.slug}`}
                config={topic.labMatrixConfig as any}
              />

              <div className={`mt-6 bg-gradient-to-br ${meta.gradient} rounded-3xl p-6 text-white shadow-xl overflow-hidden relative border border-white/10`}>
                <div className="relative z-10">
                  <h4 className="font-bold text-lg mb-2">🤖 Sci-Buddy Tip</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {topic.subject === 'CHEMISTRY' && '"Remember, scientist! Every reaction teaches us something new. Stay curious!"'}
                    {topic.subject === 'PHYSICS' && '"Energy never disappears — it just transforms! Watch closely and you will see the magic of physics!"'}
                    {topic.subject === 'BIOLOGY' && '"Life is all around us, from the tiniest cell to the tallest tree. Keep exploring!"'}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 rotate-12">{meta.emoji}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SciBuddy topicId={topic.id} />
    </main>
  )
}
