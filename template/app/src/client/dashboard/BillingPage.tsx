import { useState } from "react";
import { useAuth } from "../../lib/useClerkAuth";
import { Check, Zap, Crown, Sparkles, ExternalLink } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Sparkles,
    color: "zinc",
    features: [
      "1 AI Agent",
      "50 messages/day",
      "Talk to Jenny (free)",
      "WhatsApp conversations",
      "Basic templates",
    ],
    missing: ["PSTN phone number", "Outbound calls", "Broadcasts", "CSV import"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    icon: Zap,
    color: "indigo",
    popular: true,
    features: [
      "3 AI Agents",
      "Unlimited messages",
      "DID phone number included",
      "Inbound + outbound PSTN calls",
      "Broadcasts (up to 500)",
      "CSV contact import",
      "Talk to Jenny (free)",
      "WhatsApp conversations",
      "Priority support",
    ],
    missing: [],
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    icon: Crown,
    color: "violet",
    features: [
      "Unlimited AI Agents",
      "Unlimited messages",
      "Multiple DID numbers",
      "Unlimited broadcasts",
      "API access",
      "Custom AI personality",
      "Dedicated support",
      "SLA guarantee",
    ],
    missing: [],
  },
];

const ACCENT: Record<string, { border: string; badge: string; btn: string; icon: string }> = {
  zinc: { border: "border-zinc-700", badge: "", btn: "bg-zinc-700 hover:bg-zinc-600 text-zinc-200", icon: "text-zinc-400" },
  indigo: { border: "border-indigo-500/40", badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", btn: "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20", icon: "text-indigo-400" },
  violet: { border: "border-violet-500/40", badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30", btn: "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20", icon: "text-violet-400" },
};

export default function BillingPage() {
  const { data: user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const plan = (user as any)?.subscriptionPlan || "free";

  const handleUpgrade = async (planId: string) => {
    if (planId === plan) return;
    if (planId === "free") return; // no downgrade via UI
    setLoading(planId); setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Checkout failed"); return; }
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else setError("No checkout URL returned");
    } catch { setError("Network error"); }
    finally { setLoading(null); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Billing</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Choose the plan that works for your business</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Current plan</p>
            <p className="text-sm font-semibold text-zinc-100 capitalize">{plan}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${plan === "pro" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : plan === "business" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-zinc-700 text-zinc-400"}`}>
          {plan === "free" ? "Free tier" : "Active"}
        </span>
      </div>

      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const a = ACCENT[p.color];
          const Icon = p.icon;
          const isCurrent = p.id === plan;
          return (
            <div key={p.id} className={`bg-zinc-900 border-2 ${isCurrent ? a.border : "border-zinc-800"} rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all hover:border-opacity-80`}>
              {p.popular && !isCurrent && (
                <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">Popular</div>
              )}
              {isCurrent && (
                <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">Current</div>
              )}

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${p.color === "zinc" ? "bg-zinc-800" : p.color === "indigo" ? "bg-indigo-500/10" : "bg-violet-500/10"}`}>
                <Icon className={`w-5 h-5 ${a.icon}`} />
              </div>

              <h3 className="text-base font-bold text-zinc-100 mb-1">{p.name}</h3>
              <div className="mb-5">
                <span className="text-3xl font-black text-zinc-100">${p.price}</span>
                <span className="text-sm text-zinc-500">/mo</span>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className={`w-4 h-4 shrink-0 ${a.icon}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(p.id)}
                disabled={isCurrent || loading === p.id || p.id === "free"}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${a.btn}`}
              >
                {loading === p.id ? "Redirecting..." : isCurrent ? "Current Plan" : p.id === "free" ? "Free Plan" : `Upgrade to ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-600 text-center">Payments processed securely via Fiserv · All prices USD · Cancel anytime</p>
    </div>
  );
}
