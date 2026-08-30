# Security Architecture

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-SEC-001                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO implements a defense-in-depth security architecture for a multi-tenant automotive workshop management platform. Security controls operate at every layer: network (CORS, rate limiting, security headers), authentication (JWT with refresh token rotation), authorization (RBAC at three layers), data isolation (PostgreSQL RLS), input validation (Zod schemas), output filtering (field-level redaction), and audit (append-only trail with credential scrubbing).

## 2. Threat Model

### 2.1 Attack Surface

| Surface               | Exposure           | Primary Controls                      |
|-----------------------|--------------------|-----------------------------------------|
| REST API (`/api/v1`)  | Authenticated      | JWT verification, RBAC, RLS, rate limit |
| Public lead endpoint  | Unauthenticated    | Tight rate limit (5/min/IP), fixed org  |
| Health/ready probes   | Unauthenticated    | No data disclosure, no DB on liveness   |
| Frontend SPA          | Public static      | CSP headers, no server-side rendering   |

### 2.2 Key Threats

| Threat                         | Control                                        |
|--------------------------------|------------------------------------------------|
| Cross-tenant data access       | PostgreSQL RLS on all 53 tenant tables          |
| Privilege escalation           | RBAC matrix enforced server-side, scope derived from role |
| Token theft                    | 15-min access token, family-based refresh revocation |
| Credential exposure in logs    | PII redaction at serializer, audit scrubbing    |
| SQL injection                  | Parameterized queries via Drizzle ORM           |
| Cross-site scripting (XSS)     | API-only backend; CSP `default-src: 'none'`     |
| Cross-site request forgery     | CORS with explicit origins, credentials enabled |
| Brute force authentication     | Rate limiting keyed by orgId:IP                 |
| Self-approval (collusion)      | Segregation of duties at route and audit levels |
| Replay attacks                 | Idempotency keys with body hash verification    |
| Timing attacks                 | Constant-time comparison for token digests      |

## 3. Defense-in-Depth Layers

### 3.1 Layer 1: Network Security

**Security Headers (Helmet)**:
- `Content-Security-Policy`: `default-src: 'none'`, `frame-ancestors: 'none'`, `base-uri: 'none'`, `form-action: 'none'`
- `X-Frame-Options`: `DENY`

This is the strictest possible CSP because the API serves JSON only -- no HTML, scripts, styles, or embedded content.

**CORS**:
- Origins explicitly listed in `CORS_ORIGINS`
- Credentials enabled
- Exposed headers: `x-request-id`, `retry-after`, rate-limit headers

**Rate Limiting**:
- Global: `RATE_LIMIT_MAX` per minute (default 300), keyed by `orgId:IP`
- Public leads: `PUBLIC_LEAD_RATE_LIMIT` per minute (default 5), keyed by IP
- IETF draft headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

### 3.2 Layer 2: Authentication

**Access Token**: 15-minute HS256 JWT. Not revocable; short-lived by design.

**Refresh Token**: 30-day HS256 JWT with:
- Different audience (`-refresh` suffix) to prevent use as access token
- Random secret whose SHA-256 is stored (never the usable token)
- Family tracking for theft detection
- Constant-time digest comparison (`timingSafeEqual`)

**Password Storage**: bcrypt hashing. Plaintext never stored or logged.

**OTP**: SHA-256 hashed before storage, attempt-limited, time-bounded.

### 3.3 Layer 3: Authorization (RBAC)

Three enforcement points, each independent:

| Point               | Mechanism                        | Bypass Impact            |
|----------------------|----------------------------------|--------------------------|
| Route handler        | `requirePermission()` check      | 403 response              |
| Database             | RLS policies on `app.org_id`     | No rows returned          |
| Response             | `redact()` nullifies fields      | Sensitive data not sent   |

The RBAC matrix (28 modules x 14 roles) uses six grant letters: `v` (view), `c` (create), `e` (edit), `d` (delete), `a` (approve), `x` (export).

### 3.4 Layer 4: Tenant Isolation

Every authenticated request runs inside a transaction with:

```sql
SET LOCAL app.org_id    = :orgId;
SET LOCAL app.branch_id = :branchId;
SET LOCAL app.user_id   = :userId;
SET LOCAL app.scope     = :scope;
```

