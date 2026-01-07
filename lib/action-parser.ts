import { ActionSchema, NavigationActionSchema, type Action, type NavigationAction } from './schemas'

/**
 * Extract JSON from text (handles markdown code blocks)
 */
export function extractJson(text: string): string | null {
  let trimmed = text.trim()
  
  // Remove markdown code blocks if present
  if (trimmed.includes('```json')) {
    const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/)
    if (match) {
      trimmed = match[1].trim()
    }
  } else if (trimmed.includes('```')) {
    const match = trimmed.match(/```\s*([\s\S]*?)\s*```/)
    if (match) {
      trimmed = match[1].trim()
    }
  }
  
  // Check if it's JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return trimmed
  }
  
  return null
}

/**
 * Check if a message is pure JSON (no text before/after)
 */
export function isPureJson(text: string): boolean {
  return extractJson(text) !== null
}

/**
 * Parse and validate action JSON
 * Returns parsed action or null if invalid
 */
export function parseAction(text: string): Action | null {
  const jsonText = extractJson(text)
  if (!jsonText) {
    return null
  }

  try {
    const json = JSON.parse(jsonText)
    const result = ActionSchema.safeParse(json)

    if (result.success) {
      return result.data
    } else {
      console.error('Action validation failed:', result.error.errors)
      return null
    }
  } catch (error) {
    console.error('JSON parse error:', error)
    return null
  }
}

/**
 * Parse and validate navigation JSON
 */
export function parseNavigation(text: string): NavigationAction | null {
  const jsonText = extractJson(text)
  if (!jsonText) {
    return null
  }

  try {
    const json = JSON.parse(jsonText)
    const result = NavigationActionSchema.safeParse(json)

    if (result.success) {
      return result.data
    } else {
      console.error('Navigation validation failed:', result.error.errors)
      return null
    }
  } catch (error) {
    console.error('JSON parse error:', error)
    return null
  }
}

/**
 * Detect if message contains action or navigation
 */
export function detectMessageType(text: string): 'action' | 'navigation' | 'text' {
  const jsonText = extractJson(text)
  if (!jsonText) {
    return 'text'
  }

  try {
    const json = JSON.parse(jsonText)

    if ('action' in json) {
      return 'action'
    }

    if ('page' in json) {
      return 'navigation'
    }

    return 'text'
  } catch {
    return 'text'
  }
}
