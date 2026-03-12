import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'

function getPlan(user: any): 'free' | 'pro' | 'business' {
  const rawPlan = user?.plan || user?.subscriptionPlan || 'free'
  return ['free', 'pro', 'business'].includes(rawPlan) ? rawPlan : 'free'
}

function getUser(req: Request) {
  return (req as any).user
}

async function requireCampaign(req: Request, res: Response) {
  const user = getUser(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId: user.id },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return null
  }

  return { user, campaign }
}

function withStats(campaign: any) {
  return {
    ...campaign,
    recipientCount: campaign.enrollments.length,
    activeEnrollments: campaign.enrollments.filter((item: any) => item.status === 'active').length,
    replies: campaign.enrollments.filter((item: any) => item.exitReason === 'replied').length,
    conversions: campaign.enrollments.filter((item: any) => item.exitReason === 'goal_met').length,
  }
}

export const campaignsList = async (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const campaigns = await prisma.campaign.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  return res.json(campaigns.map(withStats))
}

export const campaignsCreate = async (req: Request, res: Response) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })
  if (getPlan(user) === 'free') return res.status(403).json({ error: 'Campaigns require Pro or Business.' })

  const { agentId, name, type = 'sales', goal = 'reply', firstMessage } = req.body || {}
  if (!agentId || !name) return res.status(400).json({ error: 'agentId and name are required' })

  const agent = await prisma.agent.findFirst({ where: { id: agentId, userId: user.id } })
  if (!agent) return res.status(404).json({ error: 'Agent not found' })

  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      agentId,
      name,
      type,
      goal,
      status: 'draft',
      audienceFilter: {},
      steps: firstMessage
        ? {
            create: [{ stepNumber: 1, delayDays: 0, message: firstMessage }],
          }
        : undefined,
    },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  return res.status(201).json(withStats(campaign))
}

export const campaignsDetail = async (req: Request, res: Response) => {
  const payload = await requireCampaign(req, res)
  if (!payload) return
  return res.json(withStats(payload.campaign))
}

export const campaignsUpdate = async (req: Request, res: Response) => {
  const payload = await requireCampaign(req, res)
  if (!payload) return

  const { name, type, goal, status } = req.body || {}
  const campaign = await prisma.campaign.update({
    where: { id: payload.campaign.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(goal !== undefined ? { goal } : {}),
      ...(status !== undefined ? { status } : {}),
    },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  return res.json(withStats(campaign))
}

export const campaignsDelete = async (req: Request, res: Response) => {
  const payload = await requireCampaign(req, res)
  if (!payload) return
  await prisma.campaign.delete({ where: { id: payload.campaign.id } })
  return res.status(204).send()
}

export const campaignsLaunch = async (req: Request, res: Response) => {
  const payload = await requireCampaign(req, res)
  if (!payload) return

  const plan = getPlan(payload.user)
  if (plan === 'free') return res.status(403).json({ error: 'Campaigns require Pro or Business.' })
  if (plan === 'pro' && payload.campaign.status !== 'active') {
    const activeCount = await prisma.campaign.count({ where: { userId: payload.user.id, status: 'active' } })
    if (activeCount >= 3) {
      return res.status(409).json({ error: 'Pro allows 3 active campaigns at a time.' })
    }
  }

  const campaign = await prisma.campaign.update({
    where: { id: payload.campaign.id },
    data: { status: 'active' },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  return res.json(withStats(campaign))
}

export const campaignsPause = async (req: Request, res: Response) => {
  const payload = await requireCampaign(req, res)
  if (!payload) return

  const campaign = await prisma.campaign.update({
    where: { id: payload.campaign.id },
    data: { status: 'paused' },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  return res.json(withStats(campaign))
}
