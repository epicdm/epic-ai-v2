import { type ExpressHttpRequest, type ExpressHttpResponse } from 'wasp/server'
import { prisma } from 'wasp/server'
import crypto from 'crypto'

export const getAgentStatus = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
  const user = (req as any).user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const { agentId } = req.params as { agentId: string }
  const agent = await prisma.agent.findFirst({ where: { id: agentId, userId: user.id } })
  if (!agent) return res.status(404).json({ error: 'Agent not found' })

  return res.json({
    id: agent.id,
    status: agent.status,
    onboardingStatus: agent.onboardingStatus,
    onboardingStep: agent.onboardingStep,
    ownerPhone: agent.ownerPhone ? '***' + agent.ownerPhone.slice(-4) : null,
    activatedAt: agent.activatedAt,
  })
}

export const getMyAgentsHandler = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
  const user = (req as any).user
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const agents = await prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })
  return res.json(agents)
}

// Called from signup flow to create the first agent
export async function createDefaultAgent(userId: string, template: string) {
  const defaultNames: Record<string, string> = {
    receptionist: 'Alex',
    sales: 'Vera',
    collections: 'Chase',
    concierge: 'Rio',
    support: 'Sam',
    assistant: 'Max',
  }

  const name = defaultNames[template] || 'Jenny'
  const activationCode = 'BFF-' + crypto.randomBytes(5).toString('hex').toUpperCase()
  const shareCode = template === 'assistant'
    ? '' // Personal assistant has no share code
    : crypto.randomBytes(6).toString('hex').toUpperCase()

  return prisma.agent.create({
    data: {
      userId,
      name,
      template,
      status: 'draft',
      activationCode,
      activationCodeCreatedAt: new Date(),
      shareCode: shareCode || crypto.randomBytes(6).toString('hex').toUpperCase(),
      onboardingStatus: 'pending',
      config: {},
    },
  })
}
