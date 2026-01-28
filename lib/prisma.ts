import { PrismaClient } from '@prisma/client'

/**
 * Cliente Prisma singleton
 * 
 * En desarrollo, se crea una nueva instancia en cada hot-reload.
 * En producción, se reutiliza la misma instancia.
 * 
 * Este patrón previene múltiples conexiones a la BD en Next.js.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar URL de conexión con parámetros SSL mejorados
let databaseUrl = process.env.DATABASE_URL || ''

// Agregar parámetros de conexión para mejorar la estabilidad
if (databaseUrl) {
  const urlObj = new URL(databaseUrl)

  // Aumentar el timeout de la conexión (en segundos)
  if (!urlObj.searchParams.has('connect_timeout')) {
    urlObj.searchParams.set('connect_timeout', '30')
  }

  // Aumentar el timeout del pool (en segundos)
  if (!urlObj.searchParams.has('pool_timeout')) {
    urlObj.searchParams.set('pool_timeout', '30')
  }

  // Manejar sslmode para desarrollo
  if (process.env.NODE_ENV === 'development' && !urlObj.searchParams.has('sslmode')) {
    urlObj.searchParams.set('sslmode', 'prefer')
  }

  databaseUrl = urlObj.toString()
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

