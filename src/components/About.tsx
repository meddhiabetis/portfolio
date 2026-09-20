'use client'

import { motion } from 'framer-motion'
import { Cpu, Rocket, Users } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="section">
      {/* Respect the site container padding like other sections */}
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <h2>About Me</h2>

          <p className="mt-4 text-muted leading-relaxed max-w-5xl">
            <span className="font-semibold">Data Engineer at MINOTORE</span> and
            Data Science Engineer graduate from ESSAI, with a strong interest in
            AI, Large Language Models, and Generative AI. Experienced in machine
            learning, NLP, and computer vision, with hands-on projects in RAG,
            multi-agent systems, and AI deployment. Former Vice Chairman of
            ESSAI Machine Learning Club, where I led workshops and mentored
            students.
          </p>

          {/* Three equal cards on one row (md+), stacked on mobile */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Core Focus */}
            <div className="card p-6 h-full">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <div className="font-semibold">Core Focus</div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                <li>• Data engineering, AI, and LLMs</li>
                <li>• Agentic AI (LangGraph) and RAG workflows</li>
                <li>• Reinforcement Learning (applied interest)</li>
                <li>• Computer Vision and NLP</li>
                <li>• Backend APIs: FastAPI, Django</li>
                <li>• Deployment & Dev: Docker, CI basics</li>
              </ul>
            </div>

            {/* Highlights */}
            <div className="card p-6 h-full">
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-indigo-600" />
                <div className="font-semibold">Highlights</div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                <li>• Engineering graduate — ESSAI, 2026</li>
                <li>
                  • MINOTORE graduation project (2026): CV parsing, semantic
                  scoring, and recruitment workflows
                </li>
                <li>
                  • AI Intern at Huawei (2025): multi‑agent NL2SQL with
                  LangGraph, RAG, ChromaDB
                </li>
                <li>
                  • Data Science Intern at Smart Conseil (2024): CV/NLP
                  pipelines; FastAPI + Docker
                </li>
                <li>• Kaggle Expert</li>
                <li>• Multilingual: Arabic, English, French, some Spanish</li>
              </ul>
            </div>

            {/* Leadership */}
            <div className="card p-6 h-full">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <div className="font-semibold">Leadership</div>
              </div>
              <div className="mt-3 text-sm text-muted space-y-1.5">
                <p>
                  Vice Chairman @ ESSAI ML Club (2024–2025): led{' '}
                  <span className="font-medium">10+ workshops</span> across
                  Tunisian engineering schools (ESSAI, ENIT, ENICAR, ISIMM,
                  UIK).
                </p>
                <ul className="list-none space-y-1">
                  <li>
                    • AI topics: ML, NLP, CV, LLMs; hands‑on labs and mentorship
                  </li>
                  <li>
                    • Organized hackathons, speaker sessions, and community
                    events
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
