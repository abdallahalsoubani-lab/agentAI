'use client'

import { useState, useEffect } from 'react'
import AlameedChat from '@/components/alameed/AlameedChat'
import CartPanel from '@/components/alameed/CartPanel'
import CheckoutSummary from '@/components/alameed/CheckoutSummary'
import AdminPanel from '@/components/alameed/AdminPanel'

export default function AlameedPage() {
  const [showCart, setShowCart] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0)

  // Trigger cart refresh
  const refreshCart = () => {
    setCartUpdateTrigger((prev) => prev + 1)
  }

  // Handle action events from chat
  const handleActionEvent = (action: any) => {
    if (action.action === 'order_batch' && action.checkout) {
      setShowSummary(true)
    } else {
      refreshCart()
    }
  }

  // Handle checkout completion
  const handleCheckoutComplete = () => {
    setShowSummary(false)
    refreshCart()
  }

  // Keyboard shortcut for admin (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setShowAdmin(true)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </a>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Alameed Coffee Ordering
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCart(!showCart)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {showCart ? 'Hide' : 'Show'} Cart
              </button>
              <button
                onClick={() => setShowAdmin(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                title="Admin Panel (Ctrl+Shift+A)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className={showCart ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <AlameedChat onActionEvent={handleActionEvent} />
          </div>

          {/* Cart Panel */}
          {showCart && (
            <div className="lg:col-span-1">
              <CartPanel updateTrigger={cartUpdateTrigger} />
            </div>
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

      {/* Admin Panel Modal */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
