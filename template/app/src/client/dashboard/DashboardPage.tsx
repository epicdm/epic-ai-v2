import { Link, useNavigate } from "react-router";
import { useQuery } from "wasp/client/operations";
import { useAuth } from "../../lib/useClerkAuth";
import { getAgents, getConversations } from "wasp/client/operations";
import { Bot, MessageCircle, Zap, Crown, Plus, ChevronRight, Clock } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "indigo" }: { icon: any; label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400" },
    green: { bg: "bg-green-500/10", icon: "text-green-400" },
    violet: { bg: "bg-violet-500/10", icon: "text-violet-400" },
    amber: { bg: "bg-amber-500/10", icon: "text-amber-400" },
  };
  const c = colors[color] || colors.indigo;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-zinc-100 font-mono">{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        <div className={`${c.bg} p-2.5 rounded-xl`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string) {
  return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}

const TEMPLATE_COLORS: Record<string, string> = {
  receptionist: "bg-indigo-500/20 text-indigo-300",
  concierge: "bg-violet-500/20 text-violet-300",
  sales: "bg-green-500/20 text-green-300",
  support: "bg-blue-500/20 text-blue-300",
  collections: "bg-amber-500/20 text-amber-300",
};

const GRADIENTS = ["from-indigo-500 to-violet-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { data: agents = [], isLoading: agentsLoading } = useQuery(getAgents);
  const { data: conversations = [], isLoading: convsLoading } = useQuery(getConversations, {});

  // Redirect to create if no agents
  if (!agentsLoading && agents.length === 0) {
    navigate("/create");
    return null;
  }

  const plan = (user as any)?.subscriptionPlan || "free";
  const activeAgents = agents.filter((a: any) => a.status === "active").length;

  // Recent messages from conversations
  const recentActivity = conversations
    .flatMap((c: any) => (c.messages || []).map((m: any) => ({ ...m, agentName: c.agent?.name, phone: c.contact?.phone || c.contactId })))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const todayMessages = recentActivity.filter((m: any) => new Date(m.createdAt).toDateString() === new Date().toDateString()).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your AI workforce at a glance</p>
        </div>
        <Link to="/create" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 transition-all">
          <Plus className="w-4 h-4" /> New Agent
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bot} label="Total Agents" value={agentsLoading ? "—" : agents.length} sub={`${activeAgents} active`} color="indigo" />
        <StatCard icon={MessageCircle} label="Conversations" value={agentsLoading ? "—" : conversations.length} color="green" />
        <StatCard icon={Zap} label="Messages Today" value={todayMessages} color="violet" />
        <StatCard icon={Crown} label="Plan" value={plan.charAt(0).toUpperCase() + plan.slice(1)} sub={plan === "free" ? "Upgrade →" : "Active"} color="amber" />
      </div>

      {/* Two column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Agents */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Your Agents</h2>
            <Link to="/dashboard/agents" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {agentsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-20 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {agents.slice(0, 5).map((agent: any, i: number) => (
                <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {getInitials(agent.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-200 truncate">{agent.name}</p>
                      {agent.template && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${TEMPLATE_COLORS[agent.template] || "bg-zinc-700 text-zinc-300"}`}>
                          {agent.template}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`flex items-center gap-1 text-xs ${agent.status === "active" ? "text-green-400" : "text-zinc-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${agent.status === "active" ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
                        {agent.status === "active" ? "Active" : "Draft"}
                      </span>
                      {agent.whatsappNumber && <span className="text-xs text-zinc-500">· {agent.whatsappNumber}</span>}
                    </div>
                  </div>
                  <Link to={`/dashboard/agents/${agent.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2.5 py-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-300">Recent Activity</h2>
          {convsLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl h-16 animate-pulse" />)}</div>
          ) : recentActivity.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <MessageCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-500">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((msg: any) => (
                <div key={msg.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-300 truncate">{msg.phone}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 shrink-0 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />{relativeTime(msg.createdAt)}
                    </span>
                  </div>
                  {msg.agentName && <p className="text-[10px] text-indigo-400 mt-1">via {msg.agentName}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
