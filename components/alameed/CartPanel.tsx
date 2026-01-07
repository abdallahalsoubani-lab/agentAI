'use client'

import { useState, useEffect } from 'react'

interface CartItem {
  id: string
  menuItem: {
    name: string
    displayNameAr: string | null
  }
  weight: string | null
  cardamom: string | null
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface Cart {
  id: string
  items: CartItem[]
}

interface CartTotals {
  subtotal: number
  tax: number
  discount: number
  total: number
}

interface CartPanelProps {
  updateTrigger: number
}

export default function CartPanel({ updateTrigger }: CartPanelProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [currency] = useState('JOD')

  useEffect(() => {
    fetchCart()
  }, [updateTrigger])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cart')
      const data = await response.json()
      setCart(data.cart)
      setTotals(data.totals)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (lineItemId: string) => {
    try {
      await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_product', lineItemId }),
      })
      fetchCart()
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleClear = async () => {
    if (!confirm('هل تريد مسح جميع المنتجات من السلة؟')) return

    try {
      await fetch('/api/cart', { method: 'DELETE' })
      fetchCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const itemCount = cart?.items.length || 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            السلة ({itemCount})
          </h3>
          {itemCount > 0 && (
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {itemCount === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            السلة فارغة
          </div>
        ) : (
          cart?.items.map((item) => (
            <div
              key={item.id}
              className="border dark:border-gray-700 rounded-lg p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.menuItem.displayNameAr || item.menuItem.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                    {item.weight && <div>الوزن: {item.weight}</div>}
                    {item.cardamom && (
                      <div>
                        الهيل: {
                          item.cardamom === 'none' ? 'بدون' :
                          item.cardamom === 'light' ? 'خفيف' :
                          item.cardamom === 'medium' ? 'وسط' : 'قوي'
                        }
                      </div>
                    )}
                    <div>الكمية: {item.quantity}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.unitPrice.toFixed(2)} {currency} × {item.quantity}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {item.lineTotal.toFixed(2)} {currency}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      {itemCount > 0 && (
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span>
            <span className="text-gray-900 dark:text-white">
              {totals.subtotal.toFixed(2)} {currency}
            </span>
          </div>
          {totals.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">الضريبة</span>
              <span className="text-gray-900 dark:text-white">
                {totals.tax.toFixed(2)} {currency}
              </span>
            </div>
          )}
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">الخصم</span>
              <span className="text-green-600 dark:text-green-400">
                -{totals.discount.toFixed(2)} {currency}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
            <span className="text-gray-900 dark:text-white">المجموع الكلي</span>
            <span className="text-amber-600 dark:text-amber-400">
              {totals.total.toFixed(2)} {currency}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
