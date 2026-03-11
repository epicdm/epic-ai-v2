import { useNavigate } from 'react-router-dom'

const TEMPLATES = [
  { slug: 'receptionist', emoji: '🏢', name: 'Receptionist', tagline: 'Never miss a customer again', desc: 'Answers inquiries, books appointments, shares hours & pricing' },
  { slug: 'sales', emoji: '💰', name: 'Sales Agent', tagline: 'Turn leads into customers, automatically', desc: 'Qualifies leads, follows up, sends pricing, closes deals' },
  { slug: 'collections', emoji: '📞', name: 'Collections Agent', tagline: 'Recover payments on autopilot', desc: 'Sends reminders, offers payment plans, escalates overdue accounts' },
  { slug: 'concierge', emoji: '🎯', name: 'Concierge', tagline: '5-star service, 24/7', desc: 'Handles reservations, answers guest questions, sends confirmations' },
  { slug: 'support', emoji: '🎧', name: 'Support Agent', tagline: 'Instant answers, happy customers', desc: 'Resolves tickets, answers product questions, escalates complex issues' },
  { slug: 'assistant', emoji: '🧑', name: 'Personal Assistant', tagline: 'Your life, organised', desc: 'Reminders, to-dos, bill tracking, daily digest — just for you' },
]

const TESTIMONIALS = [
  { name: 'Sandra M.', role: 'Airbnb Host, Dominica', text: 'My guests used to message me at 2am asking about wifi. Now Rio handles it. I sleep through the night again.' },
  { name: 'Marcus T.', role: 'Real Estate Agent', text: 'I was losing 17 leads a week because I couldn\'t follow up fast enough. Vera follows up in seconds. My conversion rate doubled.' },
  { name: 'Dr. Sarah P.', role: 'Clinic Owner', text: 'The phone used to ring 40 times a day while I was with patients. Alex now handles 90% of those calls. I\'m actually present with my patients.' },
]

