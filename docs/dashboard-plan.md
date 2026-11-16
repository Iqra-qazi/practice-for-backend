# Donor and Patient Dashboard Plan

## Repository inventory

### Phase 1 identity and authorization

- The only identity model is `user` in `backend/src/models/users.model.js`. It stores username, email, password hash, picture, role (`user` or `admin`), account status, and cart data.
- Public registration and Google sign-in create the default `user` role. No donor or patient role, profile, or verification workflow is present.
- Authentication uses the existing `token` cookie. The frontend obtains the current account through `GET /api/auth/me` and sends cookies with Axios.
- `authorize()` currently lets admins bypass every requested role. That behavior is unsuitable for future donor/patient routes, where role matching must be exact.
- `GET /api/auth/me` and the login/register/Google responses currently include the JWT in JSON as well as setting the cookie. The dashboard client does not consume that JSON token.
- The admin list query selects limited fields, but successful role/status changes serialize the full loaded account object. The response serializer must whitelist fields.

### Phase 2 donor profile

No Phase 2 donor profile implementation exists in this repository. There are no donor application, phone verification, health declaration, eligibility, availability, privacy preferences, donation-history, or donor-notification models or APIs.

### Existing APIs

| Method and path | Existing behavior |
| --- | --- |
| `POST /api/auth/register` | Public registration; creates a regular `user` account |
| `POST /api/auth/login` | Existing cookie-based login |
| `GET /api/auth/me` | Authenticated account lookup |
| `POST /api/auth/google` | Google sign-in |
| `GET /api/admin/users`, `GET /api/admin/stats` | Admin-only account listing/statistics |
| `PATCH /api/admin/users/:id/role`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/users/:id` | Admin-only account management |

### Missing models and APIs

There are no donor or patient/requester roles; donor or patient profiles; blood-request, response, donation-history, or notification models; or dashboard, donor, request, donor-search, and notification routes. In particular, none of these requested endpoints exist:

- `GET /api/dashboard/me`
- `GET|PUT /api/donor/profile`
- `PATCH /api/donor/availability`
- `GET /api/donor/history`
- `GET /api/requests/nearby`
- `POST /api/requests/:id/respond`
- `GET /api/requests/mine`
- `GET /api/notifications`

The current frontend has `/user` and `/admin` routes only. `/user` displays the signed-in account; it is not a donor or patient dashboard.

## Implementation plan

1. Keep the existing `/user` route and authentication/session mechanism. Use only the already-loaded, authenticated account for current profile details.
2. Present separate donor and patient/requester sections with clearly labeled “Coming soon” empty states. Do not show fabricated counts, requests, histories, eligibility, contact information, or controls that imply a backend update succeeded.
3. Keep donor request matching, response/decline actions, contact release, and notifications unavailable; these depend on missing APIs and matching/alerts work is explicitly deferred.
4. Do not add donor/patient roles or public role assignment without the missing server-controlled onboarding and verification workflows. Do not add Hospital, Blood Bank, or Admin dashboards.
5. Apply narrow security fixes required by this dashboard work: preserve the cookie session but omit JWTs from JSON responses; whitelist user fields in admin mutation responses; and make authorization require an exact role match. Do not change users, password hashes, MongoDB configuration, or environment values.
6. Add focused backend tests for role authorization and response serialization. Use non-mutating HTTP checks for missing authentication and confirm that the unimplemented donor/request routes remain unavailable.
7. Update the root README with the actual available functionality, limitations, and verification commands.

## Security rules

- Existing session authentication remains cookie-based. Dashboard screens never receive or store a bearer token.
- Current user data comes only from the authenticated account lookup; no dashboard accepts a client-supplied user ID.
- Future donor/request routes must apply authentication and exact server-side role checks before accessing data, and must scope queries to `req.user.id`.
- Donor phone and health data remain unavailable until consent, verification, and request-response APIs exist. Contact release must require donor acceptance.
- API serializers must use allowlists and never return password hashes, tokens, cart/internal fields, or unrelated account properties.
- No new sensitive API is introduced in this dashboard scope. Existing authentication endpoints do not currently have rate limiting; that remains a backend limitation rather than being silently represented as solved here.

## Verification boundaries

- The repository had no project-owned backend tests before this work; focused Node built-in tests have now been added for available security boundaries.
- There are no donor/patient test accounts or domain APIs. Donor A/B isolation, phone visibility after acceptance, and donor/patient endpoint integration tests cannot pass until those APIs and roles are implemented.
- Do not connect tests to the configured MongoDB instance, create test users, or alter existing data.

## Implementation record

- The existing `/user` page now presents the signed-in account and separate donor and patient/requester “Coming soon” sections. Unsupported controls, metrics, and personal health/contact data are not displayed.
- No donor or patient roles, domain models, routes, or APIs were added. Hospital, Blood Bank, and Admin dashboards were not changed.
- Cookie-based authentication and its URLs remain in place. Auth JSON responses no longer include the redundant JWT body field; the frontend already relies on the cookie and reads only `user`.
- Admin account list/mutation JSON now uses an allowlisted serializer. The role middleware now requires an exact match, so an admin does not implicitly pass a future donor-only or patient-only check.
- Added `backend/test/dashboard-security.test.js`, and `backend/package.json` now runs it with Node's built-in test runner.
- The test suite verifies unauthenticated 401s, exact-role 401/403/allow cases, safe auth/admin serialization, and confirms that donor/request routes are still 404.
- The frontend production build passed. Browser checks of the session-loading state, donor/patient empty states, and auth-service error redirect used a test-only intercepted `/api/auth/me` response; they did not access or modify MongoDB.

## Remaining limitations

- Donor/patient onboarding and roles are not yet available; current accounts remain `user` or `admin`.
- No donor profile, requests, history, search, contact-consent, notification, password-change, or language APIs exist. Those dashboard sections remain unavailable.
- Donor A/B isolation and phone release after acceptance cannot be exercised until the donor/request APIs exist.
- No new sensitive domain APIs were added, so none were rate-limited. Existing login/register rate limiting remains a separate backend limitation.
- A real authenticated account was not available. Successful login and real-account dashboard rendering were not tested.
