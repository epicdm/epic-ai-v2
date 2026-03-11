import { useState, useEffect } from "react";
import { useAuth } from "../../lib/useClerkAuth";
import { useQuery, useAction } from "wasp/client/operations";
import { getAgents, updateAgent } from "wasp/client/operations";
import { Settings, Bot, MessageCircle, Phone, Globe, Save, Check } from "lucide-react";

const ROUTING_OPTIONS = [
  { value: "whatsapp", label: "Forward to WhatsApp", desc: "Ring your WhatsApp number" },
  { value: "ai", label: "AI handles it", desc: "Jenny answers every call" },
  { value: "whatsapp_then_ai", label: "WhatsApp first, then AI", desc: "Try WhatsApp, AI if unanswered" },
  { value: "livekit", label: "Ring my browser", desc: "Notify via web push + browser" },
];

export default function SettingsPage() {
  const { data: user } = useAuth();
  const { data: agents = [] } = useQuery(getAgents);
  const updateAgentFn = useAction(updateAgent);
  const [saved, setSaved] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [form, setForm] = useState({ name: "", purpose: "", tone: "", whatsappNumber: "", inboundRouting: "ai" });

  useEffect(() => {
    if ((agents as any[]).length > 0 && !selectedAgent) {
      const a = (agents as any[])[0];
      setSelectedAgent(a);
      setForm({ name: a.name || "", purpose: a.purpose || "", tone: a.tone || "", whatsappNumber: a.whatsappNumber || "", inboundRouting: a.inboundRouting || "ai" });
    }
  }, [agents]);

  const selectAgent = (a: any) => {
    setSelectedAgent(a);
    setForm({ name: a.name || "", purpose: a.purpose || "", tone: a.tone || "", whatsappNumber: a.whatsappNumber || "", inboundRouting: a.inboundRouting || "ai" });
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    await updateAgentFn({ id: selectedAgent.id, ...form });
    setSaved(selectedAgent.id);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your agents and account preferences</p>
      </div>

      {/* Account info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Settings className="w-4 h-4" /> Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base">
            {(user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">{user?.email}</p>
            <p className="text-xs text-zinc-500 capitalize">Plan: {(user as any)?.subscriptionPlan || "free"}</p>
          </div>
        </div>
      </div>

      {/* Agent settings */}
      {(agents as any[]).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2"><Bot className="w-4 h-4" /> Agent Settings</h2>
          </div>

          {/* Agent picker */}
          {(agents as any[]).length > 1 && (
            <div className="px-5 py-3 border-b border-zinc-800 flex gap-2 overflow-x-auto">
              {(agents as any[]).map((a: any) => (
                <button key={a.id} onClick={() => selectAgent(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedAgent?.id === a.id ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}>
                  {a.name}
                </button>
              ))}
            </div>
          )}

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Agent Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Tone / Personality</label>
                <input value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
                  placeholder="e.g. Professional and friendly"
                  className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">System Prompt / Purpose</label>
              <textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} rows={4}
                placeholder="You are a helpful receptionist for ACME Corp. Help customers with appointments, questions, and support."
                className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none" />
            </div>

            {/* WhatsApp connection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-green-400" /> WhatsApp Number</label>
              <div className="flex gap-2">
                <input value={form.whatsappNumber} onChange={e => setForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                  placeholder="+17671234567"
                  className="flex-1 px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50" />
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${form.whatsappNumber ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${form.whatsappNumber ? "bg-green-400" : "bg-zinc-600"}`} />
                  {form.whatsappNumber ? "Connected" : "Not set"}
                </div>
              </div>
            </div>

            {/* Inbound routing */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-indigo-400" /> Inbound Call Routing</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROUTING_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setForm(f => ({ ...f, inboundRouting: opt.value }))}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${form.inboundRouting === opt.value ? "border-indigo-500/40 bg-indigo-500/10" : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"}`}>
                    <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${form.inboundRouting === opt.value ? "border-indigo-400 bg-indigo-400" : "border-zinc-600"}`}>
                      {form.inboundRouting === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">{opt.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${saved === selectedAgent?.id ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"}`}>
              {saved === selectedAgent?.id ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
