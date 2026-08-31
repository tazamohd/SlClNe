# Security — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-SEC-002                              |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Security                                 |

## 1. Overview

This document defines the security requirements for SALIS AUTO, covering authentication, authorization (RBAC with triple-layer enforcement), input validation, OWASP Top 10 compliance, and data protection. The platform handles sensitive financial data (invoices, payroll, bank accounts) and personally identifiable information (customer contacts, employee salaries), demanding rigorous security controls.

## 2. Authentication

### 2.1 JWT Token Architecture

| Parameter              | Value     | Notes                                    |
|------------------------|-----------|------------------------------------------|
| Algorithm              | HS256     | HMAC-SHA256 symmetric signing            |
| Access token TTL       | 15 min    | Configurable via ACCESS_TOKEN_TTL_MINUTES |
| Refresh token TTL      | 30 days   | Configurable via REFRESH_TOKEN_TTL_DAYS   |
| Token format           | JWT       | Standard claims: sub, org, role, exp     |
| Stateless verification | Yes       | No server-side session lookup for access tokens |

### 2.2 Refresh Token Rotation

Every refresh token use issues a new pair (access + refresh) and retires the old refresh token:

1. Client presents refresh token
2. Server verifies the token hash against `user_sessions.refresh_token_hash`
3. If valid: issue new pair, mark old token as `replaced_by` the new one
4. If the token was already retired (`replaced_by IS NOT NULL`): **family-based theft detection triggers** — revoke all tokens in the `family_id`

### 2.3 Family-Based Theft Detection

All refresh tokens in a rotation chain share a `family_id`. If a previously-rotated token is reused, every token in that family is revoked. This detects the scenario where an attacker steals a token and both the legitimate user and attacker attempt to refresh.

### 2.4 Password Security

- **Hashing**: Argon2id with OWASP-recommended parameters (m=19 MiB, t=2, p=1)
- **Minimum length**: 1 character (Zod schema min(1)); strength enforcement is a UI concern
- **Maximum length**: 200 characters
- **No plaintext storage**: `password_hash` column is hashed; audit scrubbing removes it from logs

### 2.5 Account Lockout

- Maximum 8 failed login attempts before lockout
- Lockout duration: 300 seconds (5 minutes)
- Enforced in-process via `loginThrottle` in `service.ts`
- Lockout state tracked per identity, not per IP

### 2.6 OTP Security

- 6-digit numeric codes, validated by regex `^\d{6}$`
- Stored as hash — no plaintext OTP at rest
- Maximum 5 verification attempts per challenge
- 60-second resend cooldown per destination
- 10-minute TTL per challenge

### 2.7 Rate Limiting

| Endpoint Category   | Limit          | Key             |
|---------------------|----------------|-----------------|
| Auth endpoints      | 20/min         | IP address      |
| Login endpoint      | 10/min         | IP address      |
| Authenticated APIs  | Per tenant     | org_id:ip       |

## 3. Authorization (RBAC)

### 3.1 Triple-Layer Enforcement

| Layer        | Location           | Mechanism                              |
|--------------|--------------------|----------------------------------------|
| Navigation   | Frontend sidebar   | Modules with empty grants hidden       |
| Screen       | Frontend router    | `SCREEN_MODULE` map gates each screen  |
| API          | Server middleware   | `requirePermission()` on every route   |

Both client and server read the same permission matrix from `@salis/contract`. The `tests/authz-matrix.test.ts` suite asserts the two tables are identical.

### 3.2 Grant Actions

Six actions, each a single character in the grant string:

| Code | Action  | Description                                    |
|------|---------|------------------------------------------------|
| v    | view    | See data and navigate to module                |
| c    | create  | Add new records                                |
| e    | edit    | Modify existing records                        |
| d    | delete  | Soft-delete records                            |
| a    | approve | Approve/reject (with ceiling check)            |
| x    | export  | Export data to CSV                             |

### 3.3 Data Scope

| Scope     | Behavior                                            |
|-----------|-----------------------------------------------------|
| all       | See all data across all branches                    |
| platform  | Platform-level administration                       |
| branch    | See data within assigned branch only                |
| own       | See only records assigned to or created by the user |
| self      | See only own data (customer portal)                 |
| external  | External party with restricted access               |

Owned tables and their scope columns are declared in `OWNED_TABLES`:

| Table        | Scope Column        |
|--------------|---------------------|
| job_cards    | assigned_tech_id    |
| appointments | technician_id       |
| crm_tasks    | created_by          |
| user_sessions| user_id             |

### 3.4 Approval Ceilings

Approval requires both the `a` grant on the relevant module AND the amount within the role's ceiling. The two checks answer different questions:

- **Authority** (grant check): "May this role approve this type of document?"
- **Ceiling** (amount check): "Is the amount within this role's limit?"

