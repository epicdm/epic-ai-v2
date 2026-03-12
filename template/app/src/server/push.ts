import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'
import webpush from 'web-push'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_EMAIL = process.env.VAPID_CONTACT_EMAIL || 'admin@epic.dm'

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC, VAPID_PRIVATE)
}

// POST /api/push/subscribe
export const pushSubscribePost = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const { endpoint, p256dh, auth } = req.body
    if (!endpoint || !p256dh || !auth) return res.status(400).json({ error: 'Missing fields' })

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId: user.id, endpoint, p256dh, auth },
      update: { userId: user.id, p256dh, auth },
    })

    return res.json({ ok: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}

// DELETE /api/push/subscribe
export const pushSubscribeDelete = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    const { endpoint } = req.body
    if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } })
    return res.json({ ok: true })
  } catch {
    return res.json({ ok: false })
  }
}

// POST /api/push/notify — called by Asterisk shell script
export const pushNotify = async (req: Request, res: Response) => {
  res.status(200).json({ ok: true })

  try {
    const authHeader = req.headers.authorization
    if (authHeader !== 'Bearer bff-internal-2026') return

    const { userId, title, body, data } = req.body
    if (!userId) return

    const subs = await prisma.pushSubscription.findMany({ where: { userId } })
    const payload = JSON.stringify({ title: title || 'Incoming Call', body: body || 'Tap to answer', data })

    for (const sub of subs) {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
      } catch (e: any) {
        if (e.statusCode === 410) await prisma.pushSubscription.delete({ where: { id: sub.id } })
      }
    }
  } catch (err: any) {
    console.error('[Push Notify]', err.message)
  }
}
