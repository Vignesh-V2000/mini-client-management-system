import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

const { ADMIN_EMAIL, ADMIN_PASSWORD, SMOKE_API_URL = 'http://localhost:5000/api' } = process.env;

test('seeded login, client persistence, search, dashboard, and logout', async () => {
  assert.ok(ADMIN_EMAIL && ADMIN_PASSWORD, 'Set the seeded administrator credentials in server/.env');
  const base = SMOKE_API_URL.replace(/\/$/, '');
  const marker = 'Smoke ' + randomUUID();
  const created = new Set();
  let cookie;

  async function request(path, method = 'GET', body, authenticated = true) {
    return fetch(base + path, {
      method,
      headers: {
        ...(authenticated && cookie ? { Cookie: cookie } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
  }

  async function expectJson(response, status) {
    assert.equal(response.status, status, 'Unexpected response for ' + response.url);
    return response.json();
  }

  async function create(body) {
    const client = await expectJson(await request('/clients', 'POST', body), 201);
    created.add(client.id);
    return client;
  }

  assert.equal((await request('/ready')).status, 200);
  assert.equal((await request('/auth/me')).status, 401);
  assert.equal((await request('/clients')).status, 401);
  assert.equal((await request('/dashboard/stats')).status, 401);

  const invalid = await request('/auth/login', 'POST', { email: ADMIN_EMAIL, password: 'invalid-' + randomUUID() });
  assert.equal(invalid.status, 401);
  const login = await request('/auth/login', 'POST', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  const { user } = await expectJson(login, 200);
  assert.equal(user.email, ADMIN_EMAIL.toLowerCase());
  assert.equal(Object.hasOwn(user, 'passwordHash'), false);
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i);
  cookie = setCookie.split(';')[0];

  try {
    assert.deepEqual(await expectJson(await request('/auth/me'), 200), { user });
    assert.equal((await request('/clients', 'POST', { name: 'x', email: 'invalid' })).status, 400);
    assert.equal((await request('/clients?page=0')).status, 400);

    const first = await create({ name: marker + ' Alpha', company: marker + ' 100%_Lab' });
    const second = await create({ name: marker + ' Beta', status: 'ACTIVE' });
    assert.equal(first.status, 'LEAD');
    assert.deepEqual(await expectJson(await request('/clients/' + first.id), 200), first);

    const search = encodeURIComponent(marker.toUpperCase());
    const page = await expectJson(await request('/clients?search=' + search + '&page=2&limit=1'), 200);
    assert.deepEqual(page.pagination, { page: 2, limit: 1, total: 2, totalPages: 2 });
    assert.deepEqual(page.data.map(({ id }) => id), [first.id]);

    const wildcard = encodeURIComponent(marker + ' 100%_');
    const companyMatch = await expectJson(await request('/clients?search=' + wildcard), 200);
    assert.deepEqual(companyMatch.data.map(({ id }) => id), [first.id]);
    const filtered = await expectJson(await request('/clients?search=' + search + '&status=ACTIVE'), 200);
    assert.deepEqual(filtered.data.map(({ id }) => id), [second.id]);

    const updated = await expectJson(await request('/clients/' + first.id, 'PUT', {
      name: first.name, status: 'INACTIVE', email: 'smoke@example.com',
    }), 200);
    assert.equal(updated.status, 'INACTIVE');
    assert.equal(updated.email, 'smoke@example.com');

    const stats = await expectJson(await request('/dashboard/stats'), 200);
    assert.equal(stats.totalClients, stats.activeClients + stats.leads + stats.inactiveClients);
    assert.ok(stats.recentClients.length <= 5);
    assert.ok(stats.recentClients.some(({ id }) => id === second.id));

    assert.equal((await request('/clients/' + first.id, 'DELETE')).status, 204);
    created.delete(first.id);
    assert.equal((await request('/clients/' + first.id)).status, 404);
    assert.equal((await request('/clients/' + first.id, 'DELETE')).status, 404);
  } finally {
    for (const id of created) {
      const response = await request('/clients/' + id, 'DELETE');
      assert.ok([204, 404].includes(response.status), 'Could not clean up smoke test client ' + id);
    }
  }

  const logout = await request('/auth/logout', 'POST');
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get('set-cookie'), /^[^=]+=;/);
  assert.equal((await request('/auth/me', 'GET', undefined, false)).status, 401);
});
