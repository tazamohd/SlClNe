# Backend Architecture

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-002                               |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

The SALIS AUTO backend is a Fastify application written in TypeScript, using Drizzle ORM 0.36 over PostgreSQL. It serves a multi-tenant REST API under the `/api/v1` prefix, enforcing tenant isolation through PostgreSQL row-level security (RLS), RBAC permission checks, and an append-only audit trail on every mutation.

## 2. Server Structure

### 2.1 Application Bootstrap (`app.ts`)

The `buildApp()` function assembles the Fastify instance in a strict order:

1. **Helmet** -- CSP with `default-src: 'none'`, `frame-ancestors: 'none'`
2. **CORS** -- Origins from `CORS_ORIGINS` env var, credentials enabled
3. **Rate Limiter** -- `RATE_LIMIT_MAX` per minute, keyed by `orgId:IP`
4. **JWT Verifier** -- HS256 verification for Bearer tokens
5. **Auth Module** -- Login, refresh, OTP, session management
6. **onRequest Hook** -- Authenticates all requests except explicitly public paths
7. **Error Handler** -- Uniform error envelope (`{ error: { code, message, field?, requestId } }`)
8. **Routes** -- Registered under `/api/v1` prefix

### 2.2 Public Paths

Requests to these paths skip authentication:

- `/health` -- Liveness probe (never touches the database)
- `/ready` -- Readiness probe (`SELECT 1` against the database)
- `/api/v1/public/leads` -- Unauthenticated marketing intake
- `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/refresh`, etc.

Everything else is authenticated by default -- a new route is authenticated unless explicitly exempted.

## 3. Middleware Pipeline

Every authenticated request passes through:

```
Helmet (security headers)
  -> CORS (origin validation)
    -> Rate Limiter (orgId:IP budget)
      -> onRequest (JWT verification -> Principal)
        -> Route Handler
          -> onSend (x-request-id header)
```

The `onRequest` hook extracts the Bearer token from the `Authorization` header and verifies it against the JWT secret, producing a `Principal` object with `userId`, `orgId`, `branchId`, `role`, and `scope`.

## 4. Collection Engine

### 4.1 CollectionDef Registry (`registry.ts`)

Every data collection is described by a `CollectionDef` in the `COLLECTIONS` array. Each definition specifies:

| Field         | Purpose                                    |
|---------------|--------------------------------------------|
| `key`         | Repository key (e.g., `customers`)         |
| `path`        | URL segment (e.g., `customers`)            |
| `table`       | Drizzle schema table reference             |
| `module`      | RBAC module for permission checks          |
| `entity`      | Audit log entity name                      |
| `search`      | Columns searched by `?q=`                  |
| `sortable`    | Columns accepted by `?sort=`               |
| `filterable`  | Columns accepted by `?filter[x]=`          |
| `defaultSort` | Default ordering                           |
| `codeColumn`  | Human-readable code (e.g., `INV-2026-001`) |
| `present`     | Transform function for API responses       |
| `writable`    | Whether generic CRUD writes are enabled    |

### 4.2 Uniform CRUD Handler (6-Step Pipeline)

Every collection route handler follows the same six steps in the same order:

1. **Authorize** -- `requirePermission(principal, module, action)` checks the PERMS matrix
2. **Open Tenant Transaction** -- `withTenant(db, principal, fn)` sets RLS context
3. **Validate** -- Zod schema parsing via `parseOr422()`, server-owned keys rejected
4. **Apply** -- Database operation (insert/update/soft-delete) with optimistic concurrency
5. **Audit** -- `writeAudit(tx, input)` records the change in the same transaction
6. **Present** -- `presentRow(def, principal, row)` applies field-level redaction

### 4.3 Generated Routes

`registerCollectionRoutes()` iterates the `COLLECTIONS` array and registers for each:

| Verb     | Path               | Action | Permission |
|----------|--------------------|--------|------------|
| `GET`    | `/{path}`          | List   | `v`        |
| `GET`    | `/{path}/export`   | Export | `x`        |
| `GET`    | `/{path}/:id`      | Detail | `v`        |
| `POST`   | `/{path}`          | Create | `c`        |
| `PATCH`  | `/{path}/:id`      | Update | `e`        |
| `DELETE` | `/{path}/:id`      | Delete | `d`        |
| `POST`   | `/{path}/bulk-update` | Bulk update | `e` |
| `POST`   | `/{path}/bulk-delete` | Bulk delete | `d` |

### 4.4 Bespoke Route Modules

Entities with lifecycle logic, line items, or derived money have dedicated routers:

