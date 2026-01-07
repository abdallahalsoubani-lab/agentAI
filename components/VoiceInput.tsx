'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if Web Speech API is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    // Initialize recognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'ar-SA' // Arabic
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onTranscript])

  const toggleRecording = () => {
    if (!recognitionRef.current || disabled) return

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="p-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
        title="Voice input not supported in this browser"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
          <line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} />
        </svg>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${
        isRecording
          ? 'bg-red-600 text-white recording-pulse'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  )
}
