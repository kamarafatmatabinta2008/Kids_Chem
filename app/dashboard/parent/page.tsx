import { prisma } from '@/src/lib/prisma'
import { getUser } from '@/src/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ParentDashboard() {
  const user = await getUser()
  if (!user) redirect('/login')

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      students: true,
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (profile?.role !== 'parent') redirect('/')

  const subscription = profile?.subscriptions?.[0]
  const isPro = subscription?.isProActive && new Date(subscription.periodEnd) > new Date()

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Parent Dashboard</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your family's scientific journey</p>
          </div>
          <Link href="/" className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all">
            ← Back to Learning
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Subscription Card */}
          <section className="lg:col-span-1 space-y-6">
            <div className={`p-8 rounded-[2rem] shadow-xl border-4 ${isPro ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-blue-100 text-slate-900'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="text-4xl">{isPro ? '💎' : '⭐'}</div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isPro ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {isPro ? 'Pro Active' : 'Basic Plan'}
                </span>
              </div>
              <h3 className="text-2xl font-black mb-2">{isPro ? 'KidsChem Pro' : 'Unlock Pro Access'}</h3>
              <p className={`text-sm font-medium leading-relaxed mb-8 ${isPro ? 'text-emerald-100' : 'text-slate-500'}`}>
                {isPro 
                  ? `Your subscription is active until ${new Date(subscription.periodEnd).toLocaleDateString()}. Thank you for supporting your kids' education!`
                  : "Get weekly access to advanced virtual labs, unlimited Sci-Buddy AI chats, and detailed progress reports."}
              </p>
              
              {!isPro && (
                <form action="/api/payments/initiate" method="POST">
                  <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                    Activate Pro (5 SLE/week)
                  </button>
                </form>
              )}
            </div>

            {/* Recent Billing */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h4 className="text-lg font-black text-slate-900 mb-6">Recent Payments</h4>
              <div className="space-y-4">
                {profile?.transactions?.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{tx.status}</div>
                    </div>
                    <div className="text-sm font-black text-slate-900">{tx.amount.toString()} SLE</div>
                  </div>
                ))}
                {(!profile?.transactions || profile.transactions.length === 0) && (
                  <p className="text-sm text-slate-400 italic">No transactions yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Students Grid */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Your Students</h3>
              <button className="text-sm font-bold text-blue-600 hover:underline">+ Add Student</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile?.students?.map(student => (
                <div key={student.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                      {student.avatarUrl || '🧑‍🔬'}
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-1">{student.fullName}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      {student.tier}
                    </span>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Streak</div>
                        <div className="text-xl font-black text-slate-900">{student.continuousStreakDays} Days</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <div className="text-[10px] font-black text-slate-400 uppercase">Weakness</div>
                        <div className="text-lg font-black text-blue-600 truncate">{student.targetedWeakness || 'None'}</div>
                      </div>
                    </div>

                    <button className="mt-8 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
                      View Progress Details
                    </button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 text-9xl opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all">🧪</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}
