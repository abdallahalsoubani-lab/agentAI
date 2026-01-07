'use client'

import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatMessage from '../ChatMessage'
import VoiceInput from '../VoiceInput'
import TTSToggle from '../TTSToggle'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isJson?: boolean
}

interface AlameedChatProps {
  onActionEvent: (action: any) => void
}

export default function AlameedChat({ onActionEvent }: AlameedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('sessionId')
      if (!id) {
        id = uuidv4()
        localStorage.setItem('sessionId', id)
      }
      return id
    }
    return uuidv4()
  })
  const [ttsEnabled, setTtsEnabled] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speak = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined') return
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ar-JO'
    utterance.rate = 0.9
    synth.speak(utterance)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'mode4',
          sessionId,
          message: text,
          includeHistory: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (!reader) throw new Error('No response body')

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.content) {
                fullContent += data.content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                )
              }

              if (data.done) {
                const isJson = data.messageType === 'action'

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, isJson, content: fullContent }
                      : msg
                  )
                )

                // Handle action
                if (isJson && data.action) {
                  handleAction(data.action)
                }

                // Speak non-JSON
                if (!isJson && ttsEnabled) {
                  speak(fullContent)
                }
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: 'عذراً، حدث خطأ. حاول مرة ثانية.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: any) => {
    try {
      switch (action.action) {
        case 'add_product':
          await fetch('/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
          })
          onActionEvent(action)
          break

        case 'update_product':
          await fetch('/api/cart/update', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
          })
          onActionEvent(action)
          break

        case 'remove_product':
          await fetch('/api/cart/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
          })
          onActionEvent(action)
          break

        case 'clear_cart':
          await fetch('/api/cart', {
            method: 'DELETE',
          })
          onActionEvent(action)
          break

        case 'order_batch':
          onActionEvent(action)
          break

        default:
          console.warn('Unknown action:', action.action)
      }
    } catch (error) {
      console.error('Action error:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleVoiceInput = (transcript: string) => {
    sendMessage(transcript)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[700px]">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Chat with Salma
        </h3>
        <TTSToggle enabled={ttsEnabled} onToggle={setTtsEnabled} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            مرحباً! كيف بقدر أساعدك اليوم؟
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
          />
          <VoiceInput onTranscript={handleVoiceInput} disabled={isLoading} />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            إرسال
          </button>
        </form>
      </div>
    </div>
  )
}
