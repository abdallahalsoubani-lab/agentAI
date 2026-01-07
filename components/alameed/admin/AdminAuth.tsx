'use client'

import { useState } from 'react'

interface AdminAuthProps {
  onSuccess: () => void
}

export default function AdminAuth({ onSuccess }: AdminAuthProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error('Invalid password')
      }

      onSuccess()
    } catch (error) {
      setError('Invalid admin password')
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Enter admin password to access the management panel
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
