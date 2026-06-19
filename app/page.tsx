import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { getUser } from '@/src/lib/auth'
import Link from 'next/link'
import HomeClient from './HomeClient'

export default async function Home() {
  const user = await getUser()
  if (!user) redirect('/register')

  const topics = await prisma.topic.findMany({
    include: { quiz: true },
    orderBy: { sortOrder: 'asc' }
  })

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      students: {
        include: {
          quizAttempts: { select: { quizId: true, isCorrect: true } }
        }
      }
    }
  })

  const student = profile?.students?.[0]
  const masteryData = student?.quizAttempts || []
  const masteredQuizIds = new Set(masteryData.filter(a => a.isCorrect).map(a => a.quizId))

  return (
    <HomeClient
      studentName={student?.fullName || 'Scientist'}
      streakDays={student?.continuousStreakDays || 0}
      masteredCount={masteredQuizIds.size}
      totalTopics={topics.length}
    >
      {/* Topics Grid */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-[#FAF9F6]">Your Learning Path</h2>
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#8CE600]" />
            <span className="w-3 h-3 rounded-full bg-[#A3FF00]" />
            <span className="w-3 h-3 rounded-full bg-[#8CE600]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const isMastered = topic.quiz ? masteredQuizIds.has(topic.quiz.id) : false
            const subjectEmoji: Record<string, string> = { CHEMISTRY: '🧪', PHYSICS: '⚡', BIOLOGY: '🌿' }
            const subjectColor: Record<string, string> = {
              CHEMISTRY: 'from-purple-600 to-purple-800',
              PHYSICS: 'from-blue-600 to-cyan-600',
              BIOLOGY: 'from-emerald-600 to-green-700'
            }
            const subjectBadge: Record<string, string> = {
              CHEMISTRY: 'bg-purple-900/50 text-purple-300',
              PHYSICS: 'bg-blue-900/50 text-blue-300',
              BIOLOGY: 'bg-emerald-900/50 text-emerald-300'
            }

            return (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className={`group relative bg-[#12142D] p-6 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-[#8CE600]/10 ${
                  isMastered
                    ? 'border-[#8CE600]/50 shadow-[#8CE600]/10'
                    : 'border-[#22254F]'
                }`}
              >
                {isMastered && (
                  <div className="absolute -top-3 -right-3 w-9 h-9 bg-[#8CE600] text-[#090A1A] rounded-full flex items-center justify-center shadow-lg animate-bounce text-sm font-black">
                    ⭐
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br ${subjectColor[topic.subject] || 'from-slate-600 to-slate-800'}`}>
                  <span className="drop-shadow-lg">{subjectEmoji[topic.subject] || '🔬'}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${subjectBadge[topic.subject] || 'bg-slate-800 text-slate-400'}`}>
                  {topic.subject}
                </span>
                <h3 className="text-lg font-black text-[#FAF9F6] mt-3 mb-2 group-hover:text-[#8CE600] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-[#8888AA] font-medium text-sm line-clamp-2 leading-relaxed">
                  {topic.simplified150Story}
                </p>
                <div className={`mt-4 flex items-center font-black text-xs uppercase tracking-widest ${
                  isMastered ? 'text-[#8CE600]' : 'text-[#A3FF00]'
                }`}>
                  {isMastered ? '✓ Mastered' : 'Start →'}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Quick Access Strip */}
      <section className="mb-16">
        <h2 className="text-2xl font-black text-[#FAF9F6] mb-6">🚀 Science HQ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/books" className="group bg-gradient-to-br from-[#8CE600] to-[#A3FF00] rounded-[2rem] p-6 text-[#090A1A] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-black text-lg">Science Books</h3>
            <p className="text-[#090A1A]/70 text-sm font-medium mt-1">Read & learn</p>
          </Link>
          <Link href="/videos" className="group bg-gradient-to-br from-[#12142D] to-[#1a1c3a] rounded-[2rem] p-6 text-[#FAF9F6] shadow-lg border border-[#22254F] hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">🎬</div>
            <h3 className="font-black text-lg">Video Lab</h3>
            <p className="text-[#8888AA] text-sm font-medium mt-1">Watch & explore</p>
          </Link>
          <Link href="/lab" className="group bg-gradient-to-br from-[#12142D] to-[#1a1c3a] rounded-[2rem] p-6 text-[#FAF9F6] shadow-lg border border-[#22254F] hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className="text-4xl mb-3">🔬</div>
            <h3 className="font-black text-lg">Virtual Lab</h3>
            <p className="text-[#8888AA] text-sm font-medium mt-1">Experiment now</p>
          </Link>
          <div className="bg-gradient-to-br from-[#12142D] to-[#1a1c3a] rounded-[2rem] p-6 text-[#FAF9F6] shadow-lg border border-[#22254F]">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-black text-lg">Sci-Buddy</h3>
            <p className="text-[#8888AA] text-sm font-medium mt-1">Ask me anything!</p>
          </div>
        </div>
      </section>
    </HomeClient>
  )
}
