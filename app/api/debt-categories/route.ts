import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const categories = await prisma.debtCategory.findMany({
            where: { userId: session },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json({ categories }, { status: 200 })
    } catch (error: any) {
        console.error('Error al obtener categorías de deuda:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const body = await request.json()
        const { name } = body

        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
        }

        const category = await prisma.debtCategory.create({
            data: {
                name: name.trim(),
                userId: session
            }
        })

        return NextResponse.json({ category }, { status: 201 })
    } catch (error: any) {
        console.error('Error al crear categoría de deuda:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
