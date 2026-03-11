import { Link } from "react-router";
import { useQuery, useAction } from "wasp/client/operations";
import { getAgents, deleteAgent } from "wasp/client/operations";
import { Bot, Plus, Settings, MessageCircle, Phone, Trash2 } from "lucide-react";
import { useState } from "react";

const GRADIENTS = ["from-indigo-500 to-violet-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600"];
const TEMPLATE_COLORS: Record<string, string> = {
  receptionist: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20",
  concierge: "bg-violet-500/20 text-violet-300 border border-violet-500/20",
  sales: "bg-green-500/20 text-green-300 border border-green-500/20",
  support: "bg-blue-500/20 text-blue-300 border border-blue-500/20",
  collections: "bg-amber-500/20 text-amber-300 border border-amber-500/20",
};

function getInitials(name: string) {
  return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useQuery(getAgents);
  const deleteAgentFn = useAction(deleteAgent);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    setDeleting(id);
    try { await deleteAgentFn({ id }); } finally { setDeleting(null); }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Agents</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your AI assistants</p>
        </div>
        <Link to="/create" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 transition-all">
          <Plus className="w-4 h-4" /> New Agent
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
          <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-base font-semibold text-zinc-400">No agents yet</p>
          <p className="text-sm text-zinc-600 mt-1 mb-6">Create your first AI agent in minutes</p>
          <Link to="/create" className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white">Create your first agent</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(agents as any[]).map((agent, i) => (
            <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {getInitials(agent.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{agent.name}</p>
                    {agent.template && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${TEMPLATE_COLORS[agent.template] || "bg-zinc-700 text-zinc-400"}`}>
                        {agent.template}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${agent.status === "active" ? "bg-green-500/10 text-green-400" : "bg-zinc-800 text-zinc-500"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
                  {agent.status === "active" ? "Active" : "Draft"}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className={`flex items-center gap-2 text-xs ${agent.whatsappNumber ? "text-zinc-400" : "text-zinc-600"}`}>
                  <MessageCircle className={`w-3.5 h-3.5 ${agent.whatsappNumber ? "text-green-400" : ""}`} />
                  <span>{agent.whatsappNumber || "WhatsApp not connected"}</span>
                </div>
                <div className={`flex items-center gap-2 text-xs ${agent.didNumber ? "text-zinc-400" : "text-zinc-600"}`}>
                  <Phone className={`w-3.5 h-3.5 ${agent.didNumber ? "text-indigo-400" : ""}`} />
                  <span className="font-mono">{agent.didNumber || "No phone number"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1 border-t border-zinc-800">
                <Link to={`/dashboard/agents/${agent.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                  <MessageCircle className="w-3.5 h-3.5" /> Open
                </Link>
                <button
                  onClick={() => handleDelete(agent.id)}
                  disabled={deleting === agent.id}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <Link to="/create" className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-zinc-600 transition-all group cursor-pointer min-h-[200px]">
            <div className="w-11 h-11 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
            </div>
            <p className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium">Add Agent</p>
          </Link>
        </div>
      )}
    </div>
  );
}
