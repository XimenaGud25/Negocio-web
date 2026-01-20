// Ensure Prisma uses the local 'library' engine at runtime when not configured
process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE ?? 'library'

//puede dar error, no importa no falla la app
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Keep Prisma logging minimal to avoid noisy query logs in development.
// Only show errors (and warnings optionally).
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
