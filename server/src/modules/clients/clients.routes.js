import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { clientBody, clientId, clientQuery } from './clients.validation.js';
import { createClient, deleteClient, getClient, listClients, updateClient } from './clients.service.js';

export const clientsRouter = Router();
const validateId = validate('params', clientId);
const validateBody = validate('body', clientBody);

clientsRouter.use(requireAuth);
clientsRouter.get('/', validate('query', clientQuery), async (_request, response) => {
  response.json(await listClients(response.locals.query));
});
clientsRouter.get('/:id', validateId, async (_request, response) => {
  const client = await getClient(response.locals.params.id);
  if (!client) return response.status(404).json({ message: 'Client not found' });
  response.json(client);
});
clientsRouter.post('/', validateBody, async (_request, response) => {
  response.status(201).json(await createClient(response.locals.body));
});
clientsRouter.put('/:id', validateId, validateBody, async (_request, response) => {
  response.json(await updateClient(response.locals.params.id, response.locals.body));
});
clientsRouter.delete('/:id', validateId, async (_request, response) => {
  await deleteClient(response.locals.params.id);
  response.sendStatus(204);
});

clientsRouter.use((error, _request, response, next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return response.status(404).json({ message: 'Client not found' });
  }
  next(error);
});
