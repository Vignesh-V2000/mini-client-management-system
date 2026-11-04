import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

export const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL });
