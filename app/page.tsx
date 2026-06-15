import { createClient } from '@/src/lib/supabase-server'
import Link from 'next/link'

export default async function Home() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: topics, error } = await supabase
    .from('topics')
    .select('*, quizzes(id)')
    .order('sort_order', { ascending: true })

  let masteryData: any[] = []
  if (user) {
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('parent_id', user.id)
      .limit(1)
      .single()

    if (student) {
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, is_correct')
        .eq('student_id', student.id)
      
      masteryData = attempts || []
    }
  }

  const isMastered = (quizId: string) => {
    return masteryData.some(a => a.quiz_id === quizId && a.is_correct)
  }

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-6xl mx-auto p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate tracking-tight">Kids<span className="text-blue-600">Chem</span></h1>
            <p className="text-slate/60 font-medium italic">Interactive Science Playground</p>
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-700">Hi, Explorer! 👋</span>
                <form action="/api/auth/signout" method="post">
                  <button className="text-xs font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest">Sign Out</button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600">Sign In</Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">Start Learning</Link>
              </>
            )}
          </div>
        </header>

        <section className="mb-16">
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h2 className="text-4xl font-black mb-4">Science Adventure Map 🚀</h2>
                <p className="text-blue-100 text-xl mb-8 leading-relaxed">
                  Your mission is to explore every topic and collect all the Mastery Badges. 
                  Ready to uncover the secrets of the universe?
                </p>
                <Link href="/topics/oxygen-combustion" className="inline-block px-10 py-5 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 active:scale-95">
                  Continue Mission
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-32 h-32 bg-white/20 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center border border-white/30">
                  <div className="text-3xl mb-1">🔥</div>
                  <div className="text-[10px] font-black uppercase">Streak</div>
                  <div className="text-xl font-black">5 Days</div>
                </div>
                <div className="w-32 h-32 bg-emerald-500/80 rounded-3xl backdrop-blur-md flex flex-col items-center justify-center border border-white/30">
                  <div className="text-3xl mb-1">🏅</div>
                  <div className="text-[10px] font-black uppercase">Mastery</div>
                  <div className="text-xl font-black">{topics?.filter(t => isMastered(t.quizzes?.id)).length || 0} Topics</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl" />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Learning Path</h3>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="w-3 h-3 bg-slate-200 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {error ? (
              <p className="text-red-500">Error loading topics. Please check your database connection.</p>
            ) : topics?.map((topic) => {
              const mastered = isMastered(topic.quizzes?.id)
              return (
                <Link 
                  key={topic.id} 
                  href={`/topics/${topic.slug}`}
                  className={`group relative bg-white p-8 rounded-[2rem] border-2 transition-all duration-500 ${
                    mastered 
                    ? 'border-emerald-100 hover:border-emerald-300 shadow-emerald-50 shadow-lg' 
                    : 'border-slate-100 hover:border-blue-300 hover:shadow-2xl shadow-slate-100 shadow-sm'
                  }`}
                >
                  {mastered && (
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      ⭐
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all ${
                    mastered ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-blue-100 group-hover:scale-110'
                  }`}>
                    {topic.subject === 'CHEMISTRY' ? '🧪' : topic.subject === 'PHYSICS' ? '⚡' : '🌿'}
                  </div>
                  
                  <h4 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {topic.title}
                  </h4>
                  
                  <p className="text-slate-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                    {topic.story_content}
                  </p>
                  
                  <div className={`flex items-center font-black text-sm uppercase tracking-widest ${
                    mastered ? 'text-emerald-600' : 'text-blue-600'
                  }`}>
                    {mastered ? 'Topic Mastered' : 'Start Journey'} 
                    <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
