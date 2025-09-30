'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Menu, X, Github, Linkedin, Mail } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

type NavItem = { href: `#${string}`; label: string }

const navItems: NavItem[] = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#organizations', label: 'Leadership' }, // aka "Vie associative"
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('')

  const getHeaderH = () => {
    const el = document.getElementById('site-nav')
    return el ? el.offsetHeight : 64
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const headerH = getHeaderH()
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - 8
    window.scrollTo({ top: y, behavior: 'smooth' })
    history.replaceState(null, '', `#${id}`)
  }, [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      setTimeout(() => scrollToId(id), 0)
    }
  }, [scrollToId])

  useEffect(() => {
    const ids = navItems.map((n) => n.href.slice(1))
    const headerH = getHeaderH()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: `-${headerH + 24}px 0px -55% 0px`, threshold: 0.1 }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsOpen(false)
    scrollToId(href.replace('#', ''))
  }

  const desktopLinks = useMemo(
    () =>
      navItems.map((item) => {
        const isActive = active === item.href.slice(1)
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => onNavClick(e, item.href)}
            className={`text-sm transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-white font-medium'
                : 'text-muted hover:text-indigo-600 dark:hover:text-white'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </a>
        )
      }),
    [active]
  )

  const mobileLinks = useMemo(
    () =>
      navItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={(e) => onNavClick(e, item.href)}
          className="block text-muted hover:text-indigo-600"
        >
          {item.label}
        </a>
      )),
    []
  )

  return (
    <nav
      id="site-nav"
      className={`fixed top-0 w-full z-40 transition-all ${
        scrolled
          ? 'bg-white/85 dark:bg-black/60 backdrop-blur border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <a
        href="#about"
        onClick={(e) => onNavClick(e as any, '#about')}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-indigo-600 text-white px-3 py-1 rounded"
      >
        Skip to content
      </a>

      <div className="container">
        <div className="flex items-center justify-between py-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
              history.replaceState(null, '', '#')
            }}
            className="text-xl font-bold gradient-text"
            aria-label="Back to top"
          >
            Mohamed Dhia Betis — Portfolio
          </a>

          <div className="hidden md:flex items-center gap-6">
            {desktopLinks}
            <div className="h-5 w-px bg-white/20" />
            <ThemeToggle />
            <div className="h-5 w-px bg-white/20" />
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/meddhiabetis"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted hover:text-indigo-600 dark:hover:text-white"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com/in/mohamed-dhia-betis/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted hover:text-indigo-600 dark:hover:text-white"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:betis.mohamed.dhia@gmail.com"
                aria-label="Email"
                className="text-muted hover:text-indigo-600 dark:hover:text-white"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          <button
            onClick={() => setIsOpen((p) => !p)}
            className="md:hidden text-muted hover:text-indigo-600"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="md:hidden pb-4">
            <div className="card p-4 space-y-3">
              {mobileLinks}
              <div className="flex items-center justify-between pt-2">
                <ThemeToggle />
                <div className="flex gap-4">
                  <a
                    href="https://github.com/meddhiabetis"
                    aria-label="GitHub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href="https://linkedin.com/in/mohamed-dhia-betis/"
                    aria-label="LinkedIn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a href="mailto:betis.mohamed.dhia@gmail.com" aria-label="Email">
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}