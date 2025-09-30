'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Slide = {
  src: string
  alt: string
  caption: string
}

const slides: Slide[] = [
  {
    src: '/images/workshops/workshop-1.jpg',
    alt: 'ESSAI ML Bootcamp at UIK',
    caption: 'Machine Learning at ESSAI ML Bootcamp — UIK campus.',
  },
  {
    src: '/images/workshops/workshop-2.jpg',
    alt: 'Introduction to Machine Learning session',
    caption: 'Introduction to Machine Learning — fundamentals and workflows.',
  },
  {
    src: '/images/workshops/workshop-3.jpg',
    alt: 'Model deployment workshop',
    caption: 'Model deployment — FastAPI, Docker, and CI basics.',
  },
  {
    src: '/images/workshops/workshop-4.jpg',
    alt: 'Reinforcement Learning workshop',
    caption: 'Reinforcement Learning — Q‑Learning intro and hands‑on demos.',
  },
  {
    src: '/images/workshops/workshop-5.jpg',
    alt: 'Mentor at IEEE ISIMM AI Serenity Hackathon',
    caption: 'Mentor — IEEE ISIMM AI Serenity Hackathon.',
  },
  {
    src: '/images/workshops/workshop-6.jpg',
    alt: 'Engineering Road at IPEIN orientation forum',
    caption:
      'Engineering Road — IPEIN: presented ESSAI and spoke about Data Science & ML at the orientation forum (speaker).',
  },
]

export default function TrainingExperience() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const total = slides.length

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index])

  // Touch swipe
  const startX = useRef<number | null>(null)
  const threshold = 40
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > threshold) {
      if (dx < 0) next()
      else prev()
    }
    startX.current = null
  }

  const prev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + total) % total)
  }
  const next = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % total)
  }

  const variants = {
    enter: (dir: 1 | -1) => ({ x: dir === 1 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir === 1 ? -40 : 40, opacity: 0 }),
  }

  const dots = useMemo(() => Array.from({ length: total }, (_, k) => k), [total])

  return (
    <section id="training-experience" className="section">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Left: smaller image carousel with arrows and caption UNDER the image */}
          <div
            className="card p-0 overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* Slightly smaller aspect ratio to keep it compact */}
            <div className="relative aspect-[4/3]">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={slides[index].src}
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={variants}
                  transition={{ duration: 0.28 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slides[index].src}
                    alt={slides[index].alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 560px, (min-width: 640px) 80vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Arrows */}
              <button
                aria-label="Previous"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/85 dark:bg-neutral-900/70 hover:bg-white dark:hover:bg-neutral-900 text-gray-900 dark:text-white rounded-full p-2 ring-1 ring-black/10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                aria-label="Next"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/85 dark:bg-neutral-900/70 hover:bg-white dark:hover:bg-neutral-900 text-gray-900 dark:text-white rounded-full p-2 ring-1 ring-black/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Caption under image */}
            <div className="p-4 text-sm text-muted">
              {slides[index].caption}
            </div>

            {/* Dots */}
            <div className="pb-4 flex justify-center gap-2">
              {dots.map((d) => (
                <button
                  key={d}
                  aria-label={`Go to slide ${d + 1}`}
                  onClick={() => {
                    setDirection(d > index ? 1 : -1)
                    setIndex(d)
                  }}
                  className={`h-2.5 w-2.5 rounded-full ${d === index ? 'bg-indigo-600' : 'bg-white/30 dark:bg-white/10'}`}
                />
              ))}
            </div>
          </div>

          {/* Right: text block about workshops/training */}
          <div className="card p-6 flex flex-col justify-center">
            <h2>Training Experience</h2>
            <p className="mt-3 text-sm text-muted">
              I led 10+ workshops across Tunisian engineering schools, focusing on practical AI and end‑to‑end delivery.
              Topics included LLMs and RAG, agentic AI with LangGraph, NLP, Computer Vision, and deployment.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              <li>• Hands‑on sessions with projects and starter repos.</li>
              <li>• Live demos, Q&amp;A, and mentorship for student teams.</li>
              <li>• From data prep to APIs and Dockerized deployment.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}