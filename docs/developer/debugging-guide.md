# SALIS AUTO -- Debugging Guide

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-DEV-005                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Frontend Debugging

### 1.1 React DevTools

Install the React DevTools browser extension for Chrome or Firefox.

**Component Tree Inspection:**

- Open DevTools > Components tab to browse the full component hierarchy.
- Select any component to inspect its current props, state, and hooks.
- The provider chain renders in order: `QueryClientProvider` > `PreferencesProvider` > `SessionProvider` > `RepositoryProvider` > `ToastProvider` > `ModalProvider` > `BrowserRouter`.

**Profiler:**

- Switch to the Profiler tab and record a session to identify slow renders.
- Look for components that re-render on every state change -- these often need `React.memo()` or `useMemo()`.
- Filter by commit duration to find renders exceeding 16ms (the 60fps budget).

### 1.2 TanStack Query DevTools

TanStack Query DevTools are enabled automatically in development builds. The floating panel appears in the bottom-left corner.

**Cache Inspection:**

- View all active queries and their states: `fresh`, `stale`, `fetching`, `inactive`.
- Cache keys follow the pattern `[collectionKey]` for lists and `[collectionKey, 'entity', id]` for single records.
- Stale time is 60 seconds -- queries older than this refetch on the next access.

**Common Checks:**

```
Query key: ["customers"]          -- List all customers
Query key: ["customers", "entity", "01HX..."]  -- Single customer
```

- Click a query to see its data payload, fetch timing, and error state.
- Use "Refetch" to manually trigger a query without reloading the page.
- Check "Observer count" to detect memory leaks (observers that never unmount).

### 1.3 Browser DevTools

**Network Tab:**

- Filter by `Fetch/XHR` to see API calls.
- Check request headers for `Authorization: Bearer <token>`.
- Verify the base URL matches `VITE_API_BASE_URL` (or confirm no network calls in mock mode).
- Look for 401/403/404/500 status codes -- see Section 4 for error pattern details.

**Console:**

- React strict mode logs double-render warnings in development -- these are expected.
- Look for `RepositoryError` messages with typed codes: `version_conflict`, `approval_required`, `forbidden`, `network`, `not_found`.

**Application Tab:**

- `localStorage` keys used by SALIS AUTO:

| Key            | Purpose                          | Mode      |
|----------------|----------------------------------|-----------|
| `salis-token`  | JWT access token                 | Live      |
| `salis-role`   | Active role identifier           | Mock      |
| `salis-lang`   | Language preference (`en`/`ar`)  | Both      |
| `salis-theme`  | Theme preference (`light`/`dark`)| Both      |
| `salis-notif`  | Notification preferences         | Both      |
| `salis-region` | Region setting                   | Both      |

### 1.4 RTL Debugging

When debugging Arabic/RTL layout issues:

- Check `document.dir` -- should be `"rtl"` when Arabic is selected.
- Verify the `PreferencesProvider` sets `<html dir="rtl" lang="ar">`.
- CSS should use logical properties: `margin-inline-start` not `margin-left`, `padding-inline-end` not `padding-right`.
- Text alignment should use `text-start`/`text-end` not `text-left`/`text-right`.
- Tailwind RTL utilities use the `rtl:` prefix for directional overrides.
- Test both directions: toggle language in the topbar and verify layout flips correctly.

---

## 2. Backend Debugging

### 2.1 Drizzle ORM Query Logging

Enable SQL logging by setting the log level to `debug` or `trace`:

```bash
# In server/.env
LOG_LEVEL=debug
```

