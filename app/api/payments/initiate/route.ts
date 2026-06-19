import { NextResponse } from 'next/server'
import { createMonimeCheckoutSession } from '@/src/lib/monime'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/src/lib/prisma'
import { getUser } from '@/src/lib/auth'

export async function POST() {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify role is 'parent'
    const profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (profile?.role !== 'parent') {
      return NextResponse.json({ error: 'Only parents can manage subscriptions' }, { status: 403 })
    }

    const price = Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_SLE) || 5
    const reference = `sub_${uuidv4().substring(0, 8)}`
    
    // 1. Create Monime Session
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const session = await createMonimeCheckoutSession({
      amount: price,
      reference,
      successUrl: `${origin}/dashboard/parent?payment=success`,
      cancelUrl: `${origin}/dashboard/parent?payment=cancelled`,
      customerEmail: user.phoneNumber
    })

    // 2. Log pending transaction
    await prisma.monimeTransaction.create({
      data: {
        parentId: user.id,
        amount: price,
        phoneNumber: 'N/A', 
        monimeReference: session.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ url: session.redirectUrl })
  } catch (error: any) {
    console.error('Payment Initiation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
