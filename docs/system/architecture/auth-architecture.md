# Auth Architecture

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-ARCH-005                               |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO uses a dual-token JWT authentication system with HS256 signing, backed by a session table for refresh token revocation and reuse detection. The system enforces 14-role RBAC at three layers: server middleware, route handlers, and field-level redaction on response payloads.

## 2. Token Design

### 2.1 Access Token

| Property       | Value                                      |
|----------------|--------------------------------------------|
| Algorithm      | HS256                                      |
| TTL            | 15 minutes                                 |
| Library        | jose (`SignJWT`, `jwtVerify`)               |
| Issuer         | `salis-auto` (configurable via `JWT_ISSUER`)|
| Audience       | `salis-auto-api` (configurable via `JWT_AUDIENCE`) |
| Revocable      | No (short-lived by design)                  |

Claims carried:

| Claim       | Source           | Purpose                              |
|-------------|------------------|--------------------------------------|
| `sub`       | `userId`         | Subject identifier                    |
| `role`      | User's role      | One of 14 role identifiers            |
| `org_id`    | User's org       | Tenant identifier                     |
| `branch_id` | User's branch    | Branch within tenant (nullable)       |
| `scope`     | Derived from role| Data scope (all/platform/branch/own/etc.) |
| `name`      | User's name      | Display name (optional)               |

The `scope` claim is included because the contract specifies it, but the API does not trust it: `principalFromClaims` derives scope from the role, so a tampered claim cannot widen access.

### 2.2 Refresh Token

| Property       | Value                                      |
|----------------|--------------------------------------------|
| Algorithm      | HS256                                      |
| TTL            | 30 days                                    |
| Audience       | `salis-auto-api-refresh`                   |
| Revocable      | Yes (via session table)                     |

The refresh token audience differs from the access token audience by a `-refresh` suffix, so a refresh token presented as `Authorization: Bearer` fails verification rather than being accepted as an access token.

Claims carried:

| Claim       | Source           | Purpose                              |
|-------------|------------------|--------------------------------------|
| `sub`       | `userId`         | Subject identifier                    |
| `sid`       | Session row      | Session identifier                    |
| `fid`       | Session family   | Family identifier for theft detection |
| `org_id`    | User's org       | Tenant identifier                     |
| `branch_id` | User's branch    | Branch within tenant (nullable)       |
| `secret`    | Random 32 bytes  | One-time secret (base64url encoded)   |

### 2.3 Secret Handling

The refresh token carries a random 32-byte secret. The database stores only its SHA-256 digest (`refresh_token_hash` column), never the usable token. Verification uses constant-time comparison (`timingSafeEqual`) so a token digest cannot be recovered from response timing.

## 3. Session Management

### 3.1 Session Table (`user_sessions`)

| Column              | Purpose                                    |
|---------------------|--------------------------------------------|
| `id`                | Session ULID                               |
| `user_id`           | Owning user                                |
| `refresh_token_hash`| SHA-256 of the current refresh token secret |
| `family_id`         | Groups rotated tokens for theft detection   |
| `user_agent`        | Browser/client identifier                   |
| `ip`                | Client IP address                           |
| `expires_at`        | Session expiration                          |
| `revoked_at`        | Revocation timestamp (null if active)       |
| `replaced_by`       | Points to the successor session             |

### 3.2 Family-Based Theft Detection

Refresh tokens within a session share a `family_id`. When a token is rotated:

1. A new session row is created with the same `family_id`
2. The old session's `replaced_by` points to the new one
3. If a retired token from the same family is replayed, all sessions in that family are revoked

This design detects token theft: if an attacker steals a refresh token and uses it, the legitimate user's next refresh attempt reuses the retired token, triggering revocation of the entire family.

### 3.3 Lifecycle

```
Login -> New session + new family
  |
  v
Refresh -> New session, same family, old session marked replaced
  |
  v
Retired token replay -> Entire family revoked (theft signal)
  |
  v
Logout -> Session revoked
```

## 4. Authentication Middleware

### 4.1 Public Paths

These paths skip authentication entirely:

| Path                       | Purpose                         |
|----------------------------|---------------------------------|
| `/health`                  | Liveness probe                  |
| `/ready`                   | Readiness probe                 |
| `/api/v1/public/leads`     | Unauthenticated marketing intake |
| `/api/v1/auth/login`       | Login                           |
| `/api/v1/auth/register`    | Registration                    |
| `/api/v1/auth/refresh`     | Token refresh                   |

All other paths are authenticated by default. A new route is authenticated unless explicitly exempted in `PUBLIC_PATHS` or `isPublicAuthPath`.

### 4.2 Verification Flow

```
onRequest hook:
  1. Check if path is in PUBLIC_PATHS or isPublicAuthPath()
     -> Yes: skip, continue
  2. Extract Bearer token from Authorization header
  3. Verify JWT with jose:
     - Algorithm: HS256
     - Issuer: JWT_ISSUER
     - Audience: JWT_AUDIENCE
  4. Extract claims, derive scope from role (not from claim)
  5. Construct Principal object: { userId, orgId, branchId, role, scope, name }
  6. Attach to request as request.principal
```

