import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const sessionCookie = env.NODE_ENV === 'production' ? '__Host-affixx_session' : 'affixx_session';
export const sessionLifetime = 60 * 60;
export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

const tokenOptions = {
  issuer: 'affixx-client-management',
  audience: 'affixx-admin',
};

export function createSessionToken(userId) {
  return jwt.sign({}, env.JWT_SECRET, {
    ...tokenOptions,
    algorithm: 'HS256',
    expiresIn: sessionLifetime,
    subject: String(userId),
  });
}

export function readSessionUserId(cookieHeader) {
  const prefix = `${sessionCookie}=`;
  const cookie = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
  if (!cookie) return null;

  try {
    const payload = jwt.verify(cookie.slice(prefix.length), env.JWT_SECRET, {
      ...tokenOptions,
      algorithms: ['HS256'],
      maxAge: sessionLifetime,
    });
    if (typeof payload.sub !== 'string' || !/^[1-9]\d*$/.test(payload.sub)) return null;
    const id = Number(payload.sub);
    return id <= 2147483647 ? id : null;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return null;
    throw error;
  }
}