export function LandingPage() {
  const navigate = useNavigate()

  function pickTemplate(slug: string) {
    localStorage.setItem('selectedTemplate', slug)
    navigate('/signup')
  }

  return (
    <div style={{ background: '#0b0f1a', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid #1f2937', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #6366f1, #25d366)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          EPIC AI
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
          <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #374151', borderRadius: '8px', color: '#d1d5db', padding: '8px 16px', cursor: 'pointer', fontSize: '14px' }}>Log in</button>
          <button onClick={() => navigate('/signup')} style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 60px', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#25d366', marginBottom: '24px' }}>
            🚀 The AI assistant that lives on WhatsApp
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
            Meet Jenny.<br />
            <span style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your AI, on WhatsApp.</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '36px', maxWidth: '480px' }}>
            She answers customers, books appointments, follows up on leads — 24/7. You just check in from your phone.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="https://wa.me/17672950333" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#25d366', color: '#fff', fontWeight: '700', fontSize: '16px', padding: '16px 28px', borderRadius: '12px', textDecoration: 'none' }}>
              💬 Try Jenny Free →
            </a>
            <button onClick={() => navigate('/signup')}
              style={{ background: 'transparent', border: '2px solid #374151', borderRadius: '12px', color: '#d1d5db', fontSize: '16px', fontWeight: '600', padding: '16px 28px', cursor: 'pointer' }}>
              Get Started →
            </button>
          </div>
          <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '16px' }}>No credit card required · Free forever plan · Live in 5 minutes</p>
        </div>

        {/* WA Mock */}
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#111827', borderRadius: '32px', padding: '16px', border: '8px solid #1f2937', maxWidth: '280px', boxShadow: '0 0 80px rgba(37,211,102,0.15)' }}>
            <div style={{ background: '#075e54', padding: '12px 16px', borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🏢</div>
              <div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>Alex — Receptionist</div>
                <div style={{ color: '#a7f3d0', fontSize: '11px' }}>online</div>
              </div>
            </div>
            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '0 0 16px 16px', minHeight: '280px' }}>
              {[
                { from: 'customer', text: 'Hi, what are your hours?' },
                { from: 'agent', text: "Hi Sarah! We're open Mon–Fri 9am–5pm, Sat 9am–1pm. Would you like to book an appointment? 😊" },
                { from: 'customer', text: 'Yes please! Tomorrow morning?' },
                { from: 'agent', text: "I have 10am available tomorrow. Can I get your name and what you're coming in for?" },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.from === 'agent' ? 'flex-start' : 'flex-end', marginBottom: '10px' }}>
                  <div style={{ background: m.from === 'agent' ? '#1f2937' : '#25d366', color: '#fff', borderRadius: m.from === 'agent' ? '12px 12px 12px 0' : '12px 12px 0 12px', padding: '8px 12px', fontSize: '12px', maxWidth: '80%', lineHeight: '1.4' }}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '11px', marginTop: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#25d366', animation: 'pulse 1.5s infinite' }} />
                Alex is typing...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: '#0d1117', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Up and running in 5 minutes</h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '56px' }}>No technical skills needed. No complex setup. Jenny just works.</p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { step: '1', emoji: '🎯', title: 'Pick your template', desc: 'Receptionist, Sales, Concierge, Support — or Personal Assistant for yourself.' },
              { step: '2', emoji: '📱', title: 'Connect WhatsApp', desc: 'Send one activation code. Your agent is live in seconds. No config, no APIs.' },
              { step: '3', emoji: '🚀', title: 'Go live', desc: 'Share your link. Customers message you. Jenny handles everything. You just watch.' },
            ].map(item => (
              <div key={item.step} style={{ flex: '1', minWidth: '200px', maxWidth: '280px', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '32px 24px', textAlign: 'left' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', marginBottom: '16px' }}>{item.step}</div>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{item.emoji}</div>
                <h3 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Picker */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Pick your AI agent</h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '48px' }}>One platform. Six templates. Every business covered.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {TEMPLATES.map(t => (
              <div
                key={t.slug}
                onClick={() => pickTemplate(t.slug)}
                style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '28px 24px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1f2937'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
              >
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{t.emoji}</div>
                <h3 style={{ fontWeight: '700', fontSize: '18px', marginBottom: '6px' }}>{t.name}</h3>
                <p style={{ color: '#6366f1', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>{t.tagline}</p>
                <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.5' }}>{t.desc}</p>
                <div style={{ marginTop: '20px', color: '#6366f1', fontSize: '13px', fontWeight: '600' }}>Choose this → </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive */}
      <section style={{ background: '#0d1117', padding: '80px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Why businesses are switching to EPIC AI</h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '48px' }}>We built what the big players won't — deep AI, not a template blaster.</p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { emoji: '💰', title: '$29/mo for what others charge $159', desc: 'Respond.io charges $159 for less. WATI starts at $49 with hard limits. We start free, go Pro at $29.' },
              { emoji: '🤖', title: 'AI that actually talks to your customers', desc: 'Competitors blast templates. Jenny has a real conversation, learns your business, and handles it without scripts.' },
              { emoji: '📞', title: 'Voice + Chat, one platform', desc: 'Nobody else offers AI voice calls on WhatsApp. Missed call → WhatsApp in 60 seconds. PSTN + browser calling included.' },
            ].map(item => (
              <div key={item.title} style={{ flex: '1', minWidth: '240px', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '28px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{item.emoji}</div>
                <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '32px' }}>No per-conversation fees. No message markups. Just your plan.</p>
        </div>
      </section>

      {/* Social Proof */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '48px' }}>What people are saying</h2>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ flex: '1', minWidth: '260px', maxWidth: '340px', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '28px 24px', textAlign: 'left' }}>
                <p style={{ color: '#d1d5db', fontSize: '15px', lineHeight: '1.7', marginBottom: '20px' }}>"{t.text}"</p>
                <div style={{ fontWeight: '700', fontSize: '14px' }}>{t.name}</div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: '#0d1117', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Simple pricing</h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '48px' }}>Start free. Upgrade when you're ready. No surprises.</p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              {
                name: 'Free', price: '$0', period: 'forever', cta: 'Start Free', highlight: false,
                features: ['1 AI agent', '50 messages/day', 'Live inbox (view)', 'WhatsApp activation', 'Business profile'],
              },
              {
                name: 'Pro', price: '$29', period: '/month', cta: 'Start Pro', highlight: true,
                features: ['3 AI agents', 'Unlimited messages', 'Full inbox + whisper/takeover', 'Owner WhatsApp alerts', 'Voice calls', 'Knowledge base (docs + URLs)', 'Campaigns (3 active)', 'Broadcasts (500/mo)'],
              },
              {
                name: 'Business', price: '$99', period: '/month', cta: 'Start Business', highlight: false,
                features: ['Unlimited agents', 'Dedicated WA number', 'Team member logins', 'Unlimited campaigns', 'Barge/whisper on calls', 'API access', 'White-label', 'Priority support'],
              },
            ].map(plan => (
              <div key={plan.name} style={{ flex: '1', minWidth: '240px', background: plan.highlight ? 'linear-gradient(135deg, #1a1040, #1e1b4b)' : '#111827', border: `2px solid ${plan.highlight ? '#6366f1' : '#1f2937'}`, borderRadius: '20px', padding: '32px 28px', textAlign: 'left', position: 'relative' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#6366f1', color: '#fff', borderRadius: '100px', padding: '4px 16px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>Most Popular</div>}
                <h3 style={{ fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>{plan.name}</h3>
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '40px', fontWeight: '800' }}>{plan.price}</span>
                  <span style={{ color: '#9ca3af', fontSize: '16px' }}>{plan.period}</span>
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  style={{ width: '100%', background: plan.highlight ? '#6366f1' : 'transparent', border: plan.highlight ? 'none' : '1px solid #374151', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '15px', padding: '14px', cursor: 'pointer', marginBottom: '24px' }}>
                  {plan.cta}
                </button>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: '8px', fontSize: '14px', color: '#d1d5db', marginBottom: '10px' }}>
                      <span style={{ color: '#25d366' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px' }}>Ready to put Jenny to work?</h2>
          <p style={{ color: '#9ca3af', fontSize: '18px', marginBottom: '36px' }}>Be one of the first businesses in the Caribbean to run on AI.</p>
          <a
            href="https://wa.me/17672950333"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#25d366', color: '#fff', fontWeight: '700', fontSize: '18px', padding: '18px 36px', borderRadius: '14px', textDecoration: 'none', marginBottom: '16px' }}>
            💬 Talk to Jenny on WhatsApp →
          </a>
          <p style={{ color: '#4b5563', fontSize: '14px' }}>Or <span onClick={() => navigate('/signup')} style={{ color: '#6366f1', cursor: 'pointer' }}>sign up</span> to build your own agent</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1f2937', padding: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        <div style={{ fontWeight: '800', fontSize: '18px', color: '#fff', marginBottom: '8px' }}>EPIC AI</div>
        <p>Powered by <a href="https://epic.dm" style={{ color: '#6366f1', textDecoration: 'none' }}>EPIC Communications Inc</a> · Dominica, Caribbean</p>
        <p style={{ marginTop: '8px' }}>© 2026 EPIC AI · Your AI, Your Rules</p>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }`}</style>
    </div>
  )
}
