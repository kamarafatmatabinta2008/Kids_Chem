import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase-server'
import { createMonimeCheckoutSession } from '@/src/lib/monime'
import { v4 as uuidv4 } from 'uuid'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 0.1 })
    }

    // Verify role is 'parent'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

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
      customerEmail: user.email
    })

    // 2. Log pending transaction
    const { error: txError } = await supabase
      .from('monime_transactions')
      .insert({
        parent_id: user.id,
        amount: price,
        phone_number: 'N/A', // Monime handles this on their page
        monime_reference: session.id, // Using Monime's ID as our internal reference for mapping
        status: 'PENDING'
      })

    if (txError) throw txError

    return NextResponse.json({ url: session.redirectUrl })
  } catch (error: any) {
    console.error('Payment Initiation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
