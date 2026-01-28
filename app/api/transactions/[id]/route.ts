import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * API Route para gestionar una transacción específica
 * 
 * GET /api/transactions/[id] - Obtener una transacción
 * PUT /api/transactions/[id] - Actualizar una transacción
 * DELETE /api/transactions/[id] - Eliminar una transacción
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

    const transactionId = params.id
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción requerido' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: session, // Asegurar que la transacción pertenece al usuario
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

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener transacción:', error)
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

    const transactionId = params.id
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción requerido' },
        { status: 400 }
      )
    }

    // Obtener la transacción existente
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: session,
      },
      include: {
        account: true,
      },
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { type, amount, description, accountId } = body

    // Validación
    const updateData: any = {}

    if (type !== undefined) {
      if (type !== 'income' && type !== 'expense') {
        return NextResponse.json(
          { error: 'El tipo de transacción debe ser "income" o "expense"' },
          { status: 400 }
        )
      }
      updateData.type = type
    }

    if (amount !== undefined) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'El monto debe ser un número positivo' },
          { status: 400 }
        )
      }
      updateData.amount = amount
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (accountId !== undefined) {
      // Verificar que la nueva cuenta existe y pertenece al usuario
      const newAccount = await prisma.account.findFirst({
        where: {
          id: accountId,
          userId: session,
        },
      })

      if (!newAccount) {
        return NextResponse.json(
          { error: 'Cuenta no encontrada' },
          { status: 404 }
        )
      }
      updateData.accountId = accountId
    }

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar' },
        { status: 400 }
      )
    }

    // Calcular cambios en el balance
    const oldAccount = existingTransaction.account
    let oldBalanceChange = existingTransaction.type === 'income' 
      ? existingTransaction.amount 
      : -existingTransaction.amount

    // Si cambió la cuenta, necesitamos revertir el balance de la cuenta antigua
    // y aplicar a la nueva cuenta
    const newAccountId = updateData.accountId || existingTransaction.accountId
    const newType = updateData.type || existingTransaction.type
    const newAmount = updateData.amount || existingTransaction.amount
    let newBalanceChange = newType === 'income' ? newAmount : -newAmount

    // Actualizar transacción
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        account: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Actualizar balances de las cuentas afectadas
    if (updateData.accountId && updateData.accountId !== existingTransaction.accountId) {
      // Revertir cambio en cuenta antigua
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: oldAccount.balance - oldBalanceChange },
      })

      // Aplicar cambio en cuenta nueva
      const newAccount = await prisma.account.findUnique({
        where: { id: newAccountId },
      })
      if (newAccount) {
        await prisma.account.update({
          where: { id: newAccountId },
          data: { balance: newAccount.balance + newBalanceChange },
        })
      }
    } else {
      // Solo actualizar la cuenta actual
      const balanceDiff = newBalanceChange - oldBalanceChange
      await prisma.account.update({
        where: { id: existingTransaction.accountId },
        data: { balance: oldAccount.balance + balanceDiff },
      })
    }

    return NextResponse.json(
      { transaction, message: 'Transacción actualizada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al actualizar transacción:', error)
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    return NextResponse.json(
      { error: errorMessage },
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

    const transactionId = params.id
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción requerido' },
        { status: 400 }
      )
    }

    // Obtener la transacción para revertir el balance
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: session,
      },
      include: {
        account: true,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      )
    }

    // Revertir el balance de la cuenta
    const balanceChange = transaction.type === 'income' 
      ? -transaction.amount 
      : transaction.amount

    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { 
        balance: transaction.account.balance + balanceChange 
      },
    })

    // Eliminar transacción
    await prisma.transaction.delete({
      where: { id: transactionId },
    })

    return NextResponse.json(
      { message: 'Transacción eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al eliminar transacción:', error)
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `Error: ${error instanceof Error ? error.message : String(error)}`
      : 'Error interno del servidor'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
