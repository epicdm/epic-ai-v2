import { useState } from "react";
import { useNavigate } from "react-router";
import { useAction } from "wasp/client/operations";
import { createAgent } from "wasp/client/operations";
import { Sparkles, Bot, ArrowRight, ArrowLeft, Check } from "lucide-react";

const TEMPLATES = [
  {
    id: "receptionist",
    name: "Receptionist",
    emoji: "📞",
    tagline: "Answer calls and route customers",
    desc: "Jenny handles inbound calls, takes messages, and books appointments.",
    color: "indigo",
    prompt: "You are a professional receptionist. Greet callers warmly, answer their questions, take messages if needed, and help them with appointments. Keep responses concise and professional.",
    defaultTone: "Professional and warm",
  },
  {
    id: "concierge",
    name: "Concierge",
    emoji: "🏨",
    tagline: "Premium customer experience",
    desc: "A high-touch assistant for bookings, recommendations, and VIP service.",
    color: "violet",
    prompt: "You are a premium concierge assistant. Provide exceptional, personalized service. Help with reservations, recommendations, and any requests with elegance and efficiency.",
    defaultTone: "Elegant and attentive",
  },
  {
    id: "sales",
    name: "Sales Agent",
    emoji: "💰",
    tagline: "Convert leads into customers",
    desc: "Qualify leads, handle objections, and close deals on WhatsApp.",
    color: "green",
    prompt: "You are an enthusiastic sales representative. Qualify prospects, highlight product benefits, handle objections confidently, and guide customers toward a purchase decision.",
    defaultTone: "Enthusiastic and persuasive",
  },
  {
    id: "support",
    name: "Support",
    emoji: "🎯",
    tagline: "Resolve issues instantly",
    desc: "24/7 customer support that solves problems and reduces ticket volume.",
    color: "blue",
    prompt: "You are a helpful customer support agent. Listen empathetically, troubleshoot issues systematically, and provide clear solutions. Escalate complex issues appropriately.",
    defaultTone: "Empathetic and solution-focused",
  },
  {
    id: "collections",
    name: "Collections",
    emoji: "📋",
    tagline: "Recover revenue politely",
    desc: "Follow up on overdue payments professionally and arrange payment plans.",
    color: "amber",
    prompt: "You are a professional collections representative. Follow up on overdue accounts respectfully, explain payment options clearly, and work toward mutually agreeable solutions.",
    defaultTone: "Professional and understanding",
  },
  {
    id: "custom",
    name: "Build Your Own",
    emoji: "⚡",
    tagline: "Complete control",
    desc: "Start from scratch with your own personality and instructions.",
    color: "zinc",
    prompt: "",
    defaultTone: "",
  },
];

const ACCENT: Record<string, { ring: string; bg: string; btn: string }> = {
  indigo: { ring: "ring-indigo-500/40 border-indigo-500/40", bg: "bg-indigo-500/10", btn: "from-indigo-500 to-violet-600" },
  violet: { ring: "ring-violet-500/40 border-violet-500/40", bg: "bg-violet-500/10", btn: "from-violet-500 to-purple-600" },
  green: { ring: "ring-green-500/40 border-green-500/40", bg: "bg-green-500/10", btn: "from-green-500 to-emerald-600" },
  blue: { ring: "ring-blue-500/40 border-blue-500/40", bg: "bg-blue-500/10", btn: "from-blue-500 to-indigo-600" },
  amber: { ring: "ring-amber-500/40 border-amber-500/40", bg: "bg-amber-500/10", btn: "from-amber-500 to-orange-600" },
  zinc: { ring: "ring-zinc-500/40 border-zinc-500/40", bg: "bg-zinc-800", btn: "from-zinc-600 to-zinc-700" },
};

export default function CreateAgentPage() {
  const navigate = useNavigate();
  const createAgentFn = useAction(createAgent);
  const [step, setStep] = useState<"template" | "customize">("template");
  const [selected, setSelected] = useState<(typeof TEMPLATES)[0] | null>(null);
  const [form, setForm] = useState({ name: "", purpose: "", tone: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const chooseTemplate = (t: typeof TEMPLATES[0]) => {
    setSelected(t);
    setForm({ name: t.id === "custom" ? "" : `My ${t.name}`, purpose: t.prompt, tone: t.defaultTone });
    setStep("customize");
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { setError("Please give your agent a name"); return; }
    setCreating(true); setError("");
    try {
      await createAgentFn({ name: form.name, template: selected?.id || "custom", purpose: form.purpose, tone: form.tone });
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Failed to create agent");
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-100">EPIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className={`flex items-center gap-1 ${step === "template" ? "text-zinc-200" : "text-zinc-500"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === "template" ? "bg-indigo-500 text-white" : "bg-green-500 text-white"}`}>
                {step === "template" ? "1" : <Check className="w-3 h-3" />}
              </span>
              Choose template
            </span>
            <span className="text-zinc-700">—</span>
            <span className={`flex items-center gap-1 ${step === "customize" ? "text-zinc-200" : "text-zinc-500"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step === "customize" ? "bg-indigo-500 text-white" : "bg-zinc-700 text-zinc-400"}`}>2</span>
              Customize
            </span>
          </div>
        </div>
        <button onClick={() => navigate("/dashboard")} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {step === "template" ? (
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-zinc-100">Choose a template</h1>
              <p className="text-zinc-500 text-sm">Pick a starting point. You'll customize it in the next step.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map((t) => {
                const a = ACCENT[t.color];
                return (
                  <button key={t.id} onClick={() => chooseTemplate(t)}
                    className={`${a.bg} border border-zinc-800 hover:border-opacity-100 hover:${a.ring} rounded-2xl p-5 text-left flex flex-col gap-3 transition-all group hover:scale-[1.01]`}>
                    <div className="text-2xl">{t.emoji}</div>
                    <div>
                      <p className="text-sm font-bold text-zinc-100 group-hover:text-white">{t.name}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{t.tagline}</p>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{t.desc}</p>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-200 mt-auto">
                      Use template <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl space-y-6">
            <div className="text-center space-y-1">
              <div className="text-3xl mb-2">{selected?.emoji}</div>
              <h1 className="text-xl font-bold text-zinc-100">Customize your {selected?.name}</h1>
              <p className="text-sm text-zinc-500">Make it yours. You can change this anytime.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Agent Name <span className="text-red-400">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jenny, Max, Alex"
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Personality / Tone</label>
                <input value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
                  placeholder="e.g. Professional and friendly"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">System Instructions</label>
                <textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} rows={5}
                  placeholder="Describe what your agent should do and how it should behave..."
                  className="w-full px-3 py-2.5 text-sm bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none" />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button onClick={() => setStep("template")} className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all flex items-center gap-1.5">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleCreate} disabled={creating || !form.name.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  <Bot className="w-4 h-4" />
                  {creating ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
