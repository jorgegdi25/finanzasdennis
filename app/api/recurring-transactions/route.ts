import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processRecurringTransactions } from '@/lib/recurring'

const getModel = () => (prisma as any).recurringTransaction

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        // Log the models for debugging in server logs
        console.log('GET Recurring: Triggering processing for user', session)
        await processRecurringTransactions(session)

        const model = getModel()
        if (!model) {
            console.error('RecurringTransaction model NOT FOUND in prisma client!')
            return NextResponse.json({ error: 'Error de configuración de base de datos' }, { status: 500 })
        }

        const recurring = await model.findMany({
            where: { userId: session },
            include: {
                account: { select: { name: true } },
                debt: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ recurring }, { status: 200 })
    } catch (error: any) {
        console.error('Error GET recurring:', error)
        return NextResponse.json({ error: 'Error del servidor', details: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const body = await request.json()
        const { type, amount, description, frequency, accountId, debtId, startDate } = body

        if (!type || !amount || !frequency || !accountId) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        const model = getModel()
        if (!model) {
            return NextResponse.json({ error: 'Error de configuración de modelos' }, { status: 500 })
        }

        const recurring = await model.create({
            data: {
                type,
                amount: parseFloat(amount),
                description,
                frequency,
                startDate: new Date(startDate || new Date()),
                nextExecutionDate: new Date(startDate || new Date()),
                accountId,
                userId: session,
                debtId: debtId || null,
                isActive: true,
            },
        })

        return NextResponse.json({ recurring }, { status: 201 })
    } catch (error: any) {
        console.error('Error POST recurring:', error)
        return NextResponse.json({ error: 'Error del servidor', details: error.message }, { status: 500 })
    }
}
