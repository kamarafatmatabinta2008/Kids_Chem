import { destroySession } from '@/src/lib/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  await destroySession()
  return NextResponse.redirect(new URL('/login', 'http://localhost:3000'), { status: 303 })
}
