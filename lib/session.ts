import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const SESSION_COOKIE_NAME = 'session_id'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Get or create session ID from cookies
 */
export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    sessionId = uuidv4()
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })
  }

  return sessionId
}

/**
 * Clear session (logout)
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
