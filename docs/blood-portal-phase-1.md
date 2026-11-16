# Blood Donor Portal — Phase 1 Identity and Onboarding Rules

## Scope

Phase 1 defines identity, onboarding, role assignment, and verification boundaries. It does not add blood-domain models, routes, or UI. Phase 2 must not begin until these rules and the existing-authentication checks are reviewed.

## Existing authentication baseline

- The existing `user` collection is the identity store. It contains unique `username` and `email`, a password hash, optional picture, a `role` enum (`user` or `admin`, default `user`), an account `status` (`active` or `blocked`), and a cart reference.
- `POST /api/auth/register` accepts `username`, `email`, and `password`; it does not accept a role. Passwords are hashed with bcrypt before persistence.
- `POST /api/auth/login` accepts email or username with a password and issues a JWT cookie.
- `GET /api/auth/me` requires that cookie and returns the signed-in account.
- The JWT contains an account ID and role, but authentication reloads the account from MongoDB and uses its current role and status. A blocked account is denied.
- Admin routes use token authentication and server-side admin authorization. Public registration must not be used to create or promote an administrator.
- The existing Google-auth route also creates accounts without accepting a role; new accounts use the model's default role.

The connection configuration, existing accounts, password hashes, token behavior, and auth routes are compatibility constraints. Phase 1 does not migrate or rewrite them.

## Onboarding and verification policy

Verification is separate from the existing global `active`/`blocked` account status. A pending or unverified profile must not receive verified-organization permissions.

| Account type | Onboarding | Role/permission rule |
| --- | --- | --- |
| Admin | Initial admin is provisioned by the existing backend bootstrap script. Later role changes use the admin-protected role endpoint. | Never selectable in public signup. Only the trusted bootstrap process or an already-authorized admin may grant it. |
| Donor | A signed-in person submits a donor application/profile. Verify their phone with OTP before contact-based donor actions. Identity/profile review and clinical screening remain separate checks. | A public request must not directly assign the donor role. The server controls any role transition; an unverified donor cannot be presented as medically eligible or receive requests as an eligible match. |
| Patient | Blood requests may be submitted without an account. An optional patient account can be onboarded through a server-controlled, non-privileged flow. | Anonymous requesters do not receive an authenticated account role. Signup cannot assign privileged roles. |
| Hospital | An organization submits an application and required institution/contact evidence. Admin review must approve it before hospital dashboard permissions are enabled. | Public signup cannot assign a verified hospital role. Store application/verification state separately from account status. |
| Blood Bank | An organization submits an application and required institution/contact evidence. Admin review must approve it before stock-management or verified-directory permissions are enabled. | Public signup cannot assign a verified blood-bank role. Stock data must remain clearly unverified until its source is approved. |

### Medical and privacy rules

- Phone verification does not establish medical eligibility.
- The 90-day donation interval may support reminders or screening prompts; it must never automatically establish eligibility. A qualified medical screening decision is required.
- Donor contact details and health information are private. Public search may expose only coarse location and approved donor availability, never a residential address or phone number.
- Share donor contact information only for a specific request after the donor explicitly accepts and consents.
- Compatibility results are limited to the configured blood product and are informational. Hospital staff remain responsible for clinical decisions and crossmatching.
- Public emergency requests need server-side validation, abuse controls, and moderation/verification states before they can trigger bulk notifications.

## Initial administrator bootstrap

The existing `backend/scripts/createAdmin.js` is the initial-admin process:

1. Provide `ADMIN_EMAIL` and `ADMIN_PASSWORD` through the backend's untracked environment file or deployment secret store. The script requires a password of at least 12 characters. Never put these values in a `VITE_` variable or commit them.
2. From the backend directory, run `node scripts/createAdmin.js` once.
3. The script promotes the matching account to active admin without changing its password, or creates an account with a bcrypt-hashed password if no matching email exists.
4. Remove temporary bootstrap values from the execution environment when provisioning is complete.

This script uses the existing database connection. Do not run it as part of routine application startup or expose it as a public API.

## Future implementation boundaries

- Keep the existing user collection as the authentication identity. Add donor, emergency-request, hospital, blood-bank, stock, event, donation, notification, report, and audit records as separately scoped domain data linked to an account where applicable; do not duplicate password or identity storage.
- Preserve the existing `user` role for current accounts during any later role expansion. Do not silently convert existing users to donors, patients, hospitals, or blood banks.
- Keep account blocking separate from donor/organization verification and medical-screening states.
- Grant organization access only after server-side verification. Keep admin actions behind existing server-side authorization and add audit records when the relevant audit model is implemented.
- Keep OTP/SMS/WhatsApp credentials server-side. If a provider is not configured, report that delivery is unavailable rather than claiming success.
- No Phase 2 models, endpoints, role migrations, or frontend modules are included in Phase 1.

## APIs and changes in this phase

No API or authentication behavior is changed in Phase 1. The APIs above are the existing authentication contract; blood-domain endpoints will be specified before their implementation in later phases.

## Verification checklist

- Confirm missing/invalid sessions are rejected by `/api/auth/me` and admin APIs.
- Confirm public registration cannot set `role` and that no test registration is made against the existing database.
- Confirm the admin bootstrap script requires its explicit environment inputs; do not execute it during tests.
- Test successful login/logout only with an explicitly provided test account. Do not inspect private environment files or create production test accounts.

## Phase 1 verification results

- `GET /api/auth/me` without a cookie returned `401`.
- `GET /api/admin/users` without a cookie returned `401`.
- `POST /api/auth/login` with a non-existent `.invalid` address returned `404`; this did not create or alter a user.
- Instantiating the user model without saving confirmed the current defaults are `role: "user"` and `status: "active"`.
- Calling the admin authorization middleware with a regular-user role returned `403` and did not call `next`.
- `node --check` passed for the existing auth controller, auth middleware, authorization middleware, and admin bootstrap script.
- Source inspection confirmed public registration only reads `username`, `email`, and `password`; no registration request was sent because it would write to the existing database.
- No authenticated test account was available. Successful login, logout, and role-specific authenticated redirects were therefore not exercised. The backend package currently has no automated test suite; its `test` script is a placeholder.

No authentication route, schema, password hash, token behavior, or MongoDB connection was changed in Phase 1.
