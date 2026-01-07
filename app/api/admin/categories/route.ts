import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * GET /api/admin/categories - Get all categories
 */
export async function GET(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    return Response.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return Response.json(
      { error: 'Failed to get categories', message: String(error) },
      { status: 500 }
    )
  }
}
