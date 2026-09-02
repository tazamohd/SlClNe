# Data Protection

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-SEC-004                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

This document describes how SALIS AUTO protects sensitive data at rest, in transit, and in processing. It covers encryption, PII handling, field-level redaction, credential management, the audit trail, soft deletes, and Saudi Arabian data residency considerations.

## 2. Data Classification

### 2.1 Sensitivity Tiers

| Tier         | Data Types                                    | Protection                          |
|--------------|-----------------------------------------------|-------------------------------------|
| Critical     | Passwords, tokens, OTP codes, JWT secrets     | Hashed/encrypted, never stored plain |
| Sensitive    | Salaries, P&L figures, cost margins           | Field-level redaction by role        |
| Personal     | Customer names, phones, emails, VAT numbers   | Log redaction, role-based hiding     |
| Business     | Invoices, job cards, estimates, POs            | Tenant isolation (RLS)              |
| Public       | Health probe responses, static frontend       | No special protection               |

### 2.2 PII Inventory

| Data Element       | Table(s)                          | Protection Controls                  |
|--------------------|-----------------------------------|--------------------------------------|
| Customer name      | customers, invoices, estimates    | Tenant RLS                           |
| Phone number       | customers, fleets, suppliers      | Log redaction, field redaction        |
| Email address      | users, customers, suppliers       | Log redaction, field redaction        |
| VAT number         | organizations, invoices           | Log redaction (buyerVatNumber)        |
| Employee salary    | employees, payroll_lines          | GLOBAL_REDACTIONS (7 keys)           |
| Bank account       | bank_statements                   | Field redaction                      |
| Password hash      | users                             | bcrypt, never in logs or audit       |
| National ID (CR)   | organizations, garage_applications| Tenant RLS                           |

## 3. Credential Protection

### 3.1 Passwords

| Aspect       | Implementation                              |
|--------------|---------------------------------------------|
| Hashing      | bcrypt (per-password salt, work factor)      |
| Storage      | `password_hash` column only                 |
| Comparison   | `bcrypt.compare()` (constant-time)          |
| Log redaction| `*.password`, `*.passwordHash` -> `[redacted]` |
| Audit scrub  | `password`, `passwordHash`, `password_hash` removed |

Plaintext passwords are never stored, logged, returned in API responses, or written to the audit trail.

### 3.2 Refresh Token Secrets

| Aspect       | Implementation                              |
|--------------|---------------------------------------------|
| Generation   | `randomBytes(32)` (256-bit entropy)         |
| Storage      | SHA-256 digest in `refresh_token_hash`      |
| Comparison   | `timingSafeEqual` (constant-time)           |
| Log redaction| `*.refreshToken`, `*.accessToken` -> `[redacted]` |
| Audit scrub  | `refreshToken`, `refreshTokenHash`, `secret` removed |

The database never holds a usable token, only a digest. A leaked table dump cannot be replayed.

### 3.3 OTP Codes

| Aspect       | Implementation                              |
|--------------|---------------------------------------------|
| Generation   | Random code generation                      |
| Storage      | SHA-256 digest in `code_hash` column        |
| Attempt limit| Counter prevents brute force                |
| Time bound   | `expires_at` enforced at verification       |
| Log redaction| `req.body.otp` -> `[redacted]`              |
| Audit scrub  | `otp`, `codeHash`, `code_hash` removed      |

### 3.4 JWT Signing Key

| Aspect       | Implementation                              |
|--------------|---------------------------------------------|
| Source       | `JWT_SECRET` environment variable            |
| Default      | None -- process refuses to start without it in production |
| Rotation     | Invalidates all tokens; users must re-login  |
| Storage      | Environment only; never committed to repo    |

## 4. Data Protection in Transit

### 4.1 API Security Headers

| Header                      | Value                           |
|-----------------------------|---------------------------------|
| Content-Security-Policy     | `default-src: 'none'`           |
| X-Frame-Options             | `DENY`                          |
| CORS                        | Explicit origins, credentials   |
| x-request-id                | Correlation ID on every response|

### 4.2 Response Sanitization

| Error Type     | Client Receives                              |
|----------------|----------------------------------------------|
| 4xx (expected) | Error code, message, field (if applicable)    |
| 5xx (unexpected)| Request ID only                              |

Internal errors never expose stack traces, SQL messages, table names, column names, or file paths.

## 5. Field-Level Redaction

### 5.1 GLOBAL_REDACTIONS

Two redaction rules apply to every API response regardless of collection:

**Employee Salary** (7 keys):
`salary`, `salaryHalalas`, `basicSalaryHalalas`, `grossPayHalalas`, `netPayHalalas`, `allowancesHalalas`, `deductionsHalalas`

**Branch P&L** (6 keys):
`branchPnl`, `branchProfitHalalas`, `grossProfitHalalas`, `netProfitHalalas`, `operatingProfitHalalas`, `ebitdaHalalas`

These fire for roles where `fieldHidden(ruleName, role)` returns true. The keys are redacted globally so they activate automatically when any collection starts emitting them, without manual wiring.

### 5.2 Collection-Specific Redactions

