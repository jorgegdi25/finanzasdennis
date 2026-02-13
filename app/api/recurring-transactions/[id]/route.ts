import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSharedUserIds } from '@/lib/user-utils'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { id } = params
        const userIds = await getSharedUserIds(session)

        // Verify the recurring transaction belongs to someone in the group
        const existing = await (prisma as any).recurringTransaction.findFirst({
            where: { id, userId: { in: userIds } },
        })

        if (!existing) {
            return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
        }

        await (prisma as any).recurringTransaction.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Eliminado correctamente' }, { status: 200 })
    } catch (error) {
        console.error('Error DELETE recurring:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
