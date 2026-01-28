import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'finanzas_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

/**
 * Hashea una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verifica si una contraseña coincide con un hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns true si la contraseña es válida
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Crea una cookie de sesión con el userId
 * @param userId - ID del usuario
 */
export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Obtiene el userId de la sesión actual
 * @returns userId si existe sesión, null si no
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  return sessionCookie?.value || null
}

/**
 * Elimina la cookie de sesión
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  // Eliminar la cookie con los mismos parámetros que se usaron para crearla
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expirar inmediatamente
    path: '/',
  })
}
