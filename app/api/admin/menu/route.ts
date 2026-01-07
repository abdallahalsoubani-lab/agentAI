import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { MenuItemSchema } from '@/lib/schemas'

/**
 * GET /api/admin/menu - Get all menu items
 */
export async function GET(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    })

    return Response.json({ items })
  } catch (error) {
    console.error('Get menu items error:', error)
    return Response.json(
      { error: 'Failed to get menu items', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/menu - Create menu item
 */
export async function POST(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate request
    const validationResult = MenuItemSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create item
    const item = await prisma.menuItem.create({
      data: {
        name: data.name,
        displayNameAr: data.displayNameAr,
        description: data.description,
        categoryId: data.categoryId,
        priceType: data.priceType,
        priceFixed: data.priceFixed,
        pricesByWeight: data.pricesByWeight ? JSON.stringify(data.pricesByWeight) : null,
        enabled: data.enabled,
        inStock: data.inStock,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder,
      },
      include: { category: true },
    })

    return Response.json({
      message: 'Menu item created',
      item,
    })
  } catch (error) {
    console.error('Create menu item error:', error)
    return Response.json(
      { error: 'Failed to create menu item', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/menu - Update menu item
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate request
    const validationResult = MenuItemSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    if (!data.id) {
      return Response.json({ error: 'Item ID required' }, { status: 400 })
    }

    // Update item
    const item = await prisma.menuItem.update({
      where: { id: data.id },
      data: {
        name: data.name,
        displayNameAr: data.displayNameAr,
        description: data.description,
        categoryId: data.categoryId,
        priceType: data.priceType,
        priceFixed: data.priceFixed,
        pricesByWeight: data.pricesByWeight ? JSON.stringify(data.pricesByWeight) : null,
        enabled: data.enabled,
        inStock: data.inStock,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder,
      },
      include: { category: true },
    })

    return Response.json({
      message: 'Menu item updated',
      item,
    })
  } catch (error) {
    console.error('Update menu item error:', error)
    return Response.json(
      { error: 'Failed to update menu item', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/menu - Delete menu item
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: 'Item ID required' }, { status: 400 })
    }

    await prisma.menuItem.delete({
      where: { id },
    })

    return Response.json({ message: 'Menu item deleted' })
  } catch (error) {
    console.error('Delete menu item error:', error)
    return Response.json(
      { error: 'Failed to delete menu item', message: String(error) },
      { status: 500 }
    )
  }
}
