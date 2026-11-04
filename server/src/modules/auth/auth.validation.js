import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().max(191).pipe(z.email()).transform((email) => email.toLowerCase()),
  password: z.string().min(1).refine((password) => Buffer.byteLength(password) <= 72),
});
