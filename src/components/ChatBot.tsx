'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm Mohamed Dhia Betis’s AI assistant. I can answer questions about his skills, experience, education, certifications, and projects. What would you like to know?",
      isBot: true,
      timestamp: new Date(),
      welcome: true,
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  const handleSendMessage = async () => {
    const text = inputValue.trim()
    if (!text) return

    const userMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date(),
      welcome: false,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const history = messages.slice(-3).map(m => ({
        role: m.isBot ? 'assistant' : 'user',
        content: m.text,
      }))

      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, top_k: 6, messages: history })
      })

      if (!res.ok) {
        // Friendly error message on server-side failure
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      const answer = data?.answer ?? 'No answer.'
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: answer,
        isBot: true,
        timestamp: new Date(),
        welcome: false,
      }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      // Show user-friendly message instead of raw error
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: 'The AI assistant is not available at the moment. Please try again later.',
        isBot: true,
        timestamp: new Date(),
        welcome: false,
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-colors z-50 ring-1 ring-black/10"
        aria-label="Toggle chatbot"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-40 dark:bg-neutral-900 dark:border-neutral-800"
          >
            <div className="bg-brand-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-medium">AI Assistant</h3>
                  <p className="text-sm opacity-90">Ask me about Mohamed Dhia</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${message.isBot ? (message.welcome ? 'chat-welcome' : 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-100') : 'bg-brand-600 text-white'}`}>
                    <div className="flex items-start gap-2">
                      {message.isBot ? <Bot size={16} className="mt-0.5 flex-shrink-0" /> : <User size={16} className="mt-0.5 flex-shrink-0" />}
                      <div>
                        {message.welcome && <div className="badge-new mb-1">New</div>}
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-neutral-100 p-3 rounded-lg max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot size={16} />
                      <div className="flex gap-1">
                        <div className="chat-typing-dot" />
                        <div className="chat-typing-dot" />
                        <div className="chat-typing-dot" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white dark:bg-neutral-900"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}