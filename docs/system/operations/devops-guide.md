# DevOps Guide

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-001                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

This document covers the build, deployment, and operations practices for SALIS AUTO. The frontend is a Vite-built React SPA deployed to GitHub Pages. The backend is a Fastify/TypeScript server running on Node.js 20, backed by PostgreSQL.

## 2. Repository Structure

```
/
  app/                  -- Frontend (React + Vite + TailwindCSS)
    src/
    package.json
    vite.config.ts
    tsconfig.json
  server/               -- Backend (Fastify + Drizzle ORM)
    src/
    drizzle/            -- SQL migration files
    package.json
    tsconfig.json
  packages/
    contract/           -- Shared types, RBAC matrix, validation schemas
  docs/                 -- Documentation
  .github/workflows/    -- CI/CD pipelines
```

## 3. Frontend Build Pipeline

### 3.1 Development

```bash
cd app && npm run dev    # Vite dev server with HMR on port 5173
```

When `VITE_API_URL` is unset, the app runs against the mock repository with fixture data. No backend or database is required for frontend development.

### 3.2 Production Build

```bash
cd app && npm run build  # tsc -b && vite build
```

Produces hashed chunks in `app/dist/` with code splitting at the route level. Every screen is `React.lazy()` loaded, so the initial bundle contains only the shell and the current route's chunk.

### 3.3 Key Build Variables

| Variable          | Purpose                                    | Default       |
|-------------------|--------------------------------------------|---------------|
| `VITE_API_URL`    | Backend API base URL                       | (unset = mock)|
| `VITE_BASE_PATH`  | Base URL path for static hosting           | `/`           |

### 3.4 Dependencies

| Package              | Version | Purpose                        |
|----------------------|---------|--------------------------------|
| react                | 18.3.1  | UI framework                   |
| typescript           | 5.7     | Type safety                    |
| vite                 | 5.4     | Build tool and dev server      |
| tailwindcss          | 3.4     | Utility-first CSS              |
| react-router-dom     | 7.x     | Client-side routing            |
| @tanstack/react-query| Latest  | Server state management        |

## 4. Backend Build and Run

### 4.1 Development

```bash
cd server && npm run dev    # ts-node or tsx with watch mode
```

The server requires `DATABASE_URL` at minimum. In development, PGlite provides a local PostgreSQL-compatible database without a separate PostgreSQL installation.

### 4.2 Production

```bash
cd server && npm run build  # TypeScript compilation
cd server && npm start      # Node.js with compiled JS
```

### 4.3 Required Environment Variables

| Variable          | Required In    | Purpose                        |
|-------------------|----------------|--------------------------------|
| `DATABASE_URL`    | All            | PostgreSQL connection string   |
| `JWT_SECRET`      | Production     | HS256 signing key              |
| `CORS_ORIGINS`    | Production     | Allowed origins (comma-separated)|

See [Environment Setup](./environment-setup.md) for the complete variable reference.

## 5. CI/CD Pipeline

### 5.1 GitHub Pages Deployment (Frontend)

The `.github/workflows/deploy-pages.yml` workflow automates frontend deployment:

**Trigger**: Push to `main` branch or manual `workflow_dispatch`

**Steps**:

1. Checkout code
2. Setup Node.js 20 with npm cache
3. Install dependencies (`npm ci` in `app/`)
4. Build with `VITE_BASE_PATH` set to `/<repository-name>/`
5. Upload `app/dist/` as Pages artifact
6. Deploy to GitHub Pages

**Concurrency**: The `pages` group with `cancel-in-progress: true` ensures only one deployment runs at a time. A new push cancels any in-progress deployment.

**Permissions**: `contents: read`, `pages: write`, `id-token: write`

### 5.2 Backend Deployment

The backend deploys as a Node.js process. Deployment targets receive:

1. Compiled TypeScript output
2. `node_modules` from `npm ci --production`
3. Environment variables configured per environment
4. Database migration applied before the process starts

## 6. Database Operations

### 6.1 Migrations

Database migrations live in `server/drizzle/` as numbered SQL files. Key migrations:

- `0001_rls.sql`: Applies row-level security policies to all 53 tenant tables, creates the audit log append-only trigger

### 6.2 Migration Execution

Migrations run before the application starts, using the `DATABASE_ADMIN_URL` connection (which may have elevated privileges) when available, falling back to `DATABASE_URL`.

### 6.3 Seeding

The seed process uses `systemPrincipal(orgId, userId)` to create a principal with `owner` role and `all` scope, allowing writes through the same RLS-enforced path as regular API calls.

## 7. Health Checks

### 7.1 Liveness Probe (`GET /health`)

Returns `{ status: "ok", uptimeSeconds: N }`. This endpoint never touches the database -- a database blip must not restart healthy containers. Unauthenticated.

### 7.2 Readiness Probe (`GET /ready`)

Executes `SELECT 1` against the database. Returns `{ status: "ready" }` (200) or `{ status: "unavailable" }` (503). Unauthenticated.

### 7.3 Probe Usage

| Probe      | Kubernetes Field      | Purpose                         |
|------------|-----------------------|---------------------------------|
| `/health`  | `livenessProbe`       | Restart if process is hung       |
| `/ready`   | `readinessProbe`      | Remove from LB if DB is down     |

## 8. Rate Limiting

Rate limiting is applied globally using `@fastify/rate-limit`:

| Setting          | Value                                      |
|------------------|--------------------------------------------|
| Budget           | `RATE_LIMIT_MAX` per minute (default: 300) |
| Key              | `orgId:IP` (tenant + address)              |
| Headers          | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (IETF draft spec) |
| Public leads     | Separate limit: `PUBLIC_LEAD_RATE_LIMIT` (default: 5) per IP |

The `orgId:IP` key ensures one noisy branch behind a NAT does not exhaust the budget for the entire organization.

## 9. Logging

### 9.1 Format

All environments use structured JSON logging (via Pino, Fastify's default logger). There is no pretty-printer -- a second formatting path would create a second, unredacted output channel.

### 9.2 Log Levels

Configurable via `LOG_LEVEL`: `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent`. Default: `info`.

### 9.3 PII Redaction

The logger redacts sensitive paths at the serializer level:

- `req.headers.authorization`, `req.headers.cookie`
- `req.body.password`, `req.body.otp`, `req.body.refreshToken`
- `req.body.phone`, `req.body.email`, `req.body.buyerVatNumber`
- `*.password`, `*.passwordHash`, `*.accessToken`, `*.codeHash`

Request URLs are logged without query strings (`url.split('?')[0]`).

### 9.4 Error Logging

| Error Type          | Log Level | Client Response                    |
|---------------------|-----------|------------------------------------|
| `ApiError` (4xx)    | `warn`    | Error code, message, field          |
| Zod validation      | --        | 400 with field path                 |
| PG 23505 (unique)   | --        | 409 with colliding field            |
| PG 23503 (FK)       | --        | 422 `rule_violated`                 |
| Unhandled error      | `error`   | 500 with request ID only            |

5xx errors never expose stack traces, table names, or column names to the client. The client receives only the request ID for correlation.

## 10. Security Headers

Helmet is configured with the strictest CSP policy:

```
default-src: 'none'
frame-ancestors: 'none'
base-uri: 'none'
form-action: 'none'
X-Frame-Options: DENY
```

This is appropriate because the API serves JSON only -- no HTML, static files, or view engine.

## Related Documents

- [Environment Setup](./environment-setup.md)
- [Monitoring and Logging](./monitoring-logging.md)
- [Backup and Recovery](./backup-recovery.md)
- [Backend Architecture](../architecture/backend-architecture.md)
