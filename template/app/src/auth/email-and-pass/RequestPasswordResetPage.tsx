import { useState } from 'react'
import { requestPasswordReset } from 'wasp/client/auth'
import { Link, routes } from 'wasp/client/router'
import { AuthPageLayout } from '../AuthPageLayout'

export function RequestPasswordResetPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset({ email })
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#1a1a28',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }

  if (sent) {
    return (
      <AuthPageLayout>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Check your inbox</h2>
          <p style={{ color: '#71717a', fontSize: 13, marginBottom: 24 }}>
            We sent a reset link to <strong style={{ color: '#a1a1aa' }}>{email}</strong>
          </p>
          <Link to={routes.LoginRoute.to} style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>← Back to sign in</Link>
        </div>
      </AuthPageLayout>
    )
  }

  return (
    <AuthPageLayout>
      <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>Reset password</h2>
      <p style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>Enter your email and we'll send a reset link</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 6, fontWeight: 500 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1e1e30' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = '#1a1a28' }} />
        </div>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#f87171', fontSize: 13 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link to={routes.LoginRoute.to} style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>← Back to sign in</Link>
      </div>
    </AuthPageLayout>
  )
}
