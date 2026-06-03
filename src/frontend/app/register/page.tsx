'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="url(#regGrad)" />
      <rect x="8" y="7" width="14" height="18" rx="2" fill="rgba(255,255,255,0.2)" />
      <path d="M22 7 L22 13 L28 13 Z" fill="rgba(0,0,0,0.2)" />
      <rect x="10.5" y="14" width="9" height="1.5" rx="0.75" fill="white" opacity="0.95" />
      <rect x="10.5" y="18" width="7" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      <rect x="10.5" y="22" width="5" height="1.5" rx="0.75" fill="white" opacity="0.45" />
      <circle cx="25" cy="25" r="7" fill="rgba(7,5,10,0.85)" />
      <path d="M20.5 26 Q20 24 22 24 Q22.5 22.5 24 23 Q25.5 22 26.5 23.5 Q28 23.5 28 25 Q28.5 26.5 27 26.5 Z" fill="url(#regGrad)" />
      <defs>
        <linearGradient id="regGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Input({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6B7280' }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder} required
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-2xl px-4 py-3.5 text-sm transition-all focus:outline-none"
        style={{
          background: '#0F0B14',
          border: `1px solid ${focused ? 'rgba(236,72,153,0.6)' : 'rgba(255,255,255,0.07)'}`,
          color: '#F1F0F0',
          boxShadow: focused ? '0 0 0 3px rgba(236,72,153,0.1)' : 'none',
        }}
      />
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof typeof form) {
    return (v: string) => setForm(prev => ({ ...prev, [field]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', form.username)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#07050A' }}>

      {/* ── Left: Brand panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(135deg, #0A1018 0%, #130A1A 50%, #180A10 100%)' }}>

        {/* Aurora orbs */}
        <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)' }} />
        <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          <div className="flex items-center gap-3 mb-auto">
            <Logo size={40} />
            <span className="font-black text-2xl tracking-tight text-white">CloudNotes</span>
          </div>

          <div className="mb-auto py-10">
            <p className="font-black leading-none tracking-tighter text-white mb-5"
              style={{ fontSize: '4rem', lineHeight: 1.0 }}>
              Start building<br />
              <span style={{
                background: 'linear-gradient(90deg,#EC4899,#F97316)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                your second brain.
              </span>
            </p>
            <p className="text-lg leading-relaxed max-w-xs" style={{ color: '#4B5563' }}>
              Free forever. Rich editor, cloud storage, microservices backend. Everything you need to think clearly.
            </p>
          </div>

          {/* Feature checklist */}
          <div className="space-y-2.5">
            {[
              'Rich text editor with tables & code blocks',
              'Drag-and-drop images and YouTube embeds',
              'Export to Markdown, HTML, JSON',
              'Dark & light mode per note',
              'Full backup and restore',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)' }}>
                  <svg className="w-3 h-3" style={{ color: '#EC4899' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: '#4B5563' }}>{f}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute right-0 bottom-0 font-black pointer-events-none select-none overflow-hidden"
          style={{ fontSize: '18rem', lineHeight: 0.8, background: 'linear-gradient(135deg,#EC4899,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: 0.04 }}>
          CN
        </div>
      </div>

      {/* ── Right: Form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(236,72,153,0.06) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0% 100%, rgba(249,115,22,0.05) 0%, transparent 60%)' }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <Logo size={34} />
          <span className="font-black text-xl text-white">CloudNotes</span>
        </div>

        <div className="w-full max-w-[360px]">
          <h1 className="font-black text-3xl tracking-tight text-white mb-1">Create account</h1>
          <p className="text-sm mb-7" style={{ color: '#4B5563' }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Username" type="text"     value={form.username} onChange={set('username')} placeholder="your_username" />
            <Input label="Email"    type="email"    value={form.email}    onChange={set('email')}    placeholder="you@example.com" />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="min 8 characters" />
            <Input label="Confirm password" type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" />

            {error && (
              <div className="flex items-center gap-2 text-sm rounded-2xl px-4 py-3"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full font-bold py-4 rounded-2xl text-white text-sm transition mt-1 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#EC4899,#F97316)', boxShadow: '0 0 30px rgba(236,72,153,0.2)' }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>Creating account...
                  </span>
                : 'Create account →'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-6">
            <Link href="/" className="text-xs" style={{ color: '#374151' }}>← Back to home</Link>
            <Link href="/login" className="text-xs font-bold" style={{ color: '#F9A8D4' }}>Sign in instead</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
