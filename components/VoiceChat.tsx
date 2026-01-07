'use client'

import { useState, useEffect, useRef } from 'react'

interface VoiceChatProps {
  mode: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// OpenAI Realtime API Voice Options (Updated 2024)
const VOICES = {
  male: [
    { id: 'alloy', name: 'Alloy - متوازن', description: 'صوت ذكوري متوازن ومحايد' },
    { id: 'echo', name: 'Echo - دافئ', description: 'صوت ذكوري دافئ وودود' },
    { id: 'ballad', name: 'Ballad - ناعم', description: 'صوت ذكوري ناعم ومريح' },
    { id: 'ash', name: 'Ash - قوي', description: 'صوت ذكوري قوي وواضح' },
    { id: 'verse', name: 'Verse - معبّر', description: 'صوت ذكوري معبّر ومميز' },
  ],
  female: [
    { id: 'shimmer', name: 'Shimmer - ناعم', description: 'صوت أنثوي ناعم ومريح' },
    { id: 'coral', name: 'Coral - مرح', description: 'صوت أنثوي مرح وحيوي' },
    { id: 'sage', name: 'Sage - هادئ', description: 'صوت أنثوي هادئ ومطمئن' },
    { id: 'marin', name: 'Marin - واضح', description: 'صوت أنثوي واضح ومباشر' },
    { id: 'cedar', name: 'Cedar - دافئ', description: 'صوت أنثوي دافئ وودود' },
  ],
}

// Default voice mapping based on persona (Updated voices)
const DEFAULT_VOICES = {
  mode1: 'alloy',     // Amjad Saudi - Male
  mode2: 'echo',      // Amjad Jordan - Male  
  mode3: 'shimmer',   // Noura - Female (nova removed, using shimmer)
  mode4: 'coral',     // Salma - Female (using coral for energetic)
}

// Gender mapping
const PERSONA_GENDER = {
  mode1: 'male',
  mode2: 'male',
  mode3: 'female',
  mode4: 'female',
}

export default function VoiceChat({ mode }: VoiceChatProps) {
  const personaGender = PERSONA_GENDER[mode as keyof typeof PERSONA_GENDER] || 'male'
  const defaultVoice = DEFAULT_VOICES[mode as keyof typeof DEFAULT_VOICES] || 'alloy'
  
  const [selectedVoice, setSelectedVoice] = useState<string>(defaultVoice)
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('غير متصل')
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioQueueRef = useRef<Int16Array[]>([])
  const isPlayingRef = useRef(false)
  
  // Update selected voice when mode changes
  useEffect(() => {
    setSelectedVoice(defaultVoice)
  }, [mode, defaultVoice])

  const connectToOpenAI = async () => {
    try {
      setError(null)
      setStatus('جاري الاتصال...')
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 24000,
        }
      })
      mediaStreamRef.current = stream

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 })
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256

      // Get ephemeral API key
      const response = await fetch('/api/realtime-token')
      const { token } = await response.json()

      // Connect to OpenAI Realtime API
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${token}`, 'openai-beta.realtime-v1']
      )

      wsRef.current = ws

      ws.onopen = async () => {
        console.log('Connected to OpenAI Realtime API')
        setIsConnected(true)
        setStatus('متصل - جاهز للاستماع')
        
        // Load system prompt
        const instructions = await getSystemPrompt()
        
        // Configure session with enhanced settings
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: instructions + '\n\n⚠️ CRITICAL VOICE RULES:\n- When user speaks, STOP immediately and listen\n- NEVER interrupt the user\n- Stay 100% within the system prompt\n- Keep conversation history and context\n- Respond naturally and quickly',
            voice: selectedVoice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 700,
              create_response: true,
            },
            temperature: 0.7,
            max_response_output_tokens: 4096,
          },
        }))

        // Start sending audio
        startAudioStream()
        startAudioLevelMonitoring()
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleRealtimeEvent(data)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('حدث خطأ في الاتصال')
        setStatus('خطأ في الاتصال')
      }

      ws.onclose = () => {
        console.log('Disconnected from OpenAI')
        setIsConnected(false)
        setIsListening(false)
        setIsSpeaking(false)
        setStatus('غير متصل')
      }

    } catch (error) {
      console.error('Error connecting:', error)
      setError('فشل الاتصال - تحقق من المفتاح')
      setStatus('فشل الاتصال')
    }
  }

  const getSystemPrompt = async () => {
    try {
      const response = await fetch(`/api/prompt?mode=${mode}`)
      const data = await response.json()
      return data.prompt || `أنت مساعد صوتي ذكي. تحدث بشكل طبيعي وواضح.`
    } catch (error) {
      console.error('Error loading prompt:', error)
      return `أنت مساعد صوتي ذكي. تحدث بشكل طبيعي وواضح.`
    }
  }

  const handleRealtimeEvent = (event: any) => {
    switch (event.type) {
      case 'session.created':
      case 'session.updated':
        console.log('Session ready')
        break

      case 'input_audio_buffer.speech_started':
        setIsListening(true)
        setIsSpeaking(false) // Stop AI speaking when user starts
        setStatus('🎤 يستمع...')
        
        // Cancel any ongoing response (only if there's an active response)
        if (wsRef.current?.readyState === WebSocket.OPEN && isSpeaking) {
          try {
            wsRef.current.send(JSON.stringify({
              type: 'response.cancel'
            }))
          } catch (e) {
            // Ignore cancellation errors
            console.log('Cancellation not needed or already done')
          }
        }
        break

      case 'input_audio_buffer.speech_stopped':
        setIsListening(false)
        setStatus('⏳ يفكر...')
        break
      
      case 'response.audio.done':
        setIsSpeaking(false)
        setStatus('✅ جاهز - تحدث الآن')
        break

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setMessages(prev => [...prev, { role: 'user', content: event.transcript }])
        }
        break

      case 'response.audio.delta':
        if (event.delta) {
          const audioData = base64ToInt16Array(event.delta)
          audioQueueRef.current.push(audioData)
          if (!isPlayingRef.current) {
            playAudioQueue()
          }
        }
        break

      case 'response.audio_transcript.delta':
        // Optionally display assistant transcript
        break

      case 'response.done':
        setStatus('✅ جاهز - تحدث الآن')
        if (event.response?.output?.[0]?.content?.[0]?.transcript) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: event.response.output[0].content[0].transcript
          }])
        }
        break

      case 'error':
        console.error('API Error:', event.error)
        setError(event.error?.message || 'حدث خطأ')
        break
    }
  }

  const startAudioStream = () => {
    if (!mediaStreamRef.current || !wsRef.current) return

    const audioContext = new AudioContext({ sampleRate: 24000 })
    const source = audioContext.createMediaStreamSource(mediaStreamRef.current)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)

    source.connect(processor)
    processor.connect(audioContext.destination)

    processor.onaudioprocess = (e) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

      const inputData = e.inputBuffer.getChannelData(0)
      const pcm16 = float32ToPCM16(inputData)
      const base64Audio = arrayBufferToBase64(pcm16.buffer)

      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      }))
    }
  }

  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return
    
    isPlayingRef.current = true
    setIsSpeaking(true)
    setStatus('🔊 يتحدث...')

    const audioContext = audioContextRef.current || new AudioContext({ sampleRate: 24000 })
    
    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift()
      if (!chunk) continue

      const audioBuffer = audioContext.createBuffer(1, chunk.length, 24000)
      const channelData = audioBuffer.getChannelData(0)
      
      for (let i = 0; i < chunk.length; i++) {
        channelData[i] = chunk[i] / 32768.0
      }

      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.start()

      await new Promise(resolve => {
        source.onended = resolve
      })
    }

    isPlayingRef.current = false
    setIsSpeaking(false)
    setStatus('✅ جاهز - تحدث الآن')
  }

  // Utility functions
  const float32ToPCM16 = (float32Array: Float32Array): Int16Array => {
    const pcm16 = new Int16Array(float32Array.length)
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return pcm16
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const base64ToInt16Array = (base64: string): Int16Array => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new Int16Array(bytes.buffer)
  }


  const disconnectFromOpenAI = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsConnected(false)
    setIsListening(false)
    setIsSpeaking(false)
    setAudioLevel(0)
    setStatus('غير متصل')
    audioQueueRef.current = []
    isPlayingRef.current = false
  }

  const startAudioLevelMonitoring = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      if (!analyserRef.current) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average / 255) // Normalize to 0-1
      
      if (isConnected) {
        requestAnimationFrame(updateLevel)
      }
    }
    
    updateLevel()
  }

  useEffect(() => {
    return () => {
      disconnectFromOpenAI()
    }
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            محادثة صوتية 🎤
          </h3>
        </div>
        
        {/* Voice Selection Dropdown */}
        {!isConnected && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              اختر الصوت:
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <optgroup label="🚹 أصوات ذكورية">
                {VOICES.male.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🚺 أصوات أنثوية">
                {VOICES.female.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 الافتراضي للشخصية: {personaGender === 'male' ? '🚹 ذكوري' : '🚺 أنثوي'}
            </p>
          </div>
        )}
      </div>


      {/* Voice Visualization */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-8">
          {/* Voice Wave Visualization */}
          <div className="flex items-center gap-2 h-32">
            {[...Array(20)].map((_, i) => {
              const baseHeight = 20
              const randomHeight = isListening || isSpeaking 
                ? Math.sin(Date.now() / 100 + i) * audioLevel * 80 + baseHeight
                : baseHeight
              return (
                <div
                  key={i}
                  className={`w-2 rounded-full transition-all duration-150 ${
                    isListening
                      ? 'bg-red-500'
                      : isSpeaking
                      ? 'bg-green-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{
                    height: `${Math.abs(randomHeight)}px`,
                    opacity: isConnected ? 1 : 0.3,
                    animation: (isListening || isSpeaking) ? 'pulse 1s ease-in-out infinite' : 'none',
                  }}
                />
              )
            })}
          </div>

          {/* Status */}
          <div className="text-center min-h-[60px]">
            {error && (
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                ⚠️ {error}
              </p>
            )}
            <p className={`font-semibold text-lg ${
              isListening 
                ? 'text-red-600 dark:text-red-400' 
                : isSpeaking
                ? 'text-green-600 dark:text-green-400'
                : isConnected
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {status}
            </p>
            {isConnected && !error && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                تكلم بشكل طبيعي - سيرد عليك تلقائياً
              </p>
            )}
          </div>

          {/* Control Button */}
          <button
            onClick={isConnected ? disconnectFromOpenAI : connectToOpenAI}
            disabled={isListening || isSpeaking}
            className={`px-8 py-4 rounded-full text-white font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isConnected
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isConnected ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                إنهاء المحادثة
              </span>
            ) : (
              'بدء المحادثة الصوتية'
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>استماع</span>
          <span className="w-2 h-2 rounded-full bg-green-500 ml-4"></span>
          <span>تحدث</span>
          <span className="w-2 h-2 rounded-full bg-indigo-500 ml-4"></span>
          <span>جاهز</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
          🎙️ VAD مفعّل - يرد تلقائياً عند توقف الكلام
        </p>
      </div>
    </div>
  )
}

