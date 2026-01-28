import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const debts = await prisma.debt.findMany({
            where: { userId: session },
            include: {
                category: true,
                transactions: {
                    where: { type: 'expense' } // Payments are recorded as expenses
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate paid amount for each debt
        const debtsWithPaid = debts.map(debt => {
            const paidAmount = debt.transactions.reduce((sum, t) => sum + t.amount, 0)
            return {
                ...debt,
                paidAmount,
                remainingAmount: Math.max(0, debt.totalAmount - paidAmount)
            }
        })

        return NextResponse.json({ debts: debtsWithPaid }, { status: 200 })
    } catch (error: any) {
        console.error('Error al obtener deudas:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const body = await request.json()
        const { name, totalAmount, categoryId, dueDate } = body

        if (!name || !totalAmount || !categoryId) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        const debt = await prisma.debt.create({
            data: {
                name,
                totalAmount: parseFloat(totalAmount),
                categoryId,
                userId: session,
                dueDate: dueDate ? new Date(dueDate) : null
            },
            include: { category: true }
        })

        return NextResponse.json({ debt }, { status: 201 })
    } catch (error: any) {
        console.error('Error al crear deuda:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
