import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionId } from '@/lib/session'
import { AddProductActionSchema } from '@/lib/schemas'
import { calculateUnitPrice, calculateLineTotal, getMenuItemByName } from '@/lib/pricing'

/**
 * POST /api/cart/add - Add product to cart
 */
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId()
    const body = await req.json()

    // Validate request
    const validationResult = AddProductActionSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { product } = validationResult.data

    // Check if product is ready
    if (!product.ready) {
      return Response.json(
        { error: 'Product configuration incomplete', message: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId },
      })
    }

    // Find menu item by ID or name
    let menuItem

    if (product.id) {
      menuItem = await prisma.menuItem.findUnique({
        where: { id: product.id },
      })
    } else {
      menuItem = await getMenuItemByName(product.name)
    }

    if (!menuItem) {
      return Response.json(
        { error: 'Product not found', message: `Menu item not found: ${product.name || product.id}` },
        { status: 404 }
      )
    }

    if (!menuItem.enabled || !menuItem.inStock) {
      return Response.json(
        { error: 'Product unavailable', message: `${menuItem.name} is currently unavailable` },
        { status: 400 }
      )
    }

    // Validate weight requirement
    if (menuItem.priceType === 'weighted' && !product.weight) {
      return Response.json(
        { error: 'Weight required', message: 'Weight is required for this product' },
        { status: 400 }
      )
    }

    // Calculate pricing
    const unitPrice = await calculateUnitPrice(
      menuItem.id,
      product.weight || null,
      product.cardamom || null
    )

    const lineTotal = calculateLineTotal(unitPrice, product.quantity)

    // Add to cart
    const cartItem = await prisma.cartLineItem.create({
      data: {
        cartId: cart.id,
        menuItemId: menuItem.id,
        weight: product.weight || null,
        cardamom: product.cardamom || null,
        quantity: product.quantity,
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
      message: 'Product added to cart',
      item: cartItem,
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return Response.json(
      { error: 'Failed to add product', message: String(error) },
      { status: 500 }
    )
  }
}
