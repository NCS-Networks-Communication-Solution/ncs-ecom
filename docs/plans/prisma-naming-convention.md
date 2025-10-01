# Prisma Naming Convention Decision (Week 1)

## Background
- Day 4 execution (see `context/5.4. Step 4 Database Seeding (1430-1600) - Execution Report.md`) highlighted friction when switching between snake_case database columns and camelCase TypeScript usage.
- Upcoming deliverables from the Month 1 execution plan (see the `context/0.*` Month 1 execution plan document) rely on rapid backend iteration and shared DTOs.

## Decision
- Retain snake_case column names in PostgreSQL for compatibility with existing Day 1-4 SQL scripts.
- Expose camelCase field names in Prisma models using `@map`/`@@map` so generated TypeScript clients align with NestJS and Next.js coding standards.

## Rationale
1. **Developer Experience** - CamelCase field names keep parity with the OpenAPI DTOs (Day 1 API spec work) and reduce adapter code in NestJS services.
2. **Backwards Compatibility** - `@map` preserves the physical schema generated from earlier context steps (`context/5. Day Four/2.1. Day 4 Step 2- Expand Database Schema (10-30-12-00).txt`).
3. **Testing & CI** - Aligning Prisma and service naming unblocks Day 2 CI pipelines (`context/3. Day Two/Day 2 Step 3.txt`) by removing TypeScript type mismatches.

## Follow-up
- Regenerate Prisma migrations reflecting the new schema mappings (tracked separately in the construction plan).
- Update seed and fixture data to reference camelCase fields (completed in this change set; see `backend/prisma/seed.ts`).
- Communicate convention in the Week 1 report addendum once database migrations are refreshed.
