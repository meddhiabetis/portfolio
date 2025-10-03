'use client'

import { useEffect, useMemo, useState } from 'react'
import { Github, ExternalLink, ChevronLeft, ChevronRight, Star, GitBranch, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types for slides
type ProjectCard = {
  name?: string
  description?: string
  tech?: string[]
  html_url?: string
  github?: string
  homepage?: string
  stars?: number
  forks?: number
  topics?: string[]
  workflow?: string
  updated_at?: string
}

// Curated slides (includes GitHub repos and external Kaggle notebooks)
const curatedBase: ProjectCard[] = [
  {
    name: 'Resume Screening System',
    github: 'meddhiabetis/resume-screening-django',
    description:
      'Django platform for resume ingestion and hybrid search (semantic + graph) with optional Gmail import.',
    workflow:
      'PDF/DOC/DOCX parsing → OCR fallback (Tesseract) → structure (skills/education/experience) → Pinecone semantic search + Neo4j relationships → advanced search UI with debug.',
    tech: ['Django', 'PostgreSQL', 'Pinecone', 'Neo4j', 'NLTK', 'spaCy', 'Sentence-Transformers', 'Celery', 'Redis', 'Tesseract', 'pdfminer.six', 'pdf2image', 'Google OAuth2'],
  },
  {
    name: 'YouTube Video Summarizer',
    github: 'meddhiabetis/youtube-video-summarizer',
    description:
      'End‑to‑end pipeline to transcribe and summarize educational videos with an interactive study assistant.',
    workflow:
      'Fetch YouTube → extract audio (FFmpeg) → Whisper transcription → LLM summarization → interactive Q&A in Streamlit.',
    tech: ['Streamlit', 'OpenAI Whisper', 'FFmpeg', 'Python', 'LLM'],
  },
  {
    name: 'LLM‑Powered Network Optimization Advisor',
    github: 'meddhiabetis/LLM-Powered-Network-Optimization-Advisor',
    description:
      'Dockerized API around a LoRA‑tuned Llama‑3‑8B for network KPI optimization suggestions.',
    workflow:
      'Receive KPI metrics → LLM (LoRA) reasoning → /optimize REST endpoint → health checks + env configuration (GPU‑ready).',
    tech: ['FastAPI', 'Docker', 'Llama‑3‑8B (LoRA)', 'CUDA', 'NVIDIA Toolkit'],
  },
  {
    name: 'AI vs Human Text Classification',
    // If you have a repo for this, set the "github" field like "owner/repo"
    description:
      'Django UI + notebooks to classify whether text is AI‑generated or human‑written using BERT and classical ML baselines.',
    workflow:
      'Preprocess → TF‑IDF + classical models → LSTM experiment → BERT fine‑tuning → export for serving in web app.',
    tech: ['Django', 'scikit‑learn', 'TensorFlow/Keras (LSTM)', 'BERT', 'Transformers'],
  },
  {
    name: 'Q‑Learning Agent in a Hazardous Grid World',
    homepage: 'https://www.kaggle.com/code/betismeddhia/q-learning-agent-in-a-hazardous-grid-world',
    description:
      'Reinforcement learning notebook implementing Q‑Learning in a stochastic, hazardous grid world.',
    workflow:
      'Define environment (states/rewards) → epsilon‑greedy exploration → Q‑table updates → convergence analysis and policy visualization.',
    tech: ['Python', 'NumPy', 'RL', 'Q‑Learning', 'Matplotlib'],
  },
  {
    name: 'Substance Use Survey — PCA/MCA & Clustering (R)',
    homepage: 'https://www.kaggle.com/code/betismeddhia/substance-use-survey-using-pca-mca-k-means',
    description:
      'Realised by Betis Mohamed Dhia • Supervised by Mr. Ghazi Bel Mufti. Statistical analysis of student substance use behaviors.',
    workflow:
      'EDA (pie/bar/correlation) → PCA • MCA → clustering (HCPC, k‑means) → interpret clusters and insights for potential interventions.',
    tech: ['R', 'tidyverse', 'FactoMineR', 'factoextra', 'Cluster analysis'],
  },
  {
    name: 'African Credit Scoring Challenge',
    homepage: 'https://www.kaggle.com/code/betismeddhia/african-credit-scoring-challenge',
    description:
      'Imbalanced credit scoring notebook applying ML techniques and evaluation tailored for skewed classes.',
    workflow:
      'EDA → preprocessing & imbalance handling → model training (tree/boosting ensembles) → metrics (ROC AUC, PR‑AUC) and comparison.',
    tech: ['Python', 'Pandas', 'scikit‑learn', 'XGBoost/LightGBM', 'Imbalanced‑learn'],
  },
]

export default function ProjectsCarousel() {
  const [slides, setSlides] = useState<ProjectCard[]>(curatedBase)
  const [i, setI] = useState(0)

  // Enrich GitHub-backed projects with stars, forks, topics, and links
  useEffect(() => {
    const withGithub = curatedBase.filter((p) => !!p.github)
    if (!withGithub.length) return

    const controller = new AbortController()
    ;(async () => {
      try {
        const results: ProjectCard[] = await Promise.all(
          withGithub.map(async (p) => {
            const res = await fetch(`https://api.github.com/repos/${p.github}`, { signal: controller.signal })
            if (!res.ok) return { name: p.name }
            const data = await res.json()
            return {
              name: p.name,
              stars: data.stargazers_count,
              forks: data.forks_count,
              topics: Array.isArray(data.topics) ? data.topics.slice(0, 6) : [],
              html_url: data.html_url,
              homepage: data.homepage || p.homepage,
              updated_at: data.updated_at,
            }
          })
        )

        setSlides((prev) =>
          prev.map((p) => {
            const match = results.find((r) => r.name === p.name)
            return match ? { ...p, ...match } : p
          })
        )
      } catch {
        // ignore fetch aborts or rate limits; keep curated content
      }
    })()

    return () => controller.abort()
  }, [])

  const emptyProject: ProjectCard = { name: 'Project', description: '', tech: [] }
  const current: ProjectCard = slides[i] ?? emptyProject
  const canPrev = i > 0
  const canNext = i < slides.length - 1
  const dots = useMemo(() => Array.from({ length: slides.length }, (_, k) => k), [slides.length])

  return (
    <section id="projects" className="section">
      <div className="container">
        <h2>Projects</h2>
        <p className="mt-2 text-muted max-w-3xl">
          Selected projects with brief workflow summaries and <span className="font-semibold">highlighted technologies</span>.
          Swipe or use the arrows to browse.
        </p>

        {slides.length === 0 ? (
          <div className="mt-6 card p-6 text-muted">Loading projects…</div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <button
                className="btn px-3 py-2 border rounded-md disabled:opacity-40"
                onClick={() => setI((p) => (p > 0 ? p - 1 : p))}
                disabled={!canPrev}
                aria-label="Previous project"
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <div className="text-sm text-muted">{i + 1} / {slides.length}</div>
              <button
                className="btn px-3 py-2 border rounded-md disabled:opacity-40"
                onClick={() => setI((p) => (p < slides.length - 1 ? p + 1 : p))}
                disabled={!canNext}
                aria-label="Next project"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl">
              <AnimatePresence mode="wait">
                <motion.article
                  key={current.name ?? 'empty'}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="card p-6"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {current.name ?? 'Project'}
                      </h3>

                      <p className="mt-2 text-sm text-muted">
                        {current.description ?? 'Project description coming soon.'}
                      </p>

                      {/* Tech highlights */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(current.tech ?? []).map((t) => (
                          <span key={t} className="badge-primary">{t}</span>
                        ))}
                        {(current.topics ?? []).map((t) => (
                          <span key={t} className="badge-muted">{t}</span>
                        ))}
                      </div>

                      {/* Meta (show only if available) */}
                      {(typeof current.stars === 'number' || typeof current.forks === 'number' || current.updated_at) && (
                        <div className="mt-4 flex items-center gap-4 text-sm text-muted">
                          {typeof current.stars === 'number' && (
                            <span className="inline-flex items-center gap-1">
                              <Star size={14} /> {current.stars}
                            </span>
                          )}
                          {typeof current.forks === 'number' && (
                            <span className="inline-flex items-center gap-1">
                              <GitBranch size={14} /> {current.forks}
                            </span>
                          )}
                          {current.updated_at && <span>Updated {new Date(current.updated_at as string).toLocaleDateString()}</span>}
                        </div>
                      )}
                    </div>

                    <div className="w-full md:w-60 flex md:flex-col gap-3">
                      {current.html_url || current.github ? (
                        <a
                          href={current.html_url || (current.github ? `https://github.com/${current.github}` : '#')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary w-full px-4 py-2"
                        >
                          <Github size={16} /> Code
                        </a>
                      ) : (
                        <div className="w-full px-4 py-2 rounded border text-muted flex items-center justify-center gap-2">
                          <Sparkles size={16} /> Notebook / internal
                        </div>
                      )}

                      {current.homepage && (
                        <a
                          href={current.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline w-full px-4 py-2"
                        >
                          <ExternalLink size={16} /> View
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Workflow */}
                  {current.workflow && (
                    <p className="mt-4 text-sm text-muted">
                      <span className="font-semibold">Workflow:</span> {current.workflow}
                    </p>
                  )}
                </motion.article>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {dots.map((d) => (
                <button
                  key={d}
                  onClick={() => setI(d)}
                  className={`h-2.5 w-2.5 rounded-full ${d === i ? 'bg-indigo-600' : 'bg-white/30 dark:bg-white/10'}`}
                  aria-label={`Go to project ${d + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}