'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Endpoint {
  method: string
  path: string
  description: string
}

interface HealthData {
  service: string
  version: string
  status: string
  uptime_seconds: number
  registered_users: number
  endpoints: Endpoint[]
}

const METHOD_COLORS: Record<string, string> = {
  GET:  'text-emerald-400 bg-emerald-900/30 border-emerald-800/40',
  POST: 'text-amber-400  bg-amber-900/30  border-amber-800/40',
  PUT:  'text-blue-400   bg-blue-900/30   border-blue-800/40',
  DELETE: 'text-red-400  bg-red-900/30    border-red-800/40',
}

function formatUptime(seconds: number) {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [error, setError] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  async function fetchHealth() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/health-status`)
      if (!res.ok) throw new Error()
      setData(await res.json())
      setError(false)
    } catch {
      setError(true)
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    fetchHealth()
    const id = setInterval(fetchHealth, 10000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-6 py-8">
      {/* Blob */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob-one absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-white">CloudNotes</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 text-sm">Health Status</span>
          </div>
          <button
            onClick={fetchHealth}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Status Banner */}
        <div className={`animate-fade-up delay-100 rounded-2xl border p-6 ${error ? 'bg-red-900/20 border-red-800/40' : 'bg-slate-900/80 border-slate-800'}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${error ? 'bg-red-900/50' : 'bg-emerald-900/50'}`}>
                {error ? (
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-lg">{data?.service ?? 'auth-service'}</h2>
                  {data && <span className="text-xs text-slate-500 font-mono">v{data.version}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span className={`text-sm font-medium ${error ? 'text-red-400' : 'text-emerald-400'}`}>
                    {error ? 'Unreachable' : (data?.status ?? 'Checking…')}
                  </span>
                </div>
              </div>
            </div>

            {data && (
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{formatUptime(data.uptime_seconds)}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Uptime</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.registered_users}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{data.endpoints.length}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Endpoints</p>
                </div>
              </div>
            )}
          </div>

          {lastChecked && (
            <p className="text-slate-600 text-xs mt-4">
              Last checked: {lastChecked.toLocaleTimeString()} · Auto-refreshes every 10s
            </p>
          )}
        </div>

        {/* Endpoints Table */}
        {data && (
          <div className="animate-fade-up delay-200 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-white font-semibold">Registered Endpoints</h3>
            </div>
            <div className="divide-y divide-slate-800/60">
              {data.endpoints.map(ep => (
                <div key={ep.path} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-800/30 transition">
                  <span className={`shrink-0 text-xs font-bold font-mono border px-2 py-0.5 rounded ${METHOD_COLORS[ep.method] ?? 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                    {ep.method}
                  </span>
                  <code className="text-slate-300 text-sm font-mono">{ep.path}</code>
                  <span className="text-slate-500 text-sm ml-auto text-right">{ep.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics link */}
        <div className="animate-fade-up delay-300 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Prometheus Metrics</p>
            <p className="text-slate-400 text-sm mt-0.5">Raw metrics endpoint for Prometheus scraping</p>
          </div>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/metrics`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-800/50 hover:border-indigo-600 px-4 py-2 rounded-lg transition"
          >
            Open
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

      </div>
    </div>
  )
}
