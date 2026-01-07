'use client'

interface Mode {
  id: string
  name: string
  description: string
}

interface ModeSelectorProps {
  modes: Mode[]
  selectedMode: string
  onModeChange: (mode: string) => void
}

export default function ModeSelector({ modes, selectedMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Select Mode
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              p-4 rounded-lg border-2 transition-all text-left
              ${
                selectedMode === mode.id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }
            `}
          >
            <div className="font-semibold text-gray-900 dark:text-white mb-1">
              {mode.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {mode.description}
            </div>
            {selectedMode === mode.id && (
              <div className="mt-2 flex items-center text-indigo-600 dark:text-indigo-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Active
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
