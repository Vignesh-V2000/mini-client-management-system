import { findSessionUser } from '../modules/auth/auth.service.js';
import { readSessionUserId } from '../modules/auth/auth.session.js';

export async function requireAuth(request, response, next) {
  const id = readSessionUserId(request.headers.cookie);
  const user = id ? await findSessionUser(id) : null;

  if (!user) return response.status(401).json({ message: 'Authentication required' });

  request.user = user;
  next();
}
