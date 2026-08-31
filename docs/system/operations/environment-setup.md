# Environment Setup

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-004                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

This document provides the complete environment variable reference for SALIS AUTO, covering the backend server, frontend build, database configuration, and secrets management. All configuration is validated at boot time using Zod schemas.

## 2. Backend Environment Variables

### 2.1 Core Server

| Variable     | Type    | Default       | Required | Purpose                              |
|--------------|---------|---------------|----------|--------------------------------------|
| `NODE_ENV`   | enum    | `development` | No       | `development`, `test`, or `production` |
| `PORT`       | integer | `3001`        | No       | HTTP listen port (1-65535)           |
| `HOST`       | string  | `0.0.0.0`    | No       | HTTP bind address                    |
| `LOG_LEVEL`  | enum    | `info`        | No       | `fatal`/`error`/`warn`/`info`/`debug`/`trace`/`silent` |

### 2.2 Database

| Variable            | Type    | Default | Required | Purpose                              |
|---------------------|---------|---------|----------|--------------------------------------|
| `DATABASE_URL`      | string  | --      | Yes      | PostgreSQL connection string         |
| `DATABASE_ADMIN_URL`| string  | --      | No       | Admin connection for migrations      |
| `DATABASE_POOL_MAX` | integer | `10`    | No       | Maximum connection pool size (1-100) |

#### Connection String Format

```
postgresql://user:password@host:port/database?sslmode=require
```

In development, PGlite provides a local PostgreSQL-compatible database. Set `DATABASE_URL` to the PGlite connection string to run without a separate PostgreSQL installation.

### 2.3 Authentication

| Variable       | Type   | Default          | Required    | Purpose                          |
|----------------|--------|------------------|-------------|----------------------------------|
| `JWT_SECRET`   | string | --               | Production  | HS256 signing key for JWTs       |
| `JWT_ISSUER`   | string | `salis-auto`     | No          | JWT `iss` claim value            |
| `JWT_AUDIENCE`  | string | `salis-auto-api` | No          | JWT `aud` claim value            |

`JWT_SECRET` is optional in development and test modes but **required in production**. A missing secret in production stops the process at boot with a clear error message. There is no default literal for any secret -- a value an attacker can read in the repository must never be used.

### 2.4 CORS and Rate Limiting

| Variable         | Type    | Default | Required | Purpose                              |
|------------------|---------|---------|----------|--------------------------------------|
| `CORS_ORIGINS`   | string  | `""`    | No       | Comma-separated allowed origins      |
| `RATE_LIMIT_MAX` | integer | `300`   | No       | Max requests per minute per orgId:IP |

#### CORS Configuration

The `CORS_ORIGINS` value is split on commas and trimmed. Examples:

```bash
# Single origin
CORS_ORIGINS=https://app.salisauto.com

# Multiple origins
CORS_ORIGINS=https://app.salisauto.com,https://staging.salisauto.com

# Empty (CORS disabled, same-origin only)
CORS_ORIGINS=
```

Credentials are enabled (`credentials: true`), and the following headers are exposed to cross-origin requests: `x-request-id`, `retry-after`, `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`.

### 2.5 Public Lead Intake

| Variable               | Type    | Default                      | Required | Purpose                          |
|------------------------|---------|------------------------------|----------|----------------------------------|
| `PUBLIC_LEAD_ORG_ID`   | string  | `01JAAAAAAAAAAAAAAAAAAAAAA1`  | No       | Organization for public leads    |
| `PUBLIC_LEAD_RATE_LIMIT`| integer| `5`                          | No       | Per-IP rate limit for public leads|

The public lead endpoint (`POST /api/v1/public/leads`) is unauthenticated. Every submission lands in the configured organization. The caller never chooses tenancy, so a public POST cannot escalate into another tenant.

### 2.6 Tax Configuration

| Variable       | Type    | Default | Required | Purpose                              |
|----------------|---------|---------|----------|--------------------------------------|
| `VAT_RATE_BPS` | integer | `1500`  | No       | VAT rate in basis points (1500 = 15%)|

This is a deployment setting, not a code literal. A Saudi rate change is a configuration update, and the finance report endpoint always names the rate it computed under.

## 3. Frontend Environment Variables

### 3.1 Build-Time Variables

