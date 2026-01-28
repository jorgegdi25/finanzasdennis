import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { id } = params

        await (prisma as any).recurringTransaction.delete({
            where: {
                id,
                userId: session,
            },
        })

        return NextResponse.json({ message: 'Eliminado correctamente' }, { status: 200 })
    } catch (error) {
        console.error('Error DELETE recurring:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
