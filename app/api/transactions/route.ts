import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSharedUserIds } from '@/lib/user-utils'

/**
 * API Route para gestionar transacciones
 * 
 * GET /api/transactions - Obtener todas las transacciones del usuario
 * POST /api/transactions - Crear una nueva transacción
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

    // Verificar que el modelo Transaction está disponible
    if (!prisma.transaction) {
      return NextResponse.json(
        {
          error: 'El modelo Transaction no está disponible. Por favor reinicia el servidor de desarrollo después de ejecutar "npx prisma generate".'
        },
        { status: 500 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    // Construir filtro
    const where: any = { userId: { in: userIds } }
    if (accountId) {
      where.accountId = accountId
    }

    // Obtener todas las transacciones del usuario
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ transactions }, { status: 200 })
  } catch (error: any) {
    console.error('Error al obtener transacciones:', error)

    // Detectar si el error es porque la tabla no existe
    const errorMessage = error?.message || String(error)
    const isTableMissing =
      errorMessage.includes('does not exist') ||
      errorMessage.includes('relation') ||
      errorMessage.includes('table') ||
      error?.code === 'P2021' ||
      error?.code === '42P01'

    if (isTableMissing) {
      return NextResponse.json(
        {
          error: 'La tabla Transaction no existe en la base de datos. Por favor ejecuta el script SQL en Supabase (create_transactions_table.sql) o ejecuta: npx prisma db push',
          details: process.env.NODE_ENV === 'development' ? {
            code: error?.code,
            message: errorMessage
          } : undefined
        },
        { status: 500 }
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
    const { type, amount, description, accountId, debtId } = body

    // Validación
    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json(
        { error: 'El tipo de transacción debe ser "income" o "expense"' },
        { status: 400 }
      )
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      )
    }

    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json(
        { error: 'El ID de cuenta es requerido' },
        { status: 400 }
      )
    }

    // Obtener todos los IDs de usuario del grupo
    const userIds = await getSharedUserIds(session)

    // Verificar que la cuenta existe y pertenece al grupo
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: { in: userIds },
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el modelo Transaction está disponible
    if (!prisma.transaction) {
      return NextResponse.json(
        {
          error: 'El modelo Transaction no está disponible. Por favor reinicia el servidor de desarrollo después de ejecutar "npx prisma generate".'
        },
        { status: 500 }
      )
    }

    // Crear transacción
    let transaction
    try {
      transaction = await prisma.transaction.create({
        data: {
          type,
          amount,
          description: description?.trim() || null,
          accountId,
          userId: session,
          debtId: debtId || null,
        },
        include: {
          account: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    } catch (createError: any) {
      console.error('Error al crear transacción en BD:', createError)

      // Detectar diferentes tipos de errores
      const errorMessage = createError?.message || String(createError)
      const errorCode = createError?.code

      // Error de tabla no existe
      const isTableMissing =
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('table') ||
        errorCode === 'P2021' ||
        errorCode === '42P01'

      // Error de conexión o mantenimiento
      const isConnectionError =
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('maintenance') ||
        errorCode === 'P1001' ||
        errorCode === 'P1017'

      // Error de permisos o bloqueo
      const isLockError =
        errorMessage.includes('lock') ||
        errorMessage.includes('read-only') ||
        errorMessage.includes('maintenance')

      if (isTableMissing) {
        return NextResponse.json(
          {
            error: 'La tabla Transaction no existe en la base de datos. Por favor ejecuta el script SQL en Supabase (create_transactions_table.sql) o ejecuta: npx prisma db push',
            details: process.env.NODE_ENV === 'development' ? {
              code: errorCode,
              message: errorMessage
            } : undefined
          },
          { status: 500 }
        )
      }

      if (isConnectionError || isLockError) {
        return NextResponse.json(
          {
            error: 'No se pudo conectar a la base de datos. Supabase puede estar en mantenimiento. Por favor intenta de nuevo en unos minutos o verifica el estado de Supabase.',
            details: process.env.NODE_ENV === 'development' ? {
              code: errorCode,
              message: errorMessage
            } : undefined
          },
          { status: 503 }
        )
      }

      throw createError // Re-lanzar si no es un error conocido
    }

    // Actualizar balance de la cuenta
    const balanceChange = type === 'income' ? amount : -amount
    const newBalance = account.balance + balanceChange

    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance },
    })

    return NextResponse.json(
      {
        transaction,
        message: 'Transacción creada exitosamente',
        newBalance,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al crear transacción:', error)
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? { name: error.name, message: error.message, code: (error as any).code }
          : undefined
      },
      { status: 500 }
    )
  }
}
