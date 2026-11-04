import { z } from 'zod';
import { ClientStatus } from '@prisma/client';

const status = z.enum(ClientStatus);
const optionalText = (max) => z.string().trim().max(max).nullish().transform((value) => value || null);

export const clientBody = z.object({
  name: z.string().trim().min(2).max(120),
  company: optionalText(150),
  email: optionalText(191).pipe(z.email().nullable()),
  phone: optionalText(30).refine(
    (value) => !value || (/^\+?[\d ().-]+$/.test(value) && value.replace(/\D/g, '').length >= 7),
    'Enter a valid phone number',
  ),
  status: status.default('LEAD'),
  notes: optionalText(5000),
});

const positiveInt = (max) => z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(z.number().int().max(max));

export const clientId = z.object({ id: positiveInt(2147483647) });

export const clientQuery = z.object({
  page: positiveInt(1000000).prefault('1'),
  limit: positiveInt(100).prefault('10'),
  search: z.string().trim().max(191).default(''),
  status: status.optional(),
});
