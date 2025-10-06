# NCS B2B E-Commerce Platform

This repository contains the source code for the NCS Networks B2B e-commerce platform, a strategic initiative to modernize networking equipment procurement in Thailand.

## Project Overview

The platform is a mobile-first, bilingual (Thai/English) Progressive Web App (PWA) designed to serve both enterprise customers and reseller partners. It provides a self-service portal with real-time pricing, stock visibility, and a streamlined RFQ-to-Order process.

**Core Technologies:**
- **Frontend:** Next.js (React)
- **Backend:** NestJS (Node.js/TypeScript) - Modular Monolith Architecture
- **Database:** PostgreSQL
- **Cache & Message Queue:** Redis
- **Hosting:** On-premise Proxmox VE Cluster

This project is developed following the guidelines outlined in the official Technical Design and Execution Plan documents.

## Quick start (local playthrough)

1. Copy the sample environment variables and adjust as needed:
   ```bash
   cp .env.example .env
   ```
   The same file feeds both Docker Compose and the backend runtime so the API and frontend share the `http://localhost:3000/api` base URL.
2. Launch the end-to-end demo workflow:
   ```bash
   ./scripts/playthrough.sh
   ```
   The helper script will:
   - Start Postgres/Redis via `docker compose` and wait for Postgres to accept connections.
   - Install backend dependencies, run Prisma migrations, and seed demo data.
   - Boot the NestJS API on port 3000 and wait for `/api/health` to pass.
   - Install frontend dependencies and run `npm run dev -- --port 3100` with `NEXT_PUBLIC_API_URL=http://localhost:3000/api`.

Open http://localhost:3100 for the UI. Press `Ctrl+C` to stop the frontend; the script automatically tears down the backend dev server and (unless `KEEP_SERVICES=true`) stops the Docker services.

> Need different ports? Override `PORT` (backend), `FRONTEND_PORT`, or `NEXT_PUBLIC_API_URL` when invoking the script, e.g. `PORT=4000 FRONTEND_PORT=4200 ./scripts/playthrough.sh`.
### Seeded demo data (from `prisma/seed.ts`)

- **Companies**
  - `ncs-company-id` — *NCS Networks*, tier `GOLD`
  - `test-company-id` — *Test Corporation*, tier `STANDARD`
- **Users**
  - System Admin: `admin@ncs.co.th` / `admin123`
  - Sales User: `sales@ncs.co.th` / `user123`
  - Buyer: `buyer@test.com` / `user123`
- **Sample products** (abbreviated)
  - `SW-24P-1G` — 24-Port Gigabit Managed Switch (฿15,000)
  - `RT-ENT-5G` — Enterprise 5G Router (฿32,000)
  - `WLC-500` — Wireless Controller 500 APs (฿120,000)

These fixtures mirror the execution reports from Week 1 and power the end-to-end demo flows.

## Admin/API smoke checklist

Use the seeded System Admin account to authenticate once, then reuse the access token for the protected endpoints below. Replace `$TOKEN` with the value from the login response.

```bash
# 1) Login (returns access & refresh tokens)
curl -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"admin@ncs.co.th","password":"admin123"}'

# Optional: refresh the token pair when needed
curl -X POST http://localhost:3000/api/auth/refresh   -H "Content-Type: application/json"   -d '{"refreshToken":"<paste refresh token here>"}'

# 2) Admin overview dashboard (totals for companies, orders, etc.)
curl http://localhost:3000/api/admin/overview   -H "Authorization: Bearer $TOKEN"

# 3) Update a company tier (e.g., promote Test Corporation)
curl -X PUT http://localhost:3000/api/admin/companies/test-company-id/tier   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"tier":"PLATINUM"}'

# 4) Bulk import cart items via CSV (buyer context)
printf 'productId,quantity
sw-24p-1g-id,2
rt-ent-5g-id,1
' > /tmp/cart.csv
curl -X POST http://localhost:3000/api/cart/bulk-import   -H "Authorization: Bearer $TOKEN"   -F file=@/tmp/cart.csv

# 5) Verify cart totals reflect the CSV upload
curl http://localhost:3000/api/cart   -H "Authorization: Bearer $TOKEN"

# 6) Smoke-check admin product inventory
curl "http://localhost:3000/api/admin/products?search=SW"   -H "Authorization: Bearer $TOKEN"
```

These commands extend the UI playthrough by validating the non-UI administrative flows referenced in the execution plan reports. They ensure the checklist covers authentication refresh, company management, and CSV import logic alongside the standard catalog and cart interactions.


# CI Clean Run - Mon Sep 29 15:22:13 +07 2025
