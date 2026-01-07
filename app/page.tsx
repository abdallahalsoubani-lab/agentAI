'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import VoiceChat from '@/components/VoiceChat'
import AlameedChat from '@/components/alameed/AlameedChat'
import CartPanel from '@/components/alameed/CartPanel'
import CheckoutSummary from '@/components/alameed/CheckoutSummary'

const MODES = [
  { 
    id: 'mode1', 
    name: 'أمجد (سعودي)', 
    nameEn: 'Amjad (Saudi)',
    description: 'مساعد بنكي سعودي',
    icon: '🏦',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'mode2', 
    name: 'أمجد (أردني)', 
    nameEn: 'Amjad (Jordan)',
    description: 'مساعد بنكي أردني',
    icon: '🏛️',
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'mode3', 
    name: 'نورة (صحية)', 
    nameEn: 'Noura (Health)',
    description: 'مساعدة صحية سعودية',
    icon: '⚕️',
    color: 'from-pink-500 to-pink-600'
  },
  { 
    id: 'mode4', 
    name: 'سلمى (العميد)', 
    nameEn: 'Alameed Coffee',
    description: 'مساعدة طلبات القهوة',
    icon: '☕',
    color: 'from-amber-500 to-amber-600'
  },
]

export default function Home() {
  const [selectedMode, setSelectedMode] = useState('mode1')
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text')
  const [showCart, setShowCart] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0)

  const selectedModeData = MODES.find(m => m.id === selectedMode) || MODES[0]

  const refreshCart = () => {
    setCartUpdateTrigger((prev) => prev + 1)
  }

  const handleActionEvent = (action: any) => {
    if (action.action === 'order_batch' && action.checkout) {
      setShowSummary(true)
    } else {
      refreshCart()
    }
  }

  const handleCheckoutComplete = () => {
    setShowSummary(false)
    refreshCart()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🤖 مساعد AI متعدد الأوضاع
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            اختر الوضع المناسب وابدأ المحادثة بالنص أو الصوت
          </p>
        </div>

        {/* Mode Selection Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`relative p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                selectedMode === mode.id
                  ? `bg-gradient-to-br ${mode.color} text-white shadow-2xl scale-105`
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="font-bold text-lg mb-1">{mode.name}</h3>
              <p className={`text-sm ${
                selectedMode === mode.id 
                  ? 'text-white/90' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {mode.description}
              </p>
              {selectedMode === mode.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <span className="text-3xl">{selectedModeData.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedModeData.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedModeData.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Voice/Text Toggle */}
              <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setChatMode('text')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    chatMode === 'text'
                      ? 'bg-white dark:bg-gray-600 shadow-md text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  💬 نص
                </button>
                <button
                  onClick={() => setChatMode('voice')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    chatMode === 'voice'
                      ? 'bg-white dark:bg-gray-600 shadow-md text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  🎤 صوت
                </button>
              </div>
              
              {selectedMode === 'mode4' && (
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                >
                  <span>🛒</span>
                  {showCart ? 'إخفاء السلة' : 'إظهار السلة'}
                </button>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          {selectedMode === 'mode4' ? (
            // Alameed mode - special handling with cart
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={showCart ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {chatMode === 'voice' ? (
                  <VoiceChat mode={selectedMode} />
                ) : (
                  <AlameedChat onActionEvent={handleActionEvent} />
                )}
              </div>
              {showCart && (
                <div className="lg:col-span-1">
                  <CartPanel updateTrigger={cartUpdateTrigger} />
                </div>
              )}
            </div>
          ) : chatMode === 'voice' ? (
            <VoiceChat mode={selectedMode} />
          ) : (
            <ChatInterface mode={selectedMode} />
          )}
        </div>
      </div>

      {/* Checkout Summary Modal */}
      {showSummary && (
        <CheckoutSummary
          onClose={() => setShowSummary(false)}
          onComplete={handleCheckoutComplete}
        />
      )}
    </div>
  )
}
