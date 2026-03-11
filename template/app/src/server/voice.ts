import type { Request, Response } from 'express'
import { prisma } from 'wasp/server'

// GET /api/voice/context?phone_number=+1767xxx
// Called by LiveKit agent to load per-customer personality
export const voiceContext = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.query
    if (!phone_number) return res.status(400).json({ error: 'phone_number required' })

    const normalized = (phone_number as string).replace(/\D/g, '')

    // Find agent by DID number
    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { didNumber: phone_number as string },
          { didNumber: `+${normalized}` },
        ],
      },
    })

    if (!agent) {
      // Default Jenny personality
      return res.json({
        agentName: 'Jenny',
        prompt: 'You are Jenny, a friendly and professional AI receptionist. Help callers with their questions politely and efficiently.',
        voice: 'alloy',
        language: 'en-US',
      })
    }

    const config = agent.config as any
    const soul = config?.soul
    const purpose = config?.purpose
    const tone = config?.tone
    return res.json({
      agentName: agent.name,
      prompt: soul || purpose || `You are ${agent.name}, a helpful AI assistant. ${tone ? `Your tone is ${tone}.` : ''}`,
      voice: 'alloy',
      language: 'en-US',
      agentId: agent.id,
    })
  } catch (err: any) {
    console.error('[Voice Context]', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
