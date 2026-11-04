# AffixxMedia Mini Client Management System

The application includes administrator sign-in, a protected dashboard, and client management backed by Express, Prisma, and MySQL. The dashboard shows counts by status and the five newest clients. The client list supports search by name, company, or email, status filters, and pagination.

## Local setup

Use Node.js 22.12 or later and a running MySQL server. Create an empty MySQL database and grant the application user access to it, including permission to create tables for the initial migration.

From the repository root:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
npm ci --prefix server
npm ci --prefix client
```

Set `DATABASE_URL`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` in `server/.env`. Choose a password of at least 12 characters and at most 72 UTF-8 bytes. URL-encode special characters in the database username or password. Generate a random JWT secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

```powershell
npm run db:generate --prefix server
npm run db:migrate --prefix server
npm run db:seed --prefix server
```

The seed preserves the existing account when run again with the same administrator email.

The Prisma migration is the setup source of truth. The matching standalone SQL export is at `database/schema.sql`.

Start the API and frontend in separate terminals:

```powershell
npm run dev --prefix server
npm run dev --prefix client
```

Open http://localhost:5173 and sign in with the seeded administrator email and password. Use `GET /api/health` to check the Express process and `GET /api/ready` to check MySQL connectivity. Readiness returns HTTP 503 when the database is unavailable.

Build the frontend with `npm run build --prefix client`.

## Authentication

- `POST /api/auth/login` accepts JSON with `email` and `password`. It returns the administrator profile and sets a one-hour HttpOnly session cookie.
- `GET /api/auth/me` returns the administrator profile for a valid session or HTTP 401.
- `POST /api/auth/logout` clears the session cookie and returns HTTP 204 for an authenticated session.

Use HTTPS and `NODE_ENV=production` to enable the Secure session cookie. Serve the frontend and API on the same site for the SameSite cookie policy, and configure `CLIENT_URL` to match the frontend origin. Configure the frontend host to serve `index.html` for client routes such as `/dashboard`.

## Client and dashboard API

All routes below require a valid session cookie.

| Method | Path | Result |
| --- | --- | --- |
| GET | `/api/clients` | Client list with `data` and `pagination`. Accepts `page`, `limit`, `search`, and `status`. |
| GET | `/api/clients/:id` | A single client |
| POST | `/api/clients` | Creates a client and returns HTTP 201 |
| PUT | `/api/clients/:id` | Replaces editable fields and returns the updated client |
| DELETE | `/api/clients/:id` | Deletes a client and returns HTTP 204 |
| GET | `/api/dashboard/stats` | Client totals by status and five recent clients |

Create and update accept JSON with `name`, `company`, `email`, `phone`, `status`, and `notes`. Only `name` is required. Status defaults to `LEAD` and also accepts `ACTIVE` or `INACTIVE`.
