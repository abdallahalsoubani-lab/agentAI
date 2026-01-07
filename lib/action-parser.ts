import { ActionSchema, NavigationActionSchema, type Action, type NavigationAction } from './schemas'

/**
 * Check if a message is pure JSON (no text before/after)
 */
export function isPureJson(text: string): boolean {
  const trimmed = text.trim()
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'))
}

/**
 * Parse and validate action JSON
 * Returns parsed action or null if invalid
 */
export function parseAction(text: string): Action | null {
  if (!isPureJson(text)) {
    return null
  }

  try {
    const json = JSON.parse(text)
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
  if (!isPureJson(text)) {
    return null
  }

  try {
    const json = JSON.parse(text)
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
  if (!isPureJson(text)) {
    return 'text'
  }

  try {
    const json = JSON.parse(text)

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
