import { useState } from "react";
import { useQuery, useAction } from "wasp/client/operations";
import { getContacts, importContacts } from "wasp/client/operations";
import { Users, Search, Upload, Phone, Mail } from "lucide-react";

function getInitials(name: string) {
  return name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
}

const GRADIENTS = ["from-indigo-500 to-violet-600", "from-violet-500 to-purple-600", "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-rose-500 to-pink-600", "from-amber-500 to-orange-600"];

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useQuery(getContacts);
  const importFn = useAction(importContacts);
  const [search, setSearch] = useState("");
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const filtered = (contacts as any[]).filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = async () => {
    const lines = importText.split("\n").filter(l => l.trim());
    const parsed = lines.map(line => {
      const parts = line.split(",");
      return { name: parts[0]?.trim() || "Unknown", phone: parts[1]?.trim(), email: parts[2]?.trim() };
    }).filter(c => c.name && c.name !== "Unknown");
    if (!parsed.length) return;
    setImporting(true);
    try { await importFn({ contacts: parsed }); setShowImport(false); setImportText(""); }
    finally { setImporting(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Contacts</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{(contacts as any[]).length} contacts total</p>
        </div>
        <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-sm font-bold text-zinc-100">Import Contacts</h2>
            <p className="text-xs text-zinc-500">One contact per line: <span className="font-mono text-zinc-400">Name, Phone, Email</span></p>
            <textarea
              placeholder={"John Smith, +17671234567, john@example.com\nJane Doe, +17679876543"}
              value={importText} onChange={e => setImportText(e.target.value)} rows={8}
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowImport(false)} className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200">Cancel</button>
              <button onClick={handleImport} disabled={importing} className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl p-16 text-center">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-sm font-semibold text-zinc-400">{search ? "No contacts match" : "No contacts yet"}</p>
          {!search && <p className="text-xs text-zinc-600 mt-1 mb-5">Import from CSV to get started</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((contact: any, i: number) => (
            <div key={contact.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                {getInitials(contact.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-200">{contact.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {contact.phone && <span className="flex items-center gap-1 text-xs text-zinc-500"><Phone className="w-3 h-3" />{contact.phone}</span>}
                  {contact.email && <span className="flex items-center gap-1 text-xs text-zinc-500"><Mail className="w-3 h-3" />{contact.email}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
