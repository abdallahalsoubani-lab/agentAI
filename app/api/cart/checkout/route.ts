import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionId } from '@/lib/session'
import { calculateCartTotals } from '@/lib/pricing'

/**
 * POST /api/cart/checkout - Create order from cart
 */
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId()

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return Response.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Calculate totals
    const totals = await calculateCartTotals(cart.id)

    // Create order
    const order = await prisma.order.create({
      data: {
        sessionId,
        status: 'new',
        subtotal: totals.subtotal,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        items: {
          create: cart.items.map(item => ({
            menuItemId: item.menuItemId,
            weight: item.weight,
            cardamom: item.cardamom,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
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

    // Clear cart
    await prisma.cartLineItem.deleteMany({
      where: { cartId: cart.id },
    })

    return Response.json({
      message: 'Order created successfully',
      order,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return Response.json(
      { error: 'Failed to create order', message: String(error) },
      { status: 500 }
    )
  }
}
