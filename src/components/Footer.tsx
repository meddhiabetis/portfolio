'use client'

import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">Mohamed Dhia Betis</div>
            <div className="text-sm text-muted">AI / Data Science — LLMs, NLP, CV, Backend</div>
          </div>
          <div className="flex items-center gap-4 text-muted">
            <a href="https://github.com/meddhiabetis" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <Github size={18} />
            </a>
            <a href="https://linkedin.com/in/mohamed-dhia-betis/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="mailto:betis.mohamed.dhia@gmail.com" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs text-muted">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  )
}