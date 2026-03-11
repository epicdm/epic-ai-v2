import { type ExpressHttpRequest, type ExpressHttpResponse } from 'wasp/server'
import { prisma } from 'wasp/server'

export const fiservWebhook = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
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
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          pendingPlan: null,
          pendingPlanSince: null,
          datePaid: new Date(),
          lastBillingDate: new Date(),
        },
      })
      console.log(`[Fiserv] Upgraded user ${userId} to ${plan}`)
    } else if (status === 'DECLINED' || status === 'FAILED') {
      await prisma.user.update({
        where: { id: userId },
        data: { pendingPlan: null, pendingPlanSince: null },
      })
      console.log(`[Fiserv] Payment declined for user ${userId}`)
    }
  } catch (err: any) {
    console.error('[Fiserv Webhook Error]', err.message)
  }
}
