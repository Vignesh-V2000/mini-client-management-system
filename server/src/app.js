import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { db } from './config/db.js';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { clientsRouter } from './modules/clients/clients.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
const clientOrigin = new URL(env.CLIENT_URL).origin;
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use('/api', (request, response, next) => {
  const origin = request.get('Origin');
  response.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && origin && origin !== clientOrigin) {
    return response.status(403).json({ message: 'Origin not allowed' });
  }
  next();
});
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/ready', async (_request, response) => {
  try {
    await db.$queryRaw`SELECT 1`;
    response.json({ status: 'ready' });
  } catch {
    response.status(503).json({ status: 'unavailable' });
  }
});

app.use((_request, response) => {
  response.status(404).json({ message: 'Endpoint not found' });
});

app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Invalid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ message: 'Request body too large' });
  }
  console.error('Unexpected request error:', error.name);
  response.status(500).json({ message: 'Unexpected server error' });
});
