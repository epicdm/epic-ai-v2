import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'

export const fiservWebhook = async (req: Request, res: Response) => {
  res.status(200).send('OK')

  try {
    const event = req.body
    console.log('[Fiserv Webhook]', JSON.stringify(event).slice(0, 200))

    const { userId, plan } = event?.metadata || {}
    const status = event?.status || event?.paymentStatus

    if (!userId || !plan) return

    if (status === 'APPROVED' || status === 'CAPTURED' || status === 'approved') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          datePaid: new Date(),
        },
      })
      console.log(`[Fiserv] Upgraded user ${userId} to ${plan}`)
    }
  } catch (err: any) {
    console.error('[Fiserv Webhook Error]', err.message)
  }
}
