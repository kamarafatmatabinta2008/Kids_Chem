import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase-server'

export async function GET(request: Request) {
  const supabase = createClient()
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug')

  if (slug) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
