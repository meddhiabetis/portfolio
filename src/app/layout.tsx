import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ChatBot from '../components/ChatBot'
import MotionProvider from '../components/MotionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mohamed Dhia Betis — Data Engineer | AI & LLM Engineering',
  description:
    'Data Engineer at MINOTORE with a background in AI, LLMs, NLP, RAG, backend engineering, and production-oriented AI systems.',
  metadataBase: new URL('https://mohameddhiabetis.vercel.app'),
  openGraph: {
    title: 'Mohamed Dhia Betis — Data Engineer | AI & LLM Engineering',
    description:
      'Data Engineer at MINOTORE with a background in AI, LLMs, NLP, RAG, backend engineering, and production-oriented AI systems.',
    url: 'https://mohameddhiabetis.vercel.app/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mohamed Dhia Betis — Data Engineer | AI & LLM Engineering',
    description:
      'Data Engineer at MINOTORE with a background in AI, LLMs, NLP, RAG, backend engineering, and production-oriented AI systems.',
  },
  authors: [{ name: 'Mohamed Dhia Betis' }],
  keywords: [
    'Data Engineering',
    'Python',
    'SQL',
    'AI',
    'Data Science',
    'Machine Learning',
    'NLP',
    'LLM',
    'Generative AI',
    'RAG',
    'LangGraph',
    'LangChain',
    'FastAPI',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MotionProvider>
          <Navigation />
          <main>{children}</main>
          <Footer />
          {/* Keep the floating chatbot available site-wide */}
          <ChatBot />
        </MotionProvider>
      </body>
    </html>
  )
}
