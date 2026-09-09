# SALIS AUTO -- Local Development Guide

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-DEV-004                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. System Requirements

### 1.1 Required Software

| Software   | Version | Purpose                          |
|------------|---------|----------------------------------|
| Node.js    | 20+     | Runtime for frontend and backend |
| npm        | 9+      | Package management (ships with Node) |
| Git        | 2.40+   | Version control                  |
| VS Code    | Latest  | Recommended IDE                  |

### 1.2 Optional Software

| Software     | Version | Purpose                              |
|--------------|---------|--------------------------------------|
| PostgreSQL   | 15+     | Production-grade database (PGlite used by default) |
| Docker       | 24+     | Containerized PostgreSQL, optional services |
| pnpm         | 8+      | Alternative package manager          |

Verify your setup:

```bash
node --version    # v20.x or higher
npm --version     # 9.x or higher
git --version     # 2.40 or higher
```

---

## 2. Clone and Install

```bash
# Clone the repository
git clone <repository-url> salis-auto
cd salis-auto

# Install frontend dependencies
cd app
npm install

# Install backend dependencies (if doing full-stack work)
cd ../server
npm install

# Install shared contract package (if present)
cd ../packages/contract
npm install
```

The project structure:

```
/
  app/                  -- Frontend (React 18 + Vite 5.4 + TailwindCSS 3.4)
  server/               -- Backend (Fastify + Drizzle ORM 0.36)
  packages/contract/    -- Shared types, RBAC matrix, validation schemas
  docs/                 -- Documentation
  project/              -- Design bundle (source of truth for generated data)
```

---

## 3. Environment Configuration

### 3.1 Frontend Environment

The frontend requires no `.env` file by default. The single controlling variable is:

| Variable           | Effect When Set                        | Effect When Unset                     |
|--------------------|----------------------------------------|---------------------------------------|
| `VITE_API_BASE_URL`| Frontend uses `httpRepository` (REST API with Bearer auth) | Frontend uses `mockRepository` (in-memory fixture data) |

Set it inline when starting the dev server:

```bash
VITE_API_BASE_URL=http://localhost:3001 npm run dev
```

Or create `app/.env.local` (git-ignored):

```bash
VITE_API_BASE_URL=http://localhost:3001
```

### 3.2 Backend Environment

Create `server/.env` from the example file:

```bash
cd server
cp .env.example .env
```

Key variables:

| Variable              | Default               | Purpose                                |
|-----------------------|-----------------------|----------------------------------------|
| `DATABASE_URL`        | *(none -- PGlite if unset)* | PostgreSQL connection string or PGlite path |
| `JWT_SECRET`          | *(auto-generated in dev)* | HS256 signing key for JWTs             |
| `JWT_ISSUER`          | `salis-auto`          | JWT `iss` claim                        |
| `JWT_AUDIENCE`        | `salis-auto-api`      | JWT `aud` claim                        |
| `PORT`                | `3001`                | HTTP listen port                       |
| `HOST`                | `0.0.0.0`             | HTTP bind address                      |
| `LOG_LEVEL`           | `info`                | Pino log level (`debug` recommended for dev) |
| `CORS_ORIGINS`        | `""`                  | Comma-separated allowed origins        |
| `RATE_LIMIT_MAX`      | `300`                 | Max requests per minute per orgId:IP   |
| `VAT_RATE_BPS`        | `1500`                | VAT rate in basis points (15%)         |

Example `server/.env` for local development:

```bash
DATABASE_URL=postgresql://localhost:5432/salis_dev
JWT_SECRET=dev-only-secret-change-in-production
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:5173
```

### 3.3 ZATCA Variables (Optional for Local Dev)

These are only needed when testing e-invoicing integration:

| Variable                | Purpose                              |
|-------------------------|--------------------------------------|
| `ZATCA_ENV`             | `sandbox` or `production`            |
| `ZATCA_CERT_PATH`       | Path to ZATCA compliance certificate |
| `ZATCA_PRIVATE_KEY_PATH` | Path to ZATCA private key           |
| `ZATCA_API_URL`          | ZATCA API endpoint                  |

Most local development does not require ZATCA configuration. The invoice module uses feature flag `ff_zatca_enabled` to gate e-invoicing features.

---

## 4. Development Modes

### 4.1 Frontend-Only (PGlite/Mock Mode)

The fastest way to start. No backend, no database, no configuration needed.

```bash
cd app
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173`. The frontend loads `mockRepository` backed by generated fixture data with Saudi-specific context (SAR currency, Saudi license plates, +966 phone numbers, Saudi cities).

All 14 demo roles are available through the login screen. The role is stored in `localStorage` key `salis-role`.

### 4.2 Full-Stack (PostgreSQL)

Run both frontend and backend with a real database connection.

**Terminal 1 -- Backend:**

```bash
cd server
cp .env.example .env         # Edit with your local database URL
npm install
npm run dev                   # Fastify on port 3001 (tsx watch)
```

**Terminal 2 -- Frontend:**

```bash
cd app
VITE_API_BASE_URL=http://localhost:3001 npm run dev
```

The frontend detects `VITE_API_BASE_URL` and dynamically imports the HTTP client, switching to `httpRepository` with Bearer token authentication.

### 4.3 Backend-Only

For API development without the frontend:

```bash
cd server
npm run dev
```

Test endpoints with curl or Postman:

```bash
# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@salisauto.sa", "password": "salis1234"}'

# List customers (with token from login response)
curl http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer <access-token>"
```

