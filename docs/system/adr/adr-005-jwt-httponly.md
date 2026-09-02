# SALIS AUTO -- ADR-005: JWT Authentication with httpOnly Cookies

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-005                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal -- Confidential     |

## Status

Accepted

## Context

SALIS AUTO is a multi-tenant automotive workshop management SaaS platform serving
multiple organizations across Saudi Arabia. The platform handles financially sensitive
data including invoices, payments, payroll, purchase orders, and ZATCA-compliant
e-invoicing records. The authentication system must satisfy several competing
requirements:

1. **Stateless scalability** -- the platform must scale horizontally across multiple
   server instances without session affinity or a centralized session store for every
   request.
2. **XSS protection** -- financial data (invoice totals, salary figures, VAT amounts)
   is classified as Sensitive under the platform's data classification tiers
   (see [Data Protection](../security/data-protection.md), Section 2.1). Tokens stored
   in `localStorage` or `sessionStorage` are readable by any JavaScript running in the
   page context, making them vulnerable to XSS exfiltration.
3. **Multi-tenant isolation** -- every authenticated request must carry the tenant
   context (`org_id`, `branch_id`) so that downstream middleware and Row-Level Security
   policies can enforce data isolation without an additional database lookup.
4. **ZATCA compliance** -- invoice issuance, hash chain computation, and QR code
   generation are security-critical operations that require authenticated, authorized
   sessions with audit trail integrity.
5. **Saudi regulatory environment** -- the Saudi Personal Data Protection Law (PDPL)
   and ZATCA regulations create a preference for reducing dependency on external
   authentication providers whose data residency guarantees may not align with Saudi
   requirements.

The platform defines 14 roles across 28 permission modules, with 6 grant types
(`v`iew, `c`reate, `e`dit, `d`elete, `a`pprove, e`x`port) and role-specific approval
ceilings ranging from 0 SAR (technician, QC inspector) to unlimited (owner,
superadmin). The authentication token must carry enough context for the three-layer
RBAC enforcement (route-level, RLS, field-level redaction) without requiring a
database round-trip on every request.

## Decision

SALIS AUTO uses a **dual-token JWT authentication system** with HS256 signing,
delivered via httpOnly secure cookies. The system is implemented using the `jose`
library (`SignJWT`, `jwtVerify`).

### Access Token

| Property   | Value                                               |
|------------|-----------------------------------------------------|
| Algorithm  | HS256                                               |
| TTL        | 15 minutes                                          |
| Library    | `jose` (`SignJWT`, `jwtVerify`)                     |
| Issuer     | `salis-auto` (configurable via `JWT_ISSUER`)        |
| Audience   | `salis-auto-api` (configurable via `JWT_AUDIENCE`)  |
| Revocable  | No (short-lived by design)                          |
| Delivery   | httpOnly, Secure, SameSite=Strict cookie            |

Access token claims:

| Claim      | Source            | Purpose                                   |
|------------|-------------------|-------------------------------------------|
| `sub`      | `userId`          | Subject identifier (ULID)                 |
| `role`     | User's role       | One of 14 role identifiers                |
| `org_id`   | User's org        | Tenant identifier for RLS                 |
| `branch_id`| User's branch     | Branch within tenant (nullable)           |
| `scope`    | Derived from role | Data scope (`all`/`platform`/`branch`/`own`/`external`/`self`) |
| `name`     | User's name       | Display name (optional)                   |

The `scope` claim is included for convenience but is never trusted from the token.
The API re-derives scope from the role via `principalFromClaims` to prevent privilege
escalation through token manipulation.

### Refresh Token

| Property   | Value                                               |
|------------|-----------------------------------------------------|
| Algorithm  | HS256                                               |
| TTL        | 30 days                                             |
| Audience   | `salis-auto-api-refresh` (distinct `-refresh` suffix)|
| Revocable  | Yes (via `user_sessions` table)                     |

Refresh token claims:

| Claim      | Source            | Purpose                                   |
|------------|-------------------|-------------------------------------------|
| `sub`      | `userId`          | Subject identifier                        |
| `sid`      | Session row       | Session identifier (ULID)                 |
| `fid`      | Session family    | Family identifier for theft detection     |
| `org_id`   | User's org        | Tenant identifier                         |
| `branch_id`| User's branch     | Branch within tenant (nullable)           |
| `secret`   | `randomBytes(32)` | One-time secret (base64url, 256-bit entropy)|

The database stores only the SHA-256 digest of the refresh token secret
(`refresh_token_hash` column), never the usable token. Verification uses
`timingSafeEqual` for constant-time comparison.

### Refresh Token Rotation

On each refresh, the system:

1. Creates a new session row with the same `family_id`
2. Marks the old session's `replaced_by` to point to the new session
3. Issues a new refresh token with a fresh 32-byte secret
4. If a retired token from the same family is replayed, **all sessions in that
   family are revoked** (theft detection signal)

### Cookie Configuration

| Attribute  | Value         | Rationale                                  |
|------------|---------------|--------------------------------------------|
| `httpOnly` | `true`        | JavaScript cannot read the token           |
| `Secure`   | `true`        | Cookie sent only over HTTPS                |
| `SameSite` | `Strict`      | Prevents cross-site request attachment     |
| `Path`     | `/api`        | Cookie scoped to API routes only           |