All SQL queries are logged via Pino (Fastify's structured JSON logger). To analyze slow queries:

```sql
-- Run EXPLAIN ANALYZE on a suspected slow query
EXPLAIN ANALYZE
SELECT * FROM customers
WHERE org_id = '01HX...' AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 50;
```

Check that tenant queries hit the compound index on `(org_id, ...)` rather than doing sequential scans.

### 2.2 JWT Debugging

**Decode a token:**

Visit [jwt.io](https://jwt.io) and paste the token from `localStorage` key `salis-token` or the `Authorization` header.

**Common JWT issues:**

| Symptom                    | Cause                          | Fix                               |
|----------------------------|--------------------------------|-----------------------------------|
| Token rejected immediately | `JWT_SECRET` mismatch          | Ensure frontend and backend use the same secret |
| Token expired              | `exp` claim in the past        | Check token TTL settings; call refresh endpoint |
| Missing claims             | `userId`, `orgId`, `role` absent | Verify login endpoint returns complete payload |

**Check token structure:**

```json
{
  "userId": "01HX...",
  "orgId": "01HX...",
  "branchId": "01HX...",
  "role": "owner",
  "scope": "all",
  "iss": "salis-auto",
  "aud": "salis-auto-api",
  "exp": 1725300000
}
```

### 2.3 RBAC Debugging

The backend enforces RBAC through `requirePermission(principal, module, action)` in the 6-step CRUD pipeline.

**Check role permissions:**

- The PERMS matrix covers 28 modules x 14 roles with actions: `v` (view), `c` (create), `e` (edit), `d` (delete), `x` (export).
- Use the `SCREEN_MODULE` mapping to find which module a screen requires.
- SOD (Separation of Duties) is enforced on `estimates`, `requisitions`, `purchase_orders`, and `insurance_claims` -- the submitter cannot also approve.

**Field-level redaction:**

- The `presentRow(def, principal, row)` function applies field-level redaction based on role.
- If a field appears as `null` unexpectedly, check if the role has redaction rules for that field.

**Debugging steps:**

```bash
# Check what permissions a role has for a module
# Look in packages/contract or app/src/data/generated/rbac.ts

# Test with curl using different role tokens
curl http://localhost:3001/api/v1/invoices \
  -H "Authorization: Bearer <cashier-token>"
```

### 2.4 API Debugging

**Request/response logging:**

All requests are logged with structured JSON. Key fields:

```json
{
  "reqId": "req-1",
  "method": "GET",
  "url": "/api/v1/customers",
  "statusCode": 200,
  "responseTime": 12.5
}
```

**Middleware pipeline tracing:**

The request passes through: Helmet > CORS > Rate Limiter > onRequest (JWT) > Route Handler > onSend (x-request-id).

To trace which middleware rejected a request, check the response status:
- 429: Rate limiter (`RATE_LIMIT_MAX` exceeded)
- 401: JWT verification failed (onRequest hook)
- 403: RBAC check failed (route handler, step 1)
- 422: Zod validation failed (route handler, step 3)

**Error response format:**

```json
{
  "error": {
    "code": "forbidden",
    "message": "Insufficient permissions for module 'invoices' action 'c'",
    "requestId": "req-abc123"
  }
}
```

---

## 3. Database Debugging

### 3.1 Slow Query Identification

**Using pg_stat_statements:**

```sql
-- Enable the extension (once per database)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find the slowest queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Using EXPLAIN ANALYZE:**

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM job_cards
WHERE org_id = '01HX...' AND stage = 'repair'
ORDER BY created_at DESC;
```

Look for sequential scans on large tables -- they should use the compound index on `(org_id, status)` or `(org_id, assigned_tech_id)`.

### 3.2 RLS Policy Debugging

Row-level security filters rows by `current_setting('app.org_id')`. The `withTenant()` wrapper sets this via `SET LOCAL`.

**Test RLS policies manually:**

```sql
-- Simulate a tenant context
BEGIN;
SET LOCAL app.org_id = '01HX_ORG_A';
SET LOCAL app.branch_id = '01HX_BRANCH_1';
SET LOCAL app.user_id = '01HX_USER_1';
SET LOCAL app.scope = 'all';

-- This should return only Org A's rows
SELECT count(*) FROM customers;

-- Compare with superuser count (bypasses RLS)
ROLLBACK;
```

**OWNED_TABLES narrowing:**

Some tables apply additional scope-based RLS:

| Table          | Ownership Column    | Effect                            |
|----------------|---------------------|-----------------------------------|
| `job_cards`    | `assigned_tech_id`  | Technicians see only assigned jobs |
| `appointments` | `technician_id`     | Technicians see own appointments   |
| `crm_tasks`    | `created_by`        | Agents see own CRM tasks           |
| `user_sessions`| `user_id`           | Users see only own sessions        |

### 3.3 Migration Issues

**Check migration status:**

```bash
cd server
npx drizzle-kit status    # Shows pending migrations
```

**Schema drift detection:**

If the running schema differs from Drizzle definitions:

```bash
npx drizzle-kit push --dry-run    # Shows what would change without applying
```

**Common migration problems:**

| Symptom                     | Cause                          | Fix                            |
|-----------------------------|--------------------------------|--------------------------------|
| Column not found            | Migration not applied          | Run `npx drizzle-kit migrate`  |
| Unique constraint violation | Duplicate data from bad seed   | Truncate table and re-seed     |
| RLS blocking all rows       | `app.org_id` not set           | Ensure `withTenant()` wraps all queries |

---

## 4. Common Error Patterns

### 4.1 401 Unauthorized

| Scenario                    | Diagnosis                      | Resolution                     |
|-----------------------------|--------------------------------|--------------------------------|
| Token expired               | Decode JWT, check `exp` claim  | Frontend should call `POST /auth/refresh` |
| Refresh token expired       | 30-day TTL exceeded            | User must re-login             |
| Cookie not set              | `salis-token` missing from localStorage | Check login flow completion |
| Wrong JWT_SECRET             | Server restarted with different secret | Align secret across restarts |

### 4.2 403 Forbidden

| Scenario                    | Diagnosis                      | Resolution                     |
|-----------------------------|--------------------------------|--------------------------------|
| RBAC permission denied      | Role lacks permission on module | Check PERMS matrix for role/module/action |
| SOD violation               | Same user submitted and tried to approve | Different user must approve |
| Field redaction             | Role has field-level restrictions | Expected behavior -- not a bug |
| Scope restriction           | `own`/`assigned` scope filtering | User only sees their own records |

### 4.3 404 Not Found

| Scenario                    | Diagnosis                      | Resolution                     |
|-----------------------------|--------------------------------|--------------------------------|
| Wrong org_id scope          | RLS hiding the row             | Verify the record belongs to the user's org |
| Soft-deleted record         | `deleted_at` is set            | Pass `?includeDeleted=true` (requires `d` permission) |
| Wrong ID format             | Non-ULID passed as identifier  | Use 26-character ULID or human code |
| Cross-tenant lookup         | RLS returns 404, never 403     | By design -- tenant isolation  |

### 4.4 500 Internal Server Error

| Scenario                    | Diagnosis                      | Resolution                     |
|-----------------------------|--------------------------------|--------------------------------|
| Database connection failed  | PostgreSQL unreachable         | Check `DATABASE_URL` and DB status |
| Migration mismatch          | Code expects columns that don't exist | Run pending migrations |
| Null reference              | Unexpected null in business logic | Check server logs with `requestId` |
| Foreign key violation (23503)| Referenced record missing      | Returned as 422 `rule_violated` |
| Unique violation (23505)    | Duplicate code/email/etc.      | Returned as 409 with the colliding field |

---

## 5. ZATCA Debugging

### 5.1 XML Validation Errors

ZATCA e-invoicing requires XML conforming to the UBL 2.1 standard. Common validation failures:

| Error                        | Cause                          | Fix                            |
|------------------------------|--------------------------------|--------------------------------|
| Missing VAT number           | `vat_number` empty on org      | Set organization VAT in admin  |
| Invalid QR code              | Base64 encoding error          | Check TLV tag structure        |
| Hash chain break             | Previous invoice hash mismatch | Verify `prev_invoice_hash` column |
| Certificate expired          | Sandbox cert has 1-year TTL    | Renew ZATCA compliance certificate |

### 5.2 QR Code Encoding

ZATCA QR codes use TLV (Tag-Length-Value) encoding with Base64. To debug:

```bash
# Decode a ZATCA QR code (Base64 -> TLV tags)
echo "<qr-base64-string>" | base64 -d | xxd
```

Tags: 1 = Seller name, 2 = VAT number, 3 = Timestamp, 4 = Total, 5 = VAT amount, 6-9 = Digital signature fields.

### 5.3 Feature Flag

ZATCA integration is gated by `ff_zatca_enabled`. In local development, this flag defaults to `true` but can be disabled to skip e-invoicing validation during testing.

---

## 6. Performance Profiling

### 6.1 React Profiler

Use the React DevTools Profiler to record and analyze render performance:

1. Open DevTools > Profiler tab.
2. Click "Record" and interact with the application.
3. Stop recording and review the flame graph.
4. Look for components with high "Self time" or frequent re-renders.

### 6.2 Lighthouse

Run Lighthouse audits for performance, accessibility, and best practices:

```bash
# Via Chrome DevTools
# Open DevTools > Lighthouse tab > Generate report

# Or via CLI
npx lighthouse http://localhost:5173 --output html --output-path report.html
```

Key metrics to monitor:
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1

### 6.3 Bundle Analysis

Analyze the production bundle to identify large dependencies:

```bash
cd app
npx vite-bundle-visualizer
```

This generates an interactive treemap showing chunk sizes. Every screen is `React.lazy()` loaded, so the initial bundle should contain only the shell and the current route's chunk.

### 6.4 Backend Performance

**Request timing:**

All requests log `responseTime` in milliseconds. Filter structured logs for slow endpoints:

```bash
# Find requests slower than 500ms (using jq on JSON logs)
cat server.log | jq 'select(.responseTime > 500)'
```

**Database query timing:**

Enable `LOG_LEVEL=debug` to see individual SQL query durations. Look for N+1 query patterns where a list query triggers individual lookups.

---

## 7. Debugging Checklist

When investigating an issue, follow this sequence:

1. **Reproduce**: Can you trigger the issue consistently?
2. **Check the console**: Browser console for frontend, server logs for backend.
3. **Inspect the network**: Is the API call being made? What status code returns?
4. **Check authentication**: Is the token present, valid, and unexpired?
5. **Check authorization**: Does the role have the required permission?
6. **Check tenant context**: Is the data scoped to the correct org_id?
7. **Check the database**: Is the data present? Is it soft-deleted? Is RLS filtering it?
8. **Check migrations**: Is the schema up to date?
9. **Check generated data**: Was `npm run port-design` run after design changes?

---

## Related Documents

- [Local Development Guide](./local-development.md)
- [Release Process](./release-process.md)
- [Backend Architecture](../system/architecture/backend-architecture.md)
- [Database Design](../system/architecture/database-design.md)
- [Environment Setup](../system/operations/environment-setup.md)
