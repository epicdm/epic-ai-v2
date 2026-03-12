import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useQuery } from 'wasp/client/operations'
import { getWorkspaceProfile } from 'wasp/client/operations'

const PLANS = [
  {
    slug: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['1 agent', '50 messages/day', 'Dashboard + onboarding', 'Business profile only'],
  },
  {
    slug: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    highlight: true,
    features: ['3 agents', 'Unlimited messages', 'Whisper / takeover', 'Owner WhatsApp alerts', 'Knowledge base', '3 active campaigns', '500 broadcasts/mo'],
  },
  {
    slug: 'business',
    name: 'Business',
    price: '$99',
    period: '/month',
    features: ['Unlimited agents', 'Dedicated number', 'Unlimited campaigns', 'Team access', 'API / white-label'],
  },
]

const REASON_COPY: Record<string, { eyebrow: string; title: string; body: string }> = {
  'message-limit': {
    eyebrow: 'Message limit reached',
    title: 'Remove the daily message cap',
    body: 'Pro removes the Free plan\'s 50-message ceiling so Alex can keep replying without interruption.',
  },
  'agent-limit': {
    eyebrow: 'More agents',
    title: 'Give your business more than one agent',
    body: 'Use Pro for up to 3 agents, or Business for unlimited roles across your company.',
  },
  campaigns: {
    eyebrow: 'Campaigns',
    title: 'Unlock broadcasts and campaigns',
    body: 'Campaigns are part of the paid workflow and plug straight into the Fiserv checkout already wired into the app.',
  },
  alerts: {
    eyebrow: 'Owner alerts',
    title: 'Get WhatsApp alerts when the agent needs you',
    body: 'Pro adds escalation alerts and regular owner summaries so you can step in at the right moment.',
  },
}

export function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const { data: profile } = useQuery(getWorkspaceProfile)

  const currentPlan = profile?.plan || 'free'
  const reason = searchParams.get('reason') || ''
  const requestedPlan = searchParams.get('plan') || ''
  const copy = useMemo(() => REASON_COPY[reason] || {
    eyebrow: 'Upgrade',
    title: 'Upgrade your plan',
    body: 'Unlock more agents, unlimited messages, campaign tools, and higher-touch support.',
  }, [reason])

  async function handleUpgrade(plan: string) {
    if (plan === currentPlan || plan === 'free') return
    setLoading(plan)
    setError('')
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not start checkout.')
      if (!data.checkoutUrl) throw new Error('No checkout URL returned.')
      window.location.href = data.checkoutUrl
    } catch (err: any) {
      setError(err?.message || 'Could not connect to the payment flow.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">{copy.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{copy.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{copy.body}</p>
            <p className="mt-3 text-sm text-zinc-500">Current plan: <span className="font-semibold capitalize text-zinc-200">{currentPlan}</span></p>
          </div>
          <Link to="/dashboard" className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900">
            Back to dashboard
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.slug === currentPlan
            const isSuggested = requestedPlan === plan.slug
            return (
              <div
                key={plan.slug}
                className={`relative rounded-3xl border-2 bg-zinc-900 p-6 ${isSuggested ? 'border-indigo-500/40' : 'border-zinc-800'} ${plan.highlight ? 'shadow-2xl shadow-indigo-500/10' : ''}`}
              >
                {plan.highlight && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white">
                    Most popular
                  </div>
                )}
                {isSuggested && (
                  <div className="mb-4 inline-flex rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-200">
                    Recommended for this upgrade
                  </div>
                )}
                <h2 className="text-xl font-semibold text-zinc-100">{plan.name}</h2>
                <div className="mt-3 text-4xl font-semibold text-zinc-100">
                  {plan.price}
                  <span className="ml-1 text-sm font-medium text-zinc-500">{plan.period}</span>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.slug)}
                  disabled={isCurrent || loading === plan.slug || plan.slug === 'free'}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${isCurrent ? 'bg-zinc-800 text-zinc-400' : plan.highlight ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500' : 'border border-zinc-700 bg-transparent text-white hover:bg-zinc-800'} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isCurrent ? 'Current plan' : loading === plan.slug ? 'Starting checkout…' : plan.slug === 'free' ? 'Free plan' : `Upgrade to ${plan.name}`}
                </button>

                <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="text-center text-xs text-zinc-600">Payments processed securely by Fiserv via api01.epic.dm. Features unlock as soon as the webhook updates your plan.</p>
      </div>
    </div>
  )
}
