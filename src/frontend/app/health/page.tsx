'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Endpoint { method: string; path: string; description: string }

interface ServiceHealth {
  service: string
  version: string
  status: string
  language?: string
  framework?: string
  uptime_seconds?: number
  registered_users?: number
  user_count?: number
  note_count?: number
  event_count?: number
  active_users?: number
  endpoints: Endpoint[]
  error?: boolean
}

const SERVICES = [
  { key: 'auth',      label: 'Auth Service',      icon: '🐍', lang: 'Python / FastAPI',     port: ':8000', env: 'NEXT_PUBLIC_API_URL',       color: '#8B5CF6' },
  { key: 'notes',     label: 'Note Service',       icon: '🐹', lang: 'Go / Gin',             port: ':8001', env: 'NEXT_PUBLIC_NOTE_URL',      color: '#06B6D4' },
  { key: 'users',     label: 'User Service',       icon: '☕', lang: 'Java / Spring Boot',   port: ':8002', env: 'NEXT_PUBLIC_USER_URL',      color: '#F59E0B' },
  { key: 'analytics', label: 'Analytics Service',  icon: '🟢', lang: 'Node.js / Express',    port: ':8003', env: 'NEXT_PUBLIC_ANALYTICS_URL', color: '#10B981' },
]

const METHOD_COLORS: Record<string, string> = {
  GET:    'text-emerald-400 bg-emerald-900/30 border-emerald-800/40',
  POST:   'text-amber-400  bg-amber-900/30  border-amber-800/40',
  PUT:    'text-blue-400   bg-blue-900/30   border-blue-800/40',
  DELETE: 'text-red-400   bg-red-900/30   border-red-800/40',
}

