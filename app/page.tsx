'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import ModeSelector from '@/components/ModeSelector'

const MODES = [
  { id: 'mode1', name: 'Amjad (Saudi)', description: 'Saudi Najdi Banking Assistant' },
  { id: 'mode2', name: 'Amjad (Jordan)', description: 'Jordanian Banking Assistant' },
  { id: 'mode3', name: 'Noura (Saudi)', description: 'Saudi Healthcare Assistant' },
  { id: 'mode4', name: 'Alameed', description: 'Coffee Ordering Assistant' },
]

export default function Home() {
  const [selectedMode, setSelectedMode] = useState('mode1')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Multi-Mode AI Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Text + Voice conversational assistant with 4 specialized modes
            </p>
          </div>

          {/* Mode Selector */}
          <ModeSelector
            modes={MODES}
            selectedMode={selectedMode}
            onModeChange={setSelectedMode}
          />

          {/* Chat Interface */}
          <div className="mt-6">
            {selectedMode === 'mode4' ? (
              // Alameed mode: Redirect to dedicated page with cart
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Alameed Coffee Ordering
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The ordering assistant has a dedicated interface with cart management.
                </p>
                <a
                  href="/alameed"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Go to Alameed Page
                </a>
              </div>
            ) : (
              <ChatInterface mode={selectedMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
