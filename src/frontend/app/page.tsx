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

// ── App preview mockup ────────────────────────────────────────────────────────
function AppPreview({ isDark }: { isDark: boolean }) {
  const bg = isDark ? '#0F0F14' : '#FFFFFF'
  const sidebar = isDark ? '#0A0A0E' : '#F8F9FA'
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const t1 = isDark ? '#F1F0F0' : '#1a1a1a'
  const t2 = isDark ? '#6B7280' : '#9CA3AF'
  const active = isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)'

  const notes = [
    { icon: '🚀', title: 'Sprint Planning · Q3', preview: 'Ship note-service, monitoring…', color: '#8B5CF6', time: '2m ago' },
    { icon: '📋', title: 'Incident Runbook #12', preview: 'kubectl rollout undo deploy…', color: '#EF4444', time: '1h ago' },
    { icon: '🏗️', title: 'AWS Architecture', preview: 'EKS, RDS, CloudFront…', color: '#06B6D4', time: 'yesterday' },
    { icon: '💡', title: 'Feature Roadmap', preview: 'Real-time sync, mobile app…', color: '#F97316', time: 'Jun 1' },
  ]

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: `1px solid ${border}` }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ background: isDark ? '#0A0A0E' : '#F0F0F0', borderColor: border }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono" style={{ background: isDark ? '#1a1a20' : '#E8E8E8', color: t2 }}>
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          localhost:3000/dashboard
        </div>
      </div>
      <div className="flex" style={{ height: 320, background: bg }}>
        {/* Sidebar */}
        <div className="w-52 shrink-0 border-r" style={{ background: sidebar, borderColor: border }}>
          <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: border }}>
            <Logo size={18} /><span className="font-bold text-xs" style={{ color: t1 }}>CloudNotes</span>
          </div>
          <div className="px-2 py-2">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-white text-center" style={{ background: AURORA }}>
              <span className="mx-auto">+ New Note</span>
            </div>
          </div>
          <div className="px-1.5 space-y-0.5">
            {notes.map((n, i) => (
              <div key={n.title} className="px-2 py-2 rounded-lg" style={{ background: i === 0 ? active : 'transparent', border: i === 0 ? `1px solid ${n.color}25` : '1px solid transparent' }}>
                <div className="flex items-center gap-1.5"><span className="text-sm">{n.icon}</span><span className="text-[11px] font-semibold truncate" style={{ color: t1 }}>{n.title}</span></div>
                <p className="text-[10px] truncate mt-0.5 ml-5" style={{ color: t2 }}>{n.preview}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-0.5 px-3 py-1.5 border-b" style={{ background: isDark ? '#111116' : '#F9F9F9', borderColor: border }}>
            {['¶','H1','B','I','U','•','</>','"','─','🖼','▶','⊞','⬡'].map((t, i) => (
              <span key={i} className="px-1 py-0.5 rounded text-[10px] font-mono" style={{ color: t2 }}>{t}</span>
            ))}
          </div>
          <div className="h-12 shrink-0" style={{ background: 'linear-gradient(135deg,#1e1b4b,#07050A)' }}>
            <div className="flex items-end h-full pb-1.5 px-6"><span className="text-xl">🚀</span></div>
          </div>
          <div className="flex-1 px-6 py-3 overflow-hidden">
            <div className="text-base font-black mb-0.5" style={{ color: t1 }}>Sprint Planning · Q3</div>
            <div className="text-[10px] mb-2" style={{ color: t2 }}>Tuesday, June 3, 2026</div>
            <div className="space-y-1 text-xs" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              <p className="font-bold text-sm" style={{ color: t1 }}>Goals for this sprint</p>
              <p>✅ Ship auth service to staging</p>
              <p>🔲 Add Go note-service endpoints</p>
              <p>🔲 Wire Prometheus → Grafana</p>
              <div className="rounded px-2 py-1.5 mt-1 font-mono text-[10px]" style={{ background: isDark ? '#0d1117' : '#F6F8FA', color: '#58A6FF' }}>
                kubectl apply -f k8s/note-service/
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-1.5 border-t text-[10px]" style={{ borderColor: border, color: t2 }}>
            <span>127 words</span><span className="ml-auto text-emerald-500">✓ Saved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AWS Architecture diagram (as a note mockup) ───────────────────────────────
function ArchNotePreview({ isDark }: { isDark: boolean }) {
  const bg = isDark ? '#0F0F14' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const t2 = isDark ? '#6B7280' : '#9CA3AF'

  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: `1px solid ${border}`, background: bg }}>
      {/* Note toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b" style={{ background: isDark ? '#111116' : '#F9F9F9', borderColor: border }}>
        {['¶','H1','B','I','─','🖼','▶','⊞','⬡'].map((t, i) => (
          <span key={i} className="px-1 py-0.5 text-[10px] font-mono" style={{ color: t2 }}>{t}</span>
        ))}
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded text-violet-400 border border-violet-800/50 font-semibold">⊞ Embed Diagram</span>
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🏗️</span>
          <span className="font-black text-sm" style={{ color: isDark ? '#F1F0F0' : '#1a1a1a' }}>CloudNotes — AWS Architecture</span>
        </div>
        <p className="text-[10px] mb-4 ml-7" style={{ color: t2 }}>Tuesday, June 3, 2026 · embedded from Excalidraw</p>

        {/* Embedded diagram area */}
        <div className="rounded-xl border p-4 relative overflow-hidden" style={{ borderColor: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.15)', background: isDark ? 'rgba(139,92,246,0.04)' : 'rgba(139,92,246,0.02)' }}>

          {/* Excalidraw badge */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: isDark ? '#1a1025' : '#f0eaff', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            Excalidraw
          </div>

          {/* Mini AWS diagram */}
          <div className="text-[10px] font-mono space-y-1" style={{ color: isDark ? '#6B7280' : '#9CA3AF', lineHeight: 1.8 }}>
            <div className="flex items-center gap-2">
              <span style={{ color: '#60A5FA' }}>🌐 Internet</span>
              <span>→</span>
              <span style={{ color: '#F59E0B' }}>☁️ CloudFront</span>
              <span>→</span>
              <span style={{ color: '#10B981' }}>⚖️ ALB</span>
            </div>
            <div className="ml-4 border-l-2 pl-3 py-1 space-y-1" style={{ borderColor: isDark ? '#374151' : '#D1D5DB' }}>
              <div className="flex items-center gap-1.5 font-semibold text-[10px]" style={{ color: '#F97316' }}>📦 EKS Cluster (us-east-1)</div>
              <div className="flex gap-1.5 flex-wrap">
                {['🐍 auth:8000','🐹 notes:8001','☕ users:8002','🟢 analytics:8003'].map(s => (
                  <span key={s} className="px-2 py-0.5 rounded text-[9px]" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, color: isDark ? '#D1D5DB' : '#374151' }}>{s}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span>↓</span>
              <span style={{ color: '#F59E0B' }}>🐘 RDS PostgreSQL</span>
              <span className="opacity-50">·</span>
              <span style={{ color: '#EC4899' }}>🪣 S3 Backup</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span style={{ color: '#8B5CF6' }}>📊 Prometheus + Grafana</span>
              <span className="opacity-50">·</span>
              <span style={{ color: '#10B981' }}>🚀 ArgoCD GitOps</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] mt-2" style={{ color: t2 }}>
          🔗 <a className="underline" style={{ color: '#8B5CF6' }}>Open in Excalidraw ↗</a>
          <span className="mx-2">·</span>
          Updated 2h ago
        </p>
      </div>
    </div>
  )
}

const STACK = ['Python','FastAPI','Go','Gin','Java','Spring Boot','Node.js','Express','Next.js 16','TypeScript','TipTap','Kubernetes','ArgoCD','Terraform','Prometheus','Loki','PostgreSQL','Docker','Helm','GitHub Actions','Excalidraw','Miro']

const FEATURES = [
  { icon: '✍️', title: 'Full rich text',       desc: 'Bold, italic, headings H1–H3, code blocks, tables, lists, blockquotes, highlights, links.' },
  { icon: '🖼️', title: 'Media anywhere',        desc: 'Drag-and-drop images, YouTube / Vimeo embeds, video file upload. Captions included.' },
  { icon: '⬡',  title: 'Embed diagrams',        desc: 'Paste Excalidraw, Miro, Lucidchart, FigJam, or draw.io share URLs — live diagrams inside your notes.' },
  { icon: '📤', title: 'Export & backup',       desc: 'Download notes as Markdown, HTML, or JSON. Full backup. Restore from file.' },
  { icon: '🌗', title: 'Per-note themes',       desc: 'App-wide dark/light mode. Override per note independently — each note has its own theme.' },
  { icon: '📡', title: '/v1/health-status',     desc: 'All four services expose uptime, user count, and endpoint list. Health UI at /health.' },
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
      <div className="pointer-events-none fixed top-0 inset-x-0" style={{ height: '55vh', background: isDark ? 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(139,92,246,0.13) 0%, rgba(236,72,153,0.06) 45%, transparent 70%)' : 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
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

      {/* ── Hero — split: headline left, editor right ─────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pt-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left: headline + CTAs */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full text-xs font-semibold border" style={{ background: 'rgba(139,92,246,0.08)', borderColor: 'rgba(139,92,246,0.2)', color: '#A78BFA' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Open source · 4 microservices · Kubernetes-native
            </div>

            <h1 className="font-black tracking-tighter leading-none mb-6" style={{ fontSize: 'clamp(3.2rem,8vw,7rem)', lineHeight: 0.95, color: text }}>
              WRITE.<br />
              <span style={AT}>STORE.</span><br />
              OWN IT.
            </h1>

            <p className="text-base leading-relaxed mb-8 max-w-sm" style={{ color: muted }}>
              A cloud-native note-taking platform. Rich text, diagrams, images, videos, code — backed by Python, Go, Java, and Node.js microservices on Kubernetes.
            </p>

            <div className="flex gap-3 flex-wrap">
              <Link href="/register" className="font-bold px-7 py-3.5 rounded-2xl text-white text-sm" style={{ background: AURORA, boxShadow: isDark ? '0 0 40px rgba(139,92,246,0.35)' : '0 4px 20px rgba(139,92,246,0.2)' }}>
                Start writing free →
              </Link>
              <Link href="/login" className="font-semibold px-7 py-3.5 rounded-2xl text-sm border" style={{ color: muted, borderColor: bdr, background: surf }}>
                Sign in
              </Link>
            </div>
          </div>

          {/* Right: live editor demo */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1" style={{ background: isDark ? '#1F2937' : '#E5E7EB' }} />
              <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: muted }}>Live editor</span>
              <div className="h-px flex-1" style={{ background: isDark ? '#1F2937' : '#E5E7EB' }} />
            </div>
            <TypingDemo />
          </div>
        </div>
      </section>

      {/* ── App preview ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#EC4899' }}>what it looks like</p>
        <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-8" style={{ color: text }}>The actual app.</h2>
        <AppPreview isDark={isDark} />
        <p className="text-xs mt-3 text-center" style={{ color: muted }}>Auto-save · Rich text · Dark/light per note · Drag-and-drop media · Excalidraw / Miro embeds</p>
      </section>

      {/* ── Diagram integration ──────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left: copy */}
          <div>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#10B981' }}>architecture diagrams</p>
            <h2 className="font-black text-3xl sm:text-4xl tracking-tight mb-4" style={{ color: text }}>
              Draw your infra.<br /><span style={AT}>Live in your notes.</span>
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: muted }}>
              Embed live Excalidraw boards, Miro diagrams, or Lucidchart architecture maps directly inside any note. Your AWS infra diagram stays next to the runbook that depends on it.
            </p>

            {/* Integration badges */}
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: muted }}>Works with</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { name: 'Excalidraw', color: '#8B5CF6', icon: '✏️' },
                { name: 'Miro',       color: '#F59E0B', icon: '🟡' },
                { name: 'Lucidchart', color: '#EF4444', icon: '🔴' },
                { name: 'FigJam',     color: '#EC4899', icon: '🎨' },
                { name: 'draw.io',    color: '#06B6D4', icon: '🔷' },
              ].map(t => (
                <div key={t.name} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border" style={{ background: isDark ? surf : 'rgba(0,0,0,0.02)', borderColor: bdr, color: text }}>
                  <span>{t.icon}</span>
                  {t.name}
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
              <span className="text-lg shrink-0">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: muted }}>
                In the editor toolbar, click <span className="font-bold" style={{ color: '#A78BFA' }}>⊞ Embed Diagram</span> and paste any share URL from Excalidraw, Miro, or Lucidchart. It embeds live inside your note.
              </p>
            </div>
          </div>

          {/* Right: diagram note preview */}
          <ArchNotePreview isDark={isDark} />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <h2 className="font-black text-3xl tracking-tight mb-8" style={{ color: text }}>Every feature earns its place.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl p-6 border transition-all cursor-default"
              style={{ background: surf, borderColor: bdr }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor='rgba(139,92,246,0.4)'; el.style.background='rgba(139,92,246,0.06)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor=bdr; el.style.background=surf }}>
              <p className="text-3xl mb-4">{f.icon}</p>
              <p className="font-bold text-sm mb-1.5" style={{ color: text }}>{f.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-14 pb-20">
        <p className="text-[10px] uppercase tracking-widest mb-6" style={{ color: muted }}>The stack</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon:'🐍', lang:'Python 3.12', fw:'FastAPI',     svc:'Auth',      port:':8000', c:'#8B5CF6' },
            { icon:'🐹', lang:'Go 1.25',     fw:'Gin',         svc:'Notes',     port:':8001', c:'#06B6D4' },
            { icon:'☕', lang:'Java 17',      fw:'Spring Boot', svc:'Users',     port:':8002', c:'#F59E0B' },
            { icon:'🟢', lang:'Node.js 20',  fw:'Express',     svc:'Analytics', port:':8003', c:'#10B981' },
          ].map(s => (
            <div key={s.svc} className="rounded-2xl p-5 border transition-all cursor-default"
              style={{ background: surf, borderColor: bdr }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = s.c+'50' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = bdr }}>
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="font-bold text-sm mb-0.5" style={{ color: text }}>{s.svc}</p>
              <p className="text-xs" style={{ color: s.c }}>{s.lang}</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>{s.fw}</p>
              <p className="text-xs font-mono mt-2" style={{ color: isDark ? '#374151' : '#E5E7EB' }}>{s.port}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Marquee — visible on both themes ────────────────────────────── */}
      <div className="relative z-10 overflow-hidden border-y py-3.5" style={{ borderColor: bdr, background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)' }}>
        <div style={{ display:'flex', gap:'3rem', width:'max-content', animation:'marquee 32s linear infinite' }}>
          {[...STACK, ...STACK].map((t, i) => (
            <span key={i} className="text-xs font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ color: isDark ? '#6B7280' : '#374151' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-6 sm:mx-14 my-16 rounded-3xl overflow-hidden"
        style={{ background: isDark ? 'rgba(139,92,246,0.07)' : 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="relative px-10 sm:px-16 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(139,92,246,0.1) 0%, transparent 60%)' }} />
          <div className="relative">
            <h2 className="font-black tracking-tight leading-none mb-3" style={{ fontSize: 'clamp(1.8rem,4vw,3.5rem)', color: text }}>
              Your second brain<br /><span style={AT}>deserves good infra.</span>
            </h2>
            <p className="text-sm" style={{ color: muted }}>Free forever · No credit card · Open source · MIT</p>
          </div>
          <Link href="/register" className="relative shrink-0 font-bold px-10 py-4 rounded-2xl text-white text-base transition"
            style={{ background: AURORA, boxShadow: '0 0 50px rgba(139,92,246,0.35)' }}>
            Start writing free →
          </Link>
        </div>
      </section>

      <footer className="relative z-10 px-6 sm:px-14 pb-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5"><Logo size={22} /><span className="font-bold text-sm" style={{ color: muted }}>CloudNotes</span></div>
        <span className="text-xs" style={{ color: isDark ? '#374151' : '#D1D5DB' }}>MIT · 2026</span>
      </footer>

      <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  )
}
