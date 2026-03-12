import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQuery } from 'wasp/client/operations'
import { getDashboardOverview } from 'wasp/client/operations'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Crown,
  MessageCircle,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

function relativeTime(value?: string | Date | null) {
  if (!value) return 'No activity yet'
  const timestamp = new Date(value).getTime()
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function displayNameFromEmail(email?: string | null) {
  if (!email) return 'there'
  const base = email.split('@')[0] || email
  return base.charAt(0).toUpperCase() + base.slice(1)
}

function statusTone(status?: string | null) {
  switch (status) {
    case 'active':
      return 'bg-green-500/10 text-green-300 border border-green-500/20'
    case 'paused':
      return 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
    case 'error':
      return 'bg-red-500/10 text-red-300 border border-red-500/20'
    default:
      return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
  }
}

function templateLabel(template?: string | null) {
  switch (template) {
    case 'receptionist': return 'Receptionist'
    case 'sales': return 'Sales'
    case 'collections': return 'Collections'
    case 'concierge': return 'Concierge'
    case 'support': return 'Support'
    case 'assistant': return 'Personal Assistant'
    default: return template || 'Agent'
  }
}

function escalationLabel(flag?: string | null) {
  switch (flag) {
    case 'hot_lead': return '🔥 Hot lead'
    case 'negative_sentiment': return '⚠️ Negative sentiment'
    case 'payment_moment': return '💳 Payment moment'
    case 'stuck': return '🧩 Agent stuck'
    case 'out_of_scope': return '❓ Out of scope'
    case 'call_request': return '📞 Call request'
    default: return '💬 Active'
  }
}

function UsageProgress({ value, total }: { value: number; total: number | null }) {
  if (!total) return null
  const percent = Math.min(100, Math.round((value / total) * 100))
  return (
    <div className="mt-3">
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">{percent}% of your current limit used</p>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string
  value: string | number
  subtext: string
  icon: any
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/20">
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

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery(getDashboardOverview)

  useEffect(() => {
    if (!isLoading && data && data.summary.agentsTotal === 0) {
      navigate('/create')
    }
  }, [data, isLoading, navigate])

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
          {error.message || 'Could not load dashboard right now.'}
        </div>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-20 rounded-3xl bg-zinc-900 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-2xl bg-zinc-900 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 h-96 rounded-2xl bg-zinc-900 animate-pulse" />
          <div className="h-96 rounded-2xl bg-zinc-900 animate-pulse" />
        </div>
      </div>
    )
  }

  const greetingName = displayNameFromEmail(data.user.email)
  const planUsageValue = data.usage.messageLimit !== null
    ? `${data.usage.messagesToday}/${data.usage.messageLimit}`
    : data.usage.agentLimit !== null
      ? `${data.usage.agentsUsed}/${data.usage.agentLimit}`
      : 'Unlimited'
  const planUsageSubtext = data.usage.messageLimit !== null
    ? 'Messages used today'
    : data.usage.agentLimit !== null
      ? 'Agent slots used'
      : `${data.usage.activeCampaigns} active campaign${data.usage.activeCampaigns === 1 ? '' : 's'}`

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              <Sparkles className="h-3.5 w-3.5" />
              {data.user.planLabel} plan workspace
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100">
              Good day, {greetingName}. Your agents are on watch.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Check status fast: who is live, how many customer conversations landed today, how onboarding is moving, and whether you are getting close to a plan limit.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/conversations" className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-900">
              <MessageCircle className="h-4 w-4" />
              Open Inbox
            </Link>
            <Link to="/dashboard/agents" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-violet-500">
              <Bot className="h-4 w-4" />
              Manage Agents
            </Link>
          </div>
        </div>
      </section>

      {data.upgradePrompt && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-200">{data.upgradePrompt.title}</p>
              <p className="mt-1 text-sm text-amber-100/80">{data.upgradePrompt.body}</p>
            </div>
            <Link
              to={`/upgrade?reason=${encodeURIComponent(data.upgradePrompt.code)}&plan=${encodeURIComponent(data.upgradePrompt.recommendedPlan)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
            >
              {data.upgradePrompt.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Agent status"
          value={`${data.summary.activeAgents}/${data.summary.agentsTotal}`}
          subtext={`${data.summary.activeAgents} live right now`}
          icon={Bot}
        />
        <StatCard
          label="Customer conversations"
          value={data.summary.conversationsToday}
          subtext={`${data.summary.totalConversations} total customer threads`}
          icon={Users}
        />
        <StatCard
          label="Onboarding progress"
          value={`${data.summary.onboardingPercent}%`}
          subtext={`${data.summary.completedOnboarding}/${data.summary.agentsTotal} agent${data.summary.agentsTotal === 1 ? '' : 's'} complete`}
          icon={Rocket}
        />
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg shadow-black/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-400">Plan usage</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">{planUsageValue}</p>
              <p className="mt-1 text-xs text-zinc-500">{planUsageSubtext}</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-2.5">
              <Crown className="h-5 w-5 text-amber-300" />
            </div>
          </div>
          <UsageProgress
            value={data.usage.messageLimit !== null ? data.usage.messagesToday : data.usage.agentsUsed}
            total={data.usage.messageLimit !== null ? data.usage.messageLimit : data.usage.agentLimit}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Agent status</h2>
                <p className="mt-1 text-sm text-zinc-500">Real activity, onboarding state, and customer load per agent.</p>
              </div>
              <Link to="/dashboard/agents" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">View all</Link>
            </div>

            <div className="mt-5 space-y-3">
              {data.agents.map((agent: any) => (
                <div key={agent.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-100">{agent.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone(agent.status)}`}>
                          {agent.status}
                        </span>
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                          {templateLabel(agent.template)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        Last customer activity {relativeTime(agent.lastMessageAt)}
                        {agent.ownerPhoneMasked ? ` · Owner ${agent.ownerPhoneMasked}` : ' · Not yet connected to an owner phone'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-left lg:min-w-[320px]">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Today</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-100">{agent.conversationsToday}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Messages</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-100">{agent.messagesToday}</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Onboarding</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-100">{agent.onboardingPercent}%</p>
                      </div>
                    </div>
                  </div>

                  {agent.latestIntent && (
                    <div className="mt-3 rounded-xl border border-indigo-500/15 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-100">
                      <span className="font-medium">Latest intent:</span> {agent.latestIntent.summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Recent conversations</h2>
                <p className="mt-1 text-sm text-zinc-500">The latest customer threads across your workspace.</p>
              </div>
              <Link to="/dashboard/conversations" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">View all</Link>
            </div>

            <div className="mt-5 space-y-3">
              {data.recentConversations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  No customer conversations yet. Once people message your share link, they will show up here.
                </div>
              ) : data.recentConversations.map((conversation: any) => (
                <div key={conversation.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-zinc-100">
                          {conversation.contact?.name || conversation.contact?.phone || conversation.phone}
                        </p>
                        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                          {escalationLabel(conversation.escalationFlag)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-300">{conversation.lastMessagePreview || 'No message preview available yet.'}</p>
                      <p className="mt-2 text-xs text-zinc-500">
                        via {conversation.agent?.name || 'Unknown agent'} · {relativeTime(conversation.lastMessageAt)}
                      </p>
                    </div>
                    <Link to="/dashboard/conversations" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">Open</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h2 className="text-base font-semibold text-zinc-100">Needs attention</h2>
            </div>
            <div className="mt-5 space-y-3">
              {data.needsAttention.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-6 text-sm text-zinc-400">
                  ✅ Alex has everything under control right now.
                </div>
              ) : data.needsAttention.map((item: any) => (
                <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{item.summary}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {item.agent?.name || 'Agent'} · {relativeTime(item.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-200">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              <h2 className="text-base font-semibold text-zinc-100">This week</h2>
            </div>
            <p className="mt-1 text-sm text-zinc-500">Customer message volume over the last 7 days.</p>

            <div className="mt-5 flex h-48 items-end gap-3">
              {data.weeklySeries.map((point: any) => {
                const peak = Math.max(...data.weeklySeries.map((item: any) => item.count), 1)
                const height = Math.max(10, Math.round((point.count / peak) * 100))
                return (
                  <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end">
                      <div className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500" style={{ height: `${height}%` }} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-zinc-300">{point.count}</p>
                      <p className="text-[11px] text-zinc-500">{point.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-300" />
              <h2 className="text-base font-semibold text-zinc-100">Activation & onboarding</h2>
            </div>
            <p className="mt-1 text-sm text-zinc-500">Track how far each agent is through the WhatsApp setup flow.</p>
            <div className="mt-4 space-y-3">
              {data.agents.map((agent: any) => (
                <div key={`onboarding-${agent.id}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-200">{agent.name}</span>
                    <span className="text-zinc-500">{agent.onboardingStatus.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: `${agent.onboardingPercent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
