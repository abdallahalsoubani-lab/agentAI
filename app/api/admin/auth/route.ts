import { NextRequest } from 'next/server'
import { AdminAuthSchema } from '@/lib/schemas'
import { verifyAdminPassword, createAdminSession, clearAdminSession } from '@/lib/admin-auth'

/**
 * POST /api/admin/auth - Admin login
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request
    const validationResult = AdminAuthSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { password } = validationResult.data

    // Verify password
    const isValid = await verifyAdminPassword(password)

    if (!isValid) {
      return Response.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create session
    await createAdminSession()

    return Response.json({ message: 'Authentication successful' })
  } catch (error) {
    console.error('Admin auth error:', error)
    return Response.json(
      { error: 'Authentication failed', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/auth - Admin logout
 */
export async function DELETE(req: NextRequest) {
  try {
    await clearAdminSession()
    return Response.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Admin logout error:', error)
    return Response.json(
      { error: 'Logout failed', message: String(error) },
      { status: 500 }
    )
  }
}
