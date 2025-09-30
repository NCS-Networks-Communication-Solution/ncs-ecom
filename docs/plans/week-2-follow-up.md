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

## Reporting
- Capture screenshots of new catalog/auth UI for Week 1 report addendum.
- Update execution report with Docker build validation timestamp.
