import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { BarChart3, Settings, Shield, Users } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Overview', icon: BarChart3 },
  { href: '/admin/users', label: 'Tenants', icon: Users },
  { href: '/admin/settings', label: 'System', icon: Settings },
]

export default function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
                <Shield className="h-3.5 w-3.5" />
                EPIC internal only
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-zinc-100">{title}</h1>
              <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {NAV.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-white text-zinc-950' : 'border border-zinc-700 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900'}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
