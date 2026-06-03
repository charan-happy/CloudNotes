'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="url(#loginGrad)" />
      <rect x="8" y="7" width="14" height="18" rx="2" fill="rgba(255,255,255,0.2)" />
      <path d="M22 7 L22 13 L28 13 Z" fill="rgba(0,0,0,0.2)" />
      <rect x="10.5" y="14" width="9" height="1.5" rx="0.75" fill="white" opacity="0.95" />
      <rect x="10.5" y="18" width="7" height="1.5" rx="0.75" fill="white" opacity="0.7" />
      <rect x="10.5" y="22" width="5" height="1.5" rx="0.75" fill="white" opacity="0.45" />
      <circle cx="25" cy="25" r="7" fill="rgba(7,5,10,0.85)" />
      <path d="M20.5 26 Q20 24 22 24 Q22.5 22.5 24 23 Q25.5 22 26.5 23.5 Q28 23.5 28 25 Q28.5 26.5 27 26.5 Z" fill="url(#loginGrad)" />
      <defs>
        <linearGradient id="loginGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
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
          border: `1px solid ${focused ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.07)'}`,
          color: '#F1F0F0',
          boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
        }}
      />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid credentials')
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', username)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#07050A' }}>

      {/* ── Left: Brand panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(135deg, #0D0818 0%, #130A1A 50%, #0A1018 100%)' }}>

        {/* Aurora orb top-right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(236,72,153,0.08) 40%, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col h-full px-14 py-12">
          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-auto">
            <Logo size={40} />
            <span className="font-black text-2xl tracking-tight text-white">CloudNotes</span>
          </div>

          {/* Hero text */}
          <div className="mb-auto py-10">
            <p className="font-black leading-none tracking-tighter text-white mb-5"
              style={{ fontSize: '4rem', lineHeight: 1.0 }}>
              Ideas are<br />
              <span style={{
                background: 'linear-gradient(90deg,#8B5CF6,#EC4899,#F97316)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                fleeting.
              </span>
            </p>
            <p className="text-lg leading-relaxed max-w-xs" style={{ color: '#4B5563' }}>
              Write them down before they vanish. CloudNotes keeps your thoughts, code snippets, and plans forever.
            </p>
          </div>

          {/* Mini service badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { l: 'Python', c: '#8B5CF6' }, { l: 'Go', c: '#06B6D4' },
              { l: 'Java', c: '#F59E0B' },   { l: 'Node.js', c: '#10B981' },
              { l: 'Kubernetes', c: '#4B5563' }, { l: 'PostgreSQL', c: '#4B5563' },
            ].map(t => (
              <span key={t.l} className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: `${t.c}12`, border: `1px solid ${t.c}25`, color: t.c }}>
                {t.l}
              </span>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute right-0 bottom-0 font-black pointer-events-none select-none overflow-hidden"
          style={{ fontSize: '18rem', lineHeight: 0.8, background: 'linear-gradient(135deg,#8B5CF6,#EC4899,#F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: 0.04 }}>
          CN
        </div>
      </div>

      {/* ── Right: Form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative">

        {/* Aurora corner glow */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 0% 100%, rgba(249,115,22,0.05) 0%, transparent 60%)' }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <Logo size={34} />
          <span className="font-black text-xl text-white">CloudNotes</span>
        </div>

        <div className="w-full max-w-[360px]">
          <h1 className="font-black text-3xl tracking-tight text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: '#4B5563' }}>Pick up where you left off.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Username" type="text"     value={username} onChange={setUsername} placeholder="your_username" />
            <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

            {error && (
              <div className="flex items-center gap-2 text-sm rounded-2xl px-4 py-3"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171' }}>
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full font-bold py-4 rounded-2xl text-white text-sm transition mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', boxShadow: '0 0 30px rgba(139,92,246,0.25)' }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>Signing in...
                  </span>
                : 'Sign in →'}
            </button>
          </form>

          <div className="flex items-center justify-between mt-6">
            <Link href="/" className="text-xs" style={{ color: '#374151' }}>← Back to home</Link>
            <Link href="/register" className="text-xs font-bold" style={{ color: '#A78BFA' }}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
