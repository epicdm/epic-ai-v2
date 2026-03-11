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

const RESPONSES: Record<string, string[]> = {
  default: [
    "Perfect! I can handle that. 💪",
    "Your customers message you on WhatsApp, I respond instantly — in your voice, with your info.",
    "Want to see how it works for your business?",
  ],
};

type Bubble = { from: "jenny" | "user"; text: string };

export default function LandingPage() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [userInput, setUserInput] = useState("");
  const [phase, setPhase] = useState<"intro" | "waiting" | "responded" | "done">("intro");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Play intro messages
  useEffect(() => {
    JENNY_MESSAGES.forEach(({ delay, text }) => {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setBubbles(b => [...b, { from: "jenny", text }]);
          if (text === JENNY_MESSAGES[JENNY_MESSAGES.length - 1].text) setPhase("waiting");
        }, 900);
      }, delay);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bubbles, typing]);

  const handleSend = () => {
    if (!userInput.trim() || phase !== "waiting") return;
    const msg = userInput.trim();
    setUserInput("");
    setPhase("responded");
    setBubbles(b => [...b, { from: "user", text: msg }]);

    // Jenny responds
    RESPONSES.default.forEach((text, i) => {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setBubbles(b => [...b, { from: "jenny", text }]);
          if (i === RESPONSES.default.length - 1) setPhase("done");
        }, 900);
      }, 1200 + i * 2200);
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold">AI</div>
          <span className="font-semibold text-white">EPIC AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to={routes.PricingRoute.build()} className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <Link to={routes.LoginRoute.build()} className="text-sm text-zinc-400 hover:text-white transition-colors">Sign in</Link>
          <Link to={routes.SignupRoute.build()} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero — chat interface */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Phone mockup wrapper */}
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 bg-indigo-600/20 blur-3xl rounded-3xl" />

            {/* Chat window */}
            <div className="relative bg-[#111118] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

              {/* WhatsApp-style header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a24] border-b border-white/5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-sm font-bold">J</div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1a1a24]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Jenny · EPIC AI</p>
                  <p className="text-[11px] text-green-400">online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="h-72 overflow-y-auto p-4 space-y-2 flex flex-col">
                {bubbles.map((b, i) => (
                  <div key={i} className={`flex ${b.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                      b.from === "jenny"
                        ? "bg-[#1e1e2e] text-zinc-100 rounded-tl-sm"
                        : "bg-indigo-600 text-white rounded-tr-sm"
                    }`}>
                      {b.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-[#1e1e2e] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-white/5 bg-[#0f0f18]">
                {phase === "done" ? (
                  <Link
                    to={routes.SignupRoute.build()}
                    className="block w-full text-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    Get my AI receptionist →
                  </Link>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder={phase === "waiting" ? "Type your answer..." : ""}
                      disabled={phase !== "waiting"}
                      className="flex-1 bg-[#1a1a28] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-indigo-500/50 disabled:opacity-40"
                    />
                    <button
                      type="submit"
                      disabled={phase !== "waiting" || !userInput.trim()}
                      className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4 text-white rotate-90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Tagline below chat */}
          <div className="text-center mt-8 space-y-2">
            <h1 className="text-2xl font-bold text-white">Your AI receptionist, on WhatsApp</h1>
            <p className="text-zinc-500 text-sm">Set up in 5 minutes. No code. No hiring. $29/mo.</p>
          </div>
        </div>
      </div>

      {/* Social proof strip */}
      <div className="border-t border-white/5 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { n: "24/7", label: "Always on" },
            { n: "< 3s", label: "Response time" },
            { n: "5 min", label: "Setup time" },
            { n: "$0", label: "To start" },
          ].map(({ n, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-white">{n}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-white/5 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-2">Everything your receptionist does. Automatically.</h2>
          <p className="text-center text-zinc-500 text-sm mb-10">On WhatsApp. On calls. Around the clock.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: "💬", title: "Answers messages", desc: "Replies to every WhatsApp message instantly, in your voice." },
              { emoji: "📞", title: "Handles calls", desc: "Picks up every call, takes messages, routes urgent ones to you." },
              { emoji: "📅", title: "Books appointments", desc: "Schedules meetings and sends reminders automatically." },
              { emoji: "🌙", title: "Works nights & weekends", desc: "No overtime, no sick days. Always available." },
              { emoji: "🧠", title: "Knows your business", desc: "Trained on your products, prices, FAQs, and policies." },
              { emoji: "💳", title: "Collects payments", desc: "Sends invoices and payment links right in the chat." },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-[#111118] border border-white/5 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
                <div className="text-2xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing preview */}
      <div className="border-t border-white/5 py-16 px-4 bg-[#0d0d14]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Simple pricing</h2>
          <p className="text-zinc-500 text-sm mb-10">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", desc: "Try it out", features: ["1 AI agent", "50 messages/mo", "Business hours only", "Talk to Jenny"], cta: "Start free", highlight: false },
              { name: "Pro", price: "$29", desc: "/month", features: ["1 AI agent", "Unlimited messages", "24/7 availability", "PSTN calling included", "Custom voice & name"], cta: "Get Pro", highlight: true },
              { name: "Business", price: "$79", desc: "/month", features: ["3 AI agents", "Unlimited everything", "Priority support", "White-label ready", "API access"], cta: "Get Business", highlight: false },
            ].map(({ name, price, desc, features, cta, highlight }) => (
              <div key={name} className={`rounded-xl p-6 border ${highlight ? "bg-indigo-600/10 border-indigo-500/40" : "bg-[#111118] border-white/5"}`}>
                <p className="text-sm text-zinc-400 mb-1">{name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{price}</span>
                  <span className="text-zinc-500 text-sm mb-1">{desc}</span>
                </div>
                <ul className="space-y-2 my-5">
                  {features.map(f => (
                    <li key={f} className="text-xs text-zinc-400 flex items-center gap-2">
                      <span className="text-indigo-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={routes.SignupRoute.build()}
                  className={`block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${highlight ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-white/5 hover:bg-white/10 text-zinc-300"}`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="border-t border-white/5 py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">Ready to hire your AI receptionist?</h2>
        <p className="text-zinc-500 mb-8 text-sm">Set up in 5 minutes. First month free. Cancel anytime.</p>
        <Link
          to={routes.SignupRoute.build()}
          className="inline-block bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/20"
        >
          Get Started Free →
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-zinc-600">
        <p>© 2026 EPIC Communications Inc · <a href="mailto:hello@epic.dm" className="hover:text-zinc-400">hello@epic.dm</a></p>
      </footer>

    </div>
  );
}
