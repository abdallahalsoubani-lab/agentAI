'use client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isJson?: boolean
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  // If JSON, display as code block
  if (message.isJson) {
    try {
      const parsed = JSON.parse(message.content)
      return (
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Action Event
            </div>
            <pre className="text-sm overflow-x-auto">
              <code>{JSON.stringify(parsed, null, 2)}</code>
            </pre>
          </div>
        </div>
      )
    } catch {
      // Fallback if parsing fails
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isUser ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
