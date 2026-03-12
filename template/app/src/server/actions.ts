import crypto from 'crypto'
import {
  type CreateAgent,
  type UpdateAgent,
  type DeleteAgent,
  type CreateReminder,
  type UpdateReminder,
  type DeleteReminder,
  type CreateBill,
  type UpdateBill,
  type DeleteBill,
  type CreateTodo,
  type UpdateTodo,
  type DeleteTodo,
  type CreateBroadcast,
  type SendBroadcast,
  type DeleteBroadcast,
  type CreateContact,
  type ImportContacts,
  type UpdateIsUserAdminById,
  type CreateCampaign,
  type UpdateCampaignStatus,
  type DeleteCampaign,
} from 'wasp/server/operations'
import { prisma } from 'wasp/server'

const PLAN_LIMITS: Record<string, { agentLimit: number | null; activeCampaignLimit: number | null }> = {
  free: { agentLimit: 1, activeCampaignLimit: 0 },
  pro: { agentLimit: 3, activeCampaignLimit: 3 },
  business: { agentLimit: null, activeCampaignLimit: null },
}

function getPlan(user: any): 'free' | 'pro' | 'business' {
  const rawPlan = user?.plan || user?.subscriptionPlan || 'free'
  return ['free', 'pro', 'business'].includes(rawPlan) ? rawPlan : 'free'
}

function defaultAgentName(template?: string) {
  const defaults: Record<string, string> = {
    receptionist: 'Alex',
    sales: 'Vera',
    collections: 'Chase',
    concierge: 'Rio',
    support: 'Sam',
    assistant: 'Max',
  }
  return defaults[template || ''] || 'Jenny'
}

function buildAgentConfig(args: { purpose?: string; tone?: string }) {
  return {
    purpose: args.purpose || '',
    tone: args.tone || '',
    knowledge: {},
    quietHours: null,
    language: 'en',
  }
}

async function assertCampaignPermission(user: any) {
  const plan = getPlan(user)
  if (plan === 'free') {
    throw new Error('Campaigns are available on Pro and Business plans.')
  }
  return { plan, limits: PLAN_LIMITS[plan] }
}

// ─── Agents ──────────────────────────────────────────────────

export const createAgent: CreateAgent<{ name?: string; template?: string; purpose?: string; tone?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const plan = getPlan(context.user)
  const count = await prisma.agent.count({ where: { userId: context.user.id } })
  const limit = PLAN_LIMITS[plan]?.agentLimit

  if (limit !== null && count >= limit) {
    throw new Error(`Your ${plan} plan allows ${limit} agent(s). Upgrade to add more.`)
  }

  const template = args.template || 'receptionist'

  return prisma.agent.create({
    data: {
      userId: context.user.id,
      name: args.name?.trim() || defaultAgentName(template),
      template,
      status: 'draft',
      activationCode: 'BFF-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
      activationCodeCreatedAt: new Date(),
      shareCode: crypto.randomBytes(6).toString('hex').toUpperCase(),
      onboardingStatus: 'pending',
      onboardingStep: 0,
      config: buildAgentConfig(args),
    },
  })
}

