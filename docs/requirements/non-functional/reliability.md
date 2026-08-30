# Reliability — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-REL-006                              |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Reliability                              |

## 1. Overview

This document defines the reliability requirements for SALIS AUTO, covering uptime targets, error handling, graceful degradation, optimistic concurrency, data integrity constraints, soft deletes, and transaction isolation. The platform must remain operational and data-consistent under concurrent multi-tenant workloads.

## 2. Uptime Targets

### 2.1 Service Level Objectives

| Metric                  | Target   | Maximum Downtime (monthly) |
|-------------------------|----------|----------------------------|
| Platform availability   | 99.9%    | ~43 minutes                |
| API availability        | 99.9%    | ~43 minutes                |
| Database availability   | 99.95%   | ~22 minutes                |
| Scheduled maintenance   | < 4h/mo  | Pre-announced window       |

### 2.2 Degraded Mode Thresholds

| Metric              | Warning    | Critical   | Action                      |
|---------------------|------------|------------|-----------------------------|
| API p95 latency     | > 500ms    | > 2s       | Scale horizontally          |
| Error rate          | > 1%       | > 5%       | Alert and investigate       |
| Database connections| > 70%      | > 90%      | Pool expansion / throttle   |
| Queue depth         | > 100      | > 500      | Scale workers               |

## 3. Error Handling

### 3.1 Error Taxonomy

The `ApiError` class provides a consistent error envelope:

| Error Code          | HTTP Status | Usage                                    |
|---------------------|-------------|------------------------------------------|
| bad_request         | 400         | Invalid input, malformed request         |
| unauthenticated     | 401         | Missing or expired token                 |
| forbidden           | 403         | Insufficient permissions                 |
| not_found           | 404         | Record not found (or cross-tenant)       |
| conflict            | 409         | Optimistic concurrency conflict          |
| version_conflict    | 409         | Record changed since last read           |
| rule_violated       | 422         | Business rule violation                  |
| approval_required   | 422         | Amount above approval ceiling            |
| validation_failed   | 422         | Input validation failure                 |

### 3.2 Error Response Format

