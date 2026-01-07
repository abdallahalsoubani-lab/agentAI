import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  // For development, return the API key directly
  // In production, you should use ephemeral tokens from OpenAI
  return NextResponse.json({ token: apiKey })
}

