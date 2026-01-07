'use client'

import { useState, useEffect } from 'react'
import AdminAuth from './admin/AdminAuth'
import MenuManagement from './admin/MenuManagement'
import OrdersView from './admin/OrdersView'
import PromptEditor from './admin/PromptEditor'

interface AdminPanelProps {
  onClose: () => void
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'prompts'>('menu')

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <AdminAuth onSuccess={handleAuthSuccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm rounded-full">
                Authenticated
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Logout
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'menu'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'prompts'
                  ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Prompt Editor
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'prompts' && <PromptEditor />}
        </div>
      </div>
    </div>
  )
}
