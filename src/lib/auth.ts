import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const profile = await prisma.profile.findUnique({ where: { id: payload.userId } })
    return profile ? { id: profile.id, phoneNumber: profile.phoneNumber } : null
  } catch {
    return null
  }
}

export async function createSession(userId: string) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  const cookieStore = cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function destroySession() {
  const cookieStore = cookies()
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}
