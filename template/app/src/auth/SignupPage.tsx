import { useState } from 'react'
import { useNavigate } from 'react-router'
import { signup, login, googleSignInUrl } from 'wasp/client/auth'
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

      {/* Google Sign Up */}
      <a href={googleSignInUrl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '10px 16px', background: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#1a1a1a', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxSizing: 'border-box', marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.6 32.4 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 45c4.9 0 9.4-1.9 12.8-4.9l-5.9-5c-1.8 1.3-4 2-6.9 2-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.6 40.8 16.3 45 24 45z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l5.9 5C36.8 39.7 44 34 44 25c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        Continue with Google
      </a>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: 12, color: '#52525b' }}>or sign up with email</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
      </div>

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
