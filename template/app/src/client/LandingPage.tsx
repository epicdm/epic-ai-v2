"use client";
import { Link } from "react-router";
import { routes } from "wasp/client/router";

const WA_LINK = "https://wa.me/17672950333?text=Hi%20Jenny!%20I%20want%20to%20see%20what%20you%20can%20do.";

const features = [
  ["💬", "Chats with your customers", "Replies instantly on WhatsApp — in your voice, with your info."],
  ["📞", "Answers every call", "Picks up, takes messages, routes urgent calls to you."],
  ["📅", "Books appointments", "Schedules and sends reminders automatically."],
  ["🌙", "Works 24/7", "No overtime. No sick days. Always on."],
  ["🧠", "Knows your business", "Trained on your products, prices, and FAQs."],
  ["💳", "Collects payments", "Sends invoices and payment links in the chat."],
];

const personas = [
  { emoji: "🏪", label: "Shop owner" },
  { emoji: "👩‍⚕️", label: "Doctor / Clinic" },
  { emoji: "🍕", label: "Restaurant" },
  { emoji: "💅", label: "Salon & Spa" },
  { emoji: "🔧", label: "Contractor" },
  { emoji: "📚", label: "Tutor / Teacher" },
  { emoji: "🚀", label: "Entrepreneur" },
  { emoji: "👩‍👧", label: "Anyone" },
];

