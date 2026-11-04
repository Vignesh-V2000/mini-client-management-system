import { api } from '../../lib/api.js';

export async function listClients(params, signal) {
  const { data } = await api.get('/clients', { params, signal });
  return data;
}

export async function getClient(id, signal) {
  const { data } = await api.get(`/clients/${encodeURIComponent(id)}`, { signal });
  return data;
}

export async function saveClient(id, values) {
  const { data } = id
    ? await api.put(`/clients/${id}`, values)
    : await api.post('/clients', values);
  return data;
}

export async function deleteClient(id) {
  await api.delete(`/clients/${id}`);
}
