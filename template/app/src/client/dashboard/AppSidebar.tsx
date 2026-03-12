import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useClerk } from '@clerk/clerk-react'
import { useQuery } from 'wasp/client/operations'
import { getWorkspaceProfile } from 'wasp/client/operations'
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageCircle,
  Phone,
  Settings,
  Sparkles,
  Users,
  Wrench,
  X,
} from 'lucide-react'

const PLAN_BADGE: Record<string, string> = {
  free: 'bg-zinc-700 text-zinc-300',
  pro: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  business: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
}

export default function AppSidebar() {
  const { signOut } = useClerk()
  const location = useLocation()
  const { data: profile } = useQuery(getWorkspaceProfile)

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', String(collapsed))
    } catch {}
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const handler = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const nav = [
    {
      items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
    },
    {
      label: 'WORKSPACE',
      items: [
        { href: '/dashboard/agents', label: 'Agents', icon: Bot },
        { href: '/dashboard/conversations', label: 'Conversations', icon: MessageCircle },
        { href: '/dashboard/contacts', label: 'Contacts', icon: Users },
        { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone },
        { href: '/dashboard/calls', label: 'Calls', icon: Phone },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { href: '/upgrade', label: 'Upgrade', icon: Crown },
        { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ],
    },
  ]

  if (profile?.isAdmin) {
    nav.push({
      label: 'INTERNAL',
      items: [{ href: '/admin', label: 'Admin', icon: Wrench }],
    })
  }

  const plan = profile?.plan || 'free'
  const email = profile?.email || 'user@epic.dm'

  const isActive = (href: string, exact?: boolean) => exact ? location.pathname === href : location.pathname.startsWith(href)

  const sidebarContent = (
    <div className={`${collapsed && !mobileOpen ? 'w-16' : 'w-64'} flex h-full flex-col border-r border-zinc-800/60 bg-zinc-950 transition-all duration-300`}>
      <div className={`flex h-16 items-center border-b border-zinc-800/60 ${collapsed && !mobileOpen ? 'justify-center px-0' : 'px-5'}`}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-sm font-bold tracking-tight text-zinc-100">
              EPIC <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AI</span>
            </span>
          )}
        </Link>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {nav.map((section, index) => (
          <div key={section.label || index} className={index > 0 ? 'mt-4' : ''}>
            {(!collapsed || mobileOpen) && section.label && (
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">{section.label}</p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${active ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'} ${collapsed && !mobileOpen ? 'justify-center' : ''}`}
                >
                  <Icon className="h-[17px] w-[17px] shrink-0" />
                  {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {!mobileOpen && (
        <button
          onClick={() => setCollapsed((current) => !current)}
          className="mx-2 mb-2 flex h-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-800/60 hover:text-zinc-300"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}

      <div className={`border-t border-zinc-800/60 p-3 ${collapsed && !mobileOpen ? 'flex justify-center' : ''}`}>
        {collapsed && !mobileOpen ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
            {(email || 'U')[0].toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {(email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-200">{email.split('@')[0]}</p>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PLAN_BADGE[plan] || PLAN_BADGE.free}`}>
                {plan}
              </span>
            </div>
            <button
              onClick={async () => {
                await signOut()
                window.location.href = '/'
              }}
              className="text-zinc-600 transition hover:text-red-400"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div ref={sidebarRef} className="hidden h-screen lg:flex">
        {sidebarContent}
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div ref={sidebarRef} className="fixed inset-y-0 left-0 z-50 flex lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
