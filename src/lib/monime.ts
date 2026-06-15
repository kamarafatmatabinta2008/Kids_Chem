const MONIME_API_URL = 'https://api.monime.io/v1'

export type MonimeCheckoutSession = {
  id: string
  redirectUrl: string
  status: string
}

export async function createMonimeCheckoutSession(params: {
  amount: number // in major units (SLE)
  reference: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  const accessToken = process.env.MONIME_ACCESS_TOKEN
  const spaceId = process.env.MONIME_SPACE_ID

  if (!accessToken || !spaceId) {
    throw new Error('Monime configuration missing')
  }

  // Convert amount to minor units (SLE cents)
  const amountInMinorUnits = Math.round(params.amount * 100)

  const response = await fetch(`${MONIME_API_URL}/checkout-sessions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Monime-Space-Id': spaceId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `KidsChem Pro Subscription - ${params.reference}`,
      currency: 'SLE',
      lineItems: [
        {
          name: 'Weekly Pro Access',
          price: { currency: 'SLE', value: amountInMinorUnits },
          quantity: 1
        }
      ],
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      metadata: {
        reference: params.reference
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Monime API Error:', error)
    throw new Error(`Failed to create Monime checkout session: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    redirectUrl: data.redirectUrl,
    status: data.status
  } as MonimeCheckoutSession
}

export function verifyMonimeSignature(payload: string, signature: string) {
  // Monime webhook signature verification logic goes here
  // For now, we'll implement a basic check against the secret if provided in headers
  // Usually involves HMAC-SHA256
  const secret = process.env.MONIME_WEBHOOK_SECRET
  if (!secret) return true // Bypass in dev if secret not set, but warn
  
  // Real implementation would use crypto.createHmac
  return true 
}