Every error returns a consistent JSON envelope:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable description",
    "field": "optional_field_name",
    "requestId": "correlation-id"
  }
}
```

### 3.3 Error Security Rules

- **Cross-tenant reads return 404, not 403**: A 403 would confirm the record exists, leaking information about another tenant's data
- **Unexpected errors never expose internals**: Stack traces and driver messages are logged with the request ID; the client receives only the request ID for correlation
- **Auth failures are generic**: Login failures do not distinguish "user not found" from "wrong password"

## 4. Graceful Degradation

### 4.1 Repository Seam Pattern

The frontend uses a repository seam (`mockRepository` / `httpRepository`) enabling graceful degradation:

| Mode             | Behavior                                         |
|------------------|--------------------------------------------------|
| httpRepository   | Live API calls via HTTP client                   |
| mockRepository   | Returns fixture data from `generated/tables.ts`  |

This pattern enables:

- Development without a running backend
- Offline-capable demo mode
- Testing with deterministic fixture data
- Fallback when API is unreachable (planned)

### 4.2 Auth Provider Degradation

SSO and WebAuthn endpoints return HTTP 503 when not configured, with a clear error message:

```
ProviderNotConfigured: "SSO is not configured for this deployment."
```

This is a deployment state, not a caller error — the server honestly reports what is available.

### 4.3 OTP Transport Degradation

OTP transport modes degrade explicitly:

| Transport     | Behavior                                          |
|---------------|---------------------------------------------------|
| unconfigured  | Refuses to pretend a code was delivered (default) |
| log           | Writes code to server log (development only)      |
| memory        | In-memory storage (test suite only)               |

## 5. Optimistic Concurrency Control

### 5.1 Version Column

Every tenant-owned table has a `version` column (integer, default 1):

- Client reads include the current version
- Write operations include `WHERE version = :read_version`
- If the row has been modified since reading, the update affects zero rows
- Zero affected rows triggers an HTTP 409 with `version_conflict` code

### 5.2 If-Match Header

The `If-Match` header pattern:

1. Client reads a record, receiving `version: N`
2. Client sends update with `If-Match: N`
3. Server validates `version = N` in the WHERE clause
4. If matched: update succeeds, `version` increments to `N+1`
5. If not matched: return 409 with message "This record changed since you loaded it"

### 5.3 Scope of Concurrency Control

| Table          | Concurrency Control | Notes                              |
|----------------|--------------------|------------------------------------|
| All tenant tables | version column  | Standard optimistic locking        |
| organizations  | version column     | Org settings changes               |
| audit_log      | None (append-only) | No updates or deletes permitted    |

### 5.4 Conflict Resolution

When a conflict occurs:

1. The server returns 409 with the conflict message
2. The client refetches the current version of the record
3. The user reviews changes and resubmits
4. React Query cache invalidation triggers automatic refetch

## 6. Data Integrity

### 6.1 Foreign Key Constraints

- All tenant FK references use `ON DELETE RESTRICT` — preventing deletion of referenced records
- `org_id` references `organizations.id` with `ON DELETE RESTRICT` — a tenant cannot be accidentally deleted
- Soft deletes (`deleted_at`) are preferred over hard deletes

### 6.2 Unique Constraints

Per-tenant unique constraints prevent data duplication:

| Table        | Unique Columns            | Index Name                     |
|--------------|---------------------------|--------------------------------|
| users        | (org_id, email)           | users_org_email_idx            |
| customers    | (org_id, phone)           | customers_org_phone_idx        |
| vehicles     | (org_id, plate)           | vehicles_org_plate_idx         |
| vehicles     | (org_id, vin)             | vehicles_org_vin_idx           |
| parts        | (org_id, sku)             | parts_org_sku_idx              |
| invoices     | (org_id, code)            | invoices_org_code_idx          |
| estimates    | (org_id, code)            | estimates_org_code_idx         |
| job_cards    | (org_id, code)            | job_cards_org_code_idx         |
| suppliers    | (org_id, code)            | suppliers_org_code_idx         |
| requisitions | (org_id, code)            | requisitions_org_code_idx      |
| purchase_orders | (org_id, code)         | purchase_orders_org_code_idx   |
| expenses     | (org_id, code)            | expenses_org_code_idx          |
| payroll_runs | (org_id, period)          | payroll_runs_org_period_idx    |

### 6.3 Check Constraints

- Money fields use `bigint` to prevent floating-point rounding
- Received quantity invariant: `received_qty <= qty` on purchase order lines
- Rating values constrained to valid ranges
- Status values constrained to defined enums via application-level validation

### 6.4 Derived Field Protection

Server-owned fields are never accepted from client input. The `SERVER_OWNED_KEYS` list strips these from request bodies:

- id, orgId, branchId, createdAt, updatedAt, createdBy, updatedBy, deletedAt, version
- vehicleCount, totalSpentHalalas, paidHalalas, estimatedTotalHalalas

## 7. Soft Deletes

### 7.1 Mechanism

All tenant-owned tables support soft deletes via the `deleted_at` timestamp column:

- **Delete**: Sets `deleted_at = NOW()` instead of removing the row
- **Default queries**: Filter `WHERE deleted_at IS NULL`
- **Recovery**: Clear `deleted_at` to restore the record (audited as `restore` action)
- **Bulk delete**: Sets `deleted_at` on multiple rows in one operation

### 7.2 Query Behavior

The `listRows()` function applies `isNull(deletedAt)` by default. The `includeDeleted` parameter overrides this for administrative use cases (audit investigation, data recovery).

### 7.3 Referential Integrity with Soft Deletes

Soft-deleted records remain in the database, so:

- Foreign key references remain valid (no orphaned references)
- Historical data is preserved (job card history, invoice records)
- Unique constraints still apply to soft-deleted rows (prevents re-creation conflicts)

## 8. Transaction Isolation

### 8.1 Transaction Scope

Each API write operation runs in a single database transaction via `withTenant()`:

- RLS context set at transaction start
- All mutations (data change + audit row) within the same transaction
- Automatic rollback on any error

### 8.2 Audit Consistency

Audit rows are written in the same transaction as the business change. If the transaction rolls back, the audit entry also rolls back — no phantom audit records.

**Exception**: SOD violation rejections are audited in a **separate** transaction, because the caller's transaction is about to roll back and the rejection record must survive.

### 8.3 Idempotency

The `idempotency_keys` table prevents duplicate business effects:

- A replayed `Idempotency-Key` returns the stored response
- Same key + different body returns 409 (caller bug detection)
- Unique per `(org_id, key, endpoint)`

## 9. Cross-References

- [Performance](./performance.md) — Response time targets under load
- [Scalability](./scalability.md) — Connection pooling and RLS transaction management
- [Security](./security.md) — Error handling security (no information disclosure)
- [Workshop Operations](../functional/workshop-operations.md) — Job card transition concurrency
- [Finance & Accounting](../functional/finance-accounting.md) — Invoice payment balance consistency
