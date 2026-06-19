import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body

    console.log('Monime Webhook received:', event, data.id)

    // 1. Identify the transaction
    if (event === 'checkout_session.completed' || event === 'payment.succeeded') {
      const sessionId = data.id
      
      // Update transaction status
      const tx = await prisma.monimeTransaction.update({
        where: { monimeReference: sessionId },
        data: { 
          status: 'SUCCESSFUL',
          webhookRawPayload: body 
        }
      })

      if (!tx) {
        console.error('Webhook: Transaction not found', sessionId)
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
      }

      // 2. Activate/Extend Subscription
      const periodStart = new Date()
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 7) // 7-day weekly access

      const existingSub = await prisma.subscription.findFirst({
        where: { parentId: tx.parentId }
      })

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            isProActive: true,
            tierPriceLeones: tx.amount,
            periodStart,
            periodEnd,
            updatedAt: new Date()
          }
        })
      } else {
        await prisma.subscription.create({
          data: {
            parentId: tx.parentId,
            isProActive: true,
            tierPriceLeones: tx.amount,
            periodStart,
            periodEnd
          }
        })
      }

      console.log(`Webhook: Subscription activated for parent ${tx.parentId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
