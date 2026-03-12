import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'

const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  pro: { amount: 2900, label: 'EPIC AI Pro — $29/mo' },
  business: { amount: 9900, label: 'EPIC AI Business — $99/mo' },
}

// Legacy helper kept compile-safe for older imports.
export const fiservCheckout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { plan } = req.body || {}
    if (!plan || !PLAN_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' })

    const { amount, label } = PLAN_PRICES[plan]
    const response = await fetch('https://api01.epic.dm/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.FISERV_API_KEY || '',
      },
      body: JSON.stringify({
        amount: { total: (amount / 100).toFixed(2), currency: 'USD' },
        order: { orderId: `epicai-${user.id}-${plan}-${Date.now()}`, description: label },
        redirects: {
          successUrl: 'https://bff.epic.dm/dashboard/billing?success=true',
          failUrl: 'https://bff.epic.dm/dashboard/billing?error=true',
          cancelUrl: 'https://bff.epic.dm/dashboard/billing?cancelled=true',
        },
        customer: { email: user.email || '' },
        metadata: { userId: user.id, plan },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[Fiserv Checkout legacy]', err)
      return res.status(500).json({ error: 'Failed to create checkout session' })
    }

    const data = await response.json() as any
    return res.json({ checkoutUrl: data.url || data.redirectUrl || data.checkoutUrl || null })
  } catch (err: any) {
    console.error('[Fiserv Checkout legacy]', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

export const getUserPlan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, subscriptionPlan: true },
    })

    return res.json({ plan: dbUser?.plan || dbUser?.subscriptionPlan || 'free' })
  } catch {
    return res.status(500).json({ error: 'Internal error' })
  }
}
