# Scalability — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-SCL-003                              |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Scalability                              |

## 1. Overview

This document defines the scalability requirements for SALIS AUTO, a multi-tenant platform that must serve multiple automotive workshops simultaneously. The architecture is designed around tenant isolation via `org_id`, stateless JWT authentication, and database-level row security, enabling horizontal scaling without application-layer session affinity.

## 2. Multi-Tenant Architecture

### 2.1 Tenant Isolation Model

Every tenant-owned table carries an `org_id` column that references the `organizations` table:

```sql
org_id varchar(26) NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT
```

The SALIS AUTO codebase declares 54 tenant-scoped tables in `TENANT_TABLES`, each enforcing isolation through Row-Level Security (RLS) policies.

### 2.2 Row-Level Security (RLS)

- RLS policies are applied via the migration `drizzle/0001_rls.sql`
- The current tenant context is set at the PostgreSQL session level
- The `withTenant()` function in `db/tenant.ts` sets the RLS context for each request
- Cross-tenant reads return 404 (not 403), preventing entity existence disclosure

### 2.3 Organization Table

The `organizations` table sits above tenancy:

| Field       | Type          | Description                       |
|-------------|---------------|-----------------------------------|
| id          | varchar(26)   | ULID primary key                  |
| name        | varchar(200)  | Organization name                 |
| slug        | varchar(80)   | URL-friendly identifier           |
| cr_number   | varchar(20)   | Commercial Registration number    |
| vat_number  | varchar(20)   | VAT registration number           |
| plan        | varchar(40)   | Subscription tier: starter, business, enterprise |
| status      | varchar(20)   | active, suspended, cancelled      |

### 2.4 Tenant Data Guarantees

- **No shared-table data leakage**: RLS ensures a query from tenant A never returns tenant B's rows
- **Foreign key integrity**: All FK references include `org_id` context
- **Unique constraints are per-tenant**: Indexes like `customers_org_phone_idx` are on `(org_id, phone)`, not `phone` alone

## 3. Horizontal Scaling Strategy

### 3.1 Stateless Application Tier

The application tier is horizontally scalable because:

- **JWT tokens are self-contained**: Access token verification requires no server-side state lookup
- **No server-side session storage**: Session data lives in the `user_sessions` table (for refresh tokens only), not in application memory
- **No sticky sessions**: Any application instance can serve any tenant's request

### 3.2 Scaling Model

```
                   ┌─────────────┐
                   │ Load Balancer│
                   └──────┬──────┘
              ┌───────────┼───────────┐
         ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
         │ App N=1 │ │ App N=2 │ │ App N=3 │
         └────┬────┘ └────┬────┘ └────┬────┘
              └───────────┼───────────┘
                   ┌──────▼──────┐
                   │ Connection  │
                   │   Pooler    │
                   └──────┬──────┘
                   ┌──────▼──────┐
                   │ PostgreSQL  │
                   │  (+ RLS)    │
                   └─────────────┘
```

### 3.3 Application Instance Requirements

Each application instance must:

- Load the RBAC matrix from `@salis/contract` at startup (immutable, no cross-instance sync needed)
- Connect to PostgreSQL through the connection pooler
- Handle any tenant's request (stateless)

## 4. Database Partitioning

### 4.1 Partitioning Strategy

For large deployments, tables can be partitioned by `org_id`:

- **Partition key**: `org_id` (consistent across all tenant tables)
- **Partition type**: Hash partitioning for even distribution
- **Candidate tables**: `audit_log` (append-only, grows fastest), `inventory_movements` (high write volume), `job_cards`, `invoices`

### 4.2 Index Strategy for Scale

All 54 tenant-scoped tables have indexes leading with `org_id`:

| Index Pattern              | Purpose                               |
|----------------------------|---------------------------------------|
| `(org_id)`                 | RLS policy evaluation                 |
| `(org_id, branch_id, ...)` | Branch-scoped queries                 |
| `(org_id, code)`           | Business code lookups (unique)        |
| `(org_id, status)`         | Status-filtered listings              |
| `(org_id, ts)`             | Time-ordered queries (audit log)      |

### 4.3 Query Ceiling

