import { type CreateAgent, type UpdateAgent, type DeleteAgent, type CreateReminder, type UpdateReminder, type DeleteReminder, type CreateBill, type UpdateBill, type DeleteBill, type CreateTodo, type UpdateTodo, type DeleteTodo, type CreateBroadcast, type SendBroadcast, type DeleteBroadcast, type CreateContact, type ImportContacts, type UpdateIsUserAdminById } from 'wasp/server/operations'
import { prisma } from 'wasp/server'

const PLAN_LIMITS: Record<string, number> = { free: 1, pro: 3, business: Infinity }

function getPlan(user: any): string {
  return user.subscriptionPlan || 'free'
}

// ─── Agents ──────────────────────────────────────────────────

export const createAgent: CreateAgent<{ name: string; template?: string; purpose?: string; tone?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const plan = getPlan(context.user)
  const count = await prisma.agent.count({ where: { userId: context.user.id } })
  const limit = PLAN_LIMITS[plan] ?? 1
  if (count >= limit) throw new Error(`Your ${plan} plan allows ${limit} agent(s). Upgrade to add more.`)
  return prisma.agent.create({
    data: { userId: context.user.id, ...args, status: 'draft' },
  })
}

export const updateAgent: UpdateAgent<{ id: string; [key: string]: any }, any> = async ({ id, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const agent = await prisma.agent.findFirst({ where: { id, userId: context.user.id } })
  if (!agent) throw new Error('Agent not found')
  return prisma.agent.update({ where: { id }, data })
}

export const deleteAgent: DeleteAgent<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.agent.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Reminders ────────────────────────────────────────────────

export const createReminder: CreateReminder<{ agentId: string; text: string; datetime: string; recurring?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.reminder.create({
    data: { userId: context.user.id, ...args, datetime: new Date(args.datetime) },
  })
}

export const updateReminder: UpdateReminder<{ id: string; sent?: boolean; text?: string }, any> = async ({ id, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.reminder.updateMany({ where: { id, userId: context.user.id }, data })
}

export const deleteReminder: DeleteReminder<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.reminder.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Bills ────────────────────────────────────────────────────

export const createBill: CreateBill<{ agentId: string; name: string; amount: number; dueDate: string; recurring?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.bill.create({
    data: { userId: context.user.id, ...args, dueDate: new Date(args.dueDate) },
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

// ─── Todos ────────────────────────────────────────────────────

export const createTodo: CreateTodo<{ agentId: string; text: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.todo.create({ data: { userId: context.user.id, ...args } })
}

export const updateTodo: UpdateTodo<{ id: string; done?: boolean; text?: string }, any> = async ({ id, ...data }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.todo.updateMany({ where: { id, userId: context.user.id }, data })
}

export const deleteTodo: DeleteTodo<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.todo.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Broadcasts ───────────────────────────────────────────────

export const createBroadcast: CreateBroadcast<{ agentId: string; name: string; message: string; phones: string[] }, any> = async ({ agentId, name, message, phones }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const plan = getPlan(context.user)
  if (plan === 'free') throw new Error('Broadcasts require Pro or Business plan')
  if (plan === 'pro' && phones.length > 500) throw new Error('Pro plan: max 500 recipients per broadcast')

  const broadcast = await prisma.broadcast.create({
    data: {
      userId: context.user.id,
      agentId,
      name,
      message,
      recipientCount: phones.length,
      recipients: {
        create: phones.map((phone) => ({ phone })),
      },
    },
    include: { recipients: true },
  })
  return broadcast
}

export const sendBroadcast: SendBroadcast<{ id: string }, { sentCount: number; failedCount: number }> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const broadcast = await prisma.broadcast.findFirst({
    where: { id, userId: context.user.id },
    include: { recipients: true, agent: true },
  })
  if (!broadcast) throw new Error('Broadcast not found')

  await prisma.broadcast.update({ where: { id }, data: { status: 'sending' } })

  const WA_TOKEN = process.env.WHATSAPP_TOKEN!
  const PHONE_ID = process.env.WHATSAPP_PHONE_ID!

  let sentCount = 0
  let failedCount = 0

  for (const recipient of broadcast.recipients) {
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: recipient.phone,
          type: 'text',
          text: { body: broadcast.message },
        }),
      })
      if (res.ok) {
        await prisma.broadcastRecipient.update({ where: { id: recipient.id }, data: { status: 'sent', sentAt: new Date() } })
        sentCount++
      } else {
        const err = await res.text()
        await prisma.broadcastRecipient.update({ where: { id: recipient.id }, data: { status: 'failed', error: err.slice(0, 200) } })
        failedCount++
      }
    } catch (e: any) {
      await prisma.broadcastRecipient.update({ where: { id: recipient.id }, data: { status: 'failed', error: e.message } })
      failedCount++
    }
  }

  await prisma.broadcast.update({
    where: { id },
    data: { status: failedCount === broadcast.recipients.length ? 'failed' : 'sent', sentCount, failedCount, sentAt: new Date() },
  })

  return { sentCount, failedCount }
}

export const deleteBroadcast: DeleteBroadcast<{ id: string }, void> = async ({ id }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  await prisma.broadcast.deleteMany({ where: { id, userId: context.user.id } })
}

// ─── Contacts ─────────────────────────────────────────────────

export const createContact: CreateContact<{ name: string; phone?: string; email?: string; notes?: string }, any> = async (args, context) => {
  if (!context.user) throw new Error('Not authenticated')
  return prisma.contact.create({ data: { userId: context.user.id, ...args } })
}

export const importContacts: ImportContacts<{ contacts: Array<{ name: string; phone?: string; email?: string }> }, { count: number }> = async ({ contacts }, context) => {
  if (!context.user) throw new Error('Not authenticated')
  const created = await prisma.contact.createMany({
    data: contacts.map((c) => ({ ...c, userId: context.user!.id })),
    skipDuplicates: true,
  })
  return { count: created.count }
}

// ─── Admin ────────────────────────────────────────────────────

export const updateIsUserAdminById: UpdateIsUserAdminById<{ id: string; isAdmin: boolean }, any> = async ({ id, isAdmin }, context) => {
  if (!context.user?.isAdmin) throw new Error('Not authorized')
  return prisma.user.update({ where: { id }, data: { isAdmin } })
}
