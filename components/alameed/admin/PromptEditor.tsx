'use client'

import { useState, useEffect } from 'react'

interface PromptData {
  mode: string
  content: string
  revisions: Array<{
    id: string
    version: number
    createdAt: string
    notes: string | null
  }>
}

const MODES = [
  { id: 'mode1', name: 'Mode 1 - Amjad (Saudi)' },
  { id: 'mode2', name: 'Mode 2 - Amjad (Jordan)' },
  { id: 'mode3', name: 'Mode 3 - Noura (Saudi Healthcare)' },
  { id: 'mode4', name: 'Mode 4 - Alameed (Coffee Ordering)' },
]

export default function PromptEditor() {
  const [selectedMode, setSelectedMode] = useState('mode1')
  const [promptData, setPromptData] = useState<PromptData | null>(null)
  const [editContent, setEditContent] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    fetchPrompt()
  }, [selectedMode])

  const fetchPrompt = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/prompts?mode=${selectedMode}`)
      const data = await response.json()
      setPromptData(data)
      setEditContent(data.content)
      setIsDirty(false)
    } catch (error) {
      console.error('Failed to fetch prompt:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          content: editContent,
          notes: notes || undefined,
        }),
      })

      if (response.ok) {
        alert('Prompt saved successfully!')
        setNotes('')
        fetchPrompt()
      }
    } catch (error) {
      console.error('Failed to save prompt:', error)
      alert('Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Prompt Editor
        </h3>
        <select
          value={selectedMode}
          onChange={(e) => {
            if (isDirty) {
              if (!confirm('You have unsaved changes. Discard them?')) return
            }
            setSelectedMode(e.target.value)
          }}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {MODES.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading prompt...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prompt Content
            </label>
            <textarea
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value)
                setIsDirty(true)
              }}
              rows={20}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
            />
            {isDirty && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                You have unsaved changes
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Change Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you changed..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Prompt'}
          </button>

          {promptData && promptData.revisions.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Revision History ({promptData.revisions.length})
              </h4>
              <div className="space-y-2">
                {promptData.revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="border dark:border-gray-700 rounded-lg p-3 text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Version {rev.version}
                        </span>
                        {rev.notes && (
                          <span className="ml-2 text-gray-600 dark:text-gray-400">
                            - {rev.notes}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 dark:text-gray-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
