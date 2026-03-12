import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useAction, useQuery } from 'wasp/client/operations'
import {
  createCampaign,
  deleteCampaign,
  getAgents,
  getCampaignsOverview,
  updateCampaignStatus,
} from 'wasp/client/operations'
import {
  ChevronRight,
  Loader2,
  Megaphone,
  PauseCircle,
  PlayCircle,
  Plus,
  RadioTower,
  ShieldAlert,
  Target,
  Trash2,
  Workflow,
} from 'lucide-react'

const CAMPAIGN_TYPES = [
  { value: 'sales', label: 'Sales', icon: Target, desc: 'Warm leads and hand replies over to the agent.' },
  { value: 'collections', label: 'Collections', icon: ShieldAlert, desc: 'Escalating reminders for overdue balances.' },
  { value: 'drip', label: 'Drip / Nurture', icon: Workflow, desc: 'Timed follow-ups for new or dormant contacts.' },
  { value: 'trigger', label: 'Trigger-based', icon: RadioTower, desc: 'Launch when a condition is met.' },
]

const GOAL_OPTIONS = [
  { value: 'booking', label: 'Booking' },
  { value: 'payment', label: 'Payment' },
  { value: 'reply', label: 'Reply' },
  { value: 'custom', label: 'Custom' },
]

function statusTone(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-300 border border-green-500/20'
    case 'paused':
      return 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
    case 'completed':
      return 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
    default:
      return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
  }
}

