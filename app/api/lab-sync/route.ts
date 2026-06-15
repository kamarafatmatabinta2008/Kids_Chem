import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // In a real scenario, we'd map user.id to a student_id
    // For MVP/Demo, we might just use the user.id if they are the student
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { oxygen, flameOn, trigger, storageKey } = body
    const topicSlug = storageKey?.replace('lab_state_', '') || 'unknown'

    // First, find a student for this user (parent)
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('parent_id', user.id)
      .limit(1)
      .single()

    if (!student) {
      return NextResponse.json({ ok: false, error: 'No student profile found' }, { status: 400 })
    }

    const { error } = await supabase
      .from('lab_states')
      .upsert({
        student_id: student.id,
        topic_slug: topicSlug,
        oxygen_level: oxygen,
        flame_on: flameOn,
        last_trigger: trigger,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id, topic_slug' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('lab-sync error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 400 })
  }
}
