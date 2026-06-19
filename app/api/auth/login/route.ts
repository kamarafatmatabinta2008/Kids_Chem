import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/src/lib/auth'

export async function POST(request: Request) {
  try {
    const { phoneNumber, password } = await request.json()

    if (!phoneNumber || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 })
    }

    const profile = await prisma.profile.findUnique({ where: { phoneNumber } })
    if (!profile) {
      return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, profile.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await createSession(profile.id)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Login API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
