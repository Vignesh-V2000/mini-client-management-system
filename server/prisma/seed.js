import bcrypt from 'bcrypt';
import { z } from 'zod';
import { db } from '../src/config/db.js';

const result = z.object({
  SEED_DEMO: z.enum(['true', 'false']).default('false'),
  ADMIN_NAME: z.string().trim().min(1).max(120),
  ADMIN_EMAIL: z.email().max(191).transform((email) => email.toLowerCase()),
  ADMIN_PASSWORD: z.string().min(12).refine((value) => Buffer.byteLength(value) <= 72),
}).safeParse(process.env);

async function seedDemoClients() {
  const samples = [
    ['Aarav Raman', 'Coral Studio', 'ACTIVE'],
    ['Meera Iyer', 'Blue Banyan Design', 'LEAD'],
    ['Nikhil Prasad', 'Harborline Coffee', 'ACTIVE'],
    ['Diya Menon', 'Paper Finch Books', 'INACTIVE'],
    ['Rohan Das', 'Monsoon Cycle Co.', 'ACTIVE'],
    ['Kavya Shah', 'Coconut Grove Events', 'LEAD'],
    ['Aditya Rao', 'Copper Kite Interiors', 'ACTIVE'],
    ['Ananya Pillai', 'Marigold Wellness', 'LEAD'],
    ['Ishaan Sen', 'Riverbend Learning', 'INACTIVE'],
    ['Sana Joseph', 'Saffron Table', 'ACTIVE'],
    ['Varun Nair', 'Seaglass Travel', 'LEAD'],
    ['Tara Bose', 'Crescent Clayworks', 'ACTIVE'],
  ];
  const records = samples.map(([name, company, status], index) => ({
    name,
    company,
    status,
    email: `demo-client-${index + 1}@example.com`,
    notes: 'Fictional client for the hosted demo.',
  }));

  const inserted = await db.$transaction(async (transaction) => {
    const existing = await transaction.client.findMany({
      where: { email: { in: records.map(({ email }) => email) } },
      select: { email: true },
    });
    const existingEmails = new Set(existing.map(({ email }) => email));
    const missing = records.filter(({ email }) => !existingEmails.has(email));
    return missing.length ? (await transaction.client.createMany({ data: missing })).count : 0;
  }, { isolationLevel: 'Serializable' });
  console.log(`Inserted ${inserted} demo clients.`);
}

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
  if (result.data.SEED_DEMO === 'true') await seedDemoClients();
} catch (error) {
  console.error(result.success ? 'Database seed failed. Check MySQL and migrations.' : error.message);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
