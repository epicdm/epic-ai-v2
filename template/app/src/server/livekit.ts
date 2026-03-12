import type { Request, Response } from 'express'
import { AccessToken } from 'livekit-server-sdk'

const LK_API_KEY = process.env.LIVEKIT_API_KEY || 'APIfFhqC7dRApB2'
const LK_API_SECRET = process.env.LIVEKIT_API_SECRET || 'U5ln2qZ6BDX1SwYBnla31AgcyhInbSuepNDYPIfhs9V'
const LK_URL = process.env.LIVEKIT_URL || 'wss://ai-agent-dl6ldsi8.livekit.cloud'
const AGENT_NAME = process.env.AGENT_NAME || 'epic-voice-agent'

// GET /api/livekit/token — Talk to Jenny (free tier)
export const getLivekitToken = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    const roomName = `jenny-${user.id}-${Date.now()}`
    const participantName = `user-${user.id}`

    const token = new AccessToken(LK_API_KEY, LK_API_SECRET, {
      identity: participantName,
      ttl: '1h',
    })
    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    })

    const jwt = await token.toJwt()

    // Dispatch agent to room
    try {
      const { RoomServiceClient } = await import('livekit-server-sdk')
      const roomService = new RoomServiceClient(LK_URL, LK_API_KEY, LK_API_SECRET)
      await roomService.createRoom({ name: roomName, emptyTimeout: 300 })
    } catch {}

    return res.json({ token: jwt, url: LK_URL, roomName })
  } catch (err: any) {
    console.error('[LiveKit Token]', err)
    return res.status(500).json({ error: 'Failed to generate token' })
  }
}
