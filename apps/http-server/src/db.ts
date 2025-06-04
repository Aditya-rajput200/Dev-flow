// src/db.ts
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

// Prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;