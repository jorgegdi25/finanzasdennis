import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Ruta de prueba para diagnosticar problemas con Account
 * GET /api/accounts/test
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const testResults: any = {
      sessionExists: true,
      prismaModelTest: null,
      error: null,
    }

    // Prueba directa: Intentar usar el modelo de Prisma
    try {
      const accounts = await prisma.account.findMany({
        where: { userId: session },
        take: 1,
      })
      
      testResults.prismaModelTest = {
        success: true,
        accountsFound: accounts.length,
        sampleAccount: accounts.length > 0 ? {
          id: accounts[0].id,
          name: accounts[0].name,
          balance: accounts[0].balance,
        } : null,
      }
    } catch (error: any) {
      testResults.prismaModelTest = {
        success: false,
        error: {
          message: String(error?.message || 'Error desconocido'),
          code: String(error?.code || 'N/A'),
          name: String(error?.name || 'Error'),
        },
      }
      
      // Información adicional sobre el error
      if (error?.message?.includes('does not exist') || 
          error?.code === 'P2021' || 
          error?.message?.includes('Unknown model')) {
        testResults.suggestion = 'La tabla Account no existe. Ejecuta el script SQL en Supabase.'
      } else if (error?.message?.includes('relation') || error?.message?.includes('table')) {
        testResults.suggestion = 'Problema con el nombre de la tabla. Verifica que se llame "Account" (con mayúscula).'
      }
    }

    return NextResponse.json({
      success: true,
      session: session.substring(0, 10) + '...',
      tests: testResults,
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: String(error?.message || 'Error desconocido'),
      errorType: String(error?.name || 'Unknown'),
    }, { status: 500 })
  }
}
