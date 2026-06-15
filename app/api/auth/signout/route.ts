import { createClient } from '@/src/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/', url.origin), {
    status: 303,
  })
}
