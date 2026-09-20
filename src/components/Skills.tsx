'use client'

import { motion } from 'framer-motion'

const groups = [
  {
    title: 'Programming & AI',
    skills: [
      'Python',
      'PyTorch',
      'TensorFlow',
      'Scikit‑learn',
      'R',
      'Java',
      'Computer Vision',
    ],
  },
  {
    title: 'LLM & GenAI',
    skills: [
      'RAG',
      'LangGraph',
      'LangChain',
      'NLP',
      'Transformers',
      'Embeddings',
      'PEFT/LoRA',
      'Prompting',
    ],
  },
  {
    title: 'Backend & Deployment',
    skills: [
      'Docker',
      'Odoo',
      'Django',
      'Flask',
      'GitHub Actions',
      'REST APIs',
      'CI/CD',
    ],
  },
  {
    title: 'Data & Visualization',
    skills: ['PostgreSQL', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <h2>Skills</h2>
        <div className="mt-6 card p-5">
          <h3 className="font-semibold">Primary Skills</h3>
          <ul className="mt-3 flex flex-wrap gap-3">
            {[
              'Python',
              'Data Engineering',
              'Large Language Models (LLMs)',
              'SQL',
              'FastAPI',
            ].map((skill) => (
              <li
                key={skill}
                className="rounded-lg bg-indigo-100 px-3 py-2 font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((g) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="card p-5"
            >
              <div className="font-semibold">{g.title}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {g.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded border border-white/10 bg-white/70 dark:bg-white/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
