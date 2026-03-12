import { useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from 'wasp/client/operations'
import { getWorkspaceProfile } from 'wasp/client/operations'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    icon: Sparkles,
    tone: 'zinc',
    features: ['1 agent', '50 messages/day', 'Dashboard + onboarding', 'Business profile only'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    icon: Zap,
    tone: 'indigo',
    features: ['3 agents', 'Unlimited daily messages', 'Whisper / takeover', 'Knowledge base', '3 active campaigns', '500 broadcasts/mo'],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$99',
    icon: Crown,
    tone: 'violet',
    features: ['Unlimited agents', 'Dedicated number', 'Unlimited campaigns', 'Team access', 'API / white-label options'],
  },
]

const TONES: Record<string, { card: string; button: string; icon: string }> = {
  zinc: {
    card: 'border-zinc-800',
    button: 'bg-zinc-800 text-zinc-200',
    icon: 'text-zinc-300',
  },
  indigo: {
    card: 'border-indigo-500/30',
    button: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20',
    icon: 'text-indigo-300',
  },
  violet: {
    card: 'border-violet-500/30',
    button: 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20',
    icon: 'text-violet-300',
  },
}

export default function BillingPage() {
  const { data: profile } = useQuery(getWorkspaceProfile)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const plan = profile?.plan || 'free'

  const handleUpgrade = async (planId: string) => {
    if (planId === plan || planId === 'free') return
    setLoading(planId)
    setError('')

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Checkout failed')
      if (!data.checkoutUrl) throw new Error('No checkout URL returned')
      window.location.href = data.checkoutUrl
    } catch (err: any) {
      setError(err?.message || 'Could not start checkout.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-100">Billing & plans</h1>
            <p className="mt-2 text-sm text-zinc-400">Payments flow through Fiserv and unlock features immediately once the webhook confirms the payment.</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
            Current plan: <span className="font-semibold capitalize text-zinc-100">{plan}</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((item) => {
          const Icon = item.icon
          const tone = TONES[item.tone]
          const current = item.id === plan

          return (
            <div key={item.id} className={`rounded-2xl border-2 bg-zinc-900 p-6 ${current ? tone.card : 'border-zinc-800'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950">
                  <Icon className={`h-5 w-5 ${tone.icon}`} />
                </div>
                {current && <span className="rounded-full bg-green-500/10 px-2 py-1 text-[11px] font-medium text-green-300">Current</span>}
              </div>

              <h2 className="mt-5 text-xl font-semibold text-zinc-100">{item.name}</h2>
              <p className="mt-2 text-4xl font-semibold text-zinc-100">{item.price}<span className="text-sm text-zinc-500">/mo</span></p>

              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tone.icon}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(item.id)}
                disabled={current || loading === item.id || item.id === 'free'}
                className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tone.button}`}
              >
                {current ? 'Current plan' : loading === item.id ? 'Redirecting…' : item.id === 'free' ? 'Free plan' : `Upgrade to ${item.name}`}
              </button>
            </div>
          )
        })}
      </section>

      <div className="flex justify-center">
        <Link to="/upgrade" className="text-sm text-indigo-300 hover:text-indigo-200">Open the dedicated upgrade page →</Link>
      </div>
    </div>
  )
}
