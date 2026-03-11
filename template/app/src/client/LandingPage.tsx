"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { routes } from "wasp/client/router";

const JENNY_MESSAGES = [
  { delay: 600,  text: "Hey! 👋 I'm Jenny — an AI receptionist." },
  { delay: 1800, text: "I answer calls, reply to messages, set reminders, and handle your customers 24/7." },
  { delay: 3200, text: "While you sleep. While you're on the job. While you're at the beach. 🏖️" },
  { delay: 5000, text: "What kind of business do you run?" },
];

const JENNY_REPLIES = [
  "Perfect! I can handle that. 💪",
  "Your customers message you on WhatsApp, I respond instantly — in your voice, with your info.",
  "Want me to do this for YOUR customers? Setup takes 5 minutes. 👇",
];

type Bubble = { from: "jenny" | "user"; text: string };

export default function LandingPage() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [userInput, setUserInput] = useState("");
  const [phase, setPhase] = useState<"intro" | "waiting" | "replied" | "done">("intro");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    JENNY_MESSAGES.forEach(({ delay, text }, idx) => {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setBubbles(b => [...b, { from: "jenny", text }]);
          if (idx === JENNY_MESSAGES.length - 1) setPhase("waiting");
        }, 900);
      }, delay);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles, typing]);

  const send = () => {
    if (!userInput.trim() || phase !== "waiting") return;
    setBubbles(b => [...b, { from: "user", text: userInput.trim() }]);
    setUserInput("");
    setPhase("replied");
    JENNY_REPLIES.forEach((text, i) => {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setBubbles(b => [...b, { from: "jenny", text }]);
          if (i === JENNY_REPLIES.length - 1) setPhase("done");
        }, 900);
      }, 1200 + i * 2200);
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>AI</div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>EPIC AI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link to={routes.PricingRoute.build()} style={{ color: "#71717a", textDecoration: "none", fontSize: 14 }}>Pricing</Link>
          <Link to={routes.LoginRoute.build()} style={{ color: "#71717a", textDecoration: "none", fontSize: 14 }}>Sign in</Link>
          <Link to={routes.SignupRoute.build()} style={{ background: "#4f46e5", color: "#fff", textDecoration: "none", padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 16px 40px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          {/* Chat window */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -1, background: "rgba(99,102,241,0.15)", filter: "blur(40px)", borderRadius: 24, zIndex: 0 }} />
            <div style={{ position: "relative", background: "#111118", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.6)", zIndex: 1 }}>

              {/* Chat header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#16161f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>J</div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: "#22c55e", borderRadius: "50%", border: "2px solid #16161f" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Jenny · EPIC AI</div>
                  <div style={{ fontSize: 11, color: "#22c55e" }}>online</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ height: 280, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {bubbles.map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: b.from === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "80%", padding: "9px 14px", borderRadius: b.from === "jenny" ? "18px 18px 18px 4px" : "18px 4px 18px 18px",
                      background: b.from === "jenny" ? "#1e1e2e" : "#4f46e5",
                      color: "#e4e4e7", fontSize: 14, lineHeight: 1.5
                    }}>{b.text}</div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ background: "#1e1e2e", padding: "10px 16px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 150, 300].map(d => (
                        <div key={d} className={`dot-${d === 0 ? 1 : d === 150 ? 2 : 3}`} style={{ width: 6, height: 6, borderRadius: "50%", background: "#71717a" }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0d0d16" }}>
                {phase === "done" ? (
                  <Link to={routes.SignupRoute.build()} style={{
                    display: "block", width: "100%", textAlign: "center", textDecoration: "none",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#fff",
                    fontWeight: 600, padding: "11px", borderRadius: 12, fontSize: 14
                  }}>
                    Get my AI receptionist →
                  </Link>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 8 }}>
                    <input
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder={phase === "waiting" ? "Type your answer..." : ""}
                      disabled={phase !== "waiting"}
                      style={{
                        flex: 1, background: "#1a1a28", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#fff",
                        outline: "none", opacity: phase !== "waiting" ? 0.4 : 1
                      }}
                    />
                    <button type="submit" disabled={phase !== "waiting" || !userInput.trim()} style={{
                      width: 38, height: 38, borderRadius: 10, background: "#4f46e5",
                      border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: (phase !== "waiting" || !userInput.trim()) ? 0.3 : 1
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ transform: "rotate(90deg)" }}>
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Your AI receptionist, on WhatsApp</h1>
            <p style={{ color: "#71717a", fontSize: 14, marginTop: 6 }}>Set up in 5 minutes. No code. No hiring. $29/mo.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 16px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 40, textAlign: "center" }}>
          {[["24/7", "Always on"], ["< 3s", "Response time"], ["5 min", "Setup time"], ["$0", "To start"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{n}</div>
              <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "64px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Everything your receptionist does. Automatically.</h2>
          <p style={{ textAlign: "center", color: "#71717a", fontSize: 14, marginBottom: 40 }}>On WhatsApp. On calls. Around the clock.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              ["💬", "Answers messages", "Replies to every WhatsApp message instantly, in your voice."],
              ["📞", "Handles calls", "Picks up every call, takes messages, routes urgent ones to you."],
              ["📅", "Books appointments", "Schedules meetings and sends reminders automatically."],
              ["🌙", "Works nights & weekends", "No overtime, no sick days. Always available."],
              ["🧠", "Knows your business", "Trained on your products, prices, FAQs, and policies."],
              ["💳", "Collects payments", "Sends invoices and payment links right in the chat."],
            ].map(([emoji, title, desc]) => (
              <div key={title as string} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{emoji}</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "64px 16px", background: "#0d0d14" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Simple pricing</h2>
          <p style={{ textAlign: "center", color: "#71717a", fontSize: 14, marginBottom: 40 }}>Start free. Upgrade when you need more.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { name: "Free", price: "$0", sub: "forever", features: ["1 AI agent", "50 messages/mo", "Business hours only", "Talk to Jenny"], highlight: false },
              { name: "Pro", price: "$29", sub: "/month", features: ["1 AI agent", "Unlimited messages", "24/7 availability", "PSTN calling", "Custom voice & name"], highlight: true },
              { name: "Business", price: "$79", sub: "/month", features: ["3 AI agents", "Unlimited everything", "Priority support", "White-label ready", "API access"], highlight: false },
            ].map(({ name, price, sub, features, highlight }) => (
              <div key={name} style={{ background: highlight ? "rgba(79,70,229,0.1)" : "#111118", border: `1px solid ${highlight ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 13, color: "#71717a", marginBottom: 4 }}>{name}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 16 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>{price}</span>
                  <span style={{ fontSize: 13, color: "#71717a", marginBottom: 4 }}>{sub}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {features.map(f => (
                    <li key={f} style={{ fontSize: 12, color: "#a1a1aa", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#818cf8" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={routes.SignupRoute.build()} style={{
                  display: "block", textAlign: "center", textDecoration: "none", padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: highlight ? "#4f46e5" : "rgba(255,255,255,0.06)", color: highlight ? "#fff" : "#a1a1aa"
                }}>
                  {name === "Free" ? "Start free" : `Get ${name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "80px 16px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Ready to hire your AI receptionist?</h2>
        <p style={{ color: "#71717a", fontSize: 14, marginBottom: 32 }}>Set up in 5 minutes. First month free. Cancel anytime.</p>
        <Link to={routes.SignupRoute.build()} style={{
          display: "inline-block", textDecoration: "none", background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          color: "#fff", fontWeight: 600, padding: "14px 32px", borderRadius: 12, fontSize: 14,
          boxShadow: "0 8px 32px rgba(79,70,229,0.3)"
        }}>
          Get Started Free →
        </Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px 16px", textAlign: "center", fontSize: 12, color: "#52525b" }}>
        © 2026 EPIC Communications Inc ·{" "}
        <a href="mailto:hello@epic.dm" style={{ color: "#71717a", textDecoration: "none" }}>hello@epic.dm</a>
      </div>

    </div>
  );
}
