import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/src/lib/auth'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { phoneNumber, password, kidName, kidTier, kidWeakness } = await request.json()

    if (!phoneNumber || !password || !kidName) {
      return NextResponse.json({ error: 'Phone number, password, and name are required' }, { status: 400 })
    }

    const existing = await prisma.profile.findUnique({ where: { phoneNumber } })
    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const userId = crypto.randomUUID()

    await prisma.profile.create({
      data: {
        id: userId,
        phoneNumber,
        passwordHash,
        fullName: kidName,
        role: 'parent'
      }
    })

    await prisma.student.create({
      data: {
        parentId: userId,
        fullName: kidName,
        tier: kidTier || 'PRIMARY',
        targetedWeakness: kidWeakness || null
      }
    })

    await createSession(userId)

    return NextResponse.json({ ok: true, userId })
  } catch (error: any) {
    console.error('Register API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
