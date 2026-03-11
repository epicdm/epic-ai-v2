import { Link } from "react-router";
import { MessageCircle, Phone, Zap, Bot, Globe, Shield, ArrowRight, Star, Check } from "lucide-react";

const FEATURES = [
  { icon: MessageCircle, color: "indigo", title: "WhatsApp AI Agent", desc: "Your AI answers every WhatsApp message instantly — 24/7, no staff needed." },
  { icon: Phone, color: "violet", title: "AI Phone Receptionist", desc: "A real phone number. Jenny answers calls, takes messages, books appointments." },
  { icon: Zap, color: "green", title: "Instant Setup", desc: "Pick a template, customize in 2 minutes, go live. No code. No engineers." },
  { icon: Bot, color: "blue", title: "Multi-Agent Workforce", desc: "Run sales, support, billing, and reception all from one dashboard." },
  { icon: Globe, color: "amber", title: "Outbound Broadcasts", desc: "Message 500+ contacts at once. Promotions, reminders, follow-ups — automated." },
  { icon: Shield, color: "pink", title: "Your AI, Your Rules", desc: "Full control over personality, tone, and instructions. Works the way you work." },
];

const STEPS = [
  { n: "01", title: "Choose a template", desc: "Receptionist, Sales, Support, Collections — or build your own from scratch." },
  { n: "02", title: "Customize your agent", desc: "Give it a name and personality. Add your business info and instructions." },
  { n: "03", title: "Connect WhatsApp", desc: "Link your business number. Your AI goes live on WhatsApp in minutes." },
];

const TESTIMONIALS = [
  { name: "Marcus L.", role: "Restaurant Owner", text: "My AI receptionist handles 80% of reservation calls now. I haven't missed a booking in 3 months." },
  { name: "Sandra R.", role: "Boutique Owner", text: "Jenny answers WhatsApp questions all night. Sales went up 30% because customers get instant responses." },
  { name: "Derek T.", role: "Property Manager", text: "Tenants get answers instantly. My phone stopped ringing for basic questions. Game changer." },
];

const COLOR_ACCENT: Record<string, { bg: string; text: string }> = {
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400" },
  green: { bg: "bg-green-500/10", text: "text-green-400" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/60 h-14 flex items-center px-6 md:px-12">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-zinc-100">EPIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <Link to="/pricing" className="hover:text-zinc-100 transition-colors">Pricing</Link>
          <a href="https://epic.dm" className="hover:text-zinc-100 transition-colors">EPIC Communications</a>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5">Sign in</Link>
          <Link to="/signup" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white transition-all">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-violet-950/20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Now with live calling — AI answers your phone
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
            Your AI, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">Your Rules.</span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Hire an AI employee for your WhatsApp and phone — answers customers 24/7, books appointments, handles support, closes sales. <strong className="text-zinc-200">$29/month. No code. Go live today.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-2xl shadow-indigo-500/25 transition-all">
              Start free today <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100 transition-all">
              See pricing
            </Link>
          </div>

          <p className="text-xs text-zinc-600 mt-4">No credit card required · Free forever for basic use</p>
        </div>
      </section>

      {/* Social proof */}
      <div className="border-y border-zinc-800/60 py-5">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
          {["WhatsApp Business API", "PSTN Voice Calls", "DeepSeek AI", "LiveKit WebRTC", "Fiserv Payments"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-green-400" />{t}
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-3">Live in under 5 minutes</h2>
          <p className="text-zinc-500 text-sm">No developers. No APIs. No headaches.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <div className="text-4xl font-black text-zinc-800 mb-3">{s.n}</div>
              <h3 className="text-base font-semibold text-zinc-200 mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-3">Everything your business needs</h2>
          <p className="text-zinc-500 text-sm">One platform. Every channel. All AI-powered.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const a = COLOR_ACCENT[f.color];
            return (
              <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
                <div className={`w-9 h-9 rounded-xl ${a.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${a.text}`} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-zinc-800/60 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-3">Real businesses, real results</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex mb-3">{[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-sm text-zinc-300 italic mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/60 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-100 mb-4">Start free today.</h2>
          <p className="text-zinc-400 mb-8">No credit card. No setup fees. Your AI live in 5 minutes.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-2xl shadow-indigo-500/25 transition-all">
            Get started free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© 2026 EPIC AI by EPIC Communications Inc</span>
          <div className="flex items-center gap-4">
            <a href="https://epic.dm" className="hover:text-zinc-400">epic.dm</a>
            <Link to="/pricing" className="hover:text-zinc-400">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