- Maximum page size: 200 rows per API request
- Export ceiling: 50,000 rows per export request
- Audit trail scan limit: 200 rows per SoD check
- Pagination is mandatory — there is no unpaginated list endpoint

## 5. Connection Pooling

### 5.1 Requirements

- Connection pool between application tier and PostgreSQL
- Minimum pool size scales with tenant count
- Maximum pool size bounded to prevent database connection exhaustion
- Connection timeout with queue for burst traffic

### 5.2 RLS and Connection Pooling

RLS session variables must be set per-transaction, not per-connection, when using a pooler. The `withTenant()` function sets the RLS context at the start of each transaction and resets it on completion.

## 6. CDN and Static Assets

### 6.1 Static Asset Strategy

- Vite-built frontend assets served via CDN
- Content-addressable filenames (hash-based) for cache busting
- Long cache TTLs (1 year) for immutable assets
- Index.html served with short cache (5 min) or no-cache

### 6.2 Asset Types

| Asset Type      | Cache Policy       | CDN   |
|-----------------|--------------------|-------|
| JS bundles      | Immutable, 1 year  | Yes   |
| CSS             | Immutable, 1 year  | Yes   |
| Fonts           | Immutable, 1 year  | Yes   |
| Images          | Immutable, 1 year  | Yes   |
| index.html      | No-cache           | Yes   |
| API responses   | No CDN caching     | No    |

## 7. API Pagination

### 7.1 Pagination Contract

Every list endpoint returns a `PageMeta` envelope:

```json
{
  "data": [...],
  "page": {
    "page": 1,
    "pageSize": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

### 7.2 Pagination Limits

| Parameter  | Default | Minimum | Maximum |
|------------|---------|---------|---------|
| page       | 1       | 1       | Unlimited |
| pageSize   | 25      | 1       | 200     |

### 7.3 Sort and Filter

- `sort` parameter: `field:asc` or `field:desc` — only declared `sortable` fields accepted
- `filter[field]` parameter: equality match — only declared `filterable` fields accepted
- `q` parameter: ILIKE search across declared `search` columns
- Unknown sort/filter fields return HTTP 400 (not a silent fallback)

## 8. Idempotency

### 8.1 Idempotency Keys

The `idempotency_keys` table prevents duplicate business effects from replayed requests:

| Field           | Type          | Description                            |
|-----------------|---------------|----------------------------------------|
| org_id          | varchar(26)   | Tenant context                         |
| key             | varchar(128)  | Client-provided idempotency key        |
| endpoint        | varchar(160)  | API endpoint path                      |
| request_hash    | varchar(64)   | Digest of request body                 |
| response_status | integer       | Stored response status                 |
| response_body   | jsonb         | Stored response body                   |

### 8.2 Replay Behavior

- Same key + same body: return stored response (no side effects)
- Same key + different body: HTTP 409 (bug on the caller's side)
- Unique per `(org_id, key, endpoint)` — scoped to tenant and endpoint

## 9. Growth Projections

### 9.1 Data Volume Estimates

| Entity            | Rows/org/month | Growth Driver                    |
|-------------------|----------------|----------------------------------|
| Job cards         | 200-2000       | Workshop throughput              |
| Invoices          | 200-2000       | 1:1 with completed jobs          |
| Audit log entries | 5000-50,000    | ~25 entries per job lifecycle    |
| Inventory movements | 1000-10,000  | Parts consumption per job        |
| Appointments      | 150-1500       | Scheduled visits                  |

### 9.2 Scaling Triggers

| Metric                    | Threshold    | Action                          |
|---------------------------|--------------|----------------------------------|
| API p95 latency           | > 500ms      | Add application instances        |
| Database CPU              | > 70%        | Read replicas or partitioning    |
| Connection pool saturation| > 80%        | Increase pool size or add pooler |
| Audit log size            | > 10M rows   | Partition by org_id              |
| Storage growth            | > 80% disk   | Expand storage or archive        |

## 10. Cross-References

- [Performance](./performance.md) — Response time targets and caching
- [Reliability](./reliability.md) — Concurrency control and error handling
- [Security](./security.md) — RLS enforcement and JWT statelessness
- [Admin & Portals](../functional/admin-portals.md) — Organization and branch management
- [Finance & Accounting](../functional/finance-accounting.md) — High-volume invoice and payment data
