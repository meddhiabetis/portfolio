'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'theme-preference'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  const apply = (t: Theme) => {
    const html = document.documentElement
    html.classList.remove('theme-light', 'theme-dark', 'dark')
    if (t === 'light') html.classList.add('theme-light')
    if (t === 'dark') { html.classList.add('theme-dark', 'dark') }
  }

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme | null) || 'dark'
    setTheme(saved)
    apply(saved)
  }, [])

  const cycle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  }

  const label = theme === 'light' ? 'Light' : 'Dark'
  const Icon = theme === 'light' ? Sun : Moon

  return (
    <button
      onClick={cycle}
      className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm border border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur hover:bg-white/90 dark:hover:bg-black/60"
      title={`Theme: ${label}`}
      aria-label="Toggle theme"
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}