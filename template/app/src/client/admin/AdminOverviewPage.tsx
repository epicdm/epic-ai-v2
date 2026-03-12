import { useQuery } from 'wasp/client/operations'
import { getAdminOverview } from 'wasp/client/operations'
import { AlertTriangle, Bot, Building2, MessageSquareWarning, Wallet } from 'lucide-react'
import AdminLayout from './AdminLayout'

function formatDate(value?: string | Date | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function healthTone(status: string) {
  switch (status) {
    case 'healthy': return 'bg-green-500/10 text-green-300'
    case 'attention': return 'bg-amber-500/10 text-amber-300'
    case 'error': return 'bg-red-500/10 text-red-300'
    default: return 'bg-zinc-800 text-zinc-400'
  }
}

function StatCard({ label, value, icon: Icon, subtext }: { label: string; value: string | number; icon: any; subtext: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{subtext}</p>
        </div>
        <div className="rounded-xl bg-indigo-500/10 p-2.5">
          <Icon className="h-5 w-5 text-indigo-300" />
        </div>
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const { data, isLoading, error } = useQuery(getAdminOverview)

  if (error) {
    return (
      <AdminLayout title="Admin panel" subtitle="Tenant and system overview for EPIC staff.">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error.message || 'You do not have access to this area.'}
        </div>
      </AdminLayout>
    )
  }

  if (isLoading || !data) {
    return (
      <AdminLayout title="Admin panel" subtitle="Tenant and system overview for EPIC staff.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl bg-zinc-900 animate-pulse" />)}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Admin panel" subtitle="Cross-tenant visibility for revenue, health, and support triage.">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tenants" value={data.summary.totalUsers} icon={Building2} subtext={`${data.summary.proUsers + data.summary.businessUsers} paying accounts`} />
        <StatCard label="Estimated MRR" value={`$${data.summary.estimatedMrr}`} icon={Wallet} subtext={`${data.summary.proUsers} Pro · ${data.summary.businessUsers} Business`} />
        <StatCard label="Agent health" value={`${data.summary.activeAgents}/${data.summary.totalAgents}`} icon={Bot} subtext={`${data.summary.errorAgents} error · ${data.summary.pendingOnboarding} onboarding`} />
        <StatCard label="Open escalations" value={data.summary.unresolvedEscalations} icon={MessageSquareWarning} subtext={`${data.summary.activeCampaigns} active campaigns`} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Tenant overview</h2>
              <p className="mt-1 text-sm text-zinc-500">Latest tenants with quick health and activity signals.</p>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="pb-3 font-medium">Tenant</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Agents</th>
                  <th className="pb-3 font-medium">Health</th>
                  <th className="pb-3 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {data.tenants.map((tenant: any) => (
                  <tr key={tenant.id}>
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium text-zinc-100">{tenant.email}</p>
                        <p className="text-xs text-zinc-500">Created {formatDate(tenant.createdAt)}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 capitalize text-zinc-300">{tenant.plan}</td>
                    <td className="py-3 pr-4 text-zinc-300">{tenant.agentCount}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${healthTone(tenant.health)}`}>{tenant.health}</span>
                    </td>
                    <td className="py-3 text-zinc-300">{formatDate(tenant.lastActiveAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h2 className="text-base font-semibold text-zinc-100">Agent issues</h2>
            </div>
            <div className="mt-4 space-y-3">
              {data.agentIssues.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">No agent issues right now.</div>
              ) : data.agentIssues.map((issue: any) => (
                <div key={issue.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm font-medium text-zinc-100">{issue.name}</p>
                  <p className="mt-1 text-xs text-zinc-500">{issue.user.email} · {issue.status} · {issue.onboardingStatus}</p>
                  <p className="mt-2 text-xs text-zinc-400">Updated {formatDate(issue.updatedAt)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="text-base font-semibold text-zinc-100">Support queue</h2>
            <div className="mt-4 space-y-3">
              {data.escalationQueue.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/70 p-4 text-sm text-zinc-500">No unresolved escalations.</div>
              ) : data.escalationQueue.map((item: any) => (
                <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm font-medium text-zinc-100">{item.summary}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.agent.user.email} · {item.agent.name}</p>
                  <p className="mt-2 text-xs text-zinc-400">{formatDate(item.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-base font-semibold text-zinc-100">WhatsApp compliance</h2>
        <p className="mt-2 text-sm text-zinc-400">{data.compliance.note}</p>
      </section>
    </AdminLayout>
  )
}
