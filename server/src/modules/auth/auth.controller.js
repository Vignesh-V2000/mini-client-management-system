import { verifyCredentials } from './auth.service.js';
import { cookieOptions, createSessionToken, sessionCookie, sessionLifetime } from './auth.session.js';
import { loginSchema } from './auth.validation.js';

export async function login(request, response) {
  const credentials = loginSchema.safeParse(request.body);
  if (!credentials.success) {
    return response.status(400).json({ message: 'Enter a valid email and password' });
  }

  const { email, password } = credentials.data;
  const user = await verifyCredentials(email, password);
  if (!user) return response.status(401).json({ message: 'Invalid email or password' });

  response.cookie(sessionCookie, createSessionToken(user.id), {
    ...cookieOptions,
    maxAge: sessionLifetime * 1000,
  });
  response.json({ user });
}

export function currentSession(request, response) {
  response.json({ user: request.user });
}

export function logout(_request, response) {
  response.clearCookie(sessionCookie, cookieOptions);
  response.sendStatus(204);
}
