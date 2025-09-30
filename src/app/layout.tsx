import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import ChatBot from '../components/ChatBot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mohamed Dhia Betis — AI / Data Science Portfolio',
  description:
    'AI/Data Science engineer passionate about applied AI, NLP, content safety and LLM systems. Projects in CV/NLP, agentic AI, and scalable backend.',
  authors: [{ name: 'Mohamed Dhia Betis' }],
  keywords: ['AI','Data Science','Machine Learning','NLP','Computer Vision','LLM','Generative AI','RAG','LangChain','FastAPI'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        <Footer />
        {/* Keep the floating chatbot available site-wide */}
        <ChatBot />
      </body>
    </html>
  )
}