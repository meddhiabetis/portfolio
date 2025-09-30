'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Download, MessageCircle } from 'lucide-react'

const stats = [
  { big: 'Final‑Year Student', small: 'Statistics & Data Science (Engineering degree.)' },
  { big: 'AI • LLMs • ML', small: 'Core focus' },
  { big: 'Community Trainer', small: 'ML/NLP/CV sessions' },
]

const Hero = () => {
  return (
    <section className="section pt-28">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm uppercase tracking-wide text-muted">AI / Data Science</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-extrabold">
              Hi, I&apos;m <span className="gradient-text">Mohamed Dhia Betis</span>
            </h1>
            <p className="mt-4 text-lg text-muted">
              Final-year engineering student at ESSAI, focused on NLP, CV, and LLM systems.
              Experience in Generative AI, RAG, agentic AI, and scalable backends.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="/docs/MohamedDhia_Betis_CV.pdf" className="btn btn-primary px-5 py-3" download>
                <Download size={18} aria-hidden="true" />
                Download Resume
              </a>
              <a href="#contact" className="btn btn-outline px-5 py-3">
                <MessageCircle size={18} aria-hidden="true" />
                Let&apos;s Talk
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((m) => (
                <div key={m.big} className="card p-4">
                  <div className="text-lg md:text-xl font-bold leading-snug">{m.big}</div>
                  <div className="text-xs text-muted">{m.small}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative flex justify-center"
          >
            {/* Fixed-size image to avoid layout jump */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-fuchsia-500/30 blur-2xl" />
              <Image
                src="/images/profile.jpg"
                alt="Portrait of Mohamed Dhia Betis"
                width={320}
                height={320}
                sizes="(min-width: 768px) 20rem, 16rem"
                className="relative rounded-2xl ring-4 ring-indigo-600/20 object-cover shadow-[0_20px_35px_rgba(0,0,0,0.25)]"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero