/**
 * BFF standalone webhook server (ESM)
 * Handles WhatsApp webhook routing + agent status API
 * Port 3016
 */
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN || 'epic-wa-2026'
const WA_TOKEN = process.env.META_WA_TOKEN || ''
const PHONE_ID = process.env.META_PHONE_ID || '1003873729481088'
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || ''

// ─── Health ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, service: 'bff-webhook', ts: Date.now() }))

// ─── WhatsApp Webhook Verification ──────────────────────────────
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WA] Webhook verified')
    return res.status(200).send(challenge)
  }
  console.log('[WA] Verification failed', { mode, token })
  return res.sendStatus(403)
})

// ─── WhatsApp Message Handler ────────────────────────────────────
app.post('/api/whatsapp/webhook', async (req, res) => {
  res.sendStatus(200) // Ack immediately

  try {
    const entry = req.body?.entry?.[0]
    const value = entry?.changes?.[0]?.value
    if (!value?.messages?.[0]) return

    const msg = value.messages[0]
    const from = msg.from
    const messageType = msg.type
    const text = msg.text?.body?.trim() || ''

    console.log(`[WA] ${from}: "${text}" (${messageType})`)

    // ── Step 1: Activation code check ─────────────────────────────
    if (/^[A-Z0-9]{6}$/.test(text)) {
      const agent = await prisma.agent.findFirst({ where: { activationCode: text } })
      if (agent) {
        await prisma.agent.update({
          where: { id: agent.id },
          data: {
            status: 'active',
            activationCode: null,
            ownerPhone: from,
            activatedAt: new Date(),
          },
        })
        await sendWA(from, `✅ *${agent.name}* is now active!\n\nYour AI agent will reply to customers on this number. Text *help* to see owner commands.`)
        return
      }
    }

    // ── Step 2: Owner mode ─────────────────────────────────────────
    const ownerAgent = await prisma.agent.findFirst({ where: { ownerPhone: from, status: 'active' } })
    if (ownerAgent) {
      const cmd = text.toLowerCase()

      if (cmd === 'status') {
        const convCount = await prisma.conversation.count({ where: { agentId: ownerAgent.id } })
        const todayMsgs = await prisma.whatsAppMessage.count({
          where: { agentId: ownerAgent.id, createdAt: { gte: new Date(Date.now() - 86400000) } },
        })
        await sendWA(from, `📊 *${ownerAgent.name}* Status\nStatus: ${ownerAgent.status}\nTotal conversations: ${convCount}\nMessages today: ${todayMsgs}`)
        return
      }

      if (cmd === 'pause') {
        await prisma.agent.update({ where: { id: ownerAgent.id }, data: { status: 'paused' } })
        await sendWA(from, `⏸️ *${ownerAgent.name}* paused. Text *resume* to reactivate.`)
        return
      }

      if (cmd === 'resume') {
        await prisma.agent.update({ where: { id: ownerAgent.id }, data: { status: 'active' } })
        await sendWA(from, `▶️ *${ownerAgent.name}* is back online!`)
        return
      }

      if (cmd.startsWith('mode ')) {
        const mode = cmd.split(' ')[1]
        if (['auto', 'notify', 'confirm'].includes(mode)) {
          await prisma.agent.update({ where: { id: ownerAgent.id }, data: { approvalMode: mode } })
          await sendWA(from, `✅ Mode set to *${mode}*`)
          return
        }
      }

      if (cmd === 'help') {
        await sendWA(from, `*${ownerAgent.name}* Owner Commands:\n\n*status* — view stats\n*pause* / *resume* — control agent\n*mode auto* — agent replies freely\n*mode notify* — agent replies + pings you\n*mode confirm* — agent drafts, you approve\n*inbox* — recent conversations`)
        return
      }

      if (cmd === 'inbox') {
        const recent = await prisma.conversation.findMany({
          where: { agentId: ownerAgent.id },
          orderBy: { lastMessageAt: 'desc' },
          take: 5,
          include: { contact: true },
        })
        if (!recent.length) { await sendWA(from, 'No conversations yet.'); return }
        const lines = recent.map((c, i) => `${i+1}. ${c.contact?.name || c.contact?.phone || 'Unknown'} — ${c.lastMessageAt?.toLocaleDateString() || '?'}`).join('\n')
        await sendWA(from, `📥 Recent conversations:\n\n${lines}`)
        return
      }

      // Not a command — pass through to customer routing below
    }

    // ── Step 3: Returning customer (48hr window) ───────────────────
    const recentConv = await prisma.conversation.findFirst({
      where: {
        contact: { phone: from },
        lastMessageAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
      orderBy: { lastMessageAt: 'desc' },
      include: { agent: true, contact: true },
    })

    if (recentConv?.agent) {
      await handleCustomerMessage(from, text, recentConv.agent, recentConv.id)
      return
    }

    // ── Step 4: CHAT share code ────────────────────────────────────
    const shareMatch = text.match(/CHAT-([A-Z0-9]{12})/i)
    if (shareMatch) {
      const agent = await prisma.agent.findFirst({ where: { shareCode: shareMatch[1].toUpperCase(), status: 'active' } })
      if (agent) {
        await handleCustomerMessage(from, text.replace(/CHAT-[A-Z0-9]{12}/i, '').trim() || 'Hello', agent, null)
        return
      }
    }

    // ── Step 5: No agent found — prompt to sign up ─────────────────
    await sendWA(from, "👋 Hi! I'm Jenny. To get your own AI assistant, visit https://bff.epic.dm")

  } catch (err) {
    console.error('[WA Webhook Error]', err)
  }
})

async function handleCustomerMessage(from, text, agent, existingConvId) {
  const config = agent.config

  // paused?
  if (agent.status === 'paused') {
    const awayMsg = config?.awayMessage || "Hi! We're unavailable right now but will get back to you soon. 🙏"
    await sendWA(from, awayMsg)
    return
  }

  // Upsert contact
  const contact = await prisma.contact.upsert({
    where: { userId_phone: { userId: agent.userId, phone: from } },
    create: { userId: agent.userId, phone: from, name: from },
    update: { lastSeenAt: new Date() },
  })

  // Upsert conversation
  let convId = existingConvId
  if (!convId) {
    const conv = await prisma.conversation.upsert({
      where: { agentId_contactId: { agentId: agent.id, contactId: contact.id } },
      create: {
        agentId: agent.id,
        contactId: contact.id,
        userId: agent.userId,
        status: 'open',
        lastMessageAt: new Date(),
        sessionType: 'customer',
      },
      update: { lastMessageAt: new Date(), status: 'open' },
    })
    convId = conv.id
  } else {
    await prisma.conversation.update({ where: { id: convId }, data: { lastMessageAt: new Date() } })
  }

  // Store inbound message
  await prisma.whatsAppMessage.create({
    data: {
      agentId: agent.id,
      conversationId: convId,
      fromPhone: from,
      toPhone: PHONE_ID,
      direction: 'inbound',
      content: text,
      messageType: 'text',
    },
  })

  // Get history
  const history = await prisma.whatsAppMessage.findMany({
    where: { conversationId: convId, direction: { in: ['inbound', 'outbound'] } },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  // Build LLM prompt
  const knowledge = config?.knowledge || {}
  const systemPrompt = `You are ${agent.name}, an AI assistant for ${knowledge.businessName || 'this business'}.
${knowledge.services ? `Services: ${knowledge.services}` : ''}
${knowledge.hours ? `Hours: ${knowledge.hours}` : ''}
${knowledge.faq ? `FAQ: ${knowledge.faq}` : ''}
${config?.tone ? `Tone: ${config.tone}` : 'Be friendly, helpful, and concise.'}
Keep responses under 3 sentences unless more detail is needed.
If the customer wants to speak to a human, escalate by saying ESCALATE.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10).map(m => ({ role: m.direction === 'inbound' ? 'user' : 'assistant', content: m.content })),
    { role: 'user', content: text },
  ]

  // LLM call
  let reply = `Thanks for your message! A member of our team will be in touch shortly.`
  try {
    const llmRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 300 }),
    })
    const llmData = await llmRes.json()
    reply = llmData.choices?.[0]?.message?.content?.trim() || reply
  } catch (e) {
    console.error('[LLM Error]', e.message)
  }

  // Escalation detection
  const escalated = /ESCALATE/i.test(reply)
  if (escalated) {
    reply = reply.replace(/ESCALATE/gi, '').trim()
    if (agent.ownerPhone) {
      await sendWA(agent.ownerPhone, `🚨 *Escalation* from ${contact.name || from}\n\nCustomer said: "${text}"\n\nReply to them at: ${from}`)
    }
  }

  // Store outbound message
  await prisma.whatsAppMessage.create({
    data: {
      agentId: agent.id,
      conversationId: convId,
      fromPhone: PHONE_ID,
      toPhone: from,
      direction: 'outbound',
      content: reply,
      messageType: 'text',
    },
  })

  // confirm mode — don't send, ping owner instead
  const mode = agent.approvalMode || 'auto'
  if (mode === 'confirm' && agent.ownerPhone) {
    await prisma.messageDraft.create({
      data: { agentId: agent.id, conversationId: convId, draftText: reply, status: 'pending' },
    })
    await sendWA(agent.ownerPhone, `📝 Draft reply for ${contact.name || from}:\n\n"${reply}"\n\nReply SEND to approve or EDIT <new text>`)
    return
  }

  // send it
  await sendWA(from, reply)

  // notify mode — also ping owner
  if (mode === 'notify' && agent.ownerPhone) {
    await sendWA(agent.ownerPhone, `💬 *${contact.name || from}* said: "${text.slice(0, 80)}"\n\n${agent.name} replied: "${reply.slice(0, 80)}"`)
  }
}

async function sendWA(to, text) {
  if (!WA_TOKEN) { console.log(`[WA Mock→${to}] ${text}`); return }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } }),
    })
    if (!res.ok) console.error('[WA Send Error]', await res.text())
  } catch (e) {
    console.error('[WA Send]', e.message)
  }
}

// ─── Agent Status API ───────────────────────────────────────────
app.get('/api/agent/:id/status', async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({ where: { id: req.params.id } })
    if (!agent) return res.status(404).json({ error: 'Not found' })
    res.json({ id: agent.id, name: agent.name, status: agent.status, activated: !!agent.activatedAt, ownerPhone: agent.ownerPhone })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const PORT = process.env.PORT || 3016
app.listen(PORT, () => console.log(`[BFF Webhook] Listening on port ${PORT}`))
