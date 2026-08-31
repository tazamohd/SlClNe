# Monitoring and Logging

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-002                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO produces structured JSON logs with PII redaction, maintains an append-only audit trail for every mutation, and exposes health endpoints for container orchestration. This document covers what is logged, how it is protected, and how the system is monitored.

## 2. Structured Logging

### 2.1 Logger Configuration

The application uses Pino (Fastify's default structured logger) configured in `server/src/logger.ts`. Every environment outputs JSON -- there is no pretty-printer, because a second formatting path would create an unredacted output channel.

```
Log Level: Configurable via LOG_LEVEL env var
Values:   fatal | error | warn | info | debug | trace | silent
Default:  info
```

### 2.2 Request Logging

Every request is logged with:

| Field    | Content                          | Redaction              |
|----------|----------------------------------|------------------------|
| `id`     | Fastify request ID               | None (correlation key) |
| `method` | HTTP method                      | None                   |
| `url`    | Path without query string        | Query params stripped   |
| `ip`     | Client IP (via `trustProxy`)     | None (needed for audit)|

The `onSend` hook attaches `x-request-id` to every response, giving clients and log consumers the same correlation handle.

### 2.3 PII Redaction at Source

The logger's `redact` configuration ensures sensitive data never reaches log storage:

**Request Headers**:
- `authorization` -- Bearer tokens
- `cookie` -- session cookies
- `idempotency-key` -- request fingerprints

**Request Body Fields**:
- `password`, `newPassword` -- credentials
- `otp`, `token`, `refreshToken` -- authentication secrets
- `phone`, `email` -- personal identifiers
- `buyerVatNumber` -- tax identifiers

**Wildcard Patterns** (`*.<field>`):
- `password`, `passwordHash` -- anywhere in nested objects
- `refreshToken`, `accessToken` -- token values
- `codeHash` -- OTP digests

All redacted values appear as `[redacted]` in the log output.

## 3. Error Classification

### 3.1 Error Log Levels

| Error Type                  | Status | Log Level | Client Receives            |
|-----------------------------|--------|-----------|----------------------------|
| Permission denied (RBAC)    | 403    | `warn`    | Code, message               |
| Validation failure (Zod)    | 400    | --        | Code, message, field path   |
| Unique violation (PG 23505) | 409    | --        | Code, colliding field       |
| FK violation (PG 23503)     | 422    | --        | `rule_violated` message     |
| Version conflict            | 409    | --        | `version_conflict` message  |
| Approval ceiling exceeded   | 422    | --        | Ceiling amount, escalation  |
| Rate limit exceeded         | 429    | --        | `Too many requests`         |
| Unhandled / unexpected      | 500    | `error`   | Request ID only             |

### 3.2 Error Envelope

Every error response follows the same structure:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Human-readable explanation",
    "field": "email",
    "requestId": "req-1234"
  }
}
```

5xx responses never expose stack traces, SQL errors, table names, or file paths. The `requestId` is the only handle for incident correlation.

### 3.3 Database Error Mapping

PostgreSQL driver error codes are mapped to API error codes:

| PG Code | Meaning           | API Code        | Extra Data                 |
|---------|-------------------|-----------------|----------------------------|
| `23505` | Unique violation  | `conflict`      | Field name from constraint |
| `23503` | FK violation      | `rule_violated` | Generic message             |

The unique violation field is extracted from the constraint name pattern `<table>_org_<column>_idx`, allowing the frontend to highlight the specific form control.

## 4. Audit Trail

### 4.1 Append-Only Guarantee

The `audit_log` table has a database trigger that refuses UPDATE and DELETE operations. An application user cannot edit history even holding the application role. This is enforced at the PostgreSQL level, not by application convention.

### 4.2 Audit Row Structure

| Column       | Type           | Purpose                              |
|--------------|----------------|--------------------------------------|
| `id`         | varchar(26)    | ULID (sortable by time)              |
| `org_id`     | varchar(26)    | Tenant scope                         |
| `branch_id`  | varchar(26)    | Branch scope                         |
| `actor_id`   | varchar(26)    | Who performed the action              |
| `actor_role` | varchar(32)    | Role at time of action                |
| `action`     | varchar(40)    | One of 18 action types                |
| `entity`     | varchar(64)    | Business entity name                  |
| `entity_id`  | varchar(64)    | Record identifier                     |
| `before`     | jsonb          | State before mutation (scrubbed)      |
| `after`      | jsonb          | State after mutation (scrubbed)       |
| `reason`     | text           | Business reason (SOD violations, etc.)|
| `source`     | varchar(24)    | `api`, `seed`, `job`, or `import`     |
| `request_id` | varchar(64)    | Correlation to HTTP request           |
| `ip`         | varchar(64)    | Client IP address                     |
| `user_agent` | text           | Client identifier                     |
| `ts`         | timestamptz    | Event timestamp                       |

### 4.3 Audit Actions

The 18 recorded action types:

| Action        | Trigger                                    |
|---------------|--------------------------------------------|
| `create`      | New record inserted                        |
| `update`      | Existing record modified                   |
| `delete`      | Record soft-deleted                        |
| `restore`     | Soft-deleted record restored               |
| `bulk_update` | Batch update applied                       |
| `bulk_delete` | Batch soft-delete applied                  |
| `transition`  | Workflow state change (e.g., job card stage)|
| `assign`      | Record assigned to a user                  |
| `approve`     | Approval action on a document              |
| `reject`      | Rejection or SOD violation refusal         |
| `post`        | Ledger posting (payroll, journal)          |
| `issue`       | Document issuance (invoice)                |
| `pay`         | Payment recording                          |
| `movement`    | Inventory stock movement                   |
| `receive`     | Goods received against PO                  |
| `reserve`     | Stock reservation                          |
| `release`     | Stock reservation release                  |
| `command`     | External device command (OBD)              |
| `seed`        | Initial data seeding                       |

### 4.4 Credential Scrubbing

Before writing audit payloads, the `scrub()` function recursively removes sensitive keys from `before` and `after` objects:

Scrubbed keys: `password`, `passwordHash`, `password_hash`, `refreshToken`, `refreshTokenHash`, `refresh_token_hash`, `accessToken`, `token`, `codeHash`, `code_hash`, `secret`, `otp`

These are replaced with `[redacted]` in the stored JSONB.

### 4.5 Transactional Integrity

The audit row and the business mutation share a single PostgreSQL transaction. Both land or neither does -- there is no state where a change happened without a record of it.

The one exception is SOD violation auditing: rejection is recorded in a separate transaction because the caller's transaction is about to roll back, and an audit row inside it would vanish.

### 4.6 Audit Indexes

| Index                  | Columns                          | Purpose                |
|------------------------|----------------------------------|------------------------|
| `audit_entity_idx`     | `(org_id, entity, entity_id)`    | Record history lookup  |
| `audit_ts_idx`         | `(org_id, ts)`                   | Time-range queries     |

## 5. Health Monitoring

### 5.1 Application Probes

| Endpoint  | Type      | Checks                | Status Codes          |
|-----------|-----------|-----------------------|-----------------------|
| `/health` | Liveness  | Process running       | 200 always             |
| `/ready`  | Readiness | Database connectivity | 200 (ready), 503 (unavailable) |

The liveness probe never touches the database. A database blip must not restart healthy containers.

### 5.2 System Health Table

The `system_health` table stores platform-level metrics:

| Column           | Type    | Metric                        |
|------------------|---------|-------------------------------|
| `uptime_pct`     | float   | Uptime percentage             |
| `queue_depth`    | integer | Background job queue depth    |
| `error_rate_pct` | float   | Error rate percentage         |
| `db_size_gb`     | float   | Database size in GB           |
| `active_sessions`| integer | Active user sessions          |

### 5.3 Rate Limit Headers

The API returns IETF draft rate-limit headers on every response:

| Header               | Purpose                              |
|----------------------|--------------------------------------|
| `RateLimit-Limit`    | Maximum requests in the window       |
| `RateLimit-Remaining`| Requests remaining in current window |
| `RateLimit-Reset`    | Seconds until the window resets      |

These are exposed through CORS (`Access-Control-Expose-Headers`) so frontend clients can read them.

## 6. Segregation of Duties Monitoring

SOD violations are audited with action `reject` and a reason field of `sod_violation:<pair>`. This makes them queryable:

```sql
SELECT * FROM audit_log
WHERE action = 'reject'
  AND reason LIKE 'sod_violation:%'
ORDER BY ts DESC;
```

The `pairStatus()` function reports which SOD pairs are currently enforceable (have audit signatures) and which are not yet observable.

## Related Documents

- [DevOps Guide](./devops-guide.md)
- [Security Architecture](../security/security-architecture.md)
- [Data Protection](../security/data-protection.md)
- [Backend Architecture](../architecture/backend-architecture.md)
