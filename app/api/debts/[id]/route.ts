import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        // Check ownership
        const existingDebt = await prisma.debt.findUnique({
            where: { id: params.id }
        })

        if (!existingDebt || existingDebt.userId !== session) {
            return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
        }

        const body = await request.json()
        const { name, totalAmount, totalInstallments, categoryId, dueDate } = body

        if (!name || !totalAmount || !categoryId) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
        }

        const debt = await prisma.debt.update({
            where: { id: params.id },
            data: {
                name,
                totalAmount: parseFloat(totalAmount),
                totalInstallments: totalInstallments || null,
                categoryId,
                dueDate: dueDate ? new Date(dueDate) : null
            },
            include: { category: true }
        })

        return NextResponse.json({ debt }, { status: 200 })
    } catch (error: any) {
        console.error('Error al actualizar deuda:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        // Check ownership
        const existingDebt = await prisma.debt.findUnique({
            where: { id: params.id }
        })

        if (!existingDebt || existingDebt.userId !== session) {
            return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
        }

        await prisma.debt.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        console.error('Error al eliminar deuda:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
