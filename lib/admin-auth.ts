import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const ADMIN_COOKIE_NAME = 'admin_session'
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 2 // 2 hours

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment')
    return false
  }

  // Simple comparison for now (you can use bcrypt for hashed passwords)
  return password === adminPassword
}

/**
 * Create admin session
 */
export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = await bcrypt.hash(Date.now().toString(), 10)

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value

  return !!token
}

/**
 * Clear admin session
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}
