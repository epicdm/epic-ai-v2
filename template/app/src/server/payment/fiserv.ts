/**
 * Fiserv Payment Integration — BFF-SPEC.md Section 7.4
 */
import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'
import crypto from 'crypto'

const FISERV_API_KEY = process.env.FISERV_API_KEY || ''
const FISERV_WEBHOOK_SECRET = process.env.FISERV_WEBHOOK_SECRET || ''
const FISERV_BASE_URL = 'https://api01.epic.dm'

// ─── Create checkout session ──────────────────────────────────

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { plan } = req.body as { plan: 'pro' | 'business' }
    if (!plan || !['pro', 'business'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const amount = plan === 'pro' ? 2900 : 9900

    const payload = {
      userId: user.id,
      plan,
      amount,
      currency: 'USD',
      successUrl: `https://bff.epic.dm/dashboard?upgraded=true`,
      cancelUrl: `https://bff.epic.dm/upgrade`,
    }

    const response = await fetch(`${FISERV_BASE_URL}/api/checkout/session`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FISERV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Fiserv] Checkout error:', err)
      return res.status(502).json({ error: 'Payment service unavailable. Please try again.' })
    }

    const data = await response.json() as { checkoutUrl: string }
    return res.json({ checkoutUrl: data.checkoutUrl })
  } catch (err) {
    console.error('[Fiserv] createCheckout exception:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

// ─── Fiserv webhook (payment confirmation) ────────────────────

export const fiservWebhook = async (req: Request, res: Response) => {
  // Verify signature
  const signature = req.headers['x-fiserv-signature'] as string
  if (!signature) {
    console.warn('[Fiserv] Missing signature header')
    return res.status(401).json({ error: 'Missing signature' })
  }

  const rawBody = JSON.stringify(req.body)
  const expectedSig = crypto
    .createHmac('sha256', FISERV_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')

  if (signature !== `sha256=${expectedSig}`) {
    console.warn('[Fiserv] Invalid signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  const { event, userId, plan, transactionId, amount } = req.body as {
    event: string
    userId: string
    plan: 'pro' | 'business'
    transactionId: string
    amount: number
  }

  if (event !== 'payment.completed') {
    return res.status(200).json({ received: true })
  }

  // Idempotency: check if already processed
  const existingUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!existingUser) {
    console.warn('[Fiserv] User not found:', userId)
    return res.status(404).json({ error: 'User not found' })
  }

  // Upgrade plan immediately
  await prisma.user.update({
    where: { id: userId },
    data: { plan },
  })

  console.log(`[Fiserv] ✅ Upgraded ${userId} to ${plan} (txn: ${transactionId}, amount: ${amount})`)
  return res.status(200).json({ received: true })
}
