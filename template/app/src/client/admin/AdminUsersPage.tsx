import { useMemo, useState } from 'react'
import { useQuery } from 'wasp/client/operations'
import { getAdminOverview } from 'wasp/client/operations'
import AdminLayout from './AdminLayout'

function formatDate(value?: string | Date | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function AdminUsersPage() {
  const { data, isLoading, error } = useQuery(getAdminOverview)
  const [search, setSearch] = useState('')

  const tenants = useMemo(() => {
    if (!data) return []
    return data.tenants.filter((tenant: any) => tenant.email.toLowerCase().includes(search.toLowerCase()))
  }, [data, search])

  if (error) {
    return (
      <AdminLayout title="Tenants" subtitle="Cross-tenant account list for support and billing review.">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error.message || 'You do not have access to this area.'}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Tenants" subtitle="Inspect plans, agent counts, and recent activity without opening each tenant manually.">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Tenant directory</h2>
            <p className="mt-1 text-sm text-zinc-500">Search by account email. Health and last-active columns use real tenant data.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search email..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500 lg:max-w-sm"
          />
        </div>

        {isLoading || !data ? (
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-xl bg-zinc-950 animate-pulse" />)}
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="pb-3 font-medium">Tenant</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Agents</th>
                  <th className="pb-3 font-medium">Health</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Last active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tenants.map((tenant: any) => (
                  <tr key={tenant.id}>
                    <td className="py-3 pr-4 text-zinc-100">{tenant.email}</td>
                    <td className="py-3 pr-4 capitalize text-zinc-300">{tenant.plan}</td>
                    <td className="py-3 pr-4 text-zinc-300">{tenant.agentCount}</td>
                    <td className="py-3 pr-4 text-zinc-300">{tenant.health}</td>
                    <td className="py-3 pr-4 text-zinc-300">{formatDate(tenant.createdAt)}</td>
                    <td className="py-3 text-zinc-300">{formatDate(tenant.lastActiveAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tenants.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/70 p-6 text-center text-sm text-zinc-500">
                No tenants match that search.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
