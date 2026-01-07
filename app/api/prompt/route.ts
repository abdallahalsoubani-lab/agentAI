import { NextRequest, NextResponse } from 'next/server'
import { loadPrompt } from '@/lib/prompts'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const mode = searchParams.get('mode') || 'mode1'

    const prompt = await loadPrompt(mode)

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error loading prompt:', error)
    return NextResponse.json(
      { error: 'Failed to load prompt', prompt: 'أنت مساعد ذكي.' },
      { status: 500 }
    )
  }
}