Above the ceiling, the response is "escalate" (not "denied"), and the error message distinguishes the two failure modes.

### 3.5 Segregation of Duties

Six declared pairs enforced at the entity level via audit trail analysis:

| Pair                                          | Risk   | Enforcement Status |
|-----------------------------------------------|--------|--------------------|
| Raise PO / Approve PO                        | High   | Enforced           |
| Create Supplier / Approve Supplier Payment    | High   | Unobservable       |
| Post Journal Entry / Approve Journal Entry    | High   | Unobservable       |
| Perform Repair / Pass Quality Check           | High   | Enforced           |
| Issue Stock / Adjust Stock Count              | Medium | Enforced           |
| Create Employee / Approve Payroll Run         | Medium | Unobservable       |

"Enforced" pairs have audit signatures that allow `requireSodClear()` to detect violations. "Unobservable" pairs lack the necessary routes/audit rows — the server honestly reports this rather than silently skipping.

### 3.6 Field-Level Redaction

Seven redaction rules hide sensitive fields based on role:

| Rule                      | Hidden Fields (API keys)              | Hidden From                                   |
|---------------------------|---------------------------------------|-----------------------------------------------|
| Part cost / margin        | costHalalas                           | advisor, technician, qc, frontdesk, callcenter, customer, supplier |
| Labour cost rate          | (labour cost fields)                  | technician, qc, frontdesk, callcenter, customer, supplier |
| Employee salary           | salaryHalalas, grossPayHalalas, etc.  | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |
| Supplier purchase price   | (purchase price fields)               | advisor, technician, qc, frontdesk, callcenter, customer |
| Customer contact details  | (contact fields)                      | technician, qc, supplier |
| Bank account details      | (bank fields)                         | advisor, technician, qc, parts, frontdesk, callcenter, hr, procurement, supplier, customer |
| Branch P&L                | netProfitHalalas, ebitdaHalalas, etc. | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |

Redaction is applied server-side via `redact()` — the value is nulled in the response, never reaching the wire.

## 4. OWASP Top 10 Compliance

### 4.1 Injection Prevention (A03:2021)

- **SQL Injection**: Drizzle ORM uses parameterized queries exclusively; no raw SQL string interpolation
- **NoSQL Injection**: Not applicable (PostgreSQL only)
- **Command Injection**: No shell command execution from user input

### 4.2 Broken Authentication (A07:2021)

- Argon2id password hashing
- Refresh token rotation with theft detection
- Account lockout after failed attempts
- Rate limiting on auth endpoints

### 4.3 XSS Prevention (A03:2021)

- React's automatic output escaping
- No `dangerouslySetInnerHTML` usage for user-controlled content
- Content Security Policy headers

### 4.4 CSRF Considerations

- JWT-based auth (no cookies for session) mitigates traditional CSRF
- `SameSite` cookie attributes where cookies are used
- CORS restricted to allowed origins

### 4.5 Security Misconfiguration (A05:2021)

- Environment variables for all secrets (no default secret literals)
- Zod schema validation for all configuration
- SSO/WebAuthn return 503 when unconfigured rather than fabricating success

## 5. Input Validation

### 5.1 Zod Schema Validation

Every API request body is validated with Zod schemas before processing:

- `loginBody` — email (3-254 chars), password (1-200 chars)
- `refreshBody` — refreshToken (10-4096 chars)
- `jobTransitionBody` — target stage validation
- `bulkDeleteBody`, `bulkUpdateBody` — batch operation schemas
- Collection-specific schemas for creates and updates

### 5.2 Validation Error Response

Invalid input returns a structured error:

```json
{
  "error": {
    "code": "bad_request",
    "message": "Descriptive error message",
    "field": "fieldName",
    "requestId": "correlation-id"
  }
}
```

### 5.3 Server-Owned Fields

Fields in `SERVER_OWNED_KEYS` are stripped from client input — the server computes them:

- `id`, `orgId`, `branchId`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`, `version`
- Derived amounts: `totalHalalas`, `paidHalalas`, `vehicleCount`, `totalSpentHalalas`

## 6. CORS Configuration

- Allowed origins restricted to known frontend domains
- Credentials included where required
- Methods restricted to GET, POST, PUT, PATCH, DELETE

## 7. Audit Trail Security

- Credential fields scrubbed before audit insertion (password, tokens, OTPs, secrets)
- Audit log is append-only at the database level
- Request ID correlation enables tracing across audit entries
- IP address and user agent recorded for forensic analysis

## 8. Cross-References

- [Admin & Portals](../functional/admin-portals.md) — Authentication screens and user management
- [Compliance](./compliance.md) — Regulatory requirements for data handling
- [Performance](./performance.md) — Rate limiting and response times
- [Reliability](./reliability.md) — Error handling and concurrency control
- [Scalability](./scalability.md) — Multi-tenant isolation via RLS
