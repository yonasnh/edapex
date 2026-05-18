import { PrismaClient } from '@prisma/client';
export interface Context {
    prisma: PrismaClient;
}
export declare function createContext(): Promise<Context>;
//# sourceMappingURL=context.d.ts.map