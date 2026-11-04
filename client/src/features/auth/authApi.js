import { api } from '../../lib/api.js';

export async function getSession(signal) {
  const { data } = await api.get('/auth/me', { signal });
  return data.user;
}

export async function createSession(credentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data.user;
}

export async function deleteSession() {
  await api.post('/auth/logout');
}
