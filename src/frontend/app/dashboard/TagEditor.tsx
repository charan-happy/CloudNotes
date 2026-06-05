'use client'

import { useState } from 'react'
import { SUGGESTED_TAGS, tagColor, type Note } from './types'

// Tag editor: chips with remove, an add-input, and quick suggestions.
export default function TagEditor({ note, onUpdate, isDark }: {
  note: Note
  onUpdate: (p: Partial<Note>) => void
  isDark: boolean
}) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')
  const tags = note.tags ?? []

  function addTag(raw: string) {
    const t = raw.trim().replace(/^#/, '')
    if (t && !tags.some(x => x.toLowerCase() === t.toLowerCase())) {
      onUpdate({ tags: [...tags, t] })
    }
    setValue(''); setAdding(false)
  }
  function removeTag(t: string) {
    onUpdate({ tags: tags.filter(x => x !== t) })
  }

  const suggestions = SUGGESTED_TAGS.filter(s => !tags.some(t => t.toLowerCase() === s.toLowerCase()))

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-5">
      {tags.map(t => (
        <span key={t} className="group inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: `${tagColor(t)}22`, color: tagColor(t) }}>
          #{t}
          <button onClick={() => removeTag(t)} className="opacity-50 hover:opacity-100 transition" title="Remove tag">×</button>
        </span>
      ))}

      {adding ? (
        <input
          autoFocus value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addTag(value); if (e.key === 'Escape') { setValue(''); setAdding(false) } }}
          onBlur={() => value ? addTag(value) : setAdding(false)}
          placeholder="tag name…"
          className={`text-xs rounded-full px-2.5 py-1 w-28 focus:outline-none border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
        />
      ) : (
        <button onClick={() => setAdding(true)}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-dashed transition ${isDark ? 'border-white/15 text-slate-400 hover:text-white hover:border-white/30' : 'border-slate-300 text-slate-500 hover:text-slate-800'}`}>
          + Tag
        </button>
      )}

      {adding && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 5).map(s => (
            <button key={s} onMouseDown={e => { e.preventDefault(); addTag(s) }}
              className="text-xs px-2 py-1 rounded-full transition"
              style={{ background: `${tagColor(s)}18`, color: tagColor(s) }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}