Health check endpoints (unauthenticated):

```bash
curl http://localhost:3001/health   # Liveness probe
curl http://localhost:3001/ready    # Readiness probe (tests DB)
```

---

## 5. Mock Data and Seeding

### 5.1 Demo Accounts

The seed database includes accounts for all 14 roles. Default password: `salis1234`

| Role            | Email                        |
|-----------------|------------------------------|
| Owner           | owner@salisauto.sa           |
| General Manager | gm@salisauto.sa              |
| Branch Manager  | bm@salisauto.sa              |
| Accountant      | accountant@salisauto.sa      |
| Service Advisor | advisor@salisauto.sa         |
| Technician      | tech@salisauto.sa            |
| Parts Manager   | parts@salisauto.sa           |
| HR Manager      | hr@salisauto.sa              |
| CRM Agent       | crm@salisauto.sa             |
| Cashier         | cashier@salisauto.sa         |

In mock mode (no `VITE_API_BASE_URL`), all roles are accessible through the login screen's role switcher without credentials.

### 5.2 Fixture Data

The generated fixture data in `app/src/data/generated/tables.ts` covers all 31 collections with Saudi-specific sample data. To regenerate after design changes:

```bash
cd app
npm run port-design    # Reads project/gms-data.js, writes to data/generated/
npm run smoke          # Quick validation of generated data
```

---

## 6. Hot Module Replacement

Vite HMR is enabled by default. Changes to React components, styles, and data files reflect instantly in the browser without a full page reload.

- **React components**: Fast Refresh preserves component state during edits.
- **TailwindCSS**: Style changes apply immediately.
- **Generated data files**: Changes to `data/generated/` trigger a module reload.

The backend uses `tsx watch` for auto-reload. File changes in `server/src/` restart the server automatically.

---

## 7. Database Migrations

### 7.1 Schema Changes

Drizzle ORM manages the database schema. Tables are defined in `server/src/db/schema.ts`.

```bash
cd server

# Generate migration SQL from schema changes
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Push schema directly (dev only -- skips migration files)
npx drizzle-kit push
```

### 7.2 Migration Files

Migrations live in `server/drizzle/` as numbered SQL files. Key migrations include:

- `0001_rls.sql`: Applies row-level security policies to all 53 tenant tables and creates the append-only audit log trigger.

### 7.3 Migration Best Practices

- Always use `drizzle-kit generate` to produce migration files for reviewable changes.
- Use `drizzle-kit push` only in local development for rapid iteration.
- Migrations run automatically before the application starts in deployment, using `DATABASE_ADMIN_URL` when available.

---

## 8. Debugging Setup

### 8.1 VS Code Launch Configurations

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Frontend (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/app/src"
    },
    {
      "name": "Backend (Node)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "watch", "src/index.ts"],
      "cwd": "${workspaceFolder}/server",
      "envFile": "${workspaceFolder}/server/.env"
    }
  ]
}
```

### 8.2 Browser DevTools

- **React DevTools**: Install the browser extension for component tree inspection, props/state debugging, and the Profiler.
- **TanStack Query DevTools**: Enabled in development builds. Shows query cache state, stale times, and refetch triggers.

See [Debugging Guide](./debugging-guide.md) for detailed debugging scenarios.

---

## 9. Common Issues and Fixes

### 9.1 Port Conflicts

```
Error: listen EADDRINUSE: address already in use :::5173
```

Kill the process occupying the port:

```bash
lsof -ti:5173 | xargs kill -9    # Frontend
lsof -ti:3001 | xargs kill -9    # Backend
```

### 9.2 PGlite WASM Errors

If you see WASM-related errors in the backend, ensure Node.js 20+ is installed. PGlite requires WASM support in the runtime.

### 9.3 CORS Issues

If the frontend cannot reach the backend, verify `CORS_ORIGINS` in `server/.env` includes the frontend URL:

```bash
CORS_ORIGINS=http://localhost:5173
```

### 9.4 node_modules Problems

```bash
# Nuclear option: clean reinstall
rm -rf node_modules package-lock.json
npm install
```

Run this in both `app/` and `server/` if dependency resolution breaks.

### 9.5 Generated Data Out of Sync

If screens or navigation look wrong, regenerate from the design bundle:

```bash
cd app
npm run port-design
npm run smoke
```

---

## 10. IDE Setup

### 10.1 Recommended VS Code Extensions

| Extension                | ID                                    | Purpose                    |
|--------------------------|---------------------------------------|----------------------------|
| ESLint                   | `dbaeumer.vscode-eslint`              | JavaScript/TypeScript linting |
| Prettier                 | `esbenp.prettier-vscode`              | Code formatting            |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss`          | Tailwind class autocomplete |
| i18n Ally                | `lokalise.i18n-ally`                  | Translation key management |
| TypeScript Importer      | `pmneo.tsimporter`                    | Auto-import suggestions    |
| PostCSS Language Support | `csstools.postcss`                    | PostCSS/Tailwind syntax    |

### 10.2 Workspace Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]
  ],
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

---

## Related Documents

- [Debugging Guide](./debugging-guide.md)
- [Release Process](./release-process.md)
- [Frontend Architecture](../system/architecture/frontend-architecture.md)
- [Backend Architecture](../system/architecture/backend-architecture.md)
- [Environment Setup](../system/operations/environment-setup.md)
- [Development Guide](../development.md)
