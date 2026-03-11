import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "wasp/client/operations";
import { getAgent, getConversations } from "wasp/client/operations";
import { Bot, Phone, MessageCircle, ArrowLeft, Clock } from "lucide-react";

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.floor(hrs / 24)}d ago`;
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}

const GRADIENTS = ["from-indigo-500 to-violet-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600"];

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const { data: agent, isLoading: agentLoading } = useQuery(getAgent, { id: agentId! });
  const { data: allConversations = [], isLoading: convsLoading } = useQuery(getConversations, {});
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter conversations for this agent
  const conversations = (allConversations as any[]).filter((c: any) => c.agentId === agentId);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedConv]);

  if (agentLoading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-zinc-800 rounded-xl animate-pulse w-48" />
      <div className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
    </div>
  );

  if (!agent) return (
    <div className="p-6 text-center">
      <p className="text-zinc-500">Agent not found</p>
      <Link to="/dashboard/agents" className="text-indigo-400 text-sm mt-2 inline-block">← Back to Agents</Link>
    </div>
  );

  const a = agent as any;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-4 shrink-0">
        <Link to="/dashboard/agents" className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
          {getInitials(a.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-zinc-100">{a.name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`flex items-center gap-1 text-xs ${a.status === "active" ? "text-green-400" : "text-zinc-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${a.status === "active" ? "bg-green-400 animate-pulse" : "bg-zinc-600"}`} />
              {a.status === "active" ? "Active" : "Draft"}
            </span>
            {a.whatsappNumber && <span className="text-xs text-zinc-500 flex items-center gap-1"><MessageCircle className="w-3 h-3 text-green-400" />{a.whatsappNumber}</span>}
            {a.didNumber && <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono"><Phone className="w-3 h-3 text-indigo-400" />{a.didNumber}</span>}
          </div>
        </div>
        <Link to={`/dashboard/settings`} className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all">
          Settings
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400">{conversations.length} Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-2 space-y-1">{[1,2,3].map(i => <div key={i} className="h-14 bg-zinc-800 rounded-xl animate-pulse" />)}</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-500">No conversations yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-0.5">
                {conversations.map((conv: any, i: number) => {
                  const lastMsg = (conv.messages || [])[conv.messages?.length - 1];
                  const name = conv.contact?.name || conv.contact?.phone || conv.contactId;
                  const active = selectedConv?.id === conv.id;
                  return (
                    <button key={conv.id} onClick={() => setSelectedConv(conv)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${active ? "bg-indigo-500/20 border border-indigo-500/30" : "hover:bg-zinc-800/60"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                          {getInitials(name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-semibold text-zinc-200 truncate">{name}</p>
                            {lastMsg && <span className="text-[10px] text-zinc-600 shrink-0">{relativeTime(lastMsg.createdAt)}</span>}
                          </div>
                          {lastMsg && <p className="text-[11px] text-zinc-500 truncate mt-0.5">{lastMsg.text}</p>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">Select a conversation to view</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(selectedConv.contact?.name || selectedConv.contact?.phone || selectedConv.contactId)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{selectedConv.contact?.name || selectedConv.contact?.phone || selectedConv.contactId}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(selectedConv.updatedAt || selectedConv.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3 max-w-2xl mx-auto">
                  {(selectedConv.messages || []).length === 0 ? (
                    <p className="text-center text-xs text-zinc-600 py-12">No messages</p>
                  ) : (
                    (selectedConv.messages || []).map((msg: any) => {
                      const isUser = msg.direction === "inbound";
                      return (
                        <div key={msg.id} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                          {!isUser && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                              <Bot className="w-3 h-3" />
                            </div>
                          )}
                          <div className={`max-w-[70%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                            <div className={`px-3 py-2 rounded-2xl text-sm ${isUser ? "bg-indigo-500 text-white rounded-tr-sm" : "bg-zinc-800 text-zinc-200 rounded-tl-sm"}`}>
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-zinc-600 mt-1 px-1">{fmtTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