### 4.3 Principal Interface

```typescript
interface Principal {
  userId: string
  orgId: string
  branchId: string | null
  role: RoleId       // one of 14 roles
  scope: DataScope   // all | platform | branch | own | external | self
  name?: string
}
```

## 5. OTP Verification

### 5.1 OTP Challenge Flow

The system supports OTP-based verification (e.g., for estimate approval by customers):

1. Generate a random OTP code
2. Hash it with SHA-256 and store in `otp_challenges` table
3. Deliver via configured transport (SMS, email)
4. On verification: compare hash, check expiry, count attempts
5. Maximum attempt limit prevents brute force

The OTP code is never stored in plaintext; only its hash persists.

### 5.2 Transport Configuration

The OTP transport defaults to refusing delivery in development/test, preventing accidental sends. The test suite overrides it with a mock transport.

## 6. RBAC Enforcement Layers

Authorization is enforced at three distinct layers:

### 6.1 Layer 1: Route-Level Permission Check

```typescript
requirePermission(principal, module, action)
```

Every route handler calls this first. The PERMS matrix (28 modules x 14 roles) determines whether the role holds the required grant letter (`v`, `c`, `e`, `d`, `a`, `x`).

### 6.2 Layer 2: Row-Level Security (Database)

The `withTenant(db, principal, fn)` wrapper sets PostgreSQL session variables that RLS policies read:

```sql
SET LOCAL app.org_id    = :orgId;
SET LOCAL app.branch_id = :branchId;
SET LOCAL app.user_id   = :userId;
SET LOCAL app.scope     = :scope;
```

Even if a handler omits a `WHERE org_id = ...` clause, the RLS policy prevents cross-tenant data access.

### 6.3 Layer 3: Field-Level Redaction

```typescript
redact(principal, row, rules)
```

Applied on the response path, before serialization. The `FIELD_RULES` define which fields are hidden from which roles:

| Rule                     | Hidden Keys                                           |
|--------------------------|-------------------------------------------------------|
| Employee salary          | salary, salaryHalalas, basicSalaryHalalas, grossPayHalalas, netPayHalalas, allowancesHalalas, deductionsHalalas |
| Branch P&L               | branchPnl, branchProfitHalalas, grossProfitHalalas, netProfitHalalas, operatingProfitHalalas, ebitdaHalalas |
| Part cost/margin         | costHalalas (on parts collection)                      |
| Customer contact details | phone, email (on customers collection)                 |

Redacted fields are set to `null`, so they never appear on the wire.

## 7. Approval Authority

Approval requires two conditions:

1. **Authority**: The role must hold the `a` (approve) grant on the relevant module
2. **Ceiling**: The amount (in halalas) must not exceed the role's approval limit

| Role         | Ceiling (SAR) | Ceiling (halalas) |
|--------------|---------------|-------------------|
| owner        | Unlimited     | null              |
| superadmin   | Unlimited     | null              |
| manager      | 50,000        | 5,000,000         |
| accountant   | 25,000        | 2,500,000         |
| procurement  | 20,000        | 2,000,000         |
| hr           | 15,000        | 1,500,000         |
| parts        | 10,000        | 1,000,000         |
| advisor      | 5,000         | 500,000           |
| qc           | 0             | 0 (non-monetary)  |

Above the ceiling, the response is "escalate" (422 `approval_required`), not "denied" (403 `forbidden`).

## 8. Frontend Auth Flow

### 8.1 Mock Mode

When `VITE_API_URL` is unset, the `SessionProvider` reads `salis-token` and `salis-role` from `localStorage`. Demo accounts for all 14 roles are available for development.

### 8.2 Live Mode

When `VITE_API_URL` is set:

1. Login: `POST /api/v1/auth/login` returns access token + refresh token
2. Store access token in `salis-token` localStorage key
3. Register token provider with `setAccessTokenProvider()`
4. All subsequent API calls include `Authorization: Bearer <token>`
5. On 401 response: attempt silent refresh via `POST /api/v1/auth/refresh`
6. On refresh failure: logout and redirect to login screen

### 8.3 Route Guard

The `RequireAccess` component checks the user's role against `SCREEN_MODULE` mappings (95+ entries) and the `PERMS` matrix. If the role lacks `v` (view) on the screen's module, the user is redirected to `/unauthorized`.

## 9. Secrets Management

| Secret          | Source              | Development Default              |
|-----------------|---------------------|----------------------------------|
| `JWT_SECRET`    | Environment variable | Optional in dev, required in production |
| `DATABASE_URL`  | Environment variable | Required always                   |
| OTP codes       | `randomBytes()`     | Never stored in plaintext         |
| Refresh secrets | `randomBytes(32)`   | SHA-256 digest stored             |
| Passwords       | bcrypt              | Hash stored, never reversible     |

A missing `JWT_SECRET` in production stops the process at boot rather than running on a default value.

## Related Documents

- [Backend Architecture](./backend-architecture.md)
- [Security Architecture](../security/security-architecture.md)
- [Authorization Matrix](../security/authorization-matrix.md)
- [Data Protection](../security/data-protection.md)