export const updateAgent: UpdateAgent<{ id: string; [key: string]: any }, any> = async ({ id, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const agent = await prisma.agent.findFirst({ where: { id, userId: context.user.id } })
  if (!agent) throw new Error('Agent not found')

  const nextData = { ...data }

  if ('purpose' in nextData || 'tone' in nextData) {
    const currentConfig = typeof agent.config === 'object' && agent.config ? (agent.config as Record<string, any>) : {}
    nextData.config = {
      ...currentConfig,
      ...(nextData.purpose !== undefined ? { purpose: nextData.purpose } : {}),
      ...(nextData.tone !== undefined ? { tone: nextData.tone } : {}),
    }
    delete nextData.purpose
    delete nextData.tone
  }

  if ('whatsappNumber' in nextData) {
    nextData.ownerPhone = nextData.whatsappNumber || null
    delete nextData.whatsappNumber
  }

  if ('inboundRouting' in nextData) {
    const currentConfig = (nextData.config as Record<string, any>) || (typeof agent.config === 'object' && agent.config ? (agent.config as Record<string, any>) : {})
    nextData.config = { ...currentConfig, inboundRouting: nextData.inboundRouting }
    delete nextData.inboundRouting
  }

  return prisma.agent.update({ where: { id }, data: nextData })
}

export const deleteAgent: DeleteAgent<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.agent.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Reminders ───────────────────────────────────────────────

export const createReminder: CreateReminder<{ agentId: string; text?: string; title?: string; datetime?: string; dueAt?: string; recurring?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.reminder.create({
    data: {
      userId: context.user.id,
      agentId: args.agentId,
      title: args.title || args.text || 'Reminder',
      dueAt: new Date(args.dueAt || args.datetime || new Date().toISOString()),
      recurring: args.recurring,
    },
  })
}

export const updateReminder: UpdateReminder<{ id: string; sent?: boolean; done?: boolean; text?: string; title?: string }, any> = async ({ id, sent, text, title, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.reminder.updateMany({
    where: { id, userId: context.user.id },
    data: {
      ...data,
      ...(sent !== undefined ? { done: sent } : {}),
      ...(title || text ? { title: title || text } : {}),
    },
  })
}

export const deleteReminder: DeleteReminder<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.reminder.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Bills ───────────────────────────────────────────────────

export const createBill: CreateBill<{ agentId: string; name: string; amount: number; dueDate: string; recurring?: string | boolean }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.bill.create({
    data: {
      userId: context.user.id,
      agentId: args.agentId,
      name: args.name,
      amount: args.amount,
      dueDate: new Date(args.dueDate),
      recurring: !!args.recurring,
    },
  })
}

export const updateBill: UpdateBill<{ id: string; paid?: boolean; amount?: number }, any> = async ({ id, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.bill.updateMany({ where: { id, userId: context.user.id }, data })
}

export const deleteBill: DeleteBill<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.bill.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Todos ───────────────────────────────────────────────────

export const createTodo: CreateTodo<{ agentId: string; text?: string; title?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.todo.create({
    data: { userId: context.user.id, agentId: args.agentId, title: args.title || args.text || 'Todo' },
  })
}

export const updateTodo: UpdateTodo<{ id: string; done?: boolean; text?: string; title?: string }, any> = async ({ id, text, title, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.todo.updateMany({
    where: { id, userId: context.user.id },
    data: {
      ...data,
      ...(title || text ? { title: title || text } : {}),
    },
  })
}

export const deleteTodo: DeleteTodo<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.todo.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Campaigns ───────────────────────────────────────────────

export const createCampaign: CreateCampaign<{ agentId: string; name: string; type: string; goal: string; firstMessage?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await assertCampaignPermission(context.user)

  const agent = await prisma.agent.findFirst({ where: { id: args.agentId, userId: context.user.id } })
  if (!agent) throw new Error('Agent not found')

  return prisma.campaign.create({
    data: {
      userId: context.user.id,
      agentId: args.agentId,
      name: args.name,
      type: args.type,
      goal: args.goal,
      status: 'draft',
      audienceFilter: {},
      steps: args.firstMessage
        ? {
            create: [{
              stepNumber: 1,
              delayDays: 0,
              message: args.firstMessage,
            }],
          }
        : undefined,
    },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: true,
    },
  })
}

export const updateCampaignStatus: UpdateCampaignStatus<{ id: string; status: 'draft' | 'active' | 'paused' | 'completed' }, any> = async ({ id, status }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const { plan, limits } = await assertCampaignPermission(context.user)

  const campaign = await prisma.campaign.findFirst({ where: { id, userId: context.user.id } })
  if (!campaign) throw new Error('Campaign not found')

  if (status === 'active' && plan === 'pro' && limits.activeCampaignLimit !== null && campaign.status !== 'active') {
    const activeCount = await prisma.campaign.count({ where: { userId: context.user.id, status: 'active' } })
    if (activeCount >= limits.activeCampaignLimit) {
      throw new Error(`Pro allows ${limits.activeCampaignLimit} active campaigns at a time. Pause one or upgrade to Business.`)
    }
  }

  return prisma.campaign.update({ where: { id }, data: { status } })
}

export const deleteCampaign: DeleteCampaign<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.campaign.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Broadcasts compatibility wrappers ───────────────────────

export const createBroadcast: CreateBroadcast<{ agentId: string; name: string; message: string; phones?: string[] }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await assertCampaignPermission(context.user)

  const agent = await prisma.agent.findFirst({ where: { id: args.agentId, userId: context.user.id } })
  if (!agent) throw new Error('Agent not found')

  return prisma.campaign.create({
    data: {
      userId: context.user.id,
      agentId: args.agentId,
      name: args.name,
      type: 'drip',
      goal: 'reply',
      status: 'draft',
      audienceFilter: {},
      steps: {
        create: [{ stepNumber: 1, delayDays: 0, message: args.message }],
      },
    },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: true,
    },
  })
}

export const sendBroadcast: SendBroadcast<{ id: string }, { sentCount: number; failedCount: number }> = async ({ id }, context) => {
  await updateCampaignStatus({ id, status: 'active' }, context)
  return { sentCount: 0, failedCount: 0 }
}

export const deleteBroadcast: DeleteBroadcast<{ id: string }, void> = async ({ id }, context) => {
  await deleteCampaign({ id }, context)
}

// ─── Contacts ─────────────────────────────────────────────────

export const createContact: CreateContact<{ name: string; phone?: string; email?: string; notes?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.contact.create({
    data: {
      userId: context.user.id,
      name: args.name,
      phone: args.phone || '',
      email: args.email,
      ownerNotes: args.notes,
    },
  })
}

export const importContacts: ImportContacts<{ contacts: Array<{ name: string; phone?: string; email?: string }> }, { count: number }> = async ({ contacts }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const created = await prisma.contact.createMany({
    data: contacts.map((contact) => ({
      userId: context.user!.id,
      name: contact.name,
      phone: contact.phone || '',
      email: contact.email,
    })),
    skipDuplicates: true,
  })
  return { count: created.count }
}

// ─── Admin ───────────────────────────────────────────────────

export const updateIsUserAdminById: UpdateIsUserAdminById<{ id: string; isAdmin: boolean }, any> = async ({ id, isAdmin }, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')
  return prisma.user.update({ where: { id }, data: { isAdmin } })
}
