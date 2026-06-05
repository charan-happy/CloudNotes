import type { JSONContent } from '@tiptap/react'

export interface Note {
  id: string
  title: string
  icon: string
  cover?: string
  color: string
  noteTheme?: 'inherit' | 'dark' | 'light'
  tags: string[]
  content: JSONContent
  createdAt: number
  updatedAt: number
  pinned: boolean
}

// Suggested tags shown when adding one to a note.
export const SUGGESTED_TAGS = ['Personal', 'Work', 'Professional', 'Ideas', 'Todo', 'Project', 'Learning', 'Finance']

// Deterministic colour for a tag so the same tag always looks the same.
export function tagColor(tag: string): string {
  const palette = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#14b8a6', '#d946ef']
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export const NOTE_COLORS = [
  { name: 'indigo',  accent: '#6366f1', from: '#1e1b4b' },
  { name: 'violet',  accent: '#8b5cf6', from: '#2e1065' },
  { name: 'emerald', accent: '#10b981', from: '#022c22' },
  { name: 'amber',   accent: '#f59e0b', from: '#431407' },
  { name: 'rose',    accent: '#f43f5e', from: '#4c0519' },
  { name: 'sky',     accent: '#0ea5e9', from: '#0c1a2e' },
  { name: 'teal',    accent: '#14b8a6', from: '#042f2e' },
  { name: 'fuchsia', accent: '#d946ef', from: '#4a044e' },
] as const

export const EMOJIS = [
  '📝','📓','📒','💡','🎯','🚀','⭐','🔥','💎','🎨',
  '🎬','🎵','🌟','🌈','🦋','🌸','🍀','🏆','🧠','👾',
  '🤖','🦄','🐉','💻','🎸','🌙','☀️','🌊','🏔️','🎪',
  '🎭','🎲','📊','📈','🔬','🧪','🎓','📚','✈️','🏠',
]

export const RANDOM_ICONS = ['📝','💡','🎯','🚀','⭐','🔥','🎨','🌟','🧠','💎']

export function genNoteId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function relativeTime(ts: number): string {
  const d = Date.now() - ts
  if (d < 60_000) return 'just now'
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`
  if (d < 172_800_000) return 'yesterday'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function emptyContent(): JSONContent {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}

export function notePreview(note: Note): string {
  function extractText(node: JSONContent): string {
    if (node.text) return node.text
    if (node.content) return node.content.map(extractText).join(' ')
    return ''
  }
  return extractText(note.content).slice(0, 120) || 'Empty note'
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

// Per-user storage key so each user's notes are completely isolated
export function notesKey(username: string) {
  return `cloudnotes_notes_${username}`
}
