# SALIS AUTO — Security Audit Report

**Date:** 2026-08-29
**Branch:** `main` (post W2+W3 merge)
**Scope:** Server (`server/src/`), Frontend (`app/src/`), dependencies

---

## 1. Dependency Audit (`npm audit`)

### Frontend (`app/`)

| Package | Severity | Issue | Fix |
|---|---|---|---|
| `esbuild` ≤ 0.24.2 | Moderate | Dev-server request forwarding (GHSA-67mh-4wv8-2f99) | Upgrade vite to ≥ 6.5 |
| `nanoid` < 3.3.18 | High | Infinite loop with zero-size custom generators (GHSA-2v37-7h3g-55p8) | `npm audit fix` |
| `react-router` 6.x–7.17.0 | Moderate + Critical | Open redirect via backslash (CVE-2025-68470 bypass); arbitrary constructor injection in SSR hydration (GHSA-337j-9hxr-rhxg) | `npm audit fix` |

**Total: 8 vulnerabilities (5 moderate, 2 high, 1 critical)**

> **Note on react-router critical:** The SSR hydration constructor injection (GHSA-337j-9hxr-rhxg) requires SSR mode. SALIS AUTO is a client-side SPA — no SSR hydration is used — so the **actual risk is low**. The open-redirect via backslash in `<Link>` is moderate and should still be patched.

### Server (`server/`)

| Package | Severity | Issue | Fix |
|---|---|---|---|
| `drizzle-orm` < 0.45.2 | High | SQL injection via improperly escaped SQL identifiers (GHSA-gpj5-g38j-94v9) | `npm audit fix --force` (breaking) |
| `esbuild` ≤ 0.24.2 | Moderate | Dev-server request forwarding | Upgrade drizzle-kit |

**Total: 9 vulnerabilities (6 moderate, 2 high, 1 critical)**

> **Critical finding:** The `drizzle-orm` SQL injection vulnerability (GHSA-gpj5-g38j-94v9) affects **SQL identifier escaping**. In the SALIS AUTO codebase, collection routes accept user-controlled `sort` and `filter` field names, which are validated against a whitelist (`def.columns.includes(field)`) before being passed to Drizzle. This whitelist **mitigates the vulnerability** in practice, but upgrading drizzle-orm remains strongly recommended as defense in depth.

---

## 2. Hardcoded Secrets Scan

### Findings

| File | Item | Risk |
|---|---|---|
| `server/src/env.ts:7` | `JWT_SECRET` default: `'dev-only-change-me'` | **Mitigated** — production guard on line 16 throws `FATAL` if this default is used in production. |
| `server/src/env.ts:10` | `DEMO_PASSWORD` default: `'salis1234'` | **Low** — demo/seed credential, not used in production auth flow. |

### Not Found

- No hardcoded API keys (`sk-`, `AIza`, `AKIA`, `ghp_`, `xox`)
- No hardcoded Bearer tokens or JWTs (`eyJ`)
- No `.env` files committed (`.gitignore` covers them)
- Frontend uses `VITE_API_BASE_URL` and `VITE_BASE_PATH` — both read from env, never hardcoded

**Verdict: No hardcoded secrets detected.**

---

## 3. Security Headers (`server/src/security.ts`)

| Header | Value | OWASP Recommended | Status |
|---|---|---|---|
| `X-Content-Type-Options` | `nosniff` | `nosniff` | Pass |
| `X-Frame-Options` | `DENY` | `DENY` or `SAMEORIGIN` | Pass |
| `X-XSS-Protection` | `0` | `0` (modern recommendation — rely on CSP instead) | Pass |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | `max-age≥31536000; includeSubDomains` | Pass |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | `strict-origin-when-cross-origin` or `no-referrer` | Pass |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict unused features | Pass |
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'` | Restrictive CSP | Pass |
| `X-Powered-By` | Removed | Must not be present | Pass |

### Recommendation

- Consider adding `preload` to HSTS: `max-age=63072000; includeSubDomains; preload` for HSTS preload list eligibility.
- The CSP `default-src 'none'` is very strict and appropriate for the API server (which serves JSON, not HTML).

**Verdict: All OWASP-recommended headers are present and correctly configured.**

---

## 4. CORS Configuration

**Implementation** (`server/src/env.ts` + `server/src/app.ts`):

```ts
// env.ts
CORS_ORIGIN: z.string().default('http://localhost:5173')

// app.ts
app.use(cors({ origin: corsOrigins, credentials: true }))
```

- Default: `http://localhost:5173` (Vite dev server) — safe for development
- Production: Configurable via `CORS_ORIGIN` environment variable
- Supports comma-separated multiple origins
- Supports wildcard `*` for open APIs

### Concerns

| Issue | Severity | Details |
|---|---|---|
| Wildcard CORS with credentials | Medium | If `CORS_ORIGIN=*` is set while `credentials: true` is active, the `cors` middleware will refuse the combination (correct behavior per spec). But the configuration *allows* `*` without warning. Consider logging a warning when `CORS_ORIGIN=*` in production. |

**Verdict: CORS is properly configured for development. Production configuration depends on the deployment setting the correct `CORS_ORIGIN`.**

---

## 5. Rate Limiting

**Implementation** (`server/src/security.ts`):

