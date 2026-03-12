// @ts-nocheck
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useQuery } from 'wasp/client/operations'
import { getMyAgents } from 'wasp/client/operations'
import confetti from 'canvas-confetti'

const TEMPLATE_META: Record<string, { emoji: string; color: string; openerPreview: string }> = {
  receptionist: {
    emoji: '🏢',
    color: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    openerPreview: "Hi! I'm Alex 👋 What's your business called, and what services do you offer?",
  },
  sales: {
    emoji: '💰',
    color: 'linear-gradient(135deg, #10b981, #059669)',
    openerPreview: "Hey! I'm Vera 🎯 Ready to follow up on every lead. What are you selling?",
  },
  collections: {
    emoji: '📞',
    color: 'linear-gradient(135deg, #f59e0b, #d97706)',
    openerPreview: "Hi! I'm Chase 📞 I'll help recover overdue payments. Tell me about your billing.",
  },
  concierge: {
    emoji: '🎯',
    color: 'linear-gradient(135deg, #ec4899, #db2777)',
    openerPreview: "Hey! I'm Rio 🌴 Tell me about your property — what do guests always ask?",
  },
  support: {
    emoji: '🎧',
    color: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    openerPreview: "Hi! I'm Sam 🎧 I'll handle customer messages. What are the most common issues?",
  },
  assistant: {
    emoji: '🧑',
    color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    openerPreview: "Hey! I'm Max ✨ Your personal assistant. What do you want to stay on top of first?",
  },
}

export function OnboardingPage() {
  const { data: agents } = useQuery(getMyAgents)
  const navigate = useNavigate()
  const [activated, setActivated] = useState(false)
  const [polling, setPolling] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [agentName, setAgentName] = useState('')

  const agent = agents?.[0]
  const meta = TEMPLATE_META[agent?.template || 'receptionist']

  // Redirect if already onboarded
  useEffect(() => {
    if (agent?.status === 'active' && agent?.onboardingStatus === 'complete') {
      navigate('/dashboard')
    }
  }, [agent])

  // Poll for activation every 3s
  useEffect(() => {
    if (!agent || activated) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/${agent.id}/status`, {
          headers: { Authorization: `Bearer ${(window as any).__clerk_session_token}` },
        })
        const data = await res.json()
        if (data.status === 'active') {
          setActivated(true)
          setPolling(false)
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
          setTimeout(() => navigate('/dashboard'), 2500)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [agent, activated])

  if (!agent) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Loading...</div>
      </div>
    )
  }

  const isReconnect = !agent.ownerPhone && agent.onboardingStatus === 'complete'
  const waLink = `https://wa.me/17672950333?text=BFF-${agent.activationCode?.replace('BFF-', '') || ''}`

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0f1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        {/* Agent Card */}
        <div style={{
          background: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '24px',
          padding: '40px 32px',
          marginBottom: '24px',
        }}>
          {/* Emoji Avatar */}
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: meta.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}>
            {meta.emoji}
          </div>

          {/* Agent Name */}
          {editingName ? (
            <input
              autoFocus
              value={agentName || agent.name}
              onChange={e => setAgentName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
              style={{
                background: '#1a1a28',
                border: '2px solid #6366f1',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '24px',
                fontWeight: '700',
                textAlign: 'center',
                padding: '8px 16px',
                width: '100%',
                outline: 'none',
                marginBottom: '8px',
              }}
            />
          ) : (
            <h1
              onClick={() => setEditingName(true)}
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px',
                cursor: 'text',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Meet {agentName || agent.name}
              <span style={{ fontSize: '14px', color: '#6366f1' }}>✏️</span>
            </h1>
          )}

          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '28px' }}>
            {agent.template?.charAt(0).toUpperCase()}{agent.template?.slice(1)} Agent · Click name to rename
          </p>

          {/* WA Preview Bubble */}
          <div style={{
            background: '#075e54',
            borderRadius: '12px 12px 12px 0',
            padding: '12px 16px',
            textAlign: 'left',
            color: '#fff',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '32px',
          }}>
            {meta.openerPreview}
          </div>

          {/* Activation Button or Success */}
          {activated ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <p style={{ color: '#10b981', fontWeight: '700', fontSize: '18px' }}>
                {agentName || agent.name} is live!
              </p>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Heading to your dashboard...</p>
            </div>
          ) : (
            <>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setPolling(true)}
                style={{
                  display: 'block',
                  background: '#25d366',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '16px',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  marginBottom: '16px',
                }}
              >
                {isReconnect ? `🔗 Reconnect ${agentName || agent.name} on WhatsApp →` : `📱 Activate on WhatsApp →`}
              </a>

              {polling && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                  <span style={{ animation: 'pulse 1.5s infinite' }}>⏳</span>
                  Waiting for activation...
                </div>
              )}

              {!polling && (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                  Opens WhatsApp with your code pre-typed. Just hit send.
                </p>
              )}
            </>
          )}
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: '#6b7280', fontSize: '13px' }}>
          <span>1. Tap the button above</span>
          <span>→</span>
          <span>2. Send the code</span>
          <span>→</span>
          <span>3. Chat with Jenny</span>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </div>
  )
}
