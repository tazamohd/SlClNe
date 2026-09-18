<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API overview

**Status:** GENERATED · **Source of truth:** the route files · **Sources as of:** 2026-09-18

390 endpoints under `/api/v1`, plus the two unauthenticated probes.

## How the surface is built

**254 of them are generated.** `server/src/registry.ts` describes each of the 53 collections once — its table, the permission module that gates it, the columns `?q=` searches and `?sort=`/`?filter[]=` accept, and how a row is presented — and `server/src/routes/collections.ts` produces the uniform routes from that description. The alternative, 53 hand-written routers, guarantees that one of them forgets the soft-delete filter or the permission check.

**136 are written out.** Anything with behaviour of its own: estimates and invoices carry line items, derived money and idempotency; procurement carries approval ceilings; authentication is its own surface.

## Cross-cutting contract

| Concern | How it works | Where |
| --- | --- | --- |
| Authentication | Bearer access token, applied as an `onRequest` hook to everything except a named public list. A route added later is authenticated by default and must be named explicitly to be public. | `server/src/app.ts` |
| Authorization | Module + action grant checked server-side on every request. The frontend copy hides and disables only. | `server/src/security/permissions.ts` |
| Tenant isolation | Postgres row-level security keyed on `app.org_id`, set per transaction. A connection with no context set sees nothing. | `server/drizzle/0001_rls.sql` |
| Concurrency | Optimistic, on `version`. The database trigger bumps it, so a stale write is refused rather than silently applied. | `server/drizzle/0001_rls.sql` |
| Idempotency | An `Idempotency-Key` replay returns the stored response and creates no second business effect. A different body under the same key is refused, not replayed. | `server/src/http/idempotency.ts` |
| Audit | Append-only. The table rejects `UPDATE` and `DELETE` for everyone including the owner. | `server/drizzle/0011_audit_log_statement_immutability.sql` |
| Money | Integer halalas end to end. Totals are computed server-side; a client-sent total is never trusted. | `packages/contract/src/rules/money.ts` |

## Unauthenticated surface

Everything reachable without a token, in full. This list is short on purpose and every addition to it is a security decision.

| Method | Path | Declared in |
| --- | --- | --- |
| POST | `/api/v1/public/customers/register` | `server/src/auth/routes.ts` |
| POST | `/api/v1/public/customers/resend-otp` | `server/src/auth/routes.ts` |
| POST | `/api/v1/public/customers/verify-otp` | `server/src/auth/routes.ts` |
| POST | `/api/v1/public/leads` | `server/src/routes/public.ts` |
| GET | `/health` | `server/src/routes/health.ts` |
| GET | `/ready` | `server/src/routes/health.ts` |

## Endpoints by domain

| Domain | Endpoints | Generated | Explicit | With a stated permission guard |
| --- | --- | --- | --- | --- |
| accounting | 28 | 20 | 8 | 28 |
| ai | 8 | 6 | 2 | 8 |
| appointments | 9 | 8 | 1 | 9 |
| approvals | 5 | 3 | 2 | 5 |
| auth | 24 | 0 | 24 | 0 |
| crm | 45 | 38 | 7 | 45 |
| customers | 19 | 16 | 3 | 19 |
| dashboard | 4 | 3 | 1 | 4 |
| departments | 9 | 8 | 1 | 9 |
| estimates | 22 | 11 | 11 | 22 |
| hr | 48 | 40 | 8 | 48 |
| insurance | 22 | 12 | 10 | 22 |
| inventory | 13 | 8 | 5 | 13 |
| invoices | 14 | 6 | 8 | 14 |
| jobcards | 57 | 38 | 19 | 57 |
| payments | 11 | 6 | 5 | 11 |
| platform | 3 | 0 | 3 | 0 |
| procurement | 28 | 14 | 14 | 28 |
| settings | 8 | 6 | 2 | 8 |
| technicians | 4 | 3 | 1 | 4 |
| vehicles | 9 | 8 | 1 | 9 |
