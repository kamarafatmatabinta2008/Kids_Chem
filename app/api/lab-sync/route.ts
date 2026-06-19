import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getUser } from '@/src/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { oxygen, flameOn, trigger, storageKey } = body
    const topicSlug = storageKey?.replace('lab_state_', '') || 'unknown'

    // First, find a student for this user (parent)
    const student = await prisma.student.findFirst({
      where: { parentId: user.id }
    })

    if (!student) {
      return NextResponse.json({ ok: false, error: 'No student profile found' }, { status: 400 })
    }

    await prisma.labState.upsert({
      where: {
        studentId_topicSlug: {
          studentId: student.id,
          topicSlug: topicSlug
        }
      },
      update: {
        oxygenLevel: oxygen,
        flameOn: flameOn,
        lastTrigger: trigger,
        updatedAt: new Date()
      },
      create: {
        studentId: student.id,
        topicSlug: topicSlug,
        oxygenLevel: oxygen,
        flameOn: flameOn,
        lastTrigger: trigger
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('lab-sync error:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 })
  }
}
