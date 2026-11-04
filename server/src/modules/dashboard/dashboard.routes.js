import { Router } from 'express';
import { db } from '../../config/db.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { newestFirst } from '../clients/clients.service.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', requireAuth, async (_request, response) => {
  const [groups, recentClients] = await db.$transaction([
    db.client.groupBy({ by: ['status'], _count: { _all: true } }),
    db.client.findMany({ orderBy: newestFirst, take: 5 }),
  ], { isolationLevel: 'RepeatableRead' });

  const counts = { LEAD: 0, ACTIVE: 0, INACTIVE: 0 };
  for (const { status, _count } of groups) counts[status] = _count._all;

  response.json({
    totalClients: counts.LEAD + counts.ACTIVE + counts.INACTIVE,
    activeClients: counts.ACTIVE,
    leads: counts.LEAD,
    inactiveClients: counts.INACTIVE,
    recentClients,
  });
});
