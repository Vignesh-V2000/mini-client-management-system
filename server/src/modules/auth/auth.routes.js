import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { currentSession, login, logout } from './auth.controller.js';

export const authRouter = Router();
const limitLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again later.' },
});

authRouter.post('/login', limitLogin, login);
authRouter.get('/me', requireAuth, currentSession);
authRouter.post('/logout', requireAuth, logout);
