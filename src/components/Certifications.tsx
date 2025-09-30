'use client'

import Image from 'next/image'

const certs = [
  { title: 'Efficient Large Language Model (LLM) Customization', issuer: 'NVIDIA', date: 'Oct 2024', logo: '/images/logos/nvidia.png', id: 'yv0N93GyTiir15JfKx_UuQ' },
  { title: 'Advanced Learning Algorithms', issuer: 'Coursera', date: 'Aug 2024', logo: '/images/logos/coursera.png' },
  { title: 'Machine Learning Specialization', issuer: 'DeepLearning.AI', date: 'Aug 2024', logo: '/images/logos/deeplearningai.png' },
  { title: 'NLP with Classification and Vector Spaces', issuer: 'DeepLearning.AI', date: 'Aug 2024', logo: '/images/logos/deeplearningai.png', id: 'W8HDJ4CUZI10' },
  { title: 'NLP with Probabilistic Models', issuer: 'DeepLearning.AI', date: 'Aug 2024', logo: '/images/logos/deeplearningai.png', id: 'I8Z0VY5PVDCJ' },
  { title: 'Neural Networks and Deep Learning', issuer: 'DeepLearning.AI', date: 'Jul 2024', logo: '/images/logos/deeplearningai.png', id: 'SM5JWHGWRVDM' },
  { title: 'Supervised ML: Regression and Classification', issuer: 'Coursera', date: 'Jul 2024', logo: '/images/logos/coursera.png' },
  { title: 'Unsupervised Learning, Recommenders, RL', issuer: 'Coursera', date: 'Jul 2024', logo: '/images/logos/coursera.png' },
  { title: 'Intro to NLP in Python', issuer: 'DataCamp', date: 'May 2024', logo: '/images/logos/datacamp.png' },
  { title: 'Django Web Framework', issuer: 'Meta', date: 'Apr 2024', logo: '/images/logos/meta.png', id: 'QCNUKCEVD3V8' },
  { title: 'Databases and SQL for DS with Python', issuer: 'IBM', date: 'Mar 2024', logo: '/images/logos/ibm.png', id: 'Z45QCWPXN2FQ' },
  { title: 'Data Analysis with R Programming', issuer: 'Google', date: 'Dec 2023', logo: '/images/logos/google.png', id: 'JPSNZ8SFKZJB' },
  { title: 'Google Data Analytics Professional', issuer: 'Google', date: 'Dec 2023', logo: '/images/logos/google.png' },
  { title: 'Preprocessing for ML in Python', issuer: 'DataCamp', date: 'Dec 2023', logo: '/images/logos/datacamp.png' },
  { title: 'Supervised Learning with scikit-learn', issuer: 'DataCamp', date: 'Nov 2023', logo: '/images/logos/datacamp.png' },
  { title: 'R Programming Intermediate', issuer: 'DataCamp', date: 'Sep 2023', logo: '/images/logos/datacamp.png' },
]

export default function Certifications() {
  return (
    <section id="certifications" className="section">
      <div className="container">
        <h2>Certifications</h2>
        <div className="h-scroll mt-6">
          <div className="flex gap-4 min-w-max pr-2">
            {certs.map((c, idx) => (
              <div key={`${c.title}-${c.date}`} className="card p-4 w-[380px]">
                <div className="flex items-center gap-3">
                  {/* Always white background for logos (light and dark mode), with subtle ring and shadow */}
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center bg-white dark:bg-white ring-1 ring-black/10 shadow-sm">
                    <Image
                      src={c.logo}
                      alt={c.issuer}
                      width={56}
                      height={56}
                      sizes="(min-width: 640px) 56px, 48px"
                      className="object-contain p-2"
                      quality={90}
                      priority={idx < 4}
                    />
                  </div>

                  <div>
                    <div className="font-semibold leading-tight">{c.title}</div>
                    <div className="text-xs text-muted">{c.issuer} • {c.date}</div>
                  </div>
                </div>

                {c.id && (
                  <div className="mt-2 text-xs text-muted">
                    Credential ID: <span className="kbd">{c.id}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}