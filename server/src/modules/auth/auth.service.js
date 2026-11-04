import bcrypt from 'bcrypt';
import { db } from '../../config/db.js';

const publicFields = { id: true, name: true, email: true };
// Keep bcrypt verification work comparable for known and unknown emails.
const fallbackHash = '$2b$12$P6i2aJiB9EQOQG4Y6JXYx.28CNHXlV82ajLrXQ2.gb0Ekh.sdTZlS';

export async function verifyCredentials(email, password) {
  const user = await db.user.findUnique({
    where: { email },
    select: { ...publicFields, passwordHash: true },
  });

  const valid = await bcrypt.compare(password, user?.passwordHash ?? fallbackHash);
  if (!user || !valid) return null;

  return { id: user.id, name: user.name, email: user.email };
}

export function findSessionUser(id) {
  return db.user.findUnique({ where: { id }, select: publicFields });
}