### Why httpOnly Cookies Over localStorage

- **XSS resistance**: `document.cookie` cannot read httpOnly cookies. A successful
  XSS attack cannot exfiltrate authentication tokens. Given that the platform handles
  7 categories of salary-related fields and 6 categories of P&L fields under
  field-level redaction, token theft would bypass all downstream authorization.
- **Automatic inclusion**: The browser attaches cookies to every same-origin request
  without explicit JavaScript, eliminating a class of bugs where `Authorization`
  headers are forgotten on certain API calls.
- **SameSite=Strict for CSRF**: Combined with SameSite=Strict, cross-origin requests
  from malicious sites never include the authentication cookie, mitigating CSRF
  without additional tokens.

## Consequences

### Positive

- Tokens are inaccessible to JavaScript, eliminating the most common token theft
  vector (XSS) for a platform handling financial and PII data.
- Stateless access token verification requires no database lookup on each request,
  enabling horizontal scaling without session affinity.
- The 15-minute access token TTL limits the exposure window if a token is compromised
  through non-XSS vectors (e.g., network interception on a misconfigured proxy).
- Family-based theft detection provides automatic revocation of all related sessions
  when token replay is detected.
- The dual-audience design (`salis-auto-api` vs `salis-auto-api-refresh`) prevents
  refresh tokens from being accepted as access tokens.
- Token payload carries tenant context (`org_id`, `branch_id`, `role`) enabling the
  three-layer RBAC enforcement without additional queries.

### Negative

- **Token revocation latency**: A compromised access token remains valid for up to
  15 minutes. Immediate revocation would require a blacklist check on every request,
  reintroducing statefulness. Mitigated by the short TTL.
- **Cookie size limits**: Browsers enforce ~4 KB per cookie. The current minimal
  payload (6 claims) stays well within this limit, but adding permissions arrays or
  additional claims could approach it.
- **CORS configuration complexity**: Cross-origin API calls require explicit CORS
  configuration with `credentials: 'include'` and whitelisted origins. Misconfigured
  CORS silently drops the cookie, producing opaque authentication failures.
- **Server-rendered pages**: httpOnly cookies cannot be read by client-side JavaScript
  for conditional rendering. The frontend must call an authenticated endpoint to
  determine the user's role and permissions (the `SessionProvider` pattern).

### Neutral

- The `JWT_SECRET` environment variable must be consistent across all server instances
  in a deployment. A missing secret in production stops the process at boot.
- JWT secret rotation invalidates all active tokens, forcing all users to re-login.
  This is a deployment event, not a runtime operation.
- The system maintains a `user_sessions` table for refresh token management, which
  is a form of server-side state -- but it is only consulted during refresh operations
  (every 15 minutes at most), not on every request.

## Alternatives Considered

### 1. Server-Side Sessions (Express Session / Redis)

Traditional session-based authentication with a session ID cookie and server-side
session store (Redis or PostgreSQL).

**Rejected because:**
- Requires session affinity or a shared session store, adding infrastructure
  complexity and a single point of failure.
- Every request requires a session store lookup, increasing latency.
- Multi-tenant context would need to be fetched from the database on each request
  rather than carried in the token.
- Session stores must be replicated or clustered for high availability.

### 2. OAuth 2.0 with External Identity Provider

Delegating authentication to a third-party OAuth 2.0 provider (Auth0, Keycloak,
or a Saudi-hosted identity service).

**Rejected because:**
- SALIS AUTO is a B2B platform with its own user management across 14 roles.
  Workshop employees are managed by the organization owner, not by an external
  identity provider.
- Saudi data residency concerns under PDPL: external OAuth providers may process
  authentication data outside approved jurisdictions.
- Additional external dependency for a critical path (every API call).
- Custom RBAC requirements (28 modules, 6 grant types, approval ceilings) do not
  map cleanly to standard OAuth scopes or OIDC claims.
- Not ruled out for future phases: OAuth 2.0 could be added as an optional SSO
  layer for enterprise customers without replacing the core JWT system.

### 3. JWT in localStorage with CSRF Tokens

Storing the JWT in `localStorage` and including it via `Authorization: Bearer` header,
with a separate CSRF token for state-changing requests.

**Rejected because:**
- `localStorage` is readable by any JavaScript in the page context, including
  injected scripts from XSS vulnerabilities.
- Requires explicit header attachment on every API call (error-prone).
- CSRF token management adds complexity that SameSite cookies avoid entirely.
- Financial platform requirements make token exfiltration resistance a priority
  over developer convenience.

## References

- [Auth Architecture](../architecture/auth-architecture.md) -- SYS-ARCH-005
- [Data Protection](../security/data-protection.md) -- SYS-SEC-004
- [Database Design](../architecture/database-design.md) -- SYS-ARCH-003
- [RBAC Definition](../../../app/src/data/generated/rbac.ts) -- 14 roles, 28 modules
- [jose Library](https://github.com/panva/jose) -- JWT implementation
- OWASP Session Management Cheat Sheet
- Saudi Personal Data Protection Law (PDPL)