RLS policies on all 53 tenant tables filter on `app.org_id`. The policies use `FORCE`, so even the table owner is subject to them. Cross-tenant reads return 404, never 403, to avoid information leakage.

### 3.5 Layer 5: Input Validation

- **Zod schemas**: Every request body is parsed against a strict schema via `parseOr422()`
- **Server-owned key rejection**: Fields like `orgId`, `version`, `createdBy` are rejected if the client sends them
- **Type coercion**: Filter values are coerced to the correct type (boolean, number) at the query layer
- **Sort/filter validation**: Unknown sort or filter keys return 400

### 3.6 Layer 6: Output Security

- **Field redaction**: Sensitive fields (salary, cost, P&L) nullified based on role
- **Error sanitization**: 5xx errors return only request ID; no stack traces, table names, or column names
- **CSV formula protection**: Export cells starting with `=`, `+`, `-`, `@`, tab, or CR are prefixed with `'`
- **Audit payload scrubbing**: Credentials stripped from before/after JSONB

## 4. Segregation of Duties

### 4.1 Submitter-Level Control

Records with `submitted_by` columns prevent the submitter from also approving:

```typescript
requireDifferentApprover(principal, record.submittedBy)
```

Applies to: estimates, requisitions, purchase orders, insurance claims.

### 4.2 Audit-Trail-Based Control

Six SOD pairs are enforced by analyzing the audit trail for a specific record:

| Pair                                       | Risk   | Status       |
|--------------------------------------------|--------|--------------|
| Perform repair / Pass quality check         | High   | Enforced     |
| Issue stock / Adjust stock count            | Medium | Enforced     |
| Raise purchase order / Approve purchase order| High  | Enforced     |
| Create supplier / Approve supplier payment  | High   | Not yet observable |
| Post journal entry / Approve journal entry  | High   | Not yet observable |
| Create employee / Approve payroll run       | Medium | Not yet observable |

Enforced pairs have audit `SIGNATURES` that map audit rows to SOD activities. The check reads the last 200 audit entries for the record and determines whether the current actor performed the counterpart activity.

SOD violation refusals are audited in a separate transaction (so the record persists even though the business transaction rolls back).

## 5. Idempotency

The `idempotency_keys` table prevents duplicate business effects from replayed requests:

| Scenario                  | Response                           |
|---------------------------|------------------------------------|
| Same key, same body hash  | Return stored response (no side effects) |
| Same key, different hash  | 409 Conflict (body mismatch)       |
| New key                   | Execute mutation, store response   |

## 6. OWASP Top 10 Mapping

| OWASP Category                    | Control                                       |
|-----------------------------------|------------------------------------------------|
| A01: Broken Access Control        | RBAC + RLS + field redaction at three layers    |
| A02: Cryptographic Failures       | bcrypt passwords, SHA-256 token digests, no plaintext secrets |
| A03: Injection                    | Parameterized queries (Drizzle ORM), Zod input validation |
| A04: Insecure Design              | Defense in depth, SOD enforcement, audit trail  |
| A05: Security Misconfiguration    | Zod-validated env, strict CSP, no defaults for secrets |
| A06: Vulnerable Components        | npm audit, locked dependencies                  |
| A07: Auth Failures                | Rate limiting, family-based theft detection, short token TTL |
| A08: Data Integrity Failures      | Append-only audit, optimistic concurrency, idempotency |
| A09: Logging Failures             | Structured JSON logs, PII redaction, SOD audit  |
| A10: SSRF                         | API-only; no user-controlled URL fetching       |

## 7. Security Testing

### 7.1 Authorization Parity Test

`tests/authz-matrix.test.ts` asserts that the server and client RBAC tables are identical, preventing drift between the UI (which hides controls) and the API (which enforces them).

### 7.2 Field Redaction Test

`tests/authz-fields.test.ts` fails if any collection emits a globally-redacted key (salary, P&L), ensuring coverage cannot rot quietly.

### 7.3 Grant Alphabet Test

The grant alphabet is verified to contain exactly six letters (`v`, `c`, `e`, `d`, `a`, `x`), preventing a misread of `x` as delete (it is export).

## Related Documents

- [Auth Architecture](../architecture/auth-architecture.md)
- [Authorization Matrix](./authorization-matrix.md)
- [Data Protection](./data-protection.md)
- [Authentication Guide](./authentication-guide.md)
