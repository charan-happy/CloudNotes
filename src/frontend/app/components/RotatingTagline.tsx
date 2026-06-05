'use client'

import { useEffect, useState } from 'react'

// Light, DevOps-flavoured microcopy that cycles with a typewriter feel.
const LINES = [
  'Markdown in. Brilliance out.',
  'Your second brain just got a 99.9% SLA.',
  'Notes that never page you at 3am.',
  'Autosaved before you even reached for Ctrl+S.',
  'Rollbacks for your code. Undo for your thoughts.',
  'Written by someone who reads runbooks for fun.',
]

export default function RotatingTagline({ color }: { color: string }) {
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState('')
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing')

  useEffect(() => {
    const full = LINES[idx]
    if (phase === 'typing') {
      if (shown.length < full.length) {
        const t = setTimeout(() => setShown(full.slice(0, shown.length + 1)), 38)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase('holding'), 1800)
      return () => clearTimeout(t)
    }
    if (phase === 'holding') {
      const t = setTimeout(() => setPhase('deleting'), 600)
      return () => clearTimeout(t)
    }
    // deleting
    if (shown.length > 0) {
      const t = setTimeout(() => setShown(full.slice(0, shown.length - 1)), 18)
      return () => clearTimeout(t)
    }
    setPhase('typing')
    setIdx(i => (i + 1) % LINES.length)
  }, [shown, phase, idx])

  return (
    <p className="text-sm font-mono h-5" style={{ color }}>
      <span style={{ color: '#8B5CF6' }}>$</span> {shown}
      <span className="animate-pulse">▋</span>
    </p>
  )
}
