'use client'

import { useState, useEffect } from 'react'

interface MenuItem {
  id: string
  name: string
  displayNameAr: string | null
  priceType: string
  priceFixed: number | null
  pricesByWeight: string | null
  enabled: boolean
  category: {
    name: string
    displayName: string | null
  }
}

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/admin/menu')
      const data = await response.json()
      setItems(data.items)
    } catch (error) {
      console.error('Failed to fetch menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEnabled = async (itemId: string, currentState: boolean) => {
    try {
      const item = items.find((i) => i.id === itemId)
      if (!item) return

      const response = await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          name: item.name,
          displayNameAr: item.displayNameAr,
          categoryId: item.category.name,
          priceType: item.priceType,
          priceFixed: item.priceFixed,
          pricesByWeight: item.pricesByWeight ? JSON.parse(item.pricesByWeight) : null,
          enabled: !currentState,
          inStock: true,
          sortOrder: 0,
        }),
      })

      if (response.ok) {
        fetchItems()
      }
    } catch (error) {
      console.error('Failed to toggle item:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading menu items...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Menu Items ({items.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const prices = item.pricesByWeight ? JSON.parse(item.pricesByWeight) : null

          return (
            <div
              key={item.id}
              className="border dark:border-gray-700 rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {item.displayNameAr || item.name}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({item.category.displayName || item.category.name})
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.enabled
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {item.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.priceType === 'fixed' ? (
                    <div>Fixed price: {item.priceFixed} JOD</div>
                  ) : (
                    <div>
                      Prices by weight:{' '}
                      {prices &&
                        Object.entries(prices)
                          .map(([weight, price]) => `${weight}: ${price} JOD`)
                          .join(', ')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleEnabled(item.id, item.enabled)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    item.enabled
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                  }`}
                >
                  {item.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
