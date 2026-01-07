import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { PromptUpdateSchema } from '@/lib/schemas'
import { loadPrompt, savePrompt, listModes } from '@/lib/prompts'

/**
 * GET /api/admin/prompts - Get prompt for a mode
 */
export async function GET(req: NextRequest) {
  try {
    // Check auth
    const isAuthenticated = await isAdminAuthenticated()

    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode')

    if (!mode) {
      // Return list of all modes
      const modes = await listModes()
      return Response.json({ modes })
    }

    // Get current prompt
    const content = await loadPrompt(mode)

    // Get revision history
    const revisions = await prisma.promptRevision.findMany({
      where: { mode },
      orderBy: { version: 'desc' },
      take: 10,
    })

    return Response.json({
      mode,
      content,
      revisions,
    })
  } catch (error) {
    console.error('Get prompt error:', error)
    return Response.json(
      { error: 'Failed to get prompt', message: String(error) },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/prompts - Update prompt for a mode
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
    const validationResult = PromptUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { mode, content, notes } = validationResult.data

    // Get current version number
    const latestRevision = await prisma.promptRevision.findFirst({
      where: { mode },
      orderBy: { version: 'desc' },
    })

    const nextVersion = (latestRevision?.version || 0) + 1

    // Mark all previous revisions as not current
    await prisma.promptRevision.updateMany({
      where: { mode, isCurrent: true },
      data: { isCurrent: false },
    })

    // Create new revision
    const revision = await prisma.promptRevision.create({
      data: {
        mode,
        content,
        version: nextVersion,
        isCurrent: true,
        notes,
      },
    })

    // Save to file
    await savePrompt(mode, content)

    return Response.json({
      message: 'Prompt updated',
      revision,
    })
  } catch (error) {
    console.error('Update prompt error:', error)
    return Response.json(
      { error: 'Failed to update prompt', message: String(error) },
      { status: 500 }
    )
  }
}
