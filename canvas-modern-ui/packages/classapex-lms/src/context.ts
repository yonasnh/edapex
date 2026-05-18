import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.CANVAS_DATABASE_URL || 'postgresql://ynebro@localhost:5432/canvas_development'
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

export async function createContext(): Promise<Context> {
  return {
    prisma,
  };
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
