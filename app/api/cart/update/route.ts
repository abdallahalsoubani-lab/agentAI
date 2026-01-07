import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionId } from '@/lib/session'
import { UpdateProductActionSchema } from '@/lib/schemas'
import { calculateUnitPrice, calculateLineTotal } from '@/lib/pricing'

/**
 * PATCH /api/cart/update - Update cart line item
 */
export async function PATCH(req: NextRequest) {
  try {
    const sessionId = await getSessionId()
    const body = await req.json()

    // Validate request
    const validationResult = UpdateProductActionSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { lineItemId, patch } = validationResult.data

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

    // Get line item
    const lineItem = await prisma.cartLineItem.findUnique({
      where: { id: lineItemId },
      include: { menuItem: true },
    })

    if (!lineItem || lineItem.cartId !== cart.id) {
      return Response.json(
        { error: 'Line item not found' },
        { status: 404 }
      )
    }

    // Apply patches
    const updatedWeight = patch.weight || lineItem.weight
    const updatedCardamom = patch.cardamom || lineItem.cardamom
    const updatedQuantity = patch.quantity || lineItem.quantity

    // Recalculate pricing
    const unitPrice = await calculateUnitPrice(
      lineItem.menuItemId,
      updatedWeight,
      updatedCardamom
    )

    const lineTotal = calculateLineTotal(unitPrice, updatedQuantity)

    // Update line item
    const updated = await prisma.cartLineItem.update({
      where: { id: lineItemId },
      data: {
        weight: updatedWeight,
        cardamom: updatedCardamom,
        quantity: updatedQuantity,
        unitPrice,
        lineTotal,
      },
      include: {
        menuItem: {
          include: { category: true },
        },
      },
    })

    return Response.json({
      message: 'Cart item updated',
      item: updated,
    })
  } catch (error) {
    console.error('Update cart item error:', error)
    return Response.json(
      { error: 'Failed to update cart item', message: String(error) },
      { status: 500 }
    )
  }
}
