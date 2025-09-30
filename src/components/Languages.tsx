'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

type Lang = {
  flagSrc?: string // local image under /public
  code: string     // 2-letter fallback shown if image fails
  name: string
  level: string
}

const languages: Lang[] = [
  { flagSrc: '/images/flags/tn.svg', code: 'TN', name: 'Arabic',  level: 'Native' },
  { flagSrc: '/images/flags/gb.svg', code: 'EN', name: 'English', level: 'Fluent' },
  { flagSrc: '/images/flags/fr.svg', code: 'FR', name: 'French',  level: 'Certified (DELF B2)' },
  { flagSrc: '/images/flags/es.svg', code: 'ES', name: 'Spanish', level: 'Elementary' },
]

function FlagBadge({ src, code, label }: { src?: string; code: string; label: string }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className="relative h-10 w-10 rounded-lg bg-white dark:bg-white ring-1 ring-black/10 shadow-sm overflow-hidden flex items-center justify-center">
      {!src || broken ? (
        <span className="text-[10px] font-semibold text-gray-700">{code}</span>
      ) : (
        <Image
          src={src}
          alt={`${label} flag`}
          fill
          sizes="40px"
          className="object-contain p-1.5"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  )
}

export default function Languages() {
  return (
    <section id="languages" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <h2>Languages</h2>
          <p className="mt-2 text-muted">Arabic, English, French, and Spanish.</p>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {languages.map((l, idx) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3">
                <FlagBadge src={l.flagSrc} code={l.code} label={l.name} />
                <div className="min-w-0">
                  <div className="font-semibold leading-tight truncate">{l.name}</div>
                  <div className="text-sm text-muted truncate">{l.level}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}