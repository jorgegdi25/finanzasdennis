import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSharedUserIds } from '@/lib/user-utils'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const userIds = await getSharedUserIds(session)

        const debts = await prisma.debt.findMany({
            where: { userId: { in: userIds } },
            include: {
                category: true,
                transactions: {
                    where: { type: 'expense' } // Payments are recorded as expenses
                },
                recurringTransactions: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        description: true,
                        frequency: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate paid amount and linked recurring for each debt
        const debtsWithDetails = debts.map(debt => {
            const paidAmount = debt.transactions.reduce((sum, t) => sum + t.amount, 0)

            // Linked recurring expenses (e.g. monthly mortgage payment)
            const linkedExpenses = debt.recurringTransactions.filter(r => r.type === 'expense')
            const monthlyPayment = linkedExpenses.reduce((sum, r) => sum + r.amount, 0)

            // Linked recurring income (e.g. rent received)
            const linkedIncome = debt.recurringTransactions.filter(r => r.type === 'income')
            const monthlyIncome = linkedIncome.reduce((sum, r) => sum + r.amount, 0)

            const monthlyNetCost = monthlyPayment - monthlyIncome

            return {
                ...debt,
                paidAmount,
                remainingAmount: Math.max(0, debt.totalAmount - paidAmount),
                paidInstallments: debt.transactions.length,
                monthlyPayment,
                monthlyIncome,
                monthlyNetCost,
                linkedRecurring: debt.recurringTransactions,
            }
        })

        return NextResponse.json({ debts: debtsWithDetails }, { status: 200 })
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
        const { name, totalAmount, totalInstallments, categoryId, dueDate } = body

        if (!name || !totalAmount || !categoryId) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        const debt = await prisma.debt.create({
            data: {
                name,
                totalAmount,
                totalInstallments: totalInstallments || null,
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
