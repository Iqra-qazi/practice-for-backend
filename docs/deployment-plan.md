# Vercel Deployment Plan

## Repository structure and deployment roots

The existing project directories are `backend/` (Express, ESM, Mongoose) and `frontend/` (React + Vite). There are no `server/` or `client/` directories. To avoid moving files or breaking imports, Vercel project roots will be `backend/` for the server project and `frontend/` for the client project.

The frontend Axios client uses `VITE_API_URL` and `withCredentials: true`; API paths include `/api`, and an unset base URL keeps them same-origin for the Vite proxy. The frontend has a Vercel SPA rewrite.

## Serverless audit

| Area | Finding | Deployment action |
| --- | --- | --- |
| Database | `backend/src/db/db.js` contains a literal Atlas connection URI and starts a connection as an import side effect; connection completion is not awaited or cached. | Remove the literal from source, read `MONGODB_URI`, and cache the Mongoose connection/promise on `globalThis`. Never connect to the configured database during this work. |
| Local URLs | Vite proxies `/api` to the local Express port; Express CORS allows the exact `CLIENT_URL`. | Use `VITE_API_URL` for the deployed backend origin; retain the development proxy. |
| App/server split | `src/app.js` exports the Express app without listening. `server.js` calls `app.listen`, but starts DB connection without awaiting it. | Keep that separation; make `server.js` validate configuration, connect, then listen for local development. Add the Vercel function entry point. |
| Cookies | JWT is in the existing `token` cookie; production already uses `Secure` and `SameSite=None`, but the cookie is not `HttpOnly`. The client currently clears it with `document.cookie`. | Add `HttpOnly` and a matching server-side logout endpoint so the visible logout flow still works. Keep credentialed Axios requests. |
| Request/security middleware | No Helmet, body-size limit, health route, or safe final error middleware exists. | Add Helmet, bounded JSON/form bodies, `/api/health`, and generic error responses without stack traces. |
| Rate limiting | No rate limiter or in-memory limiter was found. | No limiter store is migrated and no Redis dependency is added. Existing auth rate limiting remains a limitation. |
| Background jobs | No backend `setTimeout`/`setInterval` jobs or cron handlers exist. There is one frontend search debounce, which is not a server job. | Do not invent cron work. `CRON_SECRET` is validated but unused until a real job exists. No cron schedule is added. |
| Real-time | No Socket.IO/WebSocket use or polling workflow was found. | No real-time transport changes. |
| Uploads | The existing Multer middleware uses memory storage with a 5 MB limit; no local-disk storage was found. | Do not change the existing upload middleware. If durable uploads are added later, use a cloud provider rather than function-local disk. |
| Secrets/history | A backend `.env` file exists and is ignored by `backend/.gitignore`; its values were not read. A literal MongoDB URI exists in backend source. No root `.git` directory exists. | Remove the source literal and add a root ignore rule. Git tracking/history cannot be checked in this workspace; rotate any credential that may have been committed and check the repository history after restoring its Git metadata. |

## Required implementation changes

1. Replace the source database URI with `MONGODB_URI` and cache Mongoose connections for serverless reuse.
2. Validate required server environment-variable names on local/serverless startup, without including values in errors or logs.
3. Configure exact-origin CORS using `CLIENT_URL`; retain credentials because the existing auth uses cookies.
4. Make auth cookies `HttpOnly`, `Secure`, and `SameSite=None` in production. Add a cookie-clearing logout endpoint and call it from the existing logout UI.
5. Add Helmet, body limits, health response, and generic production-safe error/404 handling.
6. Add `backend/api/index.js` and `backend/vercel.json` for Vercel routing; pass the nested API path through the rewrite and retain `server.js` for local listening only.
7. Update the admin seed script to use `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD`, hash the password, refuse if an admin or the seed email already exists, and never modify an existing account.
8. Configure the Vite `/api` development proxy and keep the Vite SPA rewrite. Set the deployed backend origin using `VITE_API_URL`.
9. Add names-only environment examples and `.env` ignore rules. Do not edit the existing private `.env` file.

Required server variable names: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `CRON_SECRET`, `ADMIN_SEED_EMAIL`, `ADMIN_SEED_PASSWORD`, `SMS_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, and `WHATSAPP_PHONE_NUMBER_ID`. `GOOGLE_CLIENT_ID` remains optional for the existing Google sign-in route. Messaging keys are placeholders only; there is no SMS/WhatsApp integration in the current app.

The current JWT has no expiry claim. To preserve existing token/authentication behavior, this plan validates `JWT_EXPIRES_IN` as a deployment setting but does not apply it to signing. Applying it would change current token lifetime and requires a separately approved auth change.

Required client variable name: `VITE_API_URL`. It is the backend origin without `/api`; client request paths supply that prefix. Client environment variables are public and must contain only this non-secret origin, never credentials.

## Explicitly out of scope

- Changing existing users, passwords, roles, authentication claims, application data, database names, or database credentials.
- Connecting to or mutating any Atlas database, running the seed script, or deploying.
- Adding donor, request, SMS/WhatsApp, cron, rate-limiting, WebSocket, or other portal features.
- Renaming `backend/` and `frontend/`; those remain the Vercel server/client project roots.

## Verification plan and constraints

- Use unit/in-process HTTP tests with a temporary local listener and fake configuration; do not load the private `.env` or connect to MongoDB.
- Verify startup environment validation, CORS allow/deny headers, body limits, health response, unauthenticated `401`, wrong-role `403`, role-bearing public signup rejection, and serializers that omit password hashes/tokens.
- Test admin seeding logic with an isolated fake model. Do not execute it against the configured database.
- Build the frontend with a non-secret `VITE_API_URL` build-time value and inspect output for the configured URL and absence of credential-like values.
- A real login/signup, Atlas connectivity, Vercel cookie behavior, seed against a target database, and Vercel cron execution require user-controlled credentials/deployment and cannot be tested here.
- No cron endpoints are planned because no jobs exist. If future 15–30 minute escalation is added, Vercel Hobby's daily-only schedule is insufficient; use Pro or an external scheduler that calls a `CRON_SECRET`-protected endpoint.

## Manual deployment outline

After implementation, deployment instructions in the root README will cover Atlas networking and database-user setup, Vercel project roots and environment variables, one-time controlled admin seeding, cookie/CORS settings, cron constraints, and rollback of both Vercel projects without database rollback or data deletion.
