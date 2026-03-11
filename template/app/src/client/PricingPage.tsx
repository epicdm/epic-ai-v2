import { Link } from "react-router";
import { Check, X, Zap, Crown, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Sparkles,
    desc: "Try it out, no commitment",
    features: [
      { text: "1 AI agent", included: true },
      { text: "50 messages/day", included: true },
      { text: "Talk to Jenny (AI voice)", included: true },
      { text: "WhatsApp conversations", included: true },
      { text: "Basic templates", included: true },
      { text: "Phone number (DID)", included: false },
      { text: "PSTN inbound/outbound calls", included: false },
      { text: "Broadcasts", included: false },
      { text: "CSV contact import", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get started free",
    ctaHref: "/signup",
    accent: "zinc",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    icon: Zap,
    desc: "For small businesses",
    popular: true,
    features: [
      { text: "3 AI agents", included: true },
      { text: "Unlimited messages", included: true },
      { text: "Talk to Jenny (AI voice)", included: true },
      { text: "WhatsApp conversations", included: true },
      { text: "All templates", included: true },
      { text: "Phone number (DID) included", included: true },
      { text: "PSTN inbound/outbound calls", included: true },
      { text: "Broadcasts (up to 500)", included: true },
      { text: "CSV contact import", included: true },
      { text: "API access", included: false },
    ],
    cta: "Start Pro",
    ctaHref: "/signup",
    accent: "indigo",
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    icon: Crown,
    desc: "For growing businesses",
    features: [
      { text: "Unlimited AI agents", included: true },
      { text: "Unlimited messages", included: true },
      { text: "Talk to Jenny (AI voice)", included: true },
      { text: "WhatsApp conversations", included: true },
      { text: "All templates + custom", included: true },
      { text: "Multiple DIDs", included: true },
      { text: "PSTN inbound/outbound calls", included: true },
      { text: "Unlimited broadcasts", included: true },
      { text: "CSV contact import", included: true },
      { text: "API access", included: true },
    ],
    cta: "Start Business",
    ctaHref: "/signup",
    accent: "violet",
  },
];

const ACCENT: Record<string, { border: string; btn: string; badge: string; icon: string; iconBg: string }> = {
  zinc: { border: "border-zinc-800", btn: "bg-zinc-700 hover:bg-zinc-600 text-zinc-100", badge: "", icon: "text-zinc-400", iconBg: "bg-zinc-800" },
  indigo: { border: "border-indigo-500/50", btn: "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25", badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", icon: "text-indigo-400", iconBg: "bg-indigo-500/10" },
  violet: { border: "border-violet-500/50", btn: "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25", badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30", icon: "text-violet-400", iconBg: "bg-violet-500/10" },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/60 h-14 flex items-center px-6 md:px-12">
        <Link to="/" className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-zinc-100">EPIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-100 px-3 py-1.5 transition-colors">Sign in</Link>
          <Link to="/signup" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white transition-all">Get started</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-100">Simple, honest pricing</h1>
          <p className="text-zinc-400 text-sm md:text-base">No contracts. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const a = ACCENT[p.accent];
            return (
              <div key={p.id} className={`bg-zinc-900 border-2 ${a.border} rounded-2xl p-6 flex flex-col relative overflow-hidden`}>
                {p.popular && (
                  <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${a.badge} uppercase tracking-wide`}>
                    Most Popular
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${a.icon}`} />
                </div>

                <h3 className="text-base font-bold text-zinc-100 mb-0.5">{p.name}</h3>
                <p className="text-xs text-zinc-500 mb-4">{p.desc}</p>

                <div className="mb-6">
                  <span className="text-4xl font-black text-zinc-100">${p.price}</span>
                  <span className="text-sm text-zinc-500">/month</span>
                </div>

                <Link to={p.ctaHref} className={`block text-center py-2.5 rounded-xl text-sm font-semibold mb-6 transition-all ${a.btn}`}>
                  {p.cta}
                </Link>

                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5">
                      {f.included ? (
                        <Check className={`w-4 h-4 shrink-0 ${a.icon}`} />
                      ) : (
                        <X className="w-4 h-4 shrink-0 text-zinc-700" />
                      )}
                      <span className={`text-sm ${f.included ? "text-zinc-300" : "text-zinc-600"}`}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          {[
            { q: "What's included with a DID?", a: "A dedicated phone number for your business. Callers can call it via any carrier. Your AI picks up instantly." },
            { q: "Can I cancel anytime?", a: "Yes. Cancel through your dashboard. Your plan stays active until end of the billing period." },
            { q: "What AI powers the agents?", a: "DeepSeek for conversations, LiveKit + OpenAI for voice. Enterprise-grade AI, small business price." },
            { q: "How does WhatsApp work?", a: "Your agent connects to the EPIC AI shared WhatsApp number (+1-767-295-0333). Customers message that number, your AI replies as your agent." },
            { q: "What payment methods are accepted?", a: "We use Fiserv for payment processing. All major credit cards accepted." },
            { q: "Is there an API?", a: "Yes, on Business plan. Full REST API for integrating your agent with existing systems." },
          ].map((faq) => (
            <div key={faq.q} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-200 mb-2">{faq.q}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
