'use client'

import { useEffect, useState } from 'react'

const THEME_KEY = 'cloudnotes_theme'
export type Theme = 'dark' | 'light'

// Shared light/dark theme, persisted so the whole app (landing, auth, dashboard)
// stays in sync.
export function useTheme(): [Theme, () => void, boolean] {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
    setMounted(true)
  }, [])

  function toggle() {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, next)
      return next
    })
  }

  return [theme, toggle, mounted]
}

// Palette used by the auth pages (login / register).
export function palette(theme: Theme) {
  const dark = theme === 'dark'
  return {
    dark,
    pageBg: dark ? '#07050A' : '#F7F6FB',
    panelBg: dark
      ? 'linear-gradient(135deg, #0D0818 0%, #130A1A 50%, #0A1018 100%)'
      : 'linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 50%, #FFEDD5 100%)',
    inputBg: dark ? '#0F0B14' : '#FFFFFF',
    inputBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)',
    text: dark ? '#F1F0F0' : '#1A1A1A',      // primary text — always high contrast
    heading: dark ? '#FFFFFF' : '#0F0A1A',
    muted: dark ? '#9CA3AF' : '#6B7280',      // secondary text — readable on both
    faint: dark ? '#6B7280' : '#9CA3AF',      // tertiary text — still legible
    label: dark ? '#A78BFA' : '#7C3AED',      // field labels
    link: dark ? '#C4B5FD' : '#7C3AED',
    brandText: dark ? '#FFFFFF' : '#0F0A1A',
  }
}
