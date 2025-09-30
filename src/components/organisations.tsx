'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const clubs = [
  {
    name: 'ESSAI Machine Learning Club',
    logo: '/images/Clubs/essai-ml.svg',
    role: 'Vice Chairman (May 2024 – May 2025) • Member (Sep 2023 – May 2024)',
    desc: 'Led 10+ workshops across ESSAI, ENIT, ENICAR, ISIMM, UIK and online; mentored teams; coordinated events and speaker sessions.',
  },
  {
    name: 'Enactus ESSAI',
    logo: '/images/Clubs/enactus.png',
    role: 'Member (Sep 2024 – May 2025)',
    desc: 'Contributed to a lung cancer detection project using computer vision on CT scans with healthcare collaborators.',
  },
  {
    name: 'IEEE Computer Society — INSAT SBC',
    logo: '/images/Clubs/ieee.svg',
    role: 'Member (Sep 2023 – Sep 2024)',
    desc: 'Ambassador of DataQuest 2024; participated in technical activities and community events.',
  },
  {
    name: 'ACM INSAT Student Chapter',
    logo: '/images/Clubs/acm-insat.png',
    role: 'Participant (Sep 2023 – May 2024)',
    desc: 'Competitive programming contests; strengthened algorithmic thinking and problem‑solving.',
  },
  {
    name: 'TPL IPEIN',
    logo: '/images/Clubs/tpl.jpg',
    role: 'Oct 2021 – May 2022',
    desc: 'Helped organize Engineering Road V5.0.',
  },
  {
    name: 'Jeunes et Sciences — Medjez El Bab',
    logo: '/images/Clubs/jeunes_et_sciences.jpg',
    role: 'Sep 2014 – Jul 2016',
    desc: 'Organized Nuit Des Étoiles 2015 and community science events.',
  },
]

export default function Organizations() {
  return (
    <section id="organizations" className="section">
      <div className="container">
        <h2>Organizations & Clubs</h2>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((c) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="card p-5"
            >
              <div className="flex items-start gap-3">
                {/* Always white background for logos for contrast in dark mode */}
                <div className="relative w-10 h-10 rounded bg-white dark:bg-white ring-1 ring-black/10 overflow-hidden flex-shrink-0">
                  <Image
                    src={c.logo}
                    alt={`${c.name} logo`}
                    fill
                    sizes="40px"
                    className="object-contain p-1.5"
                    quality={90}
                  />
                </div>
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted">{c.role}</div>
                  <p className="mt-2 text-sm text-muted">{c.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}