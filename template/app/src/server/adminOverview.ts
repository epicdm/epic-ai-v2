import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'

export const adminOverview = async (req: Request, res: Response) => {
  const user = (req as any).user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (!user.isAdmin) return res.status(403).json({ error: 'Forbidden' })

  const [totalUsers, proUsers, businessUsers, totalAgents, errorAgents, escalations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'pro' } }),
    prisma.user.count({ where: { plan: 'business' } }),
    prisma.agent.count(),
    prisma.agent.count({ where: { status: 'error' } }),
    prisma.agentActivity.count({ where: { type: 'escalation', resolved: false } }),
  ])

  return res.json({
    summary: {
      totalUsers,
      proUsers,
      businessUsers,
      totalAgents,
      errorAgents,
      escalations,
      estimatedMrr: proUsers * 29 + businessUsers * 99,
    },
  })
}
