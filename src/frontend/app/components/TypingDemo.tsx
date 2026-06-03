'use client'

import { useEffect, useState } from 'react'

const NOTES = [
  {
    icon: '🚀',
    title: 'Sprint planning · Q3',
    lines: [
      '## Goals for this sprint',
      '',
      '- [x] Ship auth service to staging',
      '- [ ] Add Go note-service endpoints',
      '- [ ] Wire Prometheus → Grafana',
      '',
      '**Blockers:** Waiting on RDS credentials',
      '',
      '```bash',
      'kubectl apply -f k8s/note-service/',
      '```',
    ],
  },
  {
    icon: '🧠',
    title: 'Architecture decision · notes',
    lines: [
      '## Microservices vs Monolith',
      '',
      'Decided on **4 separate services** because:',
      '',
      '1. Independent deployments per team',
      '2. Language flexibility (Go, Java, Python)',
      '3. Kubernetes-native scaling',
      '',
      '> "Prefer boring infrastructure over clever code"',
    ],
  },
  {
    icon: '💡',
    title: 'Ideas · CloudNotes features',
    lines: [
      '## Next features',
      '',
      '| Feature         | Priority | Status  |',
      '|-----------------|----------|---------|',
      '| Real-time sync  | High     | Planned |',
      '| Mobile app      | Medium   | Idea    |',
      '| AI summarise    | High     | Planned |',
      '',
      'See also: [[Architecture decision]]',
    ],
  },
]

const CHAR_DELAY = 18
const LINE_DELAY = 80
const PAUSE_AFTER = 2400
const FADE_DURATION = 300

export default function TypingDemo() {
  const [noteIdx, setNoteIdx] = useState(0)
  const [displayed, setDisplayed] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState('')
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const note = NOTES[noteIdx]
    if (lineIdx >= note.lines.length) {
      // Done typing — pause then switch note
      const t = setTimeout(() => {
        setFading(true)
        setTimeout(() => {
          setNoteIdx(i => (i + 1) % NOTES.length)
          setDisplayed([])
          setCurrentLine('')
          setLineIdx(0)
          setCharIdx(0)
          setFading(false)
        }, FADE_DURATION)
      }, PAUSE_AFTER)
      return () => clearTimeout(t)
    }

    const line = note.lines[lineIdx]
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setCurrentLine(prev => prev + line[charIdx])
        setCharIdx(i => i + 1)
      }, CHAR_DELAY)
      return () => clearTimeout(t)
    } else {
      // Line complete
      const t = setTimeout(() => {
        setDisplayed(prev => [...prev, line])
        setCurrentLine('')
        setCharIdx(0)
        setLineIdx(i => i + 1)
      }, LINE_DELAY)
      return () => clearTimeout(t)
    }
  }, [noteIdx, lineIdx, charIdx])

  const note = NOTES[noteIdx]

  function renderLine(line: string, idx: number) {
    if (line.startsWith('## '))
      return <p key={idx} className="text-white font-bold text-sm mt-2">{line.slice(3)}</p>
    if (line.startsWith('- [x] '))
      return <p key={idx} className="text-slate-500 text-xs line-through">{line.slice(6)}</p>
    if (line.startsWith('- [ ] ') || line.startsWith('- '))
      return <p key={idx} className="text-slate-300 text-xs">{line.replace(/^- \[.\] /, '').replace(/^- /, '')}</p>
    if (line.startsWith('```'))
      return <p key={idx} className="text-violet-400 text-xs font-mono">{line}</p>
    if (line.startsWith('> '))
      return <p key={idx} className="text-slate-400 text-xs border-l-2 border-violet-500 pl-2 italic">{line.slice(2)}</p>
    if (line.startsWith('|'))
      return <p key={idx} className="text-slate-400 text-xs font-mono">{line}</p>
    if (line.startsWith('1.') || line.match(/^\d+\./))
      return <p key={idx} className="text-slate-300 text-xs">{line}</p>
    if (line === '')
      return <p key={idx} className="h-2" />
    // Bold inline
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.+?)\*\*/)
      return (
        <p key={idx} className="text-slate-300 text-xs">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{p}</strong> : p)}
        </p>
      )
    }
    return <p key={idx} className="text-slate-300 text-xs">{line}</p>
  }

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden shadow-2xl transition-opacity duration-300"
      style={{ background: '#0d0d12', opacity: fading ? 0 : 1 }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6" style={{ background: '#111116' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex items-center gap-2 mx-auto">
          <span className="text-base">{note.icon}</span>
          <span className="text-slate-400 text-xs">{note.title}</span>
        </div>
      </div>

      {/* Fake toolbar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-white/4" style={{ background: '#0f0f14' }}>
        {['¶','H1','H2','B','I','U','•','1.','</>','"','—','🖼','▶'].map((t, i) => (
          <span key={i} className="px-1.5 py-0.5 text-[10px] text-slate-700 font-mono rounded hover:text-slate-500 transition cursor-default select-none">{t}</span>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-0.5 min-h-[180px]">
        {displayed.map((line, i) => renderLine(line, i))}
        {lineIdx < note.lines.length && (
          <p className="text-slate-300 text-xs font-mono">
            {currentLine}
            <span className="animate-pulse text-violet-400">▋</span>
          </p>
        )}
      </div>
    </div>
  )
}