export default function LandingPage() {
  const s = {
    page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui,-apple-system,sans-serif" } as React.CSSProperties,
    nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" } as React.CSSProperties,
    logo: { display: "flex", alignItems: "center", gap: 10 } as React.CSSProperties,
    logoIcon: { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 } as React.CSSProperties,
    navLinks: { display: "flex", alignItems: "center", gap: 20 } as React.CSSProperties,
    navLink: { color: "#71717a", textDecoration: "none", fontSize: 14 } as React.CSSProperties,
    navCta: { background: "#4f46e5", color: "#fff", textDecoration: "none", padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600 } as React.CSSProperties,
    hero: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "80px 24px 60px" } as React.CSSProperties,
    badge: { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(79,70,229,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600, marginBottom: 28, letterSpacing: "0.05em", textTransform: "uppercase" as const },
    h1: { fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.1, color: "#fff", margin: "0 0 20px", maxWidth: 700 } as React.CSSProperties,
    accent: { background: "linear-gradient(135deg,#818cf8,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as React.CSSProperties,
    sub: { fontSize: 18, color: "#71717a", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.6 } as React.CSSProperties,
    waBtnWrap: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 },
    waBtn: {
      display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none",
      background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 17,
      padding: "16px 32px", borderRadius: 14, boxShadow: "0 8px 40px rgba(37,211,102,0.35)",
      transition: "transform 0.15s, box-shadow 0.15s"
    } as React.CSSProperties,
    waSub: { color: "#52525b", fontSize: 13 } as React.CSSProperties,
    orDivider: { color: "#3f3f46", fontSize: 13, margin: "4px 0" } as React.CSSProperties,
    signupLink: { color: "#818cf8", fontSize: 13, textDecoration: "none" } as React.CSSProperties,
  };

  return (
    <div style={s.page}>

      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoIcon}>AI</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>EPIC AI</span>
        </div>
        <div style={s.navLinks}>
          <Link to={routes.PricingRoute.build()} style={s.navLink}>Pricing</Link>
          <Link to={routes.LoginRoute.build()} style={s.navLink}>Sign in</Link>
          <Link to={routes.SignupRoute.build()} style={s.navCta}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.badge}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Jenny is online · Try her now
        </div>

        <h1 style={s.h1}>
          Meet your <span style={s.accent}>AI receptionist</span>.<br />She lives on WhatsApp.
        </h1>

        <p style={s.sub}>
          Jenny handles your calls, messages, bookings, and payments — 24/7.
          No hiring. No training. Just message her and see.
        </p>

        <div style={s.waBtnWrap}>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={s.waBtn}>
            {/* WhatsApp icon */}
            <svg width="22" height="22" viewBox="0 0 32 32" fill="white">
              <path d="M16 1C7.716 1 1 7.716 1 16c0 2.71.706 5.258 1.942 7.47L1 31l7.745-1.918A14.94 14.94 0 0016 31c8.284 0 15-6.716 15-15S24.284 1 16 1zm0 27.5a12.45 12.45 0 01-6.36-1.748l-.456-.27-4.598 1.138 1.168-4.47-.297-.48A12.457 12.457 0 013.5 16C3.5 9.096 9.096 3.5 16 3.5S28.5 9.096 28.5 16 22.904 28.5 16 28.5zm6.9-9.3c-.378-.19-2.24-1.106-2.588-1.232-.348-.126-.601-.19-.854.19-.253.378-.98 1.232-1.201 1.485-.22.252-.442.284-.82.094-.378-.19-1.597-.588-3.042-1.878-1.124-1.003-1.882-2.24-2.103-2.618-.22-.378-.023-.582.166-.77.17-.17.378-.442.567-.663.19-.22.252-.378.378-.63.126-.253.063-.474-.032-.663-.094-.19-.854-2.057-1.17-2.817-.308-.74-.62-.64-.854-.65-.22-.01-.474-.013-.727-.013s-.663.094-.01 1.012-.854 1.012-.854 1.012-.252 2.44 1.232 4.8c1.485 2.36 5.026 6.195 9.745 7.394 1.36.37 2.42.59 3.247.378.99-.237 3.042-1.244 3.47-2.44.43-1.196.43-2.22.3-2.44-.126-.22-.38-.347-.758-.536z"/>
            </svg>
            Message Jenny on WhatsApp
          </a>
          <div style={s.waSub}>Free · No sign-up required · Opens WhatsApp</div>
          <div style={s.orDivider}>— or —</div>
          <Link to={routes.SignupRoute.build()} style={s.signupLink}>Sign up to get your own AI agent →</Link>
        </div>
      </div>

      {/* Who is it for */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ color: "#52525b", fontSize: 13, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Works for every business — and everyone</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: 700, margin: "0 auto" }}>
          {personas.map(({ emoji, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 99, padding: "8px 16px", fontSize: 13, color: "#a1a1aa" }}>
              <span>{emoji}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 48, textAlign: "center" }}>
          {[["24/7", "Always on"], ["< 3s", "Avg. response"], ["5 min", "Setup time"], ["$0", "To try"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#52525b", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 10 }}>What Jenny does for you</h2>
          <p style={{ textAlign: "center", color: "#71717a", fontSize: 15, marginBottom: 48 }}>Everything a full-time receptionist does. Automatically. Around the clock.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
            {features.map(([emoji, title, desc]) => (
              <div key={title as string} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, transition: "border-color 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#fff", marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "72px 24px", background: "#0d0d14" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Set up in 5 minutes</h2>
          <p style={{ color: "#71717a", fontSize: 15, marginBottom: 56 }}>No technical skills needed.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {[
              ["1", "Message Jenny", "Open WhatsApp, say hi. She'll walk you through everything — what she can do, how to set her up, how much it costs."],
              ["2", "Tell her about your business", "Name, industry, hours, FAQs, prices. She learns it all in the conversation."],
              ["3", "She goes to work", "Jenny handles your customers while you focus on what you do best."],
            ].map(([num, title, desc]) => (
              <div key={num as string} style={{ display: "flex", gap: 20, textAlign: "left", alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#818cf8", flexShrink: 0 }}>{num}</div>
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: 16, marginBottom: 4 }}>{title}</div>
                  <div style={{ color: "#71717a", fontSize: 14, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "72px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 10 }}>Simple pricing</h2>
          <p style={{ textAlign: "center", color: "#71717a", fontSize: 15, marginBottom: 48 }}>Try free. Upgrade when you're ready.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            {[
              { name: "Free", price: "$0", sub: "forever", feats: ["1 AI agent", "50 messages/mo", "Business hours only", "Talk to Jenny"], cta: "Try Free", hi: false },
              { name: "Pro", price: "$29", sub: "/month", feats: ["1 AI agent", "Unlimited messages", "24/7 availability", "Calls + voice", "Custom name & personality"], cta: "Get Pro", hi: true },
              { name: "Business", price: "$79", sub: "/month", feats: ["3 AI agents", "Unlimited everything", "Priority support", "White-label", "API access"], cta: "Get Business", hi: false },
            ].map(({ name, price, sub, feats, cta, hi }) => (
              <div key={name} style={{ background: hi ? "rgba(79,70,229,0.1)" : "#111118", border: `1px solid ${hi ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 13, color: "#71717a" }}>{name}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, margin: "8px 0 20px" }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{price}</span>
                  <span style={{ fontSize: 13, color: "#52525b", marginBottom: 4 }}>{sub}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {feats.map(f => <li key={f} style={{ fontSize: 13, color: "#a1a1aa", display: "flex", gap: 8 }}><span style={{ color: "#818cf8" }}>✓</span>{f}</li>)}
                </ul>
                <Link to={routes.SignupRoute.build()} style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, background: hi ? "#4f46e5" : "rgba(255,255,255,0.06)", color: hi ? "#fff" : "#a1a1aa" }}>{cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "80px 24px", textAlign: "center", background: "#0d0d14" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Ready to meet Jenny?</h2>
        <p style={{ color: "#71717a", fontSize: 15, marginBottom: 36 }}>No sign-up. No credit card. Just open WhatsApp.</p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 17, padding: "16px 32px", borderRadius: 14, boxShadow: "0 8px 40px rgba(37,211,102,0.3)" }}>
          <svg width="20" height="20" viewBox="0 0 32 32" fill="white"><path d="M16 1C7.716 1 1 7.716 1 16c0 2.71.706 5.258 1.942 7.47L1 31l7.745-1.918A14.94 14.94 0 0016 31c8.284 0 15-6.716 15-15S24.284 1 16 1zm0 27.5a12.45 12.45 0 01-6.36-1.748l-.456-.27-4.598 1.138 1.168-4.47-.297-.48A12.457 12.457 0 013.5 16C3.5 9.096 9.096 3.5 16 3.5S28.5 9.096 28.5 16 22.904 28.5 16 28.5zm6.9-9.3c-.378-.19-2.24-1.106-2.588-1.232-.348-.126-.601-.19-.854.19-.253.378-.98 1.232-1.201 1.485-.22.252-.442.284-.82.094-.378-.19-1.597-.588-3.042-1.878-1.124-1.003-1.882-2.24-2.103-2.618-.22-.378-.023-.582.166-.77.17-.17.378-.442.567-.663.19-.22.252-.378.378-.63.126-.253.063-.474-.032-.663-.094-.19-.854-2.057-1.17-2.817-.308-.74-.62-.64-.854-.65-.22-.01-.474-.013-.727-.013s-.663.094-.01 1.012-.854 1.012-.854 1.012-.252 2.44 1.232 4.8c1.485 2.36 5.026 6.195 9.745 7.394 1.36.37 2.42.59 3.247.378.99-.237 3.042-1.244 3.47-2.44.43-1.196.43-2.22.3-2.44-.126-.22-.38-.347-.758-.536z"/></svg>
          Message Jenny — it's free
        </a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px", textAlign: "center", fontSize: 12, color: "#3f3f46" }}>
        © 2026 EPIC Communications Inc ·{" "}
        <a href="mailto:hello@epic.dm" style={{ color: "#52525b", textDecoration: "none" }}>hello@epic.dm</a>
        {" · "}
        <Link to={routes.PricingRoute.build()} style={{ color: "#52525b", textDecoration: "none" }}>Pricing</Link>
        {" · "}
        <Link to={routes.LoginRoute.build()} style={{ color: "#52525b", textDecoration: "none" }}>Sign in</Link>
      </div>

    </div>
  );
}
