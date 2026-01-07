'use client'

import { useState, useEffect } from 'react'

interface CheckoutSummaryProps {
  onClose: () => void
  onComplete: () => void
}

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

interface CartTotals {
  subtotal: number
  tax: number
  discount: number
  total: number
}

export default function CheckoutSummary({ onClose, onComplete }: CheckoutSummaryProps) {
  const [items, setItems] = useState<CartItem[]>([])
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [currency] = useState('JOD')

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      setItems(data.cart.items)
      setTotals(data.totals)
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      setConfirming(true)

      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Checkout failed')
      }

      alert('تم تأكيد الطلب بنجاح!')
      onComplete()
    } catch (error) {
      console.error('Checkout error:', error)
      alert('حدث خطأ أثناء تأكيد الطلب')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            ملخص الطلب
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-2">
                          {item.menuItem.displayNameAr || item.menuItem.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
                          <div className="text-gray-500">
                            {item.unitPrice.toFixed(2)} {currency} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.lineTotal.toFixed(2)} {currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 dark:text-gray-400">المجموع الفرعي</span>
                  <span className="text-gray-900 dark:text-white">
                    {totals.subtotal.toFixed(2)} {currency}
                  </span>
                </div>

                {totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">الضريبة</span>
                    <span className="text-gray-900 dark:text-white">
                      {totals.tax.toFixed(2)} {currency}
                    </span>
                  </div>
                )}

                {totals.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">الخصم</span>
                    <span className="text-green-600 dark:text-green-400">
                      -{totals.discount.toFixed(2)} {currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-2xl pt-3 border-t dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">المجموع الكلي</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {totals.total.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 flex justify-end space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            disabled={confirming}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            رجوع للتعديل
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming || loading}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center"
          >
            {confirming ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري التأكيد...
              </>
            ) : (
              'تأكيد الطلب'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