| Module                  | Routes                                    |
|-------------------------|-------------------------------------------|
| `routes/invoices.ts`    | Issue, payment recording, summary          |
| `routes/estimates.ts`   | Submit, approve with SOD and ceiling       |
| `routes/workshop.ts`    | Job card transitions (checkin -> repair -> qc -> delivery) |
| `routes/procurement.ts` | Requisitions, PO lifecycle, receiving      |
| `routes/insurance-claims.ts` | Submit, approve, reject, pay          |
| `routes/payroll.ts`     | Post payroll run (freezes totals)          |
| `routes/leave.ts`       | Leave request approve/reject              |
| `routes/bank.ts`        | Bank statement matching/reconciliation     |
| `routes/obd.ts`         | OBD device commands (rescan, clear codes)  |
| `routes/inventory.ts`   | Stock movements, transfers, reservations   |
| `routes/crm.ts`         | Lead conversion to opportunity             |
| `routes/approvals.ts`   | Unified approval queue                     |
| `routes/fleets.ts`      | Fleet contract management                  |
| `routes/public.ts`      | Public lead intake (rate-limited)          |

## 5. Query Layer (`query.ts`)

### 5.1 `listRows()`

Provides uniform list operations for all collections:

- **Pagination**: Page/pageSize with total count (max 200 per page)
- **Sorting**: Validated against `sortable` columns; unknown keys return 400
- **Filtering**: `?filter[status]=active` matched as equality; unknown keys return 400
- **Search**: `?q=term` matched as `ILIKE` across declared `search` columns
- **Soft Deletes**: Excluded by default; `?includeDeleted=true` requires `d` permission

### 5.2 `findOne()`

Looks up a record by ULID or, when a `codeColumn` is defined, by human business code. Cross-tenant reads return 404, never 403.

## 6. CSV Export

The export path (`GET /{path}/export`) walks all pages up to a `MAX_EXPORT_ROWS` ceiling of 50,000 rows. Formula injection protection prefixes cells starting with `=`, `+`, `-`, `@`, tab, or CR with a single quote. Truncation is reported via `X-Export-Truncated: true` header and logged.

## 7. Audit System (`audit/audit.ts`)

Every mutation writes an audit row inside the same transaction as the change. The audit log is append-only at the database level (trigger refuses UPDATE and DELETE).

### 7.1 Audit Actions

`create`, `update`, `delete`, `restore`, `bulk_update`, `bulk_delete`, `transition`, `assign`, `approve`, `reject`, `post`, `issue`, `pay`, `movement`, `receive`, `reserve`, `release`, `command`, `seed`

### 7.2 Credential Scrubbing

The `scrub()` function removes sensitive keys from audit payloads: `password`, `passwordHash`, `refreshToken`, `accessToken`, `token`, `codeHash`, `secret`, `otp`.

## 8. Tenant Isolation (`db/tenant.ts`)

### 8.1 Transaction Wrapper

`withTenant(db, principal, fn)` opens a PostgreSQL transaction and sets session-local variables:

```sql
SET LOCAL app.org_id    = :orgId;
SET LOCAL app.branch_id = :branchId;
SET LOCAL app.user_id   = :userId;
SET LOCAL app.scope     = :scope;
```

RLS policies in the database read these settings, so a handler that omits a `WHERE org_id = ...` clause still cannot see another tenant's rows.

### 8.2 Atomicity

The mutation and its audit row share a transaction -- both land or neither does.

## 9. Error Handling

### 9.1 Error Taxonomy (`http/errors.ts`)

| Factory               | Code                | Status |
|------------------------|---------------------|--------|
| `badRequest()`         | `bad_request`       | 400    |
| `unauthenticated()`   | `unauthenticated`   | 401    |
| `forbidden()`         | `forbidden`         | 403    |
| `notFound()`          | `not_found`         | 404    |
| `conflict()`          | `conflict`          | 409    |
| `versionConflict()`   | `version_conflict`  | 409    |
| `ruleViolated()`      | `rule_violated`     | 422    |
| `approvalRequired()`  | `approval_required` | 422    |
| `validationFailed()`  | `validation_failed` | 422    |

### 9.2 Database Error Mapping

- **23505** (unique violation): Mapped to 409 with the colliding field extracted from the constraint name
- **23503** (foreign key violation): Mapped to 422 with `rule_violated`
- **Unexpected errors**: Logged with request ID; client receives only the ID, never a stack trace

## 10. Idempotency (`http/idempotency.ts`)

The `idempotency_keys` table stores a hash of the request body alongside the response. A replayed `Idempotency-Key` header returns the stored response. A same key with a different body hash is refused (409) rather than silently replayed.

## Related Documents

- [Frontend Architecture](./frontend-architecture.md)
- [Database Design](./database-design.md)
- [Data Flow](./data-flow.md)
- [Security Architecture](../security/security-architecture.md)
