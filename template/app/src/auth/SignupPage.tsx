import { useState } from 'react'
import { useNavigate } from 'react-router'
import { signup, login } from 'wasp/client/auth'
import { Link, routes } from 'wasp/client/router'
import { AuthPageLayout } from './AuthPageLayout'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup({ email, password, username: email, isAdmin: false })
      await login({ email, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Could not create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#1a1a28',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, color: '#a1a1aa', marginBottom: 6, fontWeight: 500,
  }

  return (
    <AuthPageLayout>
      <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
        Create your account
      </h2>
      <p style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
        Your AI agent, up in minutes — free to start
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#1e1e30' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = '#1a1a28' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters" required minLength={8} style={inputStyle}
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
          {loading ? 'Creating account…' : 'Create free account →'}
        </button>
        <p style={{ fontSize: 11, color: '#52525b', textAlign: 'center', marginTop: 10 }}>
          By signing up you agree to our Terms &amp; Privacy Policy
        </p>
      </form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: '#71717a' }}>
          Already have an account?{' '}
          <Link to={routes.LoginRoute.to} style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </span>
      </div>
    </AuthPageLayout>
  )
}

export { Signup as SignupPage }
export default Signup
