import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const PLANS = [
  {
    slug: 'free', name: 'Free', price: '$0', period: 'forever', current: true,
    features: ['1 AI agent', '50 messages/day', 'Live inbox (view-only)', 'WhatsApp activation', 'Business profile'],
  },
  {
    slug: 'pro', name: 'Pro', price: '$29', period: '/month', highlight: true,
    features: ['3 AI agents', 'Unlimited messages', 'Full inbox + whisper/takeover', 'Owner WhatsApp alerts', 'Voice calls', 'Knowledge base', '3 active campaigns', '500 broadcasts/mo'],
  },
  {
    slug: 'business', name: 'Business', price: '$99', period: '/month',
    features: ['Unlimited agents', 'Dedicated WA number', 'Team member logins', 'Unlimited campaigns', 'Barge/whisper on calls', 'API access', 'White-label', 'Priority support'],
  },
]

export function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const upgraded = searchParams.get('upgraded') === 'true'

  async function handleUpgrade(plan: string) {
    setLoading(plan)
    try {
      const token = (window as any).__clerk_session_token
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Could not start checkout. Please try again.')
      }
    } catch {
      alert('Error connecting to payment service.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f1a', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", padding: '48px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>

        {upgraded && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '12px', padding: '16px 24px', marginBottom: '32px', color: '#10b981', fontWeight: '600' }}>
            🎉 You're upgraded! Your new features are unlocked.
          </div>
        )}

        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '32px', fontSize: '14px' }}>
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '12px' }}>Upgrade your plan</h1>
        <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '48px' }}>Unlock more agents, unlimited messages, and powerful tools.</p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PLANS.map(plan => (
            <div key={plan.slug} style={{
              flex: '1', minWidth: '260px', maxWidth: '300px',
              background: (plan as any).highlight ? 'linear-gradient(135deg, #1a1040, #1e1b4b)' : '#111827',
              border: `2px solid ${(plan as any).highlight ? '#6366f1' : '#1f2937'}`,
              borderRadius: '20px', padding: '32px 28px', textAlign: 'left', position: 'relative',
            }}>
              {(plan as any).highlight && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', borderRadius: '100px', padding: '4px 16px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: '800' }}>{plan.price}</span>
                <span style={{ color: '#9ca3af', fontSize: '16px' }}>{plan.period}</span>
              </div>

              {(plan as any).current ? (
                <div style={{ width: '100%', background: '#1f2937', borderRadius: '10px', color: '#9ca3af', fontWeight: '600', fontSize: '15px', padding: '14px', textAlign: 'center', marginBottom: '24px' }}>
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.slug)}
                  disabled={loading === plan.slug}
                  style={{
                    width: '100%',
                    background: (plan as any).highlight ? '#6366f1' : 'transparent',
                    border: (plan as any).highlight ? 'none' : '1px solid #374151',
                    borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '15px',
                    padding: '14px', cursor: 'pointer', marginBottom: '24px',
                    opacity: loading === plan.slug ? 0.7 : 1,
                  }}>
                  {loading === plan.slug ? 'Starting checkout...' : `Upgrade to ${plan.name} →`}
                </button>
              )}

              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#d1d5db', marginBottom: '10px' }}>
                    <span style={{ color: '#25d366' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '40px' }}>
          Payments processed securely by Fiserv · No hidden fees · Cancel anytime
        </p>
      </div>
    </div>
  )
}
