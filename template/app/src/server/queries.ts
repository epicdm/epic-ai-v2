import { type GetMyAgents, type GetAgents, type GetAgent, type GetConversations, type GetContacts, type GetReminders, type GetBills, type GetTodos, type GetBroadcasts, type GetPaginatedUsers, type GetDailyStats } from 'wasp/server/operations'
import { prisma } from 'wasp/server'

const PLAN_LIMITS: Record<string, number> = { free: 1, pro: 3, business: Infinity }

// ─── Agents ──────────────────────────────────────────────────

export const getMyAgents: GetMyAgents<void, any[]> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.agent.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'asc' },
  })
}

export const getAgents: GetAgents<void, any[]> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.agent.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'asc' },
  })
}

export const getAgent: GetAgent<{ id: string }, any> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const agent = await prisma.agent.findFirst({ where: { id, userId: context.user.id } })
  if (!agent) throw new Error('Agent not found')
  return agent
}

// ─── Conversations ────────────────────────────────────────────

export const getConversations: GetConversations<{ agentId?: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.conversation.findMany({
    where: {
      userId: context.user.id,
      ...(agentId ? { agentId } : {}),
    },
    include: {
      contact: true,
      agent: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })
}

// ─── Contacts ─────────────────────────────────────────────────

export const getContacts: GetContacts<void, any[]> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.contact.findMany({
    where: { userId: context.user.id },
    orderBy: { name: 'asc' },
  })
}

// ─── Reminders ────────────────────────────────────────────────

export const getReminders: GetReminders<{ agentId: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.reminder.findMany({
    where: { agentId, userId: context.user.id },
    orderBy: { datetime: 'asc' },
  })
}

// ─── Bills ────────────────────────────────────────────────────

export const getBills: GetBills<{ agentId: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.bill.findMany({
    where: { agentId, userId: context.user.id },
    orderBy: { dueDate: 'asc' },
  })
}

// ─── Todos ────────────────────────────────────────────────────

export const getTodos: GetTodos<{ agentId: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.todo.findMany({
    where: { agentId, userId: context.user.id },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Broadcasts ───────────────────────────────────────────────

export const getBroadcasts: GetBroadcasts<void, any[]> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.broadcast.findMany({
    where: { userId: context.user.id },
    include: { agent: { select: { name: true } }, recipients: true },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Admin ────────────────────────────────────────────────────

export const getPaginatedUsers: GetPaginatedUsers<{ skip: number; cursor?: string }, any> = async ({ skip, cursor }, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')
  const users = await prisma.user.findMany({
    skip,
    take: 10,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, username: true, isAdmin: true, subscriptionPlan: true, createdAt: true },
  })
  return { users, nextCursor: users[users.length - 1]?.id }
}

export const getDailyStats: GetDailyStats<void, any> = async (_args, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')
  const totalUsers = await prisma.user.count()
  const proUsers = await prisma.user.count({ where: { subscriptionPlan: 'pro' } })
  const businessUsers = await prisma.user.count({ where: { subscriptionPlan: 'business' } })
  const totalAgents = await prisma.agent.count()
  return { totalUsers, proUsers, businessUsers, totalAgents }
}
