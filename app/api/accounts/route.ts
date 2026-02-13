import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSharedUserIds } from '@/lib/user-utils'

/**
 * API Route para gestionar cuentas bancarias
 * 
 * GET /api/accounts - Obtener todas las cuentas del usuario
 * POST /api/accounts - Crear una nueva cuenta
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener todos los IDs de usuario del grupo
    const userIds = await getSharedUserIds(session)


    // Obtener todas las cuentas del grupo
    const accounts = await prisma.account.findMany({
      where: { userId: { in: userIds } },
    })

    // Ordenar manualmente por fecha de creación (más recientes primero)
    if (accounts.length > 0) {
      accounts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
    }

    return NextResponse.json({ accounts }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener cuentas:', error)
    // Log completo del error para debugging
    if (error instanceof Error) {
      console.error('Error stack:', error.stack)
      console.error('Error name:', error.name)
    }
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? { name: error.name, message: error.message }
          : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, balance } = body

    // Validación
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre de la cuenta es requerido' },
        { status: 400 }
      )
    }

    if (balance !== undefined && (typeof balance !== 'number' || isNaN(balance))) {
      return NextResponse.json(
        { error: 'El balance debe ser un número válido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: session },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: 'Usuario no encontrado. Por favor, cierra sesión e inicia sesión nuevamente.',
          code: 'USER_NOT_FOUND'
        },
        { status: 401 }
      )
    }

    // Crear cuenta
    const account = await prisma.account.create({
      data: {
        name: name.trim(),
        balance: balance ?? 0,
        userId: session,
      },
    })

    return NextResponse.json(
      { account, message: 'Cuenta creada exitosamente' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear cuenta:', error)

    // Detectar error de foreign key constraint
    const errorMessage = error?.message || String(error)
    const isForeignKeyError =
      errorMessage.includes('Foreign key constraint') ||
      errorMessage.includes('userId_fkey') ||
      error?.code === 'P2003'

    if (isForeignKeyError) {
      return NextResponse.json(
        {
          error: 'El usuario de la sesión no existe en la base de datos. Por favor, cierra sesión e inicia sesión nuevamente.',
          code: 'FOREIGN_KEY_ERROR',
          details: process.env.NODE_ENV === 'development' ? {
            message: errorMessage,
            code: error?.code
          } : undefined
        },
        { status: 401 }
      )
    }

    const friendlyMessage = process.env.NODE_ENV === 'development'
      ? errorMessage
      : 'Error interno del servidor'

    return NextResponse.json(
      {
        error: friendlyMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? { name: error.name, message: error.message, code: (error as any).code }
          : undefined
      },
      { status: 500 }
    )
  }
}
