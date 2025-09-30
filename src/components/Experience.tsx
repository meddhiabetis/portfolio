'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <h2>Professional Experience</h2>

        <div className="mt-6 grid gap-4">
          {/* Huawei */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="card p-5 flex flex-col sm:flex-row items-start gap-4"
          >
            <div className="w-14 h-14 relative rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
              {/* Upload to: public/images/logos/huawei.svg or .png */}
              <Image src="/images/Companies/huawei.png" alt="Huawei" fill className="object-contain p-2" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold">Artificial Intelligence Intern — Huawei</div>
                <span className="badge-muted">Jul–Aug 2025</span>
              </div>
              <ul className="mt-2 text-sm text-muted space-y-1">
                <li>• Built a multi‑agent NL2SQL system for telecom data with <span className="font-semibold">LangGraph</span>, <span className="font-semibold">RAG</span>, and <span className="font-semibold">ChromaDB</span>.</li>
                <li>• Converted Excel metadata into a JSON data dictionary for retrieval + SQL generation.</li>
                <li>• Integrated LLM reasoning, semantic retrieval, and validation in production‑like workflows.</li>
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
            <div className="w-14 h-14 relative rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
              {/* Upload to: public/images/logos/smart-conseil.svg or .png */}
              <Image src="/images/Companies/smart_conseil.png" alt="Smart Conseil" fill className="object-contain p-2" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold">Data Science Intern — Smart Conseil</div>
                <span className="badge-muted">Jun–Aug 2024</span>
              </div>
              <ul className="mt-2 text-sm text-muted space-y-1">
                <li>• CV/NLP moderation: <span className="font-semibold">YOLOv9</span> (Optuna tuning), LSTM/BERT text models.</li>
                <li>• Built real‑time pipelines with <span className="font-semibold">FastAPI</span> and <span className="font-semibold">Docker</span>.</li>
                <li>• Comparative evaluations; visualization layers to turn API outputs into insights.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}