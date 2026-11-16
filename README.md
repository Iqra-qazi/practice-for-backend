# Rabta Blood Donor Portal

Rabta is a React/Vite frontend with an Express/MongoDB authentication backend. The current backend is an account portal, not yet a donor or emergency-request platform.

## Current functionality

- Cookie-based registration, login, Google sign-in, and current-account lookup.
- Authentication JSON responses contain a serialized user only; the existing session token remains in the cookie.
- Existing regular-user dashboard displays the signed-in account and clearly marks donor/patient services as coming soon.
- Existing admin routes and account-management pages remain separate from this dashboard work.
- Public signup creates a regular `user` account. The backend currently has only `user` and `admin` roles.

## Donor and patient dashboard status

No donor/patient roles, donor profile, verification, blood request, donation history, donor search, or notification models/APIs currently exist. The dashboard does not invent data or expose unsupported actions. Donor availability, request tracking/matching, contact sharing, profile/password editing, and language switching remain unavailable.

See [docs/dashboard-plan.md](./docs/dashboard-plan.md) for the repository inventory, security boundaries, missing APIs, implementation scope, and verification limits. Phase 2 donor-profile work and the later matching/alerts phase have not been implemented.

## Development and verification

Frontend:

```powershell
cd frontend
npm run dev
npm run build
```

For local development, the Vite proxy forwards `/api` requests to the Express backend on port `3000`. If `VITE_API_URL` is set, use the backend origin without an `/api` suffix.

Backend tests are non-mutating and do not connect to MongoDB:

```powershell
cd backend
npm test
```

To run the backend locally, configure all required names from `backend/.env.example` in a private environment file, then run `npm run dev`. The server validates configuration before connecting. Keep credentials server-side; never add them to frontend code or `VITE_` variables.

## Vercel deployment

See [docs/deployment-plan.md](./docs/deployment-plan.md) for the audited changes and constraints.

The repository folders are named `backend` and `frontend`; use them as two independent Vercel projects:

1. **MongoDB Atlas:** use the existing Atlas deployment and database. Add a least-privilege database user and allow the Vercel backend's outbound access according to Atlas networking guidance. Set the complete connection string only as the backend's `MONGODB_URI`; do not put it in source, frontend variables, or logs. This code change does not connect to or migrate any database.
2. **Backend project:** import the repository in Vercel and set **Root Directory** to `backend`. Deploy the Express function from `api/index.js`. Add the backend variables listed below. Set `CLIENT_URL` to the exact deployed frontend origin (scheme and host, no path); credentialed browser requests are allowed only from this origin.
3. **Client project:** import the same repository as a second Vercel project and set **Root Directory** to `frontend`. Add `VITE_API_URL` with the deployed backend origin, without an `/api` suffix. Client API paths include `/api`. This variable is public. Do not put database credentials, JWT secrets, SMS keys, or WhatsApp keys in any `VITE_` variable.
4. Deploy the backend first, then set the client API URL and backend `CLIENT_URL` to the final deployed origins. Redeploy both projects after changing environment variables.
5. Authentication uses an `HttpOnly`, `Secure`, `SameSite=None` cookie in production. Axios sends credentials; the backend CORS origin must exactly match the client origin. Vercel preview URLs are not automatically allowed—configure the preview environment's `CLIENT_URL` explicitly if previews need authentication.

Complete the Atlas network/database-user setup and Vercel project/environment-variable configuration in the dashboards yourself. If using custom domains, add and verify the DNS records in Vercel, then update both `CLIENT_URL` and `VITE_API_URL` to the final origins. No cron scheduler setup is needed for the current code because there are no scheduled jobs or cron endpoints.

### Backend environment variables

Set these in the backend Vercel project. Values are intentionally omitted here and in `backend/.env.example`.

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (required as a deployment setting; not applied to signing because the existing JWT lifetime is intentionally unchanged)
- `CLIENT_URL`
- `CRON_SECRET` (reserved; there are no cron jobs or cron endpoints in the current backend)
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- `SMS_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `GOOGLE_CLIENT_ID` (optional; required only if Google sign-in is used)

The SMS and WhatsApp variables are placeholders; no messaging provider is integrated. Do not create or expose client-side copies.

### Client environment variables

- `VITE_API_URL` — the backend origin, for example `https://<backend-project-domain>`.

`frontend/.env.example` contains only the variable name. In local development, leave it unset to use the Vite proxy or set it to the backend origin.

### Initial administrator

The public registration endpoint rejects any submitted `role`. The only provided initial-admin path is the one-time `npm run seed:admin` command from `backend/`, using `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, and `MONGODB_URI` in a controlled environment. It hashes the password and refuses if any admin exists or if the selected email/username is already occupied; it never promotes or edits an existing user. Do not run it against production until you have verified the target database and authorized the creation. It was not run during this task.

### Background jobs and rate limits

No background jobs, WebSockets, or rate limiter exist in the current server. No cron endpoint or Vercel cron is configured, and the required `CRON_SECRET` is reserved until a real job is implemented. If a future 15–30 minute escalation job is added, Vercel Hobby's daily-only cron schedule is insufficient; use Vercel Pro or an external scheduler calling a secret-protected endpoint. Existing sensitive endpoints do not currently have rate limiting; no in-memory limiter was present to migrate.

### Rollback

Use Vercel's deployments page to promote the previous known-good deployment independently for the backend and client projects. If the backend rollback changes environment-variable requirements, restore the matching previous server variables as well. This deployment preparation does not change schema or data, so rollback requires no database restore or migration reversal. Never delete or replace the Atlas database as part of rollback.

### Deployment limitations

- Real Atlas connectivity, existing-account login, Vercel cross-domain cookie behavior, and production seeding require user-managed credentials and deployment; they were not exercised here.
- No existing rate limiting, SMS/WhatsApp integration, or cron workload was found. These remain unimplemented.
- This workspace has no Git metadata, so tracked-file status and repository history could not be inspected. A MongoDB URI was found in backend source during the audit and has been removed from the working source; if it was ever committed, rotate that credential and inspect the restored repository history.
- The production JWT expiry behavior remains unchanged. `JWT_EXPIRES_IN` is validated as required configuration but is not used to issue expiring tokens.