export default function CampaignsPage() {
  const { data: overview, isLoading, refetch } = useQuery(getCampaignsOverview)
  const { data: agents = [] } = useQuery(getAgents)
  const createCampaignFn = useAction(createCampaign)
  const updateCampaignStatusFn = useAction(updateCampaignStatus)
  const deleteCampaignFn = useAction(deleteCampaign)

  const [showComposer, setShowComposer] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusBusy, setStatusBusy] = useState<string | null>(null)
  const [deleteBusy, setDeleteBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    agentId: '',
    name: '',
    type: 'sales',
    goal: 'reply',
    firstMessage: '',
  })

  const sortedAgents = useMemo(() => agents as any[], [agents])

  const resetForm = () => {
    setForm({
      agentId: sortedAgents[0]?.id || '',
      name: '',
      type: 'sales',
      goal: 'reply',
      firstMessage: '',
    })
  }

  const openComposer = () => {
    resetForm()
    setError('')
    setShowComposer(true)
  }

  const handleCreate = async () => {
    if (!form.agentId || !form.name.trim()) {
      setError('Choose an agent and give the campaign a name.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createCampaignFn({
        agentId: form.agentId,
        name: form.name.trim(),
        type: form.type,
        goal: form.goal,
        firstMessage: form.firstMessage.trim() || undefined,
      })
      setShowComposer(false)
      resetForm()
      await refetch()
    } catch (err: any) {
      setError(err?.message || 'Could not create campaign.')
    } finally {
      setSubmitting(false)
    }
  }

  const changeStatus = async (id: string, status: 'active' | 'paused' | 'draft' | 'completed') => {
    setStatusBusy(id)
    try {
      await updateCampaignStatusFn({ id, status })
      await refetch()
    } finally {
      setStatusBusy(null)
    }
  }

  const removeCampaign = async (id: string) => {
    if (!window.confirm('Delete this campaign?')) return
    setDeleteBusy(id)
    try {
      await deleteCampaignFn({ id })
      await refetch()
    } finally {
      setDeleteBusy(null)
    }
  }

  if (isLoading || !overview) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="h-20 rounded-3xl bg-zinc-900 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-64 rounded-2xl bg-zinc-900 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (overview.plan === 'free') {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-8 text-center shadow-2xl shadow-black/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Megaphone className="h-8 w-8 text-indigo-300" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-zinc-100">Campaigns are locked on Free</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Pro unlocks broadcasts and up to 3 active campaigns. Business removes the cap and adds trigger-based automations.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left">
              <p className="text-sm font-semibold text-zinc-100">Broadcasts</p>
              <p className="mt-2 text-sm text-zinc-400">Send one-off messages to up to 500 contacts per month on Pro.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left">
              <p className="text-sm font-semibold text-zinc-100">AI sequences</p>
              <p className="mt-2 text-sm text-zinc-400">Warm leads, chase payments, or nurture dormant contacts without manual follow-up.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-left">
              <p className="text-sm font-semibold text-zinc-100">Payment-ready upgrade path</p>
              <p className="mt-2 text-sm text-zinc-400">Upgrade flows directly into the Fiserv checkout already used by the billing page.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/upgrade?reason=campaigns&plan=pro" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20">
              Upgrade to Pro
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
              <Megaphone className="h-3.5 w-3.5" />
              Campaign scaffold connected
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-zinc-100">Campaigns</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Campaign records, launch/pause controls, and basic stats are now live against the backend data model. Enrollment workers and trigger automation can layer on next without redoing the UI.
            </p>
          </div>
          <button onClick={openComposer} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-violet-500">
            <Plus className="h-4 w-4" />
            New campaign
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Plan</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{overview.planLabel}</p>
          <p className="mt-1 text-xs text-zinc-500">{overview.backend.note}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Active campaigns</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">
            {overview.activeCampaigns}
            {overview.limits.activeCampaignLimit !== null ? ` / ${overview.limits.activeCampaignLimit}` : ''}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Launch limit enforced by plan rules.</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Stored campaigns</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">{overview.campaigns.length}</p>
          <p className="mt-1 text-xs text-zinc-500">Drafts can be created now and activated later.</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <RadioTower className="h-4 w-4 text-emerald-300" />
          Backend readiness
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['List campaigns', overview.backend.list],
            ['Create campaign', overview.backend.create],
            ['Launch / pause', overview.backend.launchPause],
            ['Stats aggregation', overview.backend.stats],
          ].map(([label, ready]) => (
            <div key={String(label)} className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
              <div className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ready ? 'bg-green-500/10 text-green-300' : 'bg-zinc-800 text-zinc-400'}`}>
                  {ready ? 'Ready' : 'Blocked'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {overview.campaigns.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-10 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-zinc-600" />
            <h2 className="mt-4 text-lg font-semibold text-zinc-100">No campaigns yet</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-500">
              Start with a simple draft. The UI is already wired for plan limits, active-status controls, and campaign stats from stored enrollments.
            </p>
            <button onClick={openComposer} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Create first campaign
            </button>
          </div>
        ) : overview.campaigns.map((campaign: any) => (
          <div key={campaign.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-zinc-100">{campaign.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 capitalize">
                    {campaign.type}
                  </span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                    Goal: {campaign.goal}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {campaign.agent?.name || 'Unknown agent'} · {campaign.stepCount} step{campaign.stepCount === 1 ? '' : 's'} · last updated {new Date(campaign.updatedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {campaign.status === 'active' ? (
                  <button
                    onClick={() => changeStatus(campaign.id, 'paused')}
                    disabled={statusBusy === campaign.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200"
                  >
                    {statusBusy === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => changeStatus(campaign.id, 'active')}
                    disabled={statusBusy === campaign.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-200"
                  >
                    {statusBusy === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                    Launch
                  </button>
                )}
                <button
                  onClick={() => removeCampaign(campaign.id)}
                  disabled={deleteBusy === campaign.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200"
                >
                  {deleteBusy === campaign.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Enrollments</p>
                <p className="mt-2 text-xl font-semibold text-zinc-100">{campaign.recipientCount}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Active</p>
                <p className="mt-2 text-xl font-semibold text-zinc-100">{campaign.activeEnrollments}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Replies</p>
                <p className="mt-2 text-xl font-semibold text-zinc-100">{campaign.replies}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Conversions</p>
                <p className="mt-2 text-xl font-semibold text-zinc-100">{campaign.conversions}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Sequence preview</p>
              <div className="mt-3 space-y-3">
                {campaign.steps.length === 0 ? (
                  <p className="text-sm text-zinc-500">No steps saved yet. This draft is ready for the next backend handoff.</p>
                ) : campaign.steps.map((step: any) => (
                  <div key={step.id} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-zinc-200">Step {step.stepNumber}</p>
                      <span className="text-xs text-zinc-500">Day {step.delayDays}</span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{step.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">Create campaign</h2>
                <p className="mt-1 text-sm text-zinc-500">Draft the campaign now. Automation and enrollment workers can be layered in later.</p>
              </div>
              <button onClick={() => setShowComposer(false)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900">
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Agent</label>
                <select
                  value={form.agentId}
                  onChange={(event) => setForm((current) => ({ ...current, agentId: event.target.value }))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="">Select an agent</option>
                  {sortedAgents.map((agent: any) => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Campaign name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Spring warm-up"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Type</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  {CAMPAIGN_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-zinc-500">
                  {CAMPAIGN_TYPES.find((type) => type.value === form.type)?.desc}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Goal</label>
                <select
                  value={form.goal}
                  onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value }))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-indigo-500"
                >
                  {GOAL_OPTIONS.map((goal) => (
                    <option key={goal.value} value={goal.value}>{goal.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-zinc-300">Step 1 message</label>
              <textarea
                value={form.firstMessage}
                onChange={(event) => setForm((current) => ({ ...current, firstMessage: event.target.value }))}
                rows={5}
                placeholder="Hi {name}, just checking in..."
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 outline-none focus:border-indigo-500"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setShowComposer(false)} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
