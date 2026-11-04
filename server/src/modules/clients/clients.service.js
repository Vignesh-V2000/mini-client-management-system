import { db } from '../../config/db.js';

export const newestFirst = [{ createdAt: 'desc' }, { id: 'desc' }];

export async function listClients({ page, limit, search, status }) {
  const where = { status };
  if (search) {
    const contains = search.replace(/[\\%_]/g, '\\$&');
    where.OR = ['name', 'company', 'email'].map((field) => ({ [field]: { contains } }));
  }

  const [data, total] = await db.$transaction([
    db.client.findMany({ where, orderBy: newestFirst, skip: (page - 1) * limit, take: limit }),
    db.client.count({ where }),
  ], { isolationLevel: 'RepeatableRead' });

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export function getClient(id) {
  return db.client.findUnique({ where: { id } });
}

export function createClient(data) {
  return db.client.create({ data });
}

export function updateClient(id, data) {
  return db.client.update({ where: { id }, data });
}

export function deleteClient(id) {
  return db.client.delete({ where: { id } });
}
