'use client'

import Link from 'next/link'
import { useState } from 'react'
import TypingDemo from './components/TypingDemo'

const AURORA = 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)'
const AT = { background: AURORA, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const, backgroundClip: 'text' as const }

function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="url(#ag)" />
      <rect x="8" y="7" width="14" height="18" rx="2" fill="rgba(255,255,255,0.2)" />
      <path d="M22 7 L22 13 L28 13 Z" fill="rgba(0,0,0,0.2)" />
      <rect x="10.5" y="14" width="9" height="1.5" rx="0.75" fill="white" opacity="0.95" />
      <rect x="10.5" y="18" width="7" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      <rect x="10.5" y="22" width="5" height="1.5" rx="0.75" fill="white" opacity="0.45" />
      <circle cx="25" cy="25" r="7" fill="rgba(7,5,10,0.9)" />
      <path d="M20.5 26 Q20 24 22 24 Q22.5 22.5 24 23 Q25.5 22 26.5 23.5 Q28 23.5 28 25 Q28.5 26.5 27 26.5 Z" fill="url(#ag)" />
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" /><stop offset="50%" stopColor="#EC4899" /><stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── DevOps humour cards ───────────────────────────────────────────────────────
const DEVOPS_CARDS = [
  {
    badge: '🚨 incident response',
    color: '#EF4444',
    quote: 'Write your runbooks before you need them. Your 3am self will cry tears of gratitude.',
    sub: '— Every SRE who learned this the hard way',
  },
  {
    badge: '📟 on-call wisdom',
    color: '#F97316',
    quote: "The best alert is the one that never fires. The second best is the one where the runbook already exists.",
    sub: '— Postmortem #47, page 1',
  },
  {
    badge: '🐳 kubernetes native',
    color: '#06B6D4',
    quote: "Your notes are load-balanced, horizontally scaled, and live in a Deployment. Unlike that one service you promised would 'scale fine'.",
    sub: '— kubectl get notes -o wide',
  },
  {
    badge: '🔄 gitops approved',
    color: '#10B981',
    quote: "Notes as code. Everything is code. Your grocery list should have a PR review. This is the way.",
    sub: '— ArgoCD sync status: Healthy',
  },
  {
    badge: '🔍 observability',
    color: '#8B5CF6',
    quote: "We have /metrics, /v1/health-status, structured logs, and distributed tracing. Your thoughts finally have SLOs.",
    sub: '— Prometheus alert: ideas_count_low',
  },
  {
    badge: '😮‍💨 deployment relief',
    color: '#EC4899',
    quote: "Deployed on a Friday? CloudNotes has zero-downtime rolling updates. Your weekend is safe. Your sanity is not our responsibility.",
    sub: '— DevOps Engineer, 4:57pm Friday',
  },
]

