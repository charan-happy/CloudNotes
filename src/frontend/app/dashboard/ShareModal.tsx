'use client'

import { useEffect, useState } from 'react'
import * as api from '../../lib/api'

export default function ShareModal({ noteId, noteTitle, isDark, onClose }: {
  noteId: string
  noteTitle: string
  isDark: boolean
  onClose: () => void
}) {
  const [shares, setShares] = useState<api.Share[]>([])
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [expiry, setExpiry] = useState('')   // '' | '1' | '7' | '30'
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const linkFor = (token: string) => `${origin}/shared/${token}`

  async function load() {
    try { setShares(await api.listShares(noteId)) } catch { /* ignore */ }
    setLoading(false)
  }
  useEffect(() => { load() /* eslint-disable-next-line */ }, [noteId])

  async function create() {
    setError(''); setCreating(true)
    try {
      const share = await api.createShare(noteId, {
        permission,
        shared_with_username: username.trim() || undefined,
        password: password.trim() || undefined,
        expires_in_days: expiry ? parseInt(expiry) : undefined,
      })
      setShares(s => [share, ...s])
      setUsername(''); setPassword(''); setExpiry('')
      // auto-copy the fresh link
      navigator.clipboard?.writeText(linkFor(share.token)).catch(() => {})
      setCopied(share.token); setTimeout(() => setCopied(null), 2000)
      api.track('note_shared', { note_id: noteId, permission })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create link')
    } finally {
      setCreating(false)
    }
  }

  async function revoke(id: string) {
    try { await api.revokeShare(noteId, id); setShares(s => s.filter(x => x.id !== id)) } catch { /* ignore */ }
  }

  function copy(token: string) {
    navigator.clipboard?.writeText(linkFor(token))
    setCopied(token); setTimeout(() => setCopied(null), 2000)
  }

  const card = isDark ? '#15151b' : '#ffffff'
  const text = isDark ? '#F1F0F0' : '#1a1a1a'
  const muted = isDark ? '#9CA3AF' : '#6B7280'
  const field = isDark ? '#0F0B14' : '#F8F9FA'
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ background: card, borderColor: border }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: border }}>
          <div>
            <h2 className="font-bold text-lg" style={{ color: text }}>Share note</h2>
            <p className="text-xs truncate max-w-[280px]" style={{ color: muted }}>{noteTitle || 'Untitled'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition" style={{ color: muted }}>✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Permission toggle */}
          <div className="flex gap-2">
            {(['view', 'edit'] as const).map(p => (
              <button key={p} onClick={() => setPermission(p)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition border"
                style={permission === p
                  ? { background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', color: '#fff', borderColor: 'transparent' }
                  : { background: field, color: muted, borderColor: border }}>
                {p === 'view' ? '👁 Can view' : '✏️ Can edit'}
              </button>
            ))}
          </div>

          {/* Optional fields */}
          <div className="space-y-2.5">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Share with a username or email (optional)"
              className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none border" style={{ background: field, color: text, borderColor: border }} />
            <div className="flex gap-2">
              <input value={password} onChange={e => setPassword(e.target.value)} type="text" placeholder="Password (optional)"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none border" style={{ background: field, color: text, borderColor: border }} />
              <select value={expiry} onChange={e => setExpiry(e.target.value)}
                className="rounded-xl px-3 py-2.5 text-sm focus:outline-none border" style={{ background: field, color: text, borderColor: border }}>
                <option value="">No expiry</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            <p className="text-[11px]" style={{ color: muted }}>
              Leave username empty for a link <b>anyone</b> can open. Add a username or email to restrict it to one signed-in person.
            </p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button onClick={create} disabled={creating}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
            {creating ? 'Creating…' : '🔗 Create share link'}
          </button>

          {/* Existing shares */}
          <div className="pt-1">
            <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: muted }}>
              Active links {shares.length > 0 && `(${shares.length})`}
            </p>
            {loading ? (
              <p className="text-xs" style={{ color: muted }}>Loading…</p>
            ) : shares.length === 0 ? (
              <p className="text-xs" style={{ color: muted }}>No active links yet.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {shares.map(s => (
                  <div key={s.id} className="flex items-center gap-2 rounded-xl px-3 py-2 border" style={{ background: field, borderColor: border }}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: s.permission === 'edit' ? '#8B5CF622' : '#10B98122', color: s.permission === 'edit' ? '#A78BFA' : '#10B981' }}>
                          {s.permission}
                        </span>
                        {s.shared_with_user_id && <span className="text-[10px]" style={{ color: muted }}>👤 person-only</span>}
                        {s.has_password && <span className="text-[10px]" style={{ color: muted }}>🔒</span>}
                        {s.expires_at && <span className="text-[10px]" style={{ color: muted }}>⏳ {new Date(s.expires_at).toLocaleDateString()}</span>}
                      </div>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: muted }}>{linkFor(s.token)}</p>
                    </div>
                    <button onClick={() => copy(s.token)} className="text-xs px-2 py-1 rounded-lg transition" style={{ color: copied === s.token ? '#10B981' : '#A78BFA' }}>
                      {copied === s.token ? '✓ Copied' : 'Copy'}
                    </button>
                    <button onClick={() => revoke(s.id)} className="text-xs px-1.5 py-1 rounded-lg transition" style={{ color: muted }} title="Revoke">🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
