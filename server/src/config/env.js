import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(32),
  HOST: z.string().min(1).optional(),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
  SERVE_CLIENT: z.enum(['true', 'false']).default('false'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_URL: z.url({ protocol: /^https?$/ }).default('http://localhost:5173'),
  DATABASE_URL: z.url({ protocol: /^mysql$/ }),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  const fields = result.error.issues.map((issue) => issue.path.join('.'));
  throw new Error(`Invalid or missing configuration: ${fields.join(', ')}`);
}

export const env = result.data;
