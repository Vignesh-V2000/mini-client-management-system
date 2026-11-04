import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { db } from './config/db.js';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { clientsRouter } from './modules/clients/clients.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';

export const app = express();

app.set('trust proxy', env.TRUST_PROXY_HOPS);
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

if (env.SERVE_CLIENT === 'true') {
  const clientDist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  app.use(express.static(clientDist));
  app.get('/{*path}', (request, response, next) => {
    if (request.path === '/api' || request.path.startsWith('/api/')) return next();
    response.sendFile('index.html', { root: clientDist });
  });
}

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
  const errorCode = error.errorCode ?? error.code;
  const prismaCode = /^P\d{4}$/.test(errorCode) ? errorCode : undefined;
  console.error('Unexpected request error:', error.name, prismaCode ?? '');
  response.status(500).json({ message: 'Unexpected server error' });
});