function fmtUptime(s?: number) {
  if (!s) return '—'
  if (s < 60) return `${Math.round(s)}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

function getUrl(envKey: string): string {
  const map: Record<string, string> = {
    NEXT_PUBLIC_API_URL:       process.env.NEXT_PUBLIC_API_URL       ?? 'http://localhost:8000',
    NEXT_PUBLIC_NOTE_URL:      process.env.NEXT_PUBLIC_NOTE_URL      ?? 'http://localhost:8001',
    NEXT_PUBLIC_USER_URL:      process.env.NEXT_PUBLIC_USER_URL      ?? 'http://localhost:8002',
    NEXT_PUBLIC_ANALYTICS_URL: process.env.NEXT_PUBLIC_ANALYTICS_URL ?? 'http://localhost:8003',
  }
  return map[envKey] ?? 'http://localhost:8000'
}

export default function HealthPage() {
  const [healths, setHealths] = useState<Record<string, ServiceHealth | null>>({})
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [expanded, setExpanded] = useState<string | null>('auth')

  async function fetchAll() {
    const results: Record<string, ServiceHealth | null> = {}
    await Promise.all(
      SERVICES.map(async svc => {
        try {
          const url = getUrl(svc.env)
          const res = await fetch(`${url}/v1/health-status`, { signal: AbortSignal.timeout(4000) })
          results[svc.key] = res.ok ? await res.json() : { ...({} as ServiceHealth), error: true }
        } catch {
          results[svc.key] = { service: svc.key, version: '—', status: 'unreachable', endpoints: [], error: true }
        }
      })
    )
    setHealths(results)
    setLastChecked(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 10_000)
    return () => clearInterval(id)
  }, [])

  const allHealthy = SERVICES.every(s => healths[s.key] && !healths[s.key]?.error)
  const anyDown    = SERVICES.some(s => healths[s.key]?.error)

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: '#07050A', color: '#F1F0F0' }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold">CloudNotes</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">Service Health</span>
          </div>
          <button onClick={fetchAll} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-3 py-1.5 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {/* Overall status banner */}
        <div className="rounded-2xl p-5 border" style={{
          background: anyDown ? 'rgba(239,68,68,0.07)' : 'rgba(16,185,129,0.07)',
          borderColor: anyDown ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)',
        }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : anyDown ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
              <div>
                <p className="font-bold text-white">
                  {loading ? 'Checking services…' : anyDown ? 'Some services are down' : 'All systems operational'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {SERVICES.filter(s => !healths[s.key]?.error).length}/{SERVICES.length} services healthy
                  {lastChecked && ` · Last checked ${lastChecked.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              {SERVICES.map(s => (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{s.icon}</span>
                  <span className={`w-2 h-2 rounded-full ${!healths[s.key] ? 'bg-slate-600' : healths[s.key]?.error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES.map(svc => {
            const h = healths[svc.key]
            const isDown = !h || h.error
            const isExpanded = expanded === svc.key

            return (
              <div key={svc.key} className="rounded-2xl border overflow-hidden transition-all"
                style={{ borderColor: isDown ? 'rgba(239,68,68,0.2)' : `${svc.color}25`, background: isDown ? 'rgba(239,68,68,0.04)' : `${svc.color}06` }}>

                {/* Card header */}
                <button className="w-full flex items-center gap-4 px-5 py-4 text-left" onClick={() => setExpanded(isExpanded ? null : svc.key)}>
                  <span className="text-2xl">{svc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{svc.label}</p>
                      {h && !h.error && <span className="text-xs text-slate-500 font-mono">v{h.version}</span>}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: svc.color }}>{svc.lang}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${!h ? 'bg-slate-600' : isDown ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className={`text-xs font-medium ${!h ? 'text-slate-600' : isDown ? 'text-red-400' : 'text-emerald-400'}`}>
                      {!h ? 'Checking' : isDown ? 'Down' : 'Healthy'}
                    </span>
                    <svg className={`w-4 h-4 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                {/* Stats row */}
                {h && !h.error && (
                  <div className="flex gap-6 px-5 pb-4 text-center border-t" style={{ borderColor: `${svc.color}15` }}>
                    <div className="text-left">
                      <p className="font-bold text-white text-sm">{fmtUptime(h.uptime_seconds)}</p>
                      <p className="text-xs text-slate-500">Uptime</p>
                    </div>
                    {h.registered_users !== undefined && (
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{h.registered_users}</p>
                        <p className="text-xs text-slate-500">Users</p>
                      </div>
                    )}
                    {h.note_count !== undefined && (
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{h.note_count}</p>
                        <p className="text-xs text-slate-500">Notes</p>
                      </div>
                    )}
                    {h.user_count !== undefined && (
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{h.user_count}</p>
                        <p className="text-xs text-slate-500">Users</p>
                      </div>
                    )}
                    {h.event_count !== undefined && (
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{h.event_count}</p>
                        <p className="text-xs text-slate-500">Events</p>
                      </div>
                    )}
                    {h.active_users !== undefined && (
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{h.active_users}</p>
                        <p className="text-xs text-slate-500">Active (5m)</p>
                      </div>
                    )}
                    <div className="text-left ml-auto">
                      <p className="font-bold text-white text-sm">{h.endpoints?.length ?? 0}</p>
                      <p className="text-xs text-slate-500">Endpoints</p>
                    </div>
                  </div>
                )}

                {/* Expanded endpoints */}
                {isExpanded && h && !h.error && h.endpoints.length > 0 && (
                  <div className="border-t" style={{ borderColor: `${svc.color}15` }}>
                    <div className="divide-y divide-white/4">
                      {h.endpoints.map(ep => (
                        <div key={`${ep.method}${ep.path}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/3 transition">
                          <span className={`shrink-0 text-[10px] font-bold font-mono border px-1.5 py-0.5 rounded ${METHOD_COLORS[ep.method] ?? 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                            {ep.method}
                          </span>
                          <code className="text-slate-300 text-xs font-mono">{ep.path}</code>
                          <span className="text-slate-600 text-xs ml-auto text-right truncate max-w-[160px]">{ep.description}</span>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-2.5 border-t" style={{ borderColor: `${svc.color}15` }}>
                      <a href={`${getUrl(svc.env)}/metrics`} target="_blank" rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1.5 transition" style={{ color: svc.color }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Open /metrics (Prometheus) ↗
                      </a>
                    </div>
                  </div>
                )}

                {isDown && (
                  <div className="px-5 pb-4 text-xs text-red-400/70">
                    Service unreachable at {getUrl(svc.env)} — is it running?
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick-start hints */}
        <div className="rounded-2xl border border-slate-800 p-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-white font-semibold mb-3 text-sm">Start a down service</p>
          <div className="space-y-1.5">
            {[
              { svc: 'auth-service',      cmd: 'cd src/auth-service && .venv/bin/uvicorn main:app --port 8000' },
              { svc: 'note-service',      cmd: 'cd src/note-service && go run .' },
              { svc: 'user-service',      cmd: 'cd src/user-service && ./mvnw spring-boot:run' },
              { svc: 'analytics-service', cmd: 'cd src/analytics-service && node index.js' },
            ].map(r => (
              <div key={r.svc} className="flex items-center gap-3">
                <code className="text-[11px] font-mono text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg flex-1 truncate">{r.cmd}</code>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
