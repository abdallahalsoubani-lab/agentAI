import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { loadPrompt } from '@/lib/prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { mode, audioData } = await req.json()

    if (!audioData) {
      return Response.json({ error: 'No audio data provided' }, { status: 400 })
    }

    // Load system prompt for the mode
    let systemPrompt: string
    try {
      systemPrompt = await loadPrompt(mode)
    } catch (error) {
      return Response.json(
        { error: `Prompt not found for mode: ${mode}` },
        { status: 404 }
      )
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioData, 'base64')

    // Step 1: Transcribe audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      language: 'ar',
    })

    const userText = transcription.text

    // Step 2: Get response from GPT
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
      ],
      temperature: 0.7,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Step 3: Convert response to speech using TTS
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Can be: alloy, echo, fable, onyx, nova, shimmer
      input: responseText,
      speed: 1.0,
    })

    // Convert speech to base64
    const audioArrayBuffer = await speech.arrayBuffer()
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64')

    return Response.json({
      userText,
      responseText,
      audioBase64,
    })
  } catch (error) {
    console.error('Voice API error:', error)
    return Response.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    )
  }
}

