# Week 2 Follow-up Notes

## Refresh Token Enhancements
- Implement token rotation and revoke endpoints (logout, device revocation).
- Update OpenAPI spec + DTOs after backend endpoints land.

## Frontend Coverage
- Replace smoke script with Playwright or Cypress journey covering login + product browse.
- Add protected route to demonstrate token usage in client-side requests.

## Docker & CI
- Promote `docker build --target production` to run nightly and publish image artifact.
- Add `npm run smoke` to CI once backend preview environment is available.
- Preview backend contract:
  - Provide stable HTTPS endpoint exposed via secret `PREVIEW_BASE_URL`.
  - Ensure seeded admin creds remain valid for automation (`admin@ncs.co.th` / `admin123`).
  - Allow 30s warm-up; smoke job should poll `/health` before hitting `/auth/login` and `/products`.
  - Return consistent JSON payloads to keep `scripts/smoke.mjs` assertions stable; document changes before rollout.
  - Publish preview URL and token requirements to the platform runbook so CI can adopt without manual updates.
- Apply new Prisma migrations (`npx prisma migrate deploy`) in shared dev/preview environments before exercising admin flows.

## Reporting
- Capture screenshots of new catalog/auth UI for Week 1 report addendum.
- Update execution report with Docker build validation timestamp.
