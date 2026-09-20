'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <h2>Professional Experience</h2>

        <div className="mt-6 grid gap-4">
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="card p-5 flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="w-20 h-14 shrink-0 relative rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
              <Image
                src="/images/Companies/minotore.png"
                alt="MINOTORE"
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">Data Engineer — MINOTORE</h3>
                <span className="badge-primary">Sep 2026 – Present</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Full-time · Tunis, Tunisia · On-site
              </p>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="card p-5 flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="w-20 h-14 shrink-0 relative rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
              <Image
                src="/images/Companies/minotore.png"
                alt="MINOTORE"
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">AI Engineer Intern — MINOTORE</h3>
                <span className="badge-muted">Feb 2026 – Jul 2026</span>
              </div>
              <p className="mt-2 text-sm text-muted">
                Internship · Graduation project · Tunis, Tunisia · On-site
              </p>
              <p className="mt-3 text-sm text-muted">
                Developed an AI-assisted Applicant Tracking System for automated
                CV parsing, candidate scoring, and recruitment workflows.
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-muted space-y-1">
                <li>
                  Built a resume parsing pipeline combining document extraction,
                  OCR fallback, LLM-based structured extraction, and validation.
                </li>
                <li>
                  Developed candidate-job scoring using skills, experience,
                  education, languages, and semantic relevance.
                </li>
                <li>
                  Benchmarked extraction/OCR methods and semantic models to
                  select the final approaches used by the system.
                </li>
                <li>
                  Integrated the AI services with Odoo 16 and implemented
                  recruitment workflows, traceability, duplicate detection,
                  blacklist checks, and access control.
                </li>
              </ul>
            </div>
          </motion.article>

          {/* Huawei */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="card p-5 flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="w-20 h-14 shrink-0 relative rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
              {/* Upload to: public/images/logos/huawei.svg or .png */}
              <Image
                src="/images/Companies/huawei.png"
                alt="Huawei"
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">
                  Artificial Intelligence Intern — Huawei
                </h3>
                <span className="badge-muted">Jul 2025 – Aug 2025</span>
              </div>
              <p className="mt-2 text-sm text-muted">On-site</p>
              <ul className="mt-2 text-sm text-muted space-y-1">
                <li>
                  • Built a multi‑agent NL2SQL system for telecom data with{' '}
                  <span className="font-semibold">LangGraph</span>,{' '}
                  <span className="font-semibold">RAG</span>, and{' '}
                  <span className="font-semibold">ChromaDB</span>.
                </li>
                <li>
                  • Converted Excel metadata into a JSON data dictionary for
                  retrieval + SQL generation.
                </li>
                <li>
                  • Integrated LLMs, semantic retrieval with ChromaDB, and
                  LangGraph workflows for query generation and validation.
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Smart Conseil */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="card p-5 flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="w-20 h-14 shrink-0 relative rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
              {/* Upload to: public/images/logos/smart-conseil.svg or .png */}
              <Image
                src="/images/Companies/smart_conseil.png"
                alt="Smart Conseil"
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">
                  Data Science Intern — Smart Conseil
                </h3>
                <span className="badge-muted">Jun 2024 – Aug 2024</span>
              </div>
              <ul className="mt-2 text-sm text-muted space-y-1">
                <li>
                  • CV/NLP moderation:{' '}
                  <span className="font-semibold">YOLOv9</span> (Optuna tuning),
                  LSTM/BERT text models.
                </li>
                <li>
                  • Built real‑time pipelines with{' '}
                  <span className="font-semibold">FastAPI</span> and{' '}
                  <span className="font-semibold">Docker</span>.
                </li>
                <li>
                  • Comparative evaluations; visualization layers to turn API
                  outputs into insights.
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
