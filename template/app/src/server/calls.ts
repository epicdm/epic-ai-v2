import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'
import { AccessToken, SipClient } from 'livekit-server-sdk'

const LK_API_KEY = process.env.LIVEKIT_API_KEY || 'APIfFhqC7dRApB2'
const LK_API_SECRET = process.env.LIVEKIT_API_SECRET || 'U5ln2qZ6BDX1SwYBnla31AgcyhInbSuepNDYPIfhs9V'
const LK_URL = process.env.LIVEKIT_URL || 'wss://ai-agent-dl6ldsi8.livekit.cloud'
const EPIC_SHARED_INBOUND_TRUNK = process.env.LK_SIP_TRUNK_ID || 'ST_WEc3Hz4Xerb9'

// In-memory incoming call store (small scale, replace with Redis for production)
const pendingCalls = new Map<string, { caller: string; roomName: string; at: number }>()

// POST /api/calls/outbound
export const callsOutbound = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const plan = user.subscriptionPlan || 'free'
    if (plan === 'free') return res.status(403).json({ error: 'PSTN calling requires Pro plan', upgrade: true })

    const { toNumber, agentId } = req.body
    if (!toNumber) return res.status(400).json({ error: 'toNumber required' })

    const roomName = `pstn-${Date.now()}`
    const participantName = `user-${user.id}`

    // Create user token
    const token = new AccessToken(LK_API_KEY, LK_API_SECRET, { identity: participantName, ttl: '1h' })
    token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true })
    const jwt = await token.toJwt()

    // Initiate outbound SIP call via LiveKit
    const sipClient = new SipClient(LK_URL, LK_API_KEY, LK_API_SECRET)
    const normalized = toNumber.replace(/[^0-9]/g, '')
    const e164 = normalized.length === 7 ? `+1767${normalized}` :
                 normalized.length === 10 ? `+1${normalized}` :
                 normalized.startsWith('1') ? `+${normalized}` : `+${normalized}`

    await sipClient.createSipParticipant(EPIC_SHARED_INBOUND_TRUNK, e164, roomName, {
      participantIdentity: `pstn-${e164}`,
      participantName: e164,
    })

    return res.json({ token: jwt, url: LK_URL, roomName })
  } catch (err: any) {
    console.error('[Calls Outbound]', err)
    return res.status(500).json({ error: err.message || 'Call failed' })
  }
}

// GET /api/calls/incoming?userId=xxx
export const callsIncomingGet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query
    if (!userId) return res.json({ call: null })

    // Clean up stale calls (>30s)
    for (const [uid, call] of pendingCalls.entries()) {
      if (Date.now() - call.at > 30000) pendingCalls.delete(uid)
    }

    const call = pendingCalls.get(userId as string) || null
    return res.json({ call })
  } catch {
    return res.json({ call: null })
  }
}

// DELETE /api/calls/incoming
export const callsIncomingDelete = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    pendingCalls.delete(user.id)
    return res.json({ ok: true })
  } catch {
    return res.json({ ok: false })
  }
}

// Called by Asterisk shell script to notify browser of incoming call
export function registerIncomingCall(userId: string, caller: string, roomName: string) {
  pendingCalls.set(userId, { caller, roomName, at: Date.now() })
}