| Variable          | Type   | Default | Required | Purpose                              |
|-------------------|--------|---------|----------|--------------------------------------|
| `VITE_API_URL`    | string | --      | No       | Backend API base URL                 |
| `VITE_BASE_PATH`  | string | `/`     | No       | Base URL path for static hosting     |

#### Repository Seam

The `VITE_API_URL` variable controls which data layer the frontend uses:

| `VITE_API_URL`  | Behavior                                      |
|-----------------|-----------------------------------------------|
| Unset           | Mock repository with generated fixture data   |
| Set (e.g., `https://api.salisauto.com`) | HTTP repository with Bearer token auth |

### 3.2 localStorage Keys

The frontend persists these keys to browser local storage:

| Key            | Purpose                          | Mode      |
|----------------|----------------------------------|-----------|
| `salis-token`  | JWT access token                 | Live      |
| `salis-role`   | Active role identifier           | Mock      |
| `salis-lang`   | Language preference (`en`/`ar`)  | Both      |
| `salis-theme`  | Theme preference (`light`/`dark`)| Both      |

## 4. Environment File Management

### 4.1 `.env` File

The server reads `server/.env` at boot, loading values into `process.env` without overwriting anything already set. A real deployment's environment always wins over the file.

```bash
# server/.env (git-ignored, never committed)
DATABASE_URL=postgresql://localhost:5432/salis_dev
JWT_SECRET=dev-only-secret-change-in-production
LOG_LEVEL=debug
```

Only `.env.example` is committed to the repository.

### 4.2 Validation at Boot

All environment variables are validated through a Zod schema at application startup. If validation fails, the process exits with a descriptive error message listing every invalid variable:

```
Error: Invalid environment: DATABASE_URL: Required; JWT_SECRET: Required
```

This prevents the application from running with misconfiguration that would produce silent failures later.

## 5. Development Setup

### 5.1 Frontend Only (Mock Mode)

```bash
cd app
npm install
npm run dev          # Vite dev server on port 5173
```

No backend or database required. All 14 demo roles are available through the role switcher.

### 5.2 Full Stack (Local)

```bash
# Terminal 1: Backend
cd server
cp .env.example .env   # Edit with local database URL
npm install
npm run dev             # Fastify on port 3001

# Terminal 2: Frontend
cd app
VITE_API_URL=http://localhost:3001 npm run dev
```

### 5.3 PGlite (No PostgreSQL Installation)

For development without a PostgreSQL server, PGlite provides an in-process PostgreSQL-compatible database. Set `DATABASE_URL` to the PGlite connection string in `server/.env`.

## 6. Production Configuration

### 6.1 Required Variables

These must be set in every production deployment:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/salis?sslmode=require
JWT_SECRET=<cryptographically-random-string-at-least-32-bytes>
CORS_ORIGINS=https://app.salisauto.com
```

### 6.2 Recommended Settings

```bash
LOG_LEVEL=info
RATE_LIMIT_MAX=300
DATABASE_POOL_MAX=20
PUBLIC_LEAD_RATE_LIMIT=5
VAT_RATE_BPS=1500
```

### 6.3 Secret Rotation

| Secret        | Rotation Impact                                      |
|---------------|------------------------------------------------------|
| `JWT_SECRET`  | All active tokens invalidated; users must re-login    |
| `DATABASE_URL`| Requires app restart; no data impact                  |

`JWT_SECRET` rotation invalidates all access tokens (15-minute natural expiry) and all refresh tokens (30-day impact). Plan rotation during low-traffic periods and communicate to users.

## 7. Environment Comparison

| Variable            | Development        | Staging            | Production         |
|---------------------|--------------------|--------------------|--------------------| 
| `NODE_ENV`          | `development`      | `production`       | `production`       |
| `DATABASE_URL`      | PGlite / local PG  | Cloud PG           | Cloud PG (HA)      |
| `JWT_SECRET`        | Optional           | Required           | Required           |
| `CORS_ORIGINS`      | `""`               | Staging domain     | Production domain  |
| `LOG_LEVEL`         | `debug`            | `info`             | `info`             |
| `RATE_LIMIT_MAX`    | `300`              | `300`              | `300`              |
| `VITE_API_URL`      | Unset (mock)       | Staging API        | Production API     |

## Related Documents

- [DevOps Guide](./devops-guide.md)
- [Backend Architecture](../architecture/backend-architecture.md)
- [Auth Architecture](../architecture/auth-architecture.md)
- [Security Architecture](../security/security-architecture.md)
