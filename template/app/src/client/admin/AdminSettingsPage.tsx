import { useQuery } from 'wasp/client/operations'
import { getAdminOverview } from 'wasp/client/operations'
import { BellRing, ShieldCheck, Wrench } from 'lucide-react'
import AdminLayout from './AdminLayout'

export default function AdminSettingsPage() {
  const { data, isLoading, error } = useQuery(getAdminOverview)

  if (error) {
    return (
      <AdminLayout title="System" subtitle="Internal controls and operational notes.">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error.message || 'You do not have access to this area.'}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="System" subtitle="Operational guardrails and remaining backend handoff items for the admin surface.">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 text-zinc-100">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h2 className="text-base font-semibold">Access guard</h2>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            This UI is protected by the server-side admin query guard. Non-admin tenants will hit an authorization error instead of seeing tenant data.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 text-zinc-100">
            <BellRing className="h-4 w-4 text-amber-300" />
            <h2 className="text-base font-semibold">Compliance telemetry</h2>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            {isLoading || !data ? 'Loading compliance note…' : data.compliance.note}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 text-zinc-100">
            <Wrench className="h-4 w-4 text-sky-300" />
            <h2 className="text-base font-semibold">Next backend handoff</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>• Add true WhatsApp compliance metrics instead of derived health notes.</li>
            <li>• Wire tenant impersonation from the admin table into a secure support workflow.</li>
            <li>• Add revenue event history for upgrades, downgrades, and churn reasons.</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
