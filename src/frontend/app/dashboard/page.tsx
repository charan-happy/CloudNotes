'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NoteEditor from './NoteEditor'
import { NOTE_COLORS, RANDOM_ICONS, genNoteId, relativeTime, emptyContent, notePreview, downloadFile, notesKey, type Note } from './types'

const THEME_KEY = 'cloudnotes_theme'

function loadNotes(username: string): Note[] {
  try { return JSON.parse(localStorage.getItem(notesKey(username)) || '[]') } catch { return [] }
}
function saveNotes(username: string, n: Note[]) { localStorage.setItem(notesKey(username), JSON.stringify(n)) }

function defaultNote(): Note {
  return {
    id: genNoteId(),
    title: '',
    icon: RANDOM_ICONS[Math.floor(Math.random() * RANDOM_ICONS.length)],
    color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)].name,
    content: emptyContent(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinned: false,
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const u = localStorage.getItem('username') || ''
    if (!token) { router.replace('/'); return }
    setUsername(u)
    // Load only THIS user's notes — key is scoped to username
    const saved = loadNotes(u)
    setNotes(saved)
    if (saved.length > 0) setActiveId(saved[0].id)
    const savedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null
    if (savedTheme) setAppTheme(savedTheme)
  }, [router])

  function toggleTheme() {
    const next: 'dark' | 'light' = appTheme === 'dark' ? 'light' : 'dark'
    setAppTheme(next)
    localStorage.setItem(THEME_KEY, next)
  }

  const active = notes.find(n => n.id === activeId) ?? null

  const filtered = [...notes]
    .filter(n => !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      notePreview(n).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })

  function createNote() {
    const note = defaultNote()
    const next = [note, ...notes]
    setNotes(next); saveNotes(next); setActiveId(note.id)
  }

  function updateNote(id: string, patch: Partial<Note>) {
    const next = notes.map(n => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)
    setNotes(next); saveNotes(next)
  }

  function deleteNote(id: string) {
    const next = notes.filter(n => n.id !== id)
    setNotes(next); saveNotes(next)
    setActiveId(next.length > 0 ? next[0].id : null)
  }

  function logout() {
    localStorage.removeItem('token'); localStorage.removeItem('username')
    router.push('/')
  }

  function backupAll() {
    downloadFile(JSON.stringify(notes, null, 2), 'cloudnotes-backup.json', 'application/json')
  }

  function restoreBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Note[]
        if (!Array.isArray(data)) throw new Error()
        const merged = [...data, ...notes.filter(n => !data.find(d => d.id === n.id))]
        setNotes(merged); saveNotes(merged)
        if (data.length > 0) setActiveId(data[0].id)
        alert(`Restored ${data.length} notes.`)
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const isDark = appTheme === 'dark'

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${isDark ? 'bg-[#0f0f12] text-white' : 'bg-slate-50 text-slate-900'}`}>

      {/* ── Sidebar ── */}
      <aside
        className={`shrink-0 flex flex-col overflow-hidden transition-all duration-200 border-r ${isDark ? 'bg-[#0a0a0e] border-white/5' : 'bg-white border-slate-200'}`}
        style={{ width: sidebarOpen ? 260 : 0 }}
      >
        {/* Logo + theme */}
        <div className={`flex items-center h-12 px-4 gap-2.5 border-b shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className={`font-bold text-sm flex-1 whitespace-nowrap bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-white to-slate-400' : 'from-slate-900 to-slate-500'}`}>
            CloudNotes
          </span>
          {/* Theme toggle */}
          <button onClick={toggleTheme} title="Toggle theme" className={`p-1.5 rounded-lg transition ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
            {isDark
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>
        </div>

        {/* New note + search */}
        <div className="px-3 py-3 space-y-2 shrink-0">
          <button onClick={createNote} className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-2 rounded-xl transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Note
          </button>
          <div className="relative">
            <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${isDark ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className={`w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none transition ${isDark ? 'bg-white/5 border-white/8 text-white placeholder-slate-600 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-400'}`}
            />
          </div>
        </div>

        <div className={`px-4 pb-1 shrink-0 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
          {filtered.length} notes
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-px">
          {filtered.length === 0 ? (
            <div className="text-center mt-10 px-4">
              <div className="text-4xl mb-2">📭</div>
              <p className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{search ? 'Nothing found' : 'No notes yet'}</p>
            </div>
          ) : filtered.map(note => {
            const cc = NOTE_COLORS.find(c => c.name === note.color) ?? NOTE_COLORS[0]
            const isActive = note.id === activeId
            // Color as background tint — no strip that overlaps text
            const bgStyle = isActive
              ? { background: `${cc.accent}22`, border: `1px solid ${cc.accent}40` }
              : { background: 'transparent', border: '1px solid transparent' }
            return (
              <button
                key={note.id}
                onClick={() => setActiveId(note.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl transition-all group"
                style={bgStyle}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = `${cc.accent}10` }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0 mt-0.5">{note.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{note.title || 'Untitled'}</p>
                    <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{notePreview(note)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cc.accent }} />
                      <p className={`text-xs ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>{relativeTime(note.updatedAt)}</p>
                    </div>
                  </div>
                  {note.pinned && <svg className="w-3 h-3 mt-1 shrink-0" style={{ color: cc.accent }} fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Sidebar footer */}
        <div className={`border-t px-3 py-2.5 space-y-0.5 shrink-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
          {/* Backup / Restore */}
          <div className="flex items-center gap-1 px-2 py-1">
            <button onClick={backupAll} title="Backup all notes" className={`flex items-center gap-1.5 text-xs transition px-2 py-1 rounded-lg flex-1 ${isDark ? 'text-slate-600 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Backup
            </button>
            <label className={`cursor-pointer flex items-center gap-1.5 text-xs transition px-2 py-1 rounded-lg flex-1 ${isDark ? 'text-slate-600 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Restore
              <input type="file" accept=".json" className="hidden" onChange={restoreBackup} />
            </label>
          </div>

          <Link href="/health" className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg transition ${isDark ? 'text-slate-600 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Service Health
          </Link>

          <div className={`flex items-center justify-between px-2 py-1 rounded-lg ${isDark ? '' : ''}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{username}</span>
            </div>
            <button onClick={logout} title="Sign out" className={`transition ml-2 ${isDark ? 'text-slate-600 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <div className={`flex items-center h-12 px-4 border-b shrink-0 gap-2 ${isDark ? 'border-white/5 bg-[#0f0f12]' : 'border-slate-200 bg-white'}`}>
          <button onClick={() => setSidebarOpen(v => !v)} className={`p-1.5 rounded-lg transition ${isDark ? 'text-slate-600 hover:text-white hover:bg-white/8' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          {active && (
            <>
              <span className={`text-xs truncate ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
                {active.icon} {active.title || 'Untitled'}
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => updateNote(active.id, { pinned: !active.pinned })}
                  title={active.pinned ? 'Unpin' : 'Pin'}
                  className={`p-1.5 rounded-lg transition ${active.pinned ? 'text-indigo-400' : isDark ? 'text-slate-600 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <svg className="w-4 h-4" fill={active.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button onClick={() => deleteNote(active.id)} className={`p-1.5 rounded-lg transition hover:bg-red-900/20 hover:text-red-400 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Editor or empty state */}
        {active ? (
          <NoteEditor
            key={active.id}
            note={active}
            onUpdate={patch => updateNote(active.id, patch)}
            appTheme={appTheme}
          />
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center text-center px-6 ${isDark ? 'bg-[#0f0f12]' : 'bg-slate-50'}`}>
            <div className="text-7xl mb-5">✍️</div>
            <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Your ideas deserve a home</h3>
            <p className={`text-sm mb-6 max-w-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Create rich notes with text, images, videos, tables, and code. Everything saves automatically.
            </p>
            <button onClick={createNote} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 rounded-2xl transition shadow-lg shadow-indigo-900/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Create first note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