| Collection       | Redacted Keys                       | Rule                        |
|------------------|-------------------------------------|-----------------------------|
| parts            | `costHalalas`                       | Part cost/margin            |
| customers        | `phone`, `email`                    | Customer contact details    |
| employees        | `salaryHalalas`                     | Employee salary             |
| payrollRuns      | `grossHalalas`, `allowancesHalalas`, `deductionsHalalas`, `netHalalas` | Employee salary |
| payrollLines     | `grossHalalas`, `allowancesHalalas`, `deductionsHalalas`, `netHalalas` | Employee salary |

### 5.3 Redaction Mechanism

```typescript
function redact(principal, row, rules) {
  for each rule in [...rules, ...GLOBAL_REDACTIONS]:
    if fieldHidden(rule.ruleField, principal.role):
      for each key in rule.rowKeys:
        row[key] = null
  return row
}
```

Redaction happens server-side before serialization. A redacted field is set to `null` and never appears on the wire in its original form.

## 6. Log Protection

### 6.1 PII Redaction in Logs

The structured JSON logger (Pino) redacts sensitive fields at the serializer level:

**Request Headers**: `authorization`, `cookie`, `idempotency-key`

**Request Body**: `password`, `newPassword`, `otp`, `token`, `refreshToken`, `phone`, `email`, `buyerVatNumber`

**Wildcard**: `*.password`, `*.passwordHash`, `*.refreshToken`, `*.accessToken`, `*.codeHash`

All redacted values appear as `[redacted]` in log output. Request URLs are logged without query strings.

### 6.2 Audit Trail Credential Scrubbing

The `scrub()` function recursively removes these keys from audit `before` and `after` payloads:

`password`, `passwordHash`, `password_hash`, `refreshToken`, `refreshTokenHash`, `refresh_token_hash`, `accessToken`, `token`, `codeHash`, `code_hash`, `secret`, `otp`

Replaced with `[redacted]` in the stored JSONB.

## 7. Tenant Data Isolation

### 7.1 Row-Level Security

All 53 tenant-owned tables have RLS policies that filter on `current_setting('app.org_id')`, applied with `FORCE`. A handler that omits a `WHERE org_id = ...` clause still cannot read another tenant's data.

### 7.2 Cross-Tenant Behavior

| Operation              | Cross-Tenant Response           |
|------------------------|---------------------------------|
| Read by ID             | 404 (never 403)                 |
| List                   | Empty results                   |
| Update                 | 404 (row not visible)           |
| Delete                 | 404 (row not visible)           |

Cross-tenant reads return 404, not 403, to avoid confirming that a record exists in another tenant.

## 8. Soft Deletes and Data Retention

### 8.1 Soft Delete Mechanism

Records are never physically removed. The `deleted_at` column is set to the current timestamp. Soft-deleted records are:

- Excluded from normal queries by default
- Visible with `?includeDeleted=true` (requires `d` permission)
- Restorable through the API (audit action: `restore`)

### 8.2 Audit Trail Immutability

The audit log is append-only at the database level. A PostgreSQL trigger refuses UPDATE and DELETE on the `audit_log` table. This means:

- No application code can alter audit history
- The audit trail survives application bugs
- Forensic integrity is maintained for compliance

## 9. Data Export Protection

### 9.1 CSV Formula Injection

The export endpoint protects against formula injection by prefixing cells that start with `=`, `+`, `-`, `@`, tab, or carriage return with a single quote (`'`). This prevents spreadsheet applications from executing injected formulas.

### 9.2 Export Limits

| Setting            | Value    | Purpose                         |
|--------------------|----------|---------------------------------|
| MAX_EXPORT_ROWS    | 50,000   | Prevent data exfiltration        |
| Export permission   | `x`      | Separate from view permission    |
| Truncation header  | `X-Export-Truncated: true` | Signals incomplete data |

## 10. Saudi Data Residency

### 10.1 Applicable Data

The database contains Saudi-specific regulated data:

| Data Type              | Regulation                      |
|------------------------|---------------------------------|
| Customer PII           | Saudi Personal Data Protection Law (PDPL) |
| VAT numbers            | ZATCA compliance                |
| Invoice data           | ZATCA e-invoicing (Phase 2)     |
| Employee records       | Saudi labor law                 |
| Commercial Registration| Ministry of Commerce            |

### 10.2 Residency Requirements

- Database instances should be hosted within Saudi Arabia or in jurisdictions approved by PDPL
- Backups containing PII must follow the same residency rules
- Log storage containing PII (even in redacted form) should comply with data residency requirements

### 10.3 Data Minimization

The system practices data minimization:

- Only necessary PII is collected (name, phone, email for business purposes)
- Derived values (totalSpent, vehicleCount) are computed server-side, not collected
- The public lead form (`/api/v1/public/leads`) collects only contact information
- Presentation-only fields (`*_label`) carry no additional PII

## 11. Money Integrity

All monetary values are stored as `bigint` halalas (integer count), never as floating-point numbers. This prevents:

- Rounding errors accumulating across transactions
- Floating-point comparison failures in financial calculations
- Currency precision issues (1 SAR = 100 halalas)

Server-computed totals (invoice totals, payroll sums) are never accepted from client input.

## Related Documents

- [Security Architecture](./security-architecture.md)
- [Authorization Matrix](./authorization-matrix.md)
- [Database Design](../architecture/database-design.md)
- [Backup and Recovery](../operations/backup-recovery.md)
