/**
 * Clerk auth middleware — BFF-SPEC.md Section 7.0
 * All /api/* routes except webhooks must use this.
 */
import { type ExpressHttpRequest, type ExpressHttpResponse } from 'wasp/server'
import { prisma } from 'wasp/server'
import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY || '' })

export async function requireAuth(
  req: ExpressHttpRequest,
  res: ExpressHttpResponse,
  next: () => void
) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing auth token' })
    }

    const token = authHeader.slice(7)
    const payload = await clerk.verifyToken(token)
    const clerkId = payload.sub

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    ;(req as any).user = user
    next()
  } catch (err) {
    console.error('[Auth] Token verification failed:', err)
    return res.status(401).json({ error: 'Invalid token' })
  }
}
