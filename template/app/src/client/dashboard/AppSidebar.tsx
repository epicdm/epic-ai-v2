import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../../lib/useClerkAuth";
import { useClerk } from "@clerk/clerk-react";
import {
  LayoutDashboard, Bot, MessageCircle, Phone, Radio,
  Users, BookOpen, Plug, CreditCard, Settings,
  ChevronLeft, ChevronRight, Sparkles, LogOut, X,
} from "lucide-react";

const NAV = [
  {
    items: [{ href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "WORKSPACE",
    items: [
      { href: "/dashboard/agents", label: "Agents", icon: Bot , exact: false },
      { href: "/dashboard/conversations", label: "Conversations", icon: MessageCircle , exact: false },
      { href: "/dashboard/calls", label: "Calls", icon: Phone , exact: false },
      { href: "/dashboard/broadcasts", label: "Broadcasts", icon: Radio , exact: false },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { href: "/dashboard/contacts", label: "Contacts", icon: Users , exact: false },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard , exact: false },
      { href: "/dashboard/settings", label: "Settings", icon: Settings , exact: false },
    ],
  },
];

const PLAN_BADGE: Record<string, string> = {
  free: "bg-zinc-700 text-zinc-300",
  pro: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
  business: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
};

export default function AppSidebar() {
  const { data: user } = useAuth()
  const { signOut } = useClerk();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Persist collapse state
  useEffect(() => {
    try { localStorage.setItem("sidebar-collapsed", String(collapsed)); } catch {}
  }, [collapsed]);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Click outside to close mobile
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  // ESC to close mobile
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const plan = (user as any)?.subscriptionPlan || "free";

  const isActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className={`${collapsed && !mobileOpen ? "w-16" : "w-60"} bg-zinc-950 border-r border-zinc-800/60 flex flex-col h-full transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className={`h-16 flex items-center ${collapsed && !mobileOpen ? "justify-center px-0" : "px-5"} border-b border-zinc-800/60 shrink-0`}>
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="font-bold text-sm text-zinc-100 tracking-tight">
              EPIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span>
            </span>
          )}
        </Link>
        {mobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {(!collapsed || mobileOpen) && section.label && (
              <p className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href, 'exact' in item && item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  } ${collapsed && !mobileOpen ? "justify-center" : ""}`}
                >
                  <Icon className="w-[17px] h-[17px] shrink-0" />
                  {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!mobileOpen && (
        <button
          onClick={() => setCollapsed(c => !c)}
          className="mx-2 mb-2 flex items-center justify-center h-8 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {/* User section */}
      <div className={`border-t border-zinc-800/60 p-3 ${collapsed && !mobileOpen ? "flex justify-center" : ""}`}>
        {collapsed && !mobileOpen ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {(user?.email || "U")[0].toUpperCase()}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${PLAN_BADGE[plan] || PLAN_BADGE.free}`}>
                {plan}
              </span>
            </div>
            <button onClick={async () => { await signOut(); window.location.href = "/"; }} style={{cursor:"pointer",background:"none",border:"none",padding:0}} className="text-zinc-600 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-200"
        onClick={() => setMobileOpen(true)}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <div ref={sidebarRef} className="hidden lg:flex h-screen">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
          <div ref={sidebarRef} className="lg:hidden fixed inset-y-0 left-0 z-50 flex">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
