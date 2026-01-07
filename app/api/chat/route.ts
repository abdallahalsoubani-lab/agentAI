import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { loadPrompt } from '@/lib/prompts'
import { prisma } from '@/lib/prisma'
import { ChatRequestSchema } from '@/lib/schemas'
import { detectMessageType, parseAction } from '@/lib/action-parser'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request
    const validationResult = ChatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return Response.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { mode, sessionId, message, includeHistory } = validationResult.data

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

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        mode,
        role: 'user',
        content: message,
        isJson: false,
      },
    })

    // Build conversation history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (includeHistory) {
      // Get previous messages for this mode only
      const history = await prisma.chatMessage.findMany({
        where: { sessionId, mode },
        orderBy: { createdAt: 'asc' },
        take: 20, // Limit history to last 20 messages
      })

      for (const msg of history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })
        }
      }
    } else {
      // Just add current message
      messages.push({ role: 'user', content: message })
    }

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o', // or configurable per mode
      messages,
      temperature: 0.7,
      stream: true,
    })

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            fullResponse += content

            // Send chunk to client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
          }

          // Detect message type
          const messageType = detectMessageType(fullResponse)
          let isJson = false
          let parsedAction = null

          if (messageType === 'action') {
            isJson = true
            parsedAction = parseAction(fullResponse)

            if (!parsedAction) {
              console.error('Failed to parse action:', fullResponse)
            }
          }

          // Save assistant response
          await prisma.chatMessage.create({
            data: {
              sessionId,
              mode,
              role: 'assistant',
              content: fullResponse,
              isJson,
              metadata: parsedAction ? JSON.stringify(parsedAction) : null,
            },
          })

          // Send completion signal with metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                messageType,
                action: parsedAction,
              })}\n\n`
            )
          )

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      { error: 'Internal server error', message: String(error) },
      { status: 500 }
    )
  }
}
