import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../src/config/db.js';

const result = z.object({
  ADMIN_NAME: z.string().trim().min(1).max(120),
  ADMIN_EMAIL: z.email().max(191).transform((email) => email.toLowerCase()),
  ADMIN_PASSWORD: z.string().min(12).refine((value) => Buffer.byteLength(value) <= 72),
}).safeParse(process.env);

try {
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join('.'));
    throw new Error(`Invalid administrator settings: ${fields.join(', ')}`);
  }

  const { ADMIN_NAME: name, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = result.data;
  await db.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log('Administrator seed complete.');
} catch (error) {
  console.error(result.success ? 'Administrator seed failed. Check MySQL and migrations.' : error.message);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
