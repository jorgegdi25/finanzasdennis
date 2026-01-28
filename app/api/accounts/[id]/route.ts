import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API Route para gestionar una cuenta bancaria específica
 * 
 * GET /api/accounts/[id] - Obtener una cuenta
 * PUT /api/accounts/[id] - Actualizar una cuenta
 * DELETE /api/accounts/[id] - Eliminar una cuenta
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const accountId = params.id
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'ID de cuenta requerido' },
        { status: 400 }
      )
    }

    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session, // Asegurar que la cuenta pertenece al usuario
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ account }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener cuenta:', error)
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const accountId = params.id
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'ID de cuenta requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, balance } = body

    console.log('PUT /api/accounts/[id] - Datos recibidos:', {
      accountId,
      name,
      balance,
      balanceType: typeof balance,
    })

    // Verificar que la cuenta existe y pertenece al usuario
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session,
      },
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Validación y preparación de datos
    const updateData: { name?: string; balance?: number } = {}

    if (name !== undefined && name !== null) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'El nombre de la cuenta es requerido' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (balance !== undefined && balance !== null) {
      // Convertir balance a número si es string
      const balanceNum = typeof balance === 'string' 
        ? parseFloat(balance) 
        : typeof balance === 'number' 
          ? balance 
          : parseFloat(String(balance))
      
      if (isNaN(balanceNum)) {
        return NextResponse.json(
          { error: 'El balance debe ser un número válido' },
          { status: 400 }
        )
      }
      updateData.balance = balanceNum
    }

    console.log('Datos a actualizar:', updateData)

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      )
    }

    // Actualizar cuenta
    console.log('Intentando actualizar cuenta con ID:', accountId)
    console.log('Datos de actualización:', JSON.stringify(updateData))
    
    try {
      const account = await prisma.account.update({
        where: { id: accountId },
        data: updateData,
      })
      
      console.log('Cuenta actualizada exitosamente:', account.id)
      
      return NextResponse.json(
        { account, message: 'Cuenta actualizada exitosamente' },
        { status: 200 }
      )
    } catch (updateError: any) {
      console.error('Error específico en prisma.account.update:', updateError)
      console.error('Código de error:', updateError?.code)
      console.error('Meta del error:', updateError?.meta)
      throw updateError // Re-lanzar para que sea capturado por el catch externo
    }

  } catch (error) {
    console.error('Error al actualizar cuenta:', error)
    // Log detallado del error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const accountId = params.id
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'ID de cuenta requerido' },
        { status: 400 }
      )
    }

    // Verificar que la cuenta existe y pertenece al usuario
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: session,
      },
    })

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar cuenta
    await prisma.account.delete({
      where: { id: accountId },
    })

    return NextResponse.json(
      { message: 'Cuenta eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar cuenta:', error)
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
