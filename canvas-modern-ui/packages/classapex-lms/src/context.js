import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.CANVAS_DATABASE_URL || 'postgresql://ynebro@localhost:5432/canvas_development'
        }
    },
    log: ['query', 'info', 'warn', 'error'],
});
export async function createContext() {
    return {
        prisma,
    };
}
// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=context.js.map