| Endpoint | Window | Max Requests |
|---|---|---|
| `POST /auth/login` | 15 minutes | 15 |
| `POST /auth/refresh` | 15 minutes | 30 |

### Architecture

- In-memory `Map<string, RateLimitBucket>` keyed by `path:clientIP`
- Stale buckets cleaned every 60 seconds via `setInterval`
- Client IP extracted from `X-Forwarded-For` (first entry) or `remoteAddress`
- Returns standard `RateLimit-*` headers
- 429 response with JSON error envelope

### Concerns

| Issue | Severity | Details |
|---|---|---|
| In-memory rate limiting | Medium | Rate limit state is per-process. In a multi-instance deployment, each instance tracks independently — an attacker can multiply their budget by the instance count. Consider Redis-backed rate limiting for production multi-instance deployments. |
| No rate limiting on data endpoints | Low | Collection endpoints (`/jobs`, `/customers`, etc.) have no rate limits. These are auth-gated, so the risk is limited to authenticated users. Consider adding a general rate limit (e.g. 100 req/min per user) for defense in depth. |
| IP spoofing via `X-Forwarded-For` | Low | The `getClientIp` function trusts the first value in `X-Forwarded-For`. Behind a trusted reverse proxy (Vercel, Nginx), this is correct. Without a trusted proxy, clients can spoof their IP to bypass rate limits. Ensure the deployment uses `trust proxy` correctly. |

**Verdict: Rate limiting is correctly implemented for auth endpoints. Adequate for single-instance deployment.**

---

## 6. SQL Injection Analysis

### ORM Usage

All database queries use **Drizzle ORM's query builder** with parameterized values:

```ts
// Example from auth.ts — email is parameterized
db.select().from(schema.users).where(eq(schema.users.email, parsed.data.email.toLowerCase()))

// Example from collections.ts — search uses ilike with escaping
ilike(def.table[c], `%${escapeIlike(q)}%`)
```

### Protections in Place

1. **Zod validation** on all inputs before they reach the database
2. **`escapeIlike()` function** in `security.ts` properly escapes `%`, `_`, and `\` in ILIKE patterns
3. **Column whitelist** — sort and filter fields are validated against `def.columns` before use
4. **No raw SQL** — no `sql.raw()`, `sql.unsafe()`, or string concatenation in queries
5. **Parameterized values** — all user input goes through Drizzle's parameter binding

### Drizzle-ORM Identifier Escaping Vulnerability (GHSA-gpj5-g38j-94v9)

The npm audit flagged drizzle-orm for SQL injection via improperly escaped **SQL identifiers** (table/column names). In this codebase:

- Table and column names are **hardcoded in schema.ts** — they are never derived from user input
- The `sort` field name and `filter` keys come from query params but are **validated against a static whitelist** (`def.columns.includes(field)`) before being used as column references
- Dynamic column access (`def.table[field]`) resolves to a pre-defined Drizzle column object, not a raw string

**Verdict: No SQL injection vectors found. The whitelist validation mitigates the drizzle-orm identifier vulnerability, but upgrading is still recommended.**

---

## 7. Additional Security Observations

### Authentication

- JWT access tokens with configurable TTL (default 15 min) — appropriate
- Opaque refresh tokens stored server-side, revocable on logout — correct pattern
- Refresh token rotation on every use (old token revoked, new pair issued) — prevents replay
- Password hashing with bcrypt (cost factor 10) — adequate
- No account enumeration: login returns same error for unknown email and wrong password
- Password hash never included in API responses (`publicUser()` strips it)

### Authorization

- RBAC middleware (`requireAuth` + `requireModule`) gates every data endpoint
- Permission checks are server-side, not just frontend-hidden
- Role-action matrix defines granular access (view, create, edit, delete per module)

### Error Handling

- `AppError` class ensures structured error responses, never raw stack traces
- Unhandled errors return generic 500 with no internal details
- `console.error` logs only `err.message`, not full stack — adequate for production

### Input Validation

- All request bodies validated with Zod schemas
- `listQuerySchema` limits `pageSize` to max 200, `page` min 1
- Sort field validated with regex (`/^[a-zA-Z_]+:(asc|desc)$/`)
- Unknown body keys rejected via `.strict()`

---

## 8. Risk Summary

| Finding | Severity | Recommendation |
|---|---|---|
| `drizzle-orm` SQL injection CVE | High (mitigated) | Upgrade to ≥ 0.45.2 |
| `react-router` open redirect | Moderate | Upgrade to ≥ 7.18 |
| `nanoid` infinite loop | High | Run `npm audit fix` in `app/` |
| In-memory rate limiting | Medium | Use Redis for multi-instance |
| No rate limit on data endpoints | Low | Add general authenticated rate limit |
| CORS wildcard + credentials | Medium | Add production warning for `*` |
| HSTS missing `preload` | Low | Add `preload` directive |

---

## 9. Overall Assessment

**The server has a solid security posture.** All OWASP-recommended headers are present. Authentication follows best practices (JWT + opaque refresh tokens, bcrypt, no account enumeration). RBAC is enforced server-side. SQL injection is prevented through parameterized queries and input validation. The primary action items are dependency upgrades (drizzle-orm, react-router, nanoid) and infrastructure-level hardening (Redis rate limiting, CORS validation) for production deployments.
