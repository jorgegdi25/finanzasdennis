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



if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

