'use client'

import Image from 'next/image'

const items = [
  {
    school:
      'Higher School of Statistics and Information Analysis (ESSAI), University of Carthage',
    degree: 'Engineering Degree (Statistics & Data Science) — in progress',
    period: '2023–2026 (expected)',
    logo: '/images/Schools/essai.png',
  },
  {
    school:
      'Preparatory Institute for Engineering Studies of Nabeul (IPEIN)',
    degree: 'Preparatory Cycle (Mathematics & Physics) — ranked top ~30%',
    period: '2021–2023',
    logo: '/images/Schools/ipein.png',
  },
  {
    school: 'Abou Kacem Chebbi High School (Medjez el Bab)',
    degree: 'Mathematics Baccalaureate — average 15.07/20',
    period: '2021',
    logo: '/images/Schools/bac.png',
  },
]

export default function Education() {
  return (
    <section id="education" className="section">
      <div className="container">
        <h2>Education</h2>

        {/* Vertical list, one item per row */}
        <div className="mt-6 space-y-4">
          {items.map((e) => (
            <div key={e.school} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Left: logo + school/degree */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded bg-white dark:bg-white ring-1 ring-black/10 overflow-hidden flex-shrink-0">
                    <Image
                      src={e.logo}
                      alt={`${e.school} logo`}
                      fill
                      sizes="40px"
                      className="object-contain p-1.5"
                      quality={90}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight truncate">
                      {e.school}
                    </div>
                    <div className="text-sm text-muted">
                      {e.degree}
                    </div>
                  </div>
                </div>

                {/* Right: period (top-right) */}
                <div className="text-xs md:text-sm text-muted whitespace-nowrap">
                  {e.period}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}