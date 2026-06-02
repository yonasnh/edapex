import { PrismaClient } from '@prisma/client';
import express from 'express';
import { verifyJwt } from './utils/jwt';

export interface Context {
  prisma: PrismaClient;
  req: express.Request;
  res: express.Response;
  currentUser?: {
    userId: string;
    email: string;
    roles: string[];
    canvasToken?: string;
  } | null;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.CANVAS_DATABASE_URL || 'postgresql://ynebro@localhost:5432/canvas_development'
    }
  },
  log: ['query', 'info', 'warn', 'error'],
});

export async function createContext({ req, res }: { req: express.Request; res: express.Response }): Promise<Context> {
  let currentUser = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    currentUser = verifyJwt(token);
  }

  return {
    prisma,
    req,
    res,
    currentUser,
  };
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

