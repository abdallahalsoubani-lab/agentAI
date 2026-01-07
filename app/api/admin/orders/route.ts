import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * GET /api/admin/orders - Get all orders
 */
export async function GET(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = status ? { status } : {}

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return Response.json({ orders })
  } catch (error) {
    console.error('Get orders error:', error)
    return Response.json(
      { error: 'Failed to get orders', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/orders - Update order status
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return Response.json(
        { error: 'Order ID and status required' },
        { status: 400 }
      )
    }

    const validStatuses = ['new', 'in_progress', 'completed', 'cancelled']

    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
        },
      },
    })

    return Response.json({
      message: 'Order status updated',
      order,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return Response.json(
      { error: 'Failed to update order', message: String(error) },
      { status: 500 }
    )
  }
}
