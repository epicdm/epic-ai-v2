import { ReactNode } from 'react'
import { Link } from 'react-router'
import { routes } from 'wasp/client/router'

export function AuthPageLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* Logo */}
      <Link to={routes.LandingPageRoute.build()} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 32 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>AI</div>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>EPIC AI</span>
      </Link>
      {/* Card - wide enough for Clerk component */}
      <div style={{ width: '100%', maxWidth: 480, background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '32px 24px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflow: 'visible' }}>
        {children}
      </div>
    </div>
  )
}
