import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Ruta de prueba para diagnosticar problemas con Transaction
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    const diagnostics: any = {
      session: session ? 'OK' : 'NO SESSION',
      prismaAvailable: !!prisma,
      transactionModelAvailable: !!prisma.transaction,
      timestamp: new Date().toISOString(),
    }

    if (prisma.transaction) {
      try {
        // Intentar una consulta simple
        const count = await prisma.transaction.count()
        diagnostics.tableExists = true
        diagnostics.transactionCount = count
      } catch (error: any) {
        diagnostics.tableExists = false
        diagnostics.tableError = error.message
        diagnostics.errorCode = error.code
      }
    }

    return NextResponse.json({ diagnostics }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: error.code
      },
      { status: 500 }
    )
  }
}
