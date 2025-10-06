# Auth Refresh Token Alignment (Week 1)

## Context
- Day 4.5 debugging logs (`context/5. Day Four/4.3. Day 4.5 Debugging`) revealed that the NestJS auth responses did not match the OpenAPI contract defined on Day 1 (`spec/openapi.yaml`).
- Requirement: issue access + refresh tokens with consistent casing (`accessToken`, `refreshToken`) and enumerate expiry metadata for frontend integration.

## Decision
- Implemented refresh-token persistence via a dedicated `refresh_tokens` table (see Prisma migration `20250930041917_add_refresh_tokens`).
- Updated `AuthService` to generate contract-compliant responses with `accessToken`, `refreshToken`, and `expiresIn` values aligned to the 24-hour access token window.
- Added DTO validation (`RegisterDto`, `LoginDto`) and enabled global validation to ensure request bodies mirror the OpenAPI schema.

## Evidence
- Jest suite (`npm run test` in `backend`) covers register/login flows with refresh-token interactions.
- Prisma migrations: `20250930041658_init`, `20250930041917_add_refresh_tokens` (captured under `docs/evidence/week-1/`).
- Docker-based Postgres refreshed via Day 1 compose stack before reapplying migrations.

## Follow-up
- Expose refresh-token rotation & revocation endpoints in Week 2 to support logout/device management.
- Update Week 1 execution report to document contract alignment and new evidence artifacts.
