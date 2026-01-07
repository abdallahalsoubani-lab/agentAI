import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionId } from '@/lib/session'
import { RemoveProductActionSchema } from '@/lib/schemas'

/**
 * DELETE /api/cart/remove - Remove product from cart
 */
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = await getSessionId()
    const body = await req.json()

    // Validate request
    const validationResult = RemoveProductActionSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { lineItemId } = validationResult.data

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { sessionId },
    })

    if (!cart) {
      return Response.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // Verify line item belongs to cart
    const lineItem = await prisma.cartLineItem.findUnique({
      where: { id: lineItemId },
    })

    if (!lineItem || lineItem.cartId !== cart.id) {
      return Response.json(
        { error: 'Line item not found' },
        { status: 404 }
      )
    }

    // Delete line item
    await prisma.cartLineItem.delete({
      where: { id: lineItemId },
    })

    return Response.json({
      message: 'Item removed from cart',
    })
  } catch (error) {
    console.error('Remove from cart error:', error)
    return Response.json(
      { error: 'Failed to remove item', message: String(error) },
      { status: 500 }
    )
  }
}
