import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth'

/**
 * API Route para logout de usuarios
 * 
 * POST /api/auth/logout
 * 
 * Elimina la cookie de sesión
 */
export async function POST() {
  try {
    await deleteSession()

    // Crear respuesta y eliminar cookie también en la respuesta
    const response = NextResponse.json(
      { success: true, message: 'Sesión cerrada exitosamente' },
      { status: 200 }
    )

    // Asegurar que la cookie se elimine en la respuesta
    const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'finanzas_session'
    response.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
