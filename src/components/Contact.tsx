'use client'

import { useState } from 'react'
import { Send, Mail, MapPin } from 'lucide-react'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvgwanoz'

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setOk(null); setErr(null)

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setOk("Thanks! I'll get back to you soon.")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (e) {
      setErr('Something went wrong. Please try again or email me directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <h2>Let’s Contact</h2>
        <p className="mt-2 text-muted max-w-3xl">
          Reach out for collaborations, workshops, or any questions.
        </p>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted">
                <Mail size={18} /> betis.mohamed.dhia@gmail.com
              </div>
              <div className="flex items-center gap-3 text-muted">
                <MapPin size={18} /> Tunis, Tunisia
              </div>
              <ul className="mt-4 text-muted">
                <li>• AI/ML project development</li>
                <li>• LLM apps and RAG systems</li>
                <li>• Full‑stack APIs & inference</li>
              </ul>
            </div>
          </div>

          <form onSubmit={onSubmit} className="card p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/70 dark:bg-white/5"
                placeholder="Name *"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/70 dark:bg-white/5"
                placeholder="Email *"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <input
              className="mt-4 w-full px-3 py-2 rounded-lg border border-white/10 bg-white/70 dark:bg-white/5"
              placeholder="Subject *"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <textarea
              className="mt-4 w-full px-3 py-2 rounded-lg border border-white/10 bg-white/70 dark:bg-white/5 min-h-[140px]"
              placeholder="Message *"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full mt-4 py-3 disabled:opacity-50"
            >
              <Send size={18} />
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>

            {ok && <div className="mt-3 text-sm text-emerald-600">{ok}</div>}
            {err && <div className="mt-3 text-sm text-rose-600">{err}</div>}
          </form>
        </div>
      </div>
    </section>
  )
}