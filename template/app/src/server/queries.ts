import {
  type GetMyAgents,
  type GetAgents,
  type GetAgent,
  type GetConversations,
  type GetContacts,
  type GetReminders,
  type GetBills,
  type GetTodos,
  type GetBroadcasts,
  type GetPaginatedUsers,
  type GetDailyStats,
  type GetWorkspaceProfile,
  type GetDashboardOverview,
  type GetCampaignsOverview,
  type GetAdminOverview,
} from 'wasp/server/operations'
import { prisma } from 'wasp/server'

const PLAN_LIMITS: Record<string, { agentLimit: number | null; messageLimit: number | null; activeCampaignLimit: number | null }> = {
  free: { agentLimit: 1, messageLimit: 50, activeCampaignLimit: 0 },
  pro: { agentLimit: 3, messageLimit: null, activeCampaignLimit: 3 },
  business: { agentLimit: null, messageLimit: null, activeCampaignLimit: null },
}

function getPlan(user: any): 'free' | 'pro' | 'business' {
  const rawPlan = user?.plan || user?.subscriptionPlan || 'free'
  return ['free', 'pro', 'business'].includes(rawPlan) ? rawPlan : 'free'
}

function toOnboardingPercent(agent: { onboardingStatus?: string | null; onboardingStep?: number | null }) {
  if (agent.onboardingStatus === 'complete') return 100
  const step = Math.max(0, Math.min(5, agent.onboardingStep || 0))
  return Math.round((step / 5) * 100)
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function startOfSevenDayWindow() {
  const date = startOfToday()
  date.setDate(date.getDate() - 6)
  return date
}

function formatPlanName(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

// ─── Workspace Profile ───────────────────────────────────────

export const getWorkspaceProfile: GetWorkspaceProfile<void, any> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const user = await prisma.user.findUnique({
    where: { id: context.user.id },
    select: { id: true, email: true, plan: true, subscriptionPlan: true, isAdmin: true, createdAt: true },
  })

  if (!user) throw new Error('User not found')

  const plan = getPlan(user)

  return {
    id: user.id,
    email: user.email,
    plan,
    planLabel: formatPlanName(plan),
    isAdmin: !!user.isAdmin,
    createdAt: user.createdAt,
    limits: PLAN_LIMITS[plan],
  }
}

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

// ─── Dashboard Overview ──────────────────────────────────────

export const getDashboardOverview: GetDashboardOverview<void, any> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const userId = context.user.id
  const plan = getPlan(context.user)
  const limits = PLAN_LIMITS[plan]
  const today = startOfToday()
  const sevenDayWindow = startOfSevenDayWindow()

  const [
    agents,
    recentConversations,
    totalConversationCounts,
    todayConversationCounts,
    todayMessageCounts,
    weeklyMessages,
    activeCampaignCount,
    attentionItems,
    intentItems,
  ] = await Promise.all([
    prisma.agent.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        template: true,
        status: true,
        onboardingStatus: true,
        onboardingStep: true,
        ownerPhone: true,
        activatedAt: true,
        createdAt: true,
      },
    }),
    prisma.conversation.findMany({
      where: { userId, sessionType: 'customer' },
      orderBy: { lastMessageAt: 'desc' },
      take: 5,
      select: {
        id: true,
        agentId: true,
        status: true,
        escalationFlag: true,
        phone: true,
        lastMessageAt: true,
        lastMessagePreview: true,
        contact: { select: { id: true, name: true, phone: true, doNotContact: true } },
        agent: { select: { id: true, name: true, template: true, status: true } },
      },
    }),
    prisma.conversation.groupBy({
      by: ['agentId'],
      where: { userId, sessionType: 'customer' },
      _count: { _all: true },
      _max: { lastMessageAt: true },
    }),
    prisma.conversation.groupBy({
      by: ['agentId'],
      where: { userId, sessionType: 'customer', lastMessageAt: { gte: today } },
      _count: { _all: true },
    }),
    prisma.whatsAppMessage.groupBy({
      by: ['agentId'],
      where: { agent: { userId }, sessionType: 'customer', timestamp: { gte: today } },
      _count: { _all: true },
      _max: { timestamp: true },
    }),
    prisma.whatsAppMessage.findMany({
      where: { agent: { userId }, sessionType: 'customer', timestamp: { gte: sevenDayWindow } },
      select: { timestamp: true },
    }),
    prisma.campaign.count({ where: { userId, status: 'active' } }),
    prisma.agentActivity.findMany({
      where: {
        agent: { userId },
        OR: [
          { type: 'escalation', resolved: false },
          { type: 'error', resolved: false },
          { type: 'health', resolved: false },
          { type: 'onboarding', resolved: false },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true,
        type: true,
        summary: true,
        metadata: true,
        createdAt: true,
        agent: { select: { id: true, name: true, template: true } },
      },
    }),
    prisma.agentActivity.findMany({
      where: { agent: { userId }, type: 'intent' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { agentId: true, summary: true, createdAt: true },
    }),
  ])

  const totalConversationMap = new Map(totalConversationCounts.map((row) => [row.agentId, row]))
  const todayConversationMap = new Map(todayConversationCounts.map((row) => [row.agentId, row]))
  const todayMessageMap = new Map(todayMessageCounts.map((row) => [row.agentId, row]))

  const latestIntentByAgent = new Map<string, { summary: string; createdAt: Date }>()
  for (const item of intentItems) {
    if (!latestIntentByAgent.has(item.agentId)) {
      latestIntentByAgent.set(item.agentId, { summary: item.summary, createdAt: item.createdAt })
    }
  }

  const totalConversations = totalConversationCounts.reduce((sum, row) => sum + row._count._all, 0)
  const conversationsToday = todayConversationCounts.reduce((sum, row) => sum + row._count._all, 0)
  const messagesToday = todayMessageCounts.reduce((sum, row) => sum + row._count._all, 0)
  const activeAgents = agents.filter((agent) => agent.status === 'active').length
  const completedOnboarding = agents.filter((agent) => agent.onboardingStatus === 'complete').length
  const onboardingPercent = agents.length
    ? Math.round(agents.reduce((sum, agent) => sum + toOnboardingPercent(agent), 0) / agents.length)
    : 0

  const weeklySeriesMap = new Map<string, number>()
  for (let i = 0; i < 7; i++) {
    const bucket = new Date(sevenDayWindow)
    bucket.setDate(sevenDayWindow.getDate() + i)
    weeklySeriesMap.set(bucket.toISOString().slice(0, 10), 0)
  }
  for (const message of weeklyMessages) {
    const key = new Date(message.timestamp).toISOString().slice(0, 10)
    weeklySeriesMap.set(key, (weeklySeriesMap.get(key) || 0) + 1)
  }
  const weeklySeries = Array.from(weeklySeriesMap.entries()).map(([date, count]) => ({
    date,
    label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    count,
  }))

  const upgradeReasons: Array<{ code: string; title: string; body: string; cta: string; recommendedPlan: string }> = []
  if (plan === 'free' && messagesToday >= 45) {
    upgradeReasons.push({
      code: 'message-limit',
      title: `You've used ${messagesToday}/50 messages today`,
      body: 'Upgrade to Pro for unlimited daily messages, full inbox controls, and owner alerts when a hot lead appears.',
      cta: 'Upgrade to Pro',
      recommendedPlan: 'pro',
    })
  }
  if (plan === 'free' && agents.length >= 1) {
    upgradeReasons.push({
      code: 'agent-limit',
      title: 'Free includes 1 agent',
      body: 'Upgrade to Pro to add up to 3 agents, unlock campaigns, and train each one for a different job.',
      cta: 'See Pro',
      recommendedPlan: 'pro',
    })
  }
  if (plan === 'pro' && limits.agentLimit !== null && agents.length >= limits.agentLimit) {
    upgradeReasons.push({
      code: 'pro-capacity',
      title: `You're using all ${limits.agentLimit} Pro agent slots`,
      body: 'Move to Business for unlimited agents, dedicated number support, and team access.',
      cta: 'Upgrade to Business',
      recommendedPlan: 'business',
    })
  }
  if (plan === 'free' && attentionItems.length > 0) {
    upgradeReasons.push({
      code: 'alerts',
      title: 'Hot leads and escalations are waiting in the dashboard',
      body: 'Pro sends instant WhatsApp alerts when Alex needs you, so you do not have to keep checking the dashboard.',
      cta: 'Unlock alerts',
      recommendedPlan: 'pro',
    })
  }

  const agentCards = agents.map((agent) => {
    const totalConversationRow = totalConversationMap.get(agent.id)
    const todayConversationRow = todayConversationMap.get(agent.id)
    const todayMessageRow = todayMessageMap.get(agent.id)
    const latestIntent = latestIntentByAgent.get(agent.id)

    return {
      id: agent.id,
      name: agent.name,
      template: agent.template,
      status: agent.status,
      onboardingStatus: agent.onboardingStatus,
      onboardingStep: agent.onboardingStep,
      onboardingPercent: toOnboardingPercent(agent),
      ownerPhoneMasked: agent.ownerPhone ? `••••${agent.ownerPhone.slice(-4)}` : null,
      activatedAt: agent.activatedAt,
      totalConversations: totalConversationRow?._count._all || 0,
      conversationsToday: todayConversationRow?._count._all || 0,
      messagesToday: todayMessageRow?._count._all || 0,
      lastMessageAt: todayMessageRow?._max.timestamp || totalConversationRow?._max.lastMessageAt || null,
      latestIntent: latestIntent || null,
    }
  })

  return {
    user: {
      id: context.user.id,
      email: context.user.email,
      plan,
      planLabel: formatPlanName(plan),
      isAdmin: !!context.user.isAdmin,
    },
    limits,
    summary: {
      agentsTotal: agents.length,
      activeAgents,
      conversationsToday,
      totalConversations,
      messagesToday,
      activeCampaigns: activeCampaignCount,
      completedOnboarding,
      onboardingPercent,
    },
    usage: {
      agentsUsed: agents.length,
      agentLimit: limits.agentLimit,
      messagesToday,
      messageLimit: limits.messageLimit,
      activeCampaigns: activeCampaignCount,
      activeCampaignLimit: limits.activeCampaignLimit,
      messageUsagePercent: limits.messageLimit ? Math.min(100, Math.round((messagesToday / limits.messageLimit) * 100)) : null,
      agentUsagePercent: limits.agentLimit ? Math.min(100, Math.round((agents.length / limits.agentLimit) * 100)) : null,
    },
    upgradePrompt: upgradeReasons[0] || null,
    upgradeReasons,
    agents: agentCards,
    needsAttention: attentionItems.map((item) => ({
      id: item.id,
      type: item.type,
      summary: item.summary,
      createdAt: item.createdAt,
      metadata: item.metadata,
      agent: item.agent,
    })),
    recentConversations: recentConversations.map((conversation) => ({
      id: conversation.id,
      status: conversation.status,
      escalationFlag: conversation.escalationFlag,
      lastMessageAt: conversation.lastMessageAt,
      lastMessagePreview: conversation.lastMessagePreview,
      phone: conversation.phone,
      contact: conversation.contact,
      agent: conversation.agent,
    })),
    weeklySeries,
  }
}

// ─── Conversations ───────────────────────────────────────────

export const getConversations: GetConversations<{ agentId?: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.conversation.findMany({
    where: {
      userId: context.user.id,
      sessionType: 'customer',
      ...(agentId ? { agentId } : {}),
    },
    include: {
      contact: true,
      agent: { select: { id: true, name: true, template: true, status: true } },
    },
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
  })
}

// ─── Contacts ─────────────────────────────────────────────────

export const getContacts: GetContacts<void, any[]> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.contact.findMany({
    where: { userId: context.user.id },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Reminders ───────────────────────────────────────────────

export const getReminders: GetReminders<{ agentId: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.reminder.findMany({
    where: { agentId, userId: context.user.id },
    orderBy: { dueAt: 'asc' },
  })
}

// ─── Bills ───────────────────────────────────────────────────

export const getBills: GetBills<{ agentId: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.bill.findMany({
    where: { agentId, userId: context.user.id },
    orderBy: { dueDate: 'asc' },
  })
}

// ─── Todos ───────────────────────────────────────────────────

export const getTodos: GetTodos<{ agentId: string }, any[]> = async ({ agentId }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.todo.findMany({
    where: { agentId, userId: context.user.id },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── Campaigns / Broadcasts compatibility ───────────────────

export const getBroadcasts: GetBroadcasts<void, any[]> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const campaigns = await prisma.campaign.findMany({
    where: { userId: context.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      agent: { select: { id: true, name: true, template: true } },
      steps: { orderBy: { stepNumber: 'asc' } },
      enrollments: { select: { status: true, exitReason: true } },
    },
  })

  return campaigns.map((campaign) => ({
    ...campaign,
    stepCount: campaign.steps.length,
    recipientCount: campaign.enrollments.length,
    activeEnrollments: campaign.enrollments.filter((item) => item.status === 'active').length,
    replies: campaign.enrollments.filter((item) => item.exitReason === 'replied').length,
    conversions: campaign.enrollments.filter((item) => item.exitReason === 'goal_met').length,
  }))
}

export const getCampaignsOverview: GetCampaignsOverview<void, any> = async (_args, context) => {
  if (!context.user) throw new Error('Not authenticated')

  const plan = getPlan(context.user)
  const limits = PLAN_LIMITS[plan]
  const campaigns = await getBroadcasts(_args, context)

  return {
    plan,
    planLabel: formatPlanName(plan),
    limits,
    activeCampaigns: campaigns.filter((campaign: any) => campaign.status === 'active').length,
    campaigns,
    backend: {
      list: true,
      create: plan !== 'free',
      launchPause: plan !== 'free',
      stats: true,
      note: plan === 'free' ? 'Campaigns are locked on Free. Upgrade to create or launch them.' : 'Campaign records and status changes are live. Automation/enrollment workers can be layered on next.'
    },
  }
}

// ─── Admin ───────────────────────────────────────────────────

export const getPaginatedUsers: GetPaginatedUsers<{ skip: number; cursor?: string }, any> = async ({ skip, cursor }, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')
  const users = await prisma.user.findMany({
    skip,
    take: 10,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, isAdmin: true, plan: true, createdAt: true },
  })
  return { users, nextCursor: users[users.length - 1]?.id }
}

export const getDailyStats: GetDailyStats<void, any> = async (_args, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')

  const totalUsers = await prisma.user.count()
  const proUsers = await prisma.user.count({ where: { plan: 'pro' } })
  const businessUsers = await prisma.user.count({ where: { plan: 'business' } })
  const totalAgents = await prisma.agent.count()

  return {
    totalUsers,
    proUsers,
    businessUsers,
    totalAgents,
    dailyStats: {
      totalViews: totalUsers,
      prevDayViewsChangePercent: 0,
      payingUsersCount: proUsers + businessUsers,
      revenue: proUsers * 29 + businessUsers * 99,
      signupsCount: totalUsers,
      sources: [
        { source: 'Free', visitors: totalUsers - proUsers - businessUsers },
        { source: 'Pro', visitors: proUsers },
        { source: 'Business', visitors: businessUsers },
      ],
    },
    weeklyStats: [],
  }
}

export const getAdminOverview: GetAdminOverview<void, any> = async (_args, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')

  const [
    totalUsers,
    freeUsers,
    proUsers,
    businessUsers,
    totalAgents,
    activeAgents,
    pausedAgents,
    errorAgents,
    pendingOnboarding,
    activeCampaigns,
    unresolvedEscalations,
    tenantRows,
    agentIssues,
    escalationQueue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'free' } }),
    prisma.user.count({ where: { plan: 'pro' } }),
    prisma.user.count({ where: { plan: 'business' } }),
    prisma.agent.count(),
    prisma.agent.count({ where: { status: 'active' } }),
    prisma.agent.count({ where: { status: 'paused' } }),
    prisma.agent.count({ where: { status: 'error' } }),
    prisma.agent.count({ where: { onboardingStatus: { in: ['pending', 'in_progress', 'timed_out'] } } }),
    prisma.campaign.count({ where: { status: 'active' } }),
    prisma.agentActivity.count({ where: { type: 'escalation', resolved: false } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        email: true,
        plan: true,
        createdAt: true,
        agents: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            name: true,
            status: true,
            onboardingStatus: true,
            updatedAt: true,
            conversations: {
              where: { sessionType: 'customer' },
              orderBy: { lastMessageAt: 'desc' },
              take: 1,
              select: { lastMessageAt: true },
            },
          },
        },
      },
    }),
    prisma.agent.findMany({
      where: {
        OR: [
          { status: 'error' },
          { onboardingStatus: 'timed_out' },
          { status: 'paused', ownerPhone: null },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        onboardingStatus: true,
        updatedAt: true,
        user: { select: { email: true, plan: true } },
      },
    }),
    prisma.agentActivity.findMany({
      where: { type: 'escalation', resolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        summary: true,
        createdAt: true,
        metadata: true,
        agent: { select: { id: true, name: true, user: { select: { email: true, plan: true } } } },
      },
    }),
  ])

  const estimatedMrr = proUsers * 29 + businessUsers * 99

  const tenants = tenantRows.map((tenant) => {
    const lastActiveAt = tenant.agents
      .flatMap((agent) => agent.conversations.map((conversation) => conversation.lastMessageAt))
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null

    const health = tenant.agents.some((agent) => agent.status === 'error')
      ? 'error'
      : tenant.agents.some((agent) => agent.onboardingStatus === 'timed_out')
        ? 'attention'
        : tenant.agents.some((agent) => agent.status === 'active')
          ? 'healthy'
          : 'draft'

    return {
      id: tenant.id,
      email: tenant.email,
      plan: tenant.plan || 'free',
      createdAt: tenant.createdAt,
      lastActiveAt,
      health,
      agentCount: tenant.agents.length,
      agents: tenant.agents,
    }
  })

  return {
    summary: {
      totalUsers,
      freeUsers,
      proUsers,
      businessUsers,
      totalAgents,
      activeAgents,
      pausedAgents,
      errorAgents,
      pendingOnboarding,
      activeCampaigns,
      unresolvedEscalations,
      estimatedMrr,
    },
    tenants,
    agentIssues,
    escalationQueue,
    compliance: {
      available: false,
      note: 'WhatsApp compliance telemetry is not yet wired into V2. Health here is derived from agent errors and unresolved escalations only.',
    },
  }
}
