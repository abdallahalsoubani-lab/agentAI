'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    lineTotal: number
    menuItem: {
      name: string
      displayNameAr: string | null
    }
    weight: string | null
    cardamom: string | null
  }>
}

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' ? '/api/admin/orders' : `/api/admin/orders?status=${filter}`
      const response = await fetch(url)
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Orders ({orders.length})
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">All Orders</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No orders found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="border dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Order #{order.id.slice(0, 8)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      order.status === 'new'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : order.status === 'in_progress'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        : order.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="text-sm text-gray-600 dark:text-gray-400 flex justify-between"
                  >
                    <span>
                      {item.menuItem.displayNameAr || item.menuItem.name} ×{' '}
                      {item.quantity}
                      {item.weight && ` (${item.weight})`}
                      {item.cardamom && ` (${item.cardamom})`}
                    </span>
                    <span>{item.lineTotal.toFixed(2)} JOD</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t dark:border-gray-700 flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-amber-600 dark:text-amber-400">
                  {order.total.toFixed(2)} JOD
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
