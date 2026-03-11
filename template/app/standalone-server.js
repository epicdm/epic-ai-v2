#!/usr/bin/env node
/**
 * Standalone Express server for BFF WhatsApp webhook + agent status API
 * Runs on port 3016, independent of Wasp build.
 */
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN || 'epic-wa-2026'
const WA_TOKEN = process.env.META_WA_TOKEN || ''
const PHONE_ID = process.env.META_PHONE_ID || '1003873729481088'

// ─── WhatsApp Webhook Verification ──────────────────────────────
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WA Webhook] Verified')
    res.status(200).send(challenge)
  } else {
    console.log('[WA Webhook] Verification failed')
    res.sendStatus(403)
  }
})

// ─── WhatsApp Webhook Handler (simplified) ──────────────────────
app.post('/api/whatsapp/webhook', async (req, res) => {
  console.log('[WA Webhook] Received', req.body?.object)
  res.sendStatus(200)

  const entry = req.body?.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value

  if (!value?.messages?.[0]) return

  const message = value.messages[0]
  const from = message.from
  const text = message.text?.body || ''

  console.log(`[WA Webhook] ${from}: ${text}`)

  // Step 1: Activation code?
  if (text.length === 6 && /^[A-Z0-9]{6}$/.test(text)) {
    const agent = await prisma.agent.findFirst({
      where: { activationCode: text },
    })
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
      await sendWAMessage(from, `✅ Activated! Your agent "${agent.name}" is now live.`)
      return
    }
  }

  // Step 2: Owner mode?
  const ownerAgent = await prisma.agent.findFirst({
    where: { ownerPhone: from },
  })
  if (ownerAgent) {
    // Owner commands
    if (text.toLowerCase() === 'status') {
      const convs = await prisma.conversation.count({ where: { agentId: ownerAgent.id } })
      await sendWAMessage(from, `📊 ${ownerAgent.name}: ${convs} conversations, status ${ownerAgent.status}`)
      return
    }
    // Forward to agent routing
  }

  // Step 3: Find agent by share code (CHAT-xxxxxx)
  const shareMatch = text.match(/CHAT-([A-Z0-9]{12})/)
  if (shareMatch) {
    const shareCode = shareMatch[1]
    const agent = await prisma.agent.findFirst({ where: { shareCode } })
    if (agent) {
      // Create conversation and reply with LLM (simplified)
      await sendWAMessage(from, `👋 Hi! This is ${agent.name}. I'll help you shortly.`)
      return
    }
  }

  // Step 4: Default routing — find most recent agent for this phone
  const contact = await prisma.contact.findFirst({ where: { phone: from } })
  if (contact) {
    const conv = await prisma.conversation.findFirst({
      where: { contactId: contact.id },
      orderBy: { lastMessageAt: 'desc' },
      include: { agent: true },
    })
    if (conv && conv.agent) {
      await sendWAMessage(from, `👋 ${conv.agent.name}: Thanks for your message!`)
      return
    }
  }

  // No agent found — generic reply
  await sendWAMessage(from, "👋 Hi! I'm Jenny, your AI assistant. To get started, please visit bff.epic.dm")
})

async function sendWAMessage(to, text) {
  if (!WA_TOKEN) {
    console.log(`[WA Mock] ${to}: ${text}`)
    return
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WA_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    })
    if (!res.ok) {
      console.error('[WA Send]', await res.text())
    }
  } catch (e) {
    console.error('[WA Send]', e.message)
  }
}

// ─── Agent Status API ───────────────────────────────────────────
app.get('/api/agent/:id/status', async (req, res) => {
  const { id } = req.params
  const agent = await prisma.agent.findUnique({ where: { id } })
  if (!agent) return res.status(404).json({ error: 'Agent not found' })
  res.json({
    id: agent.id,
    name: agent.name,
    status: agent.status,
    activated: agent.activatedAt !== null,
    ownerPhone: agent.ownerPhone,
  })
})

// ─── Health ─────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ ok: true, service: 'bff-webhook' }))

const PORT = process.env.PORT || 3016
app.listen(PORT, () => {
  console.log(`BFF Webhook server listening on port ${PORT}`)
})
