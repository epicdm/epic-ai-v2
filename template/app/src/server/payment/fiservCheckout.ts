import { type ExpressHttpRequest, type ExpressHttpResponse } from 'wasp/server'
import { prisma } from 'wasp/server'

const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  pro: { amount: 2900, label: 'EPIC AI Pro — $29/mo' },
  business: { amount: 9900, label: 'EPIC AI Business — $99/mo' },
}

// POST /api/billing/checkout
export const fiservCheckout = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { plan } = req.body
    if (!plan || !PLAN_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' })

    const { amount, label } = PLAN_PRICES[plan]

    // Create Fiserv checkout session
    const fiservPayload = {
      amount: { total: (amount / 100).toFixed(2), currency: 'USD' },
      order: {
        orderId: `epicai-${user.id}-${plan}-${Date.now()}`,
        description: label,
      },
      redirects: {
        successUrl: `https://bff.epic.dm/dashboard/billing?success=true&plan=${plan}`,
        failUrl: `https://bff.epic.dm/dashboard/billing?error=true`,
        cancelUrl: `https://bff.epic.dm/dashboard/billing?cancelled=true`,
      },
      customer: {
        email: user.email || '',
        orderId: user.id,
      },
      metadata: { userId: user.id, plan },
    }

    const fiservRes = await fetch('https://api01.epic.dm/checkout/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': process.env.FISERV_API_KEY || '' },
      body: JSON.stringify(fiservPayload),
    })

    if (!fiservRes.ok) {
      const err = await fiservRes.text()
      console.error('[Fiserv] Checkout error:', err)
      return res.status(500).json({ error: 'Failed to create checkout session' })
    }

    const data = await fiservRes.json()

    // Mark pending plan
    await prisma.user.update({
      where: { id: user.id },
      data: { pendingPlan: plan, pendingPlanSince: new Date() },
    })

    return res.json({ url: data.url || data.redirectUrl })
  } catch (err: any) {
    console.error('[Fiserv Checkout]', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

// GET /api/billing/plan
export const getUserPlan = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionPlan: true, pendingPlan: true },
    })

    return res.json({ plan: dbUser?.subscriptionPlan || 'free', pendingPlan: dbUser?.pendingPlan || null })
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal error' })
  }
}
