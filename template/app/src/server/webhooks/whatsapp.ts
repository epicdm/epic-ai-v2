import { type ExpressHttpRequest, type ExpressHttpResponse } from 'wasp/server'
import { prisma } from 'wasp/server'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'epic-wa-2026'
const WA_TOKEN = process.env.WHATSAPP_TOKEN || ''
const PHONE_ID = process.env.WHATSAPP_PHONE_ID || '1003873729481088'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

// ─── Webhook verification ─────────────────────────────────────

export const whatsappWebhookVerify = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WA Webhook] Verified')
    return res.status(200).send(challenge)
  }
  return res.status(403).send('Forbidden')
}

// ─── Send WhatsApp message ────────────────────────────────────

async function sendWAMessage(to: string, text: string) {
  await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
}

// ─── Get AI response from DeepSeek ───────────────────────────

async function getAIResponse(agent: any, userMessage: string, history: Array<{ role: string; content: string }>) {
  const systemPrompt = agent.soul || agent.purpose ||
    `You are ${agent.name}, a helpful AI assistant. ${agent.tone ? `Your tone is ${agent.tone}.` : ''}`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ]

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-chat', messages, max_tokens: 500 }),
  })

  if (!res.ok) return "I'm having trouble responding right now. Please try again in a moment."
  const data = await res.json()
  return data.choices?.[0]?.message?.content || "I didn't quite get that. Can you try again?"
}

// ─── Main webhook handler ─────────────────────────────────────

export const whatsappWebhook = async (req: ExpressHttpRequest, res: ExpressHttpResponse) => {
  // Acknowledge immediately
  res.status(200).send('OK')

  try {
    const body = req.body
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (!value?.messages?.length) return

    const msg = value.messages[0]
    const from = msg.from // sender phone number
    const msgType = msg.type

    // Only handle text messages for now
    if (msgType !== 'text') return

    const userText = msg.text?.body || ''
    if (!userText.trim()) return

    console.log(`[WA] Message from ${from}: ${userText.slice(0, 80)}`)

    // Find agent by WhatsApp phone number (business number)
    // The business number is the whatsappNumber in WABA metadata
    const businessNumber = value?.metadata?.phone_number_id

    // Find the agent that owns this WhatsApp number
    // We match by agentId or fall back to finding any active agent for this user
    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { whatsappNumber: from },
          { status: 'active' },
        ],
      },
      include: { user: true },
    })

    if (!agent) {
      console.log('[WA] No agent found for this message')
      return
    }

    // Get or create conversation
    let contact = await prisma.contact.findFirst({
      where: { phone: from, userId: agent.userId },
    })
    if (!contact) {
      contact = await prisma.contact.create({
        data: { userId: agent.userId, name: from, phone: from },
      })
    }

    let conversation = await prisma.conversation.findFirst({
      where: { agentId: agent.id, contactId: contact.id },
    })
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { userId: agent.userId, agentId: agent.id, contactId: contact.id },
      })
    }

    // Save inbound message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: 'inbound',
        text: userText,
        status: 'received',
      },
    })

    // Also save to WhatsAppMessage (for history/context)
    await prisma.whatsAppMessage.create({
      data: { agentId: agent.id, phone: from, role: 'user', content: userText },
    })

    // Get recent history for context
    const history = await prisma.whatsAppMessage.findMany({
      where: { agentId: agent.id, phone: from },
      orderBy: { timestamp: 'asc' },
      take: 20,
    })

    const historyForAI = history.map((m: any) => ({ role: m.role, content: m.content }))

    // Get AI response
    const aiResponse = await getAIResponse(agent, userText, historyForAI)

    // Save AI response
    await prisma.whatsAppMessage.create({
      data: { agentId: agent.id, phone: from, role: 'assistant', content: aiResponse },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: 'outbound',
        text: aiResponse,
        status: 'sent',
        sentAt: new Date(),
      },
    })

    // Send response via WhatsApp
    await sendWAMessage(from, aiResponse)

  } catch (err: any) {
    console.error('[WA Webhook Error]', err.message)
  }
}
