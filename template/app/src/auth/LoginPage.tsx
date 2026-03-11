import { useState } from 'react'
import { useNavigate } from 'react-router'
import { login } from 'wasp/client/auth'
import { Link, routes } from 'wasp/client/router'
import { AuthPageLayout } from './AuthPageLayout'

export function Login() {
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
      await login({ email, password })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password')
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
        Welcome back
      </h2>
      <p style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
        Sign in to your EPIC AI account
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
            placeholder="••••••••" required style={inputStyle}
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#71717a' }}>
          No account?{' '}
          <Link to={routes.SignupRoute.to} style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign up free</Link>
        </span>
        <Link to={routes.RequestPasswordResetRoute.to} style={{ color: '#52525b', fontSize: 12, textDecoration: 'none' }}>Forgot password?</Link>
      </div>
    </AuthPageLayout>
  )
}

export { Login as LoginPage }
export default Login
