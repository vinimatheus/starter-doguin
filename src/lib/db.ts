import { PrismaClient } from '@prisma/client'

// Configuração de conexão otimizada
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Configurações de performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

// Singleton para evitar múltiplas instâncias
declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

 