// ── App preview mockup ────────────────────────────────────────────────────────
function AppPreview({ isDark }: { isDark: boolean }) {
  const bg = isDark ? '#0F0F14' : '#FFFFFF'
  const sidebar = isDark ? '#0A0A0E' : '#F8F9FA'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const text1 = isDark ? '#F1F0F0' : '#1a1a1a'
  const text2 = isDark ? '#6B7280' : '#9CA3AF'
  const active = isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)'

  const notes = [
    { icon: '🚀', title: 'Sprint Planning · Q3', preview: 'Ship note-service, add monitoring…', color: '#8B5CF6', time: '2m ago' },
    { icon: '📋', title: 'Incident Runbook #12', preview: 'kubectl rollout undo deploy/api…', color: '#EF4444', time: '1h ago' },
    { icon: '🏗️', title: 'Architecture Decision', preview: 'Microservices over monolith because…', color: '#06B6D4', time: 'yesterday' },
    { icon: '💡', title: 'Feature Ideas', preview: 'Real-time sync via WebSockets…', color: '#F97316', time: 'Jun 1' },
  ]

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ border: `1px solid ${border}`, maxWidth: 780 }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ background: isDark ? '#0A0A0E' : '#F0F0F0', borderColor: border }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
        </div>
        <div className="flex-1 mx-4">
          <div className="rounded-md px-3 py-1 text-xs font-mono flex items-center gap-2" style={{ background: isDark ? '#1a1a20' : '#E8E8E8', color: text2 }}>
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            localhost:3000/dashboard
          </div>
        </div>
      </div>

      {/* App layout */}
      <div className="flex" style={{ height: 340, background: bg }}>
        {/* Sidebar */}
        <div className="w-56 shrink-0 flex flex-col border-r" style={{ background: sidebar, borderColor: border }}>
          {/* Logo row */}
          <div className="flex items-center gap-2 px-3 py-3 border-b" style={{ borderColor: border }}>
            <Logo size={20} />
            <span className="font-bold text-xs" style={{ color: text1 }}>CloudNotes</span>
          </div>
          {/* New note btn */}
          <div className="px-2 py-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: AURORA }}>
              <span>+</span> New Note
            </div>
          </div>
          {/* Note list */}
          <div className="flex-1 px-1.5 space-y-0.5 overflow-hidden">
            {notes.map((n, i) => (
              <div key={n.title} className="px-2 py-2 rounded-lg" style={{ background: i === 0 ? active : 'transparent', border: i === 0 ? `1px solid ${n.color}30` : '1px solid transparent' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{n.icon}</span>
                  <span className="text-xs font-semibold truncate" style={{ color: text1 }}>{n.title}</span>
                </div>
                <p className="text-[10px] truncate mt-0.5 ml-5" style={{ color: text2 }}>{n.preview}</p>
                <p className="text-[9px] ml-5 mt-0.5" style={{ color: isDark ? '#374151' : '#D1D5DB' }}>{n.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-0.5 px-3 py-1.5 border-b" style={{ background: isDark ? '#111116' : '#F9F9F9', borderColor: border }}>
            {['¶','H1','H2','B','I','U','S','`','•','1.','</>','"','─','🖼','▶','⊞'].map((t, i) => (
              <span key={i} className="px-1.5 py-1 rounded text-[10px] font-mono" style={{ color: text2 }}>{t}</span>
            ))}
          </div>
          {/* Cover */}
          <div className="h-16 shrink-0 relative" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #07050A 100%)' }}>
            <div className="absolute bottom-2 left-6 text-2xl">🚀</div>
          </div>
          {/* Content */}
          <div className="flex-1 px-8 py-4 overflow-hidden">
            <div className="text-xl font-black mb-1" style={{ color: text1 }}>Sprint Planning · Q3</div>
            <div className="text-[10px] mb-3" style={{ color: text2 }}>Tuesday, June 3, 2026</div>
            <div className="space-y-1.5 text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              <p className="font-bold text-sm" style={{ color: text1 }}>Goals for this sprint</p>
              <p>✅ Ship auth service to staging</p>
              <p>🔲 Add Go note-service endpoints</p>
              <p>🔲 Wire Prometheus → Grafana</p>
              <div className="rounded-md px-3 py-2 mt-2 font-mono text-[10px]" style={{ background: isDark ? '#0d1117' : '#F6F8FA', color: '#58A6FF' }}>
                kubectl apply -f k8s/note-service/
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex items-center gap-3 px-8 py-2 border-t text-[10px]" style={{ borderColor: border, color: text2 }}>
            <span>127 words</span><span>843 chars</span>
            <span className="ml-auto flex items-center gap-1 text-emerald-500">✓ Saved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Architecture diagram ──────────────────────────────────────────────────────
function ArchDiagram({ isDark }: { isDark: boolean }) {
  const box = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const bdr = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  const t1  = isDark ? '#F1F0F0' : '#1a1a1a'
  const t2  = isDark ? '#6B7280' : '#9CA3AF'
  const line = isDark ? '#1F2937' : '#E5E7EB'

  const services = [
    { icon: '🐍', name: 'auth-service', lang: 'Python / FastAPI', port: ':8000', color: '#8B5CF6' },
    { icon: '🐹', name: 'note-service', lang: 'Go / Gin',         port: ':8001', color: '#06B6D4' },
    { icon: '☕', name: 'user-service', lang: 'Java / Spring',    port: ':8002', color: '#F59E0B' },
    { icon: '🟢', name: 'analytics',   lang: 'Node.js / Express', port: ':8003', color: '#10B981' },
  ]

  return (
    <div className="rounded-2xl p-8 border" style={{ background: box, borderColor: bdr }}>
      {/* User layer */}
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold" style={{ background: 'rgba(139,92,246,0.1)', borderColor: 'rgba(139,92,246,0.3)', color: '#A78BFA' }}>
          🌐 Browser / User
        </div>
      </div>

      {/* Arrow down */}
      <div className="flex justify-center mb-1"><div className="w-px h-5" style={{ background: line }} /></div>
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold" style={{ background: 'rgba(236,72,153,0.1)', borderColor: 'rgba(236,72,153,0.3)', color: '#F9A8D4' }}>
          ⚡ Next.js 16 Frontend · :3000
        </div>
      </div>

      {/* Arrows to services */}
      <div className="flex justify-center mb-1">
        <svg width="400" height="24" viewBox="0 0 400 24">
          <line x1="200" y1="0" x2="200" y2="24" stroke={line} strokeWidth="1" />
          <line x1="50"  y1="24" x2="350" y2="24" stroke={line} strokeWidth="1" />
          <line x1="50"  y1="24" x2="50"  y2="32" stroke={line} strokeWidth="1" />
          <line x1="150" y1="24" x2="150" y2="32" stroke={line} strokeWidth="1" />
          <line x1="250" y1="24" x2="250" y2="32" stroke={line} strokeWidth="1" />
          <line x1="350" y1="24" x2="350" y2="32" stroke={line} strokeWidth="1" />
        </svg>
      </div>

      {/* Services row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {services.map(s => (
          <div key={s.name} className="rounded-xl p-3 text-center border" style={{ borderColor: s.color + '30', background: s.color + '08' }}>
            <p className="text-lg mb-1">{s.icon}</p>
            <p className="text-[10px] font-bold mb-0.5" style={{ color: t1 }}>{s.name}</p>
            <p className="text-[9px]" style={{ color: s.color }}>{s.lang}</p>
            <p className="text-[9px] font-mono mt-1" style={{ color: t2 }}>{s.port}</p>
          </div>
        ))}
      </div>

      {/* Arrow down to DB */}
      <div className="flex justify-center mb-1"><div className="w-px h-4" style={{ background: line }} /></div>
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold" style={{ background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.3)', color: '#FDBA74' }}>
          🐘 PostgreSQL  ·  local dev / AWS RDS in prod
        </div>
      </div>

      {/* Side concerns */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t" style={{ borderColor: bdr }}>
        {[
          { icon: '📊', label: 'Prometheus + Grafana', sub: '/metrics on every service', color: '#F59E0B' },
          { icon: '🚀', label: 'Kubernetes / EKS',     sub: 'Helm + ArgoCD GitOps',      color: '#8B5CF6' },
          { icon: '🔧', label: 'Terraform',            sub: 'VPC · EKS · RDS · Secrets', color: '#10B981' },
        ].map(c => (
          <div key={c.label} className="flex items-center gap-2.5 p-2.5 rounded-xl border" style={{ borderColor: c.color + '25', background: c.color + '06' }}>
            <span className="text-lg shrink-0">{c.icon}</span>
            <div>
              <p className="text-[10px] font-bold" style={{ color: t1 }}>{c.label}</p>
              <p className="text-[9px]" style={{ color: t2 }}>{c.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const STACK = ['Python','FastAPI','Go','Gin','Java','Spring Boot','Node.js','Express','Next.js 16','TypeScript','TipTap','Kubernetes','ArgoCD','Terraform','Prometheus','Loki','PostgreSQL','Docker','Helm','GitHub Actions']

const FEATURES = [
  { icon: '✍️', title: 'Full rich text',         desc: 'Bold, italic, underline, headings H1–H3, code blocks, tables, lists, blockquotes, highlights, links.' },
  { icon: '🖼️', title: 'Media anywhere',          desc: 'Drag-and-drop images, YouTube / Vimeo embeds, video file upload. Captions included.' },
  { icon: '📤', title: 'Export & backup',         desc: 'Download notes as Markdown, HTML, or JSON. Full backup. Restore from file.' },
  { icon: '🌗', title: 'Per-note themes',         desc: 'App-wide dark/light. Override individually per note — each note has its own theme.' },
  { icon: '🔒', title: 'Auth service',            desc: 'Register + login via Python FastAPI. Token-based sessions. Prometheus metrics at /metrics.' },
  { icon: '📡', title: '/v1/health-status',       desc: 'Uptime, registered users, endpoint list — all four services expose this endpoint. Health page in the UI.' },
]

export default function LandingPage() {
  const [isDark, setIsDark] = useState(true)

  const bg    = isDark ? '#07050A' : '#FAFAF9'
  const text  = isDark ? '#F1F0F0' : '#1a1a1a'
  const muted = isDark ? '#4B5563' : '#9CA3AF'
  const surf  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
  const bdr   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{ background: bg, color: text, fontFamily: 'system-ui,-apple-system,sans-serif', minHeight: '100vh', transition: 'background .3s,color .3s' }}>

      {/* Aurora ambient */}
      <div className="pointer-events-none fixed top-0 inset-x-0" style={{ height: '60vh', background: isDark ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.14) 0%, rgba(236,72,153,0.07) 40%, transparent 70%)' : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 sm:px-14 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <span className="font-black text-2xl tracking-tight" style={{ color: text }}>CloudNotes</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsDark(v => !v)} className="p-2 rounded-xl transition mr-1" style={{ background: surf, border: `1px solid ${bdr}` }} title="Toggle theme">
            {isDark
              ? <svg className="w-4 h-4" style={{ color: muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-4 h-4" style={{ color: muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>
          <Link href="/login" className="text-sm px-4 py-2 rounded-xl transition" style={{ color: muted }}>Sign in</Link>
          <Link href="/register" className="text-sm font-bold px-5 py-2.5 rounded-xl text-white" style={{ background: AURORA, boxShadow: isDark ? '0 0 24px rgba(139,92,246,0.3)' : 'none' }}>
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pt-8 pb-6">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Open source · 4 microservices · Kubernetes-native
        </div>

        {/* Headline */}
        <div className="mb-8">
          <h1 className="font-black tracking-tighter leading-none" style={{ fontSize: 'clamp(3.5rem,10vw,8rem)', lineHeight: 0.95, color: text }}>
            WRITE.<br />
            <span style={AT}>STORE.</span><br />
            OWN IT.
          </h1>
        </div>

        {/* ── Typing demo — ABOVE the CTAs ── */}
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1" style={{ background: isDark ? '#1F2937' : '#E5E7EB' }} />
            <span className="text-[11px] uppercase tracking-widest" style={{ color: muted }}>live editor</span>
            <div className="h-px flex-1" style={{ background: isDark ? '#1F2937' : '#E5E7EB' }} />
          </div>
          <TypingDemo />
        </div>

        {/* CTAs below demo */}
        <div className="flex flex-col sm:flex-row gap-4 items-start mb-12">
          <Link href="/register" className="font-bold px-8 py-4 rounded-2xl text-white text-sm" style={{ background: AURORA, boxShadow: isDark ? '0 0 40px rgba(139,92,246,0.35)' : '0 4px 20px rgba(139,92,246,0.2)' }}>
            Start writing free →
          </Link>
          <Link href="/login" className="font-semibold px-8 py-4 rounded-2xl text-sm border" style={{ color: muted, borderColor: bdr, background: surf }}>
            Sign in
          </Link>
          <div className="flex gap-6 sm:ml-auto items-center">
            {[{ n: '4', l: 'services' }, { n: '∞', l: 'notes' }, { n: '3', l: 'exports' }].map(s => (
              <div key={s.n} className="text-center">
                <p className="font-black text-2xl leading-none" style={AT}>{s.n}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: muted }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DevOps humour ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#8B5CF6' }}>for people who know what 3am feels like</span>
        </div>
        <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-8" style={{ color: text }}>
          Notes with <span style={AT}>DevOps energy.</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEVOPS_CARDS.map(c => (
            <div key={c.badge} className="rounded-2xl p-6 border relative overflow-hidden" style={{ background: surf, borderColor: bdr }}>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4"
                style={{ background: c.color + '15', border: `1px solid ${c.color}30`, color: c.color }}>
                {c.badge}
              </span>
              <p className="text-sm leading-relaxed mb-3" style={{ color: text }}>"{c.quote}"</p>
              <p className="text-xs italic" style={{ color: muted }}>{c.sub}</p>
              <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${c.color}12 0%, transparent 70%)` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── App preview ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#EC4899' }}>what it looks like</span>
        </div>
        <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-8" style={{ color: text }}>
          The actual app.
        </h2>
        <AppPreview isDark={isDark} />
        <p className="text-xs mt-3 text-center" style={{ color: muted }}>
          Real-time auto-save · Rich text editor · Dark/light per note · Drag-and-drop media
        </p>
      </section>

      {/* ── Architecture diagram ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: '#10B981' }}>how it's built</span>
        </div>
        <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-2" style={{ color: text }}>
          Architecture that <span style={AT}>doesn't page you at 3am.</span>
        </h2>
        <p className="text-sm mb-8" style={{ color: muted }}>
          Four isolated services. One database. Full observability. GitOps delivery. The kind of infra you wish your last job had.
        </p>
        <ArchDiagram isDark={isDark} />
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <h2 className="font-black text-3xl tracking-tight mb-8" style={{ color: text }}>Every feature earns its place.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-6 border transition-all cursor-default"
              style={{ background: surf, borderColor: bdr }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(139,92,246,0.4)'; el.style.background = 'rgba(139,92,246,0.06)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = bdr; el.style.background = surf }}>
              <p className="text-3xl mb-4">{f.icon}</p>
              <p className="font-bold text-sm mb-1.5" style={{ color: text }}>{f.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden border-y py-3" style={{ borderColor: bdr, background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
        <div style={{ display: 'flex', gap: '3rem', width: 'max-content', animation: 'marquee 30s linear infinite' }}>
          {[...STACK, ...STACK].map((t, i) => (
            <span key={i} className="text-[11px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: isDark ? '#1F2937' : '#E5E7EB' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-6 sm:mx-14 my-16 rounded-3xl overflow-hidden"
        style={{ background: isDark ? 'rgba(139,92,246,0.07)' : 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="relative px-10 sm:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(139,92,246,0.12) 0%, transparent 60%)' }} />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: '#8B5CF6' }}>deploy your ideas</p>
            <h2 className="font-black tracking-tight leading-none mb-3" style={{ fontSize: 'clamp(2rem,5vw,4rem)', color: text }}>
              Your second brain<br /><span style={AT}>deserves good infra.</span>
            </h2>
            <p className="text-sm" style={{ color: muted }}>Free forever · No credit card · Open source · MIT license</p>
          </div>
          <Link href="/register" className="relative shrink-0 font-bold px-10 py-4 rounded-2xl text-white text-lg" style={{ background: AURORA, boxShadow: '0 0 50px rgba(139,92,246,0.35)' }}>
            Start writing free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 sm:px-14 pb-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5"><Logo size={22} /><span className="font-bold text-sm" style={{ color: muted }}>CloudNotes</span></div>
        <span className="text-xs" style={{ color: isDark ? '#1F2937' : '#E5E7EB' }}>MIT · 2026</span>
      </footer>

      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  )
}
