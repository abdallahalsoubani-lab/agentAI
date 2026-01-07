import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionId } from '@/lib/session'
import { calculateCartTotals } from '@/lib/pricing'

/**
 * GET /api/cart - Get current cart
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = await getSessionId()

    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            menuItem: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
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
    }

    // Calculate totals
    const totals = await calculateCartTotals(cart.id)

    return Response.json({
      cart,
      totals,
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return Response.json(
      { error: 'Failed to get cart', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart - Clear cart
 */
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = await getSessionId()

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
    })

    if (!cart) {
      return Response.json({ message: 'Cart is already empty' })
    }

    // Delete all items
    await prisma.cartLineItem.deleteMany({
      where: { cartId: cart.id },
    })

    return Response.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    console.error('Clear cart error:', error)
    return Response.json(
      { error: 'Failed to clear cart', message: String(error) },
      { status: 500 }
    )
  }
}
