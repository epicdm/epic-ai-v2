import { useState } from "react";
import { useQuery, useAction } from "wasp/client/operations";
import { useAuth } from "wasp/client/auth";
import { getBroadcasts, createBroadcast, sendBroadcast, deleteBroadcast, getAgents } from "wasp/client/operations";
import { Radio, Plus, Send, Trash2, RefreshCw, Users, Clock, Megaphone } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-zinc-700/50 text-zinc-400 border border-zinc-600",
  sending: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  sent: "bg-green-500/20 text-green-300 border border-green-500/30",
  failed: "bg-red-500/20 text-red-300 border border-red-500/30",
};

export default function BroadcastsPage() {
  const { data: user } = useAuth();
  const { data: broadcasts = [], isLoading, refetch } = useQuery(getBroadcasts);
  const { data: agents = [] } = useQuery(getAgents);
  const createFn = useAction(createBroadcast);
  const sendFn = useAction(sendBroadcast);
  const deleteFn = useAction(deleteBroadcast);

  const plan = (user as any)?.subscriptionPlan || "free";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [phones, setPhones] = useState("");
  const [agentId, setAgentId] = useState((agents as any[])[0]?.id || "");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (sendNow: boolean) => {
    if (!name.trim() || !message.trim()) return;
    const phoneList = phones.split("\n").map(p => p.trim()).filter(Boolean);
    if (!phoneList.length) return;
    setCreating(true);
    try {
      const bc = await createFn({ agentId: agentId || (agents as any[])[0]?.id, name, message, phones: phoneList }) as any;
      setDialogOpen(false); setName(""); setMessage(""); setPhones("");
      if (sendNow && bc?.id) { setSending(bc.id); await sendFn({ id: bc.id }); setSending(null); }
    } finally { setCreating(false); }
  };

  const handleSend = async (id: string) => {
    setSending(id);
    try { await sendFn({ id }); } finally { setSending(null); }
  };

  if (plan === "free") return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-zinc-100">Broadcasts</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-7 h-7 text-indigo-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-200 mb-2">Upgrade to Send Broadcasts</h3>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">Reach up to 500 contacts at once on Pro, unlimited on Business.</p>
        <a href="/dashboard/billing" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white">Upgrade Now →</a>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Broadcasts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Send messages to multiple contacts at once</p>
        </div>
        <button onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> New Broadcast
        </button>
      </div>

      {/* Create dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-sm font-bold text-zinc-100">Create Broadcast</h2>
            <input placeholder="Campaign Name" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none" />
            {(agents as any[]).length > 1 && (
              <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full text-sm border border-zinc-700 rounded-lg px-3 py-2 bg-zinc-800 text-zinc-300">
                {(agents as any[]).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
            <textarea placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} rows={4}
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none" />
            <textarea placeholder={"Phone numbers (one per line)\n14165550100\n18005551234"} value={phones} onChange={e => setPhones(e.target.value)} rows={4}
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none" />
            <p className="text-[10px] text-zinc-600">{phones.split("\n").filter(p => p.trim()).length} numbers · {plan === "pro" ? "max 500" : "unlimited"}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDialogOpen(false)} className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">Cancel</button>
              <button onClick={() => handleCreate(false)} disabled={creating} className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700">Save Draft</button>
              <button onClick={() => handleCreate(true)} disabled={creating} className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                {creating ? "Creating..." : <><Send className="w-3 h-3 inline mr-1" />Create & Send</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-24 animate-pulse" />)}</div>
      ) : (broadcasts as any[]).length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
          <Radio className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No broadcasts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(broadcasts as any[]).map((b: any) => (
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-zinc-200 truncate">{b.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_STYLE[b.status] || STATUS_STYLE.draft}`}>{b.status}</span>
                    {b.agent && <span className="text-xs text-zinc-500">· {b.agent.name}</span>}
                  </div>
                  <p className="text-sm text-zinc-500 truncate mb-2">{b.message}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.recipientCount} recipients</span>
                    {b.status !== "draft" && <><span className="text-green-400">✓ {b.sentCount}</span>{b.failedCount > 0 && <span className="text-red-400">✗ {b.failedCount}</span>}</>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {b.status === "draft" && (
                    <button onClick={() => handleSend(b.id)} disabled={sending === b.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
                      {sending === b.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      {sending === b.id ? "Sending..." : "Send"}
                    </button>
                  )}
                  <button onClick={() => deleteFn({ id: b.id })} className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
