'use client'

interface TTSToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function TTSToggle({ enabled, onToggle }: TTSToggleProps) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
        enabled
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}
      title={enabled ? 'Disable voice output' : 'Enable voice output'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {enabled ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        ) : (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
          </>
        )}
      </svg>
      <span className="text-sm font-medium">
        {enabled ? 'Voice On' : 'Voice Off'}
      </span>
    </button>
  )
}
