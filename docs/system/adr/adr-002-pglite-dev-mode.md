# SALIS AUTO — ADR-002: PGlite for Local Development Mode

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-002                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal — Confidential      |

## Status

Accepted

## Context

SALIS AUTO development involves two distinct workstreams: frontend developers building 191+ screens across 13 business domains, and backend developers working on the Fastify API server with Drizzle ORM 0.36 over PostgreSQL. These workstreams have different database dependencies:

1. **Frontend developers** need realistic data to build and test screens — customer lists, job card Kanban boards, invoice tables, appointment calendars — but they should not need to install, configure, or maintain a PostgreSQL instance. Their workflow is `cd app && npm install && npm run dev`.

2. **Backend developers** need a PostgreSQL-compatible database for testing Drizzle ORM queries, RLS policies, migration scripts, and the six-step CRUD pipeline. When `DATABASE_URL` is not set, the server should still start and function without requiring an external database process.

3. **Demo and showcase scenarios** require a fully functional application that can run from a single `npm run dev` command on any machine — a sales engineer's laptop, a conference demo station, or a CI environment — without Docker, without PostgreSQL, without any external service dependency.

4. **Offline development** must be possible. Developers working without network access (travel, restricted environments) should be able to run, modify, and test the full application.

The prerequisites listed in the development guide are intentionally minimal: Node.js 18+, npm, and Git. No external database is required for local development.

## Decision

Use PGlite — PostgreSQL compiled to WebAssembly — as the database engine for local development when no external PostgreSQL connection is configured. The switching mechanism differs by layer:

### Frontend: Repository Seam

The frontend uses the `VITE_API_URL` environment variable to select the data source:

| `VITE_API_URL` | Active Repository  | Backing Store                          |
|-----------------|--------------------|----------------------------------------|
| Unset           | `mockRepository`   | Generated fixture tables in memory     |
| Set             | `httpRepository`   | REST API with Bearer token auth        |

When `VITE_API_URL` is unset, the `RepositoryProvider` activates `mockRepository`, which operates on in-memory fixture data generated from the design bundle (`app/src/data/generated/tables.ts`). This data uses Saudi-specific context: SAR currency, Saudi license plates, +966 phone numbers, and Saudi city names (Riyadh, Jeddah, Dammam).

The mock repository implements the full `Repository` interface — `list`, `get`, `create`, `update`, `delete` across 46 collection keys — performing search, sort, filter, and pagination operations in JavaScript on the fixture arrays.

### Backend: PGlite Fallback

The backend server uses `DATABASE_URL` to select the database engine:

| `DATABASE_URL` | Database Engine                     |
|-----------------|-------------------------------------|
| Unset           | PGlite (in-process PostgreSQL WASM) |
| Set             | PostgreSQL via connection string     |

When `DATABASE_URL` is not set, the server instantiates a PGlite database in-process. This provides a real PostgreSQL query engine — parsing SQL, enforcing constraints, executing transactions — without any external process. Drizzle ORM 0.36 connects to PGlite through its PostgreSQL-compatible driver interface, so the same schema definitions, migration scripts, and query builders work against both PGlite and production PostgreSQL.

### Authentication in Development

The mock mode frontend bypasses real authentication. The login screen reads the role from localStorage key `salis-role`, enabling role switching across all 14 RBAC roles without a backend. Demo accounts for all roles use the password `salis1234` (configurable via `DEMO_PASSWORD`).

When the frontend connects to the backend (`VITE_API_BASE_URL=http://localhost:4000`), the full JWT authentication flow activates:

1. Frontend sends `POST /auth/login` with email and password
2. Server returns `{ accessToken, refreshToken, user }`
3. `SessionProvider` stores the access token as `salis-token` in localStorage
4. `httpRepository` includes `Authorization: Bearer <token>` on all API requests
5. Token refresh via `POST /auth/refresh` with the refresh token
6. Logout via `POST /auth/logout` revokes the refresh token server-side

### Development Mode Combinations

The two switching mechanisms (`VITE_API_URL` and `DATABASE_URL`) operate independently, producing four valid development configurations:

| Frontend Mode | Backend Mode     | Use Case                                           |
|---------------|------------------|----------------------------------------------------|
| Mock (unset)  | N/A              | Frontend-only development, demos, offline work     |
| HTTP (set)    | PGlite (unset)   | Full-stack dev without PostgreSQL installation     |
| HTTP (set)    | PostgreSQL (set) | Integration testing against real PostgreSQL        |
| Mock (unset)  | PGlite (unset)   | Backend API development with frontend in parallel  |

### Fixture Data Details

The generated fixture data in `app/src/data/generated/tables.ts` covers 31 collections with Saudi-specific content. The `npm run port-design` script regenerates this data from the design bundle (`project/gms-data.js`), producing:

| Generated File | Content                                          |
|----------------|--------------------------------------------------|
| `screens.ts`   | 191 screen definitions with routes and purposes  |
| `nav.ts`       | 14 sidebar navigation groups                     |
| `tables.ts`    | Fixture data for all 31 collections              |
| `rbac.ts`      | Roles, permission matrix, field rules, SOD rules |
| `badges.ts`    | Status badge color palettes                      |
| `ar.ts`        | ~2,122 Arabic translation entries                |

## Consequences

### Positive

- **Zero-install development**: A new developer runs `cd app && npm install && npm run dev` and has a fully functional application with realistic data. No Docker, no PostgreSQL installation, no database configuration. The entire prerequisite list is Node.js, npm, and Git.
- **Offline-capable**: The mock repository operates entirely in-memory. The PGlite backend requires no network access. Developers can work on planes, trains, or in network-restricted environments.
- **Instant startup**: The Vite dev server with mock data starts in under 2 seconds. There is no database connection delay, no migration wait, no seed data loading against a cold PostgreSQL instance.
- **Demo readiness**: Sales engineers and product managers can run the full application from a single command. The Saudi-specific fixture data (SAR amounts, Saudi plates, Arabic translations) provides a realistic demo environment that reflects the production use case.
- **Backend SQL validation**: PGlite on the backend executes real PostgreSQL SQL, so queries that pass locally will parse correctly in production. Drizzle ORM schema definitions and migration files are validated against a real SQL engine, not a mock.
- **CI-friendly**: Build and test pipelines run without provisioning a PostgreSQL service container. `npm run build` and `npm test` execute in hermetic environments.

### Negative

- **PGlite does not enforce RLS**: Row-level security policies, which are critical for multi-tenant isolation in production (53 tables with `FORCE` RLS policies filtering on `current_setting('app.org_id')`), are not enforced by PGlite. RLS testing requires a real PostgreSQL instance. Developers must not rely on PGlite for tenant isolation validation.
- **Extension limitations**: PGlite does not support PostgreSQL extensions (e.g., `pg_trgm` for trigram search, `pgcrypto` for server-side hashing). Any feature depending on extensions must be tested against production PostgreSQL.
- **Data volatility**: In-memory fixture data resets on page reload (frontend) and process restart (backend with PGlite). Developers testing multi-step workflows (e.g., create estimate, approve, convert to invoice, record payment) may need to repeat setup steps after restarts. PGlite's optional filesystem persistence mitigates this partially but is not enabled by default.
- **Behavioral divergence risk**: Subtle differences between PGlite and production PostgreSQL (e.g., collation handling, JSONB operator support, transaction isolation edge cases) could allow bugs to pass local testing. The CI pipeline should run integration tests against a real PostgreSQL instance to catch these.
- **Mock data maintenance**: The 46 collection keys in `mockRepository` must stay synchronized with the `CollectionDef` registry on the backend (also 46 entries). Adding a new collection requires updating both the server's `collections.ts` and the frontend's `tables.ts` and `endpoints.ts`.

### Neutral

- **Two seam points**: The system has two independent switching mechanisms — `VITE_API_URL` on the frontend and `DATABASE_URL` on the backend. This is an intentional design: the frontend can run mock mode while the backend runs PGlite, or the frontend can connect to a backend running against production PostgreSQL. The combinations are all valid and tested.
- **Fixture data generation**: The `npm run port-design` script regenerates fixture data from the design bundle (`project/gms-data.js`). Changes to the design bundle propagate to mock data automatically. This is neither an advantage nor a cost — it is the standard development workflow.

## Alternatives Considered

### SQLite via better-sqlite3 or sql.js

SQLite was considered as a lightweight embedded database. It was rejected because:

- **Different SQL dialect**: SQLite uses a different SQL grammar from PostgreSQL. Column types, date functions, string operations, and constraint syntax differ. Queries validated against SQLite might fail against PostgreSQL. PGlite executes the same PostgreSQL SQL dialect as production.
- **No Drizzle PostgreSQL driver compatibility**: The Drizzle ORM schema definitions use PostgreSQL-specific types (`bigint`, `varchar`, `timestamptz`, `jsonb`). SQLite would require a separate schema definition or a translation layer, negating the "same schema, same queries" benefit.
- **No RLS support**: SQLite has no row-level security mechanism. While PGlite also does not enforce RLS in the development configuration, it at least supports the SQL syntax for `SET LOCAL` session variables, allowing query code to be validated syntactically.

### Docker Compose with PostgreSQL

Running PostgreSQL in a Docker container was considered. It was rejected because:

- **Violates zero-install goal**: Docker requires installation, adds ~2GB of disk for the PostgreSQL image, and is not available in all development environments (corporate laptops with restricted Docker access, Windows Home without WSL2, cloud-based development environments with limited container support).
- **Slower startup**: A Docker PostgreSQL container takes 3-10 seconds to reach readiness, plus migration and seed time. PGlite starts in milliseconds.
- **Configuration complexity**: Docker Compose files, volume mounts for data persistence, port mapping, environment variable coordination between containers — all add configuration surface that is unnecessary for frontend development.
- **Not offline-capable**: Docker image pulls require network access. A developer without internet cannot provision a fresh PostgreSQL container.

### Pure In-Memory Mock (No SQL Engine)

Using plain JavaScript objects and arrays as the data store (no SQL engine at all) was considered. The frontend's `mockRepository` partially follows this approach for fixture data. It was rejected as the sole strategy because:

- **No SQL validation**: Queries written in Drizzle ORM syntax would not be validated at all during local development. A malformed query would only fail when deployed against PostgreSQL, creating a late feedback loop.
- **No constraint checking**: Foreign key constraints, unique constraints (`(org_id, code)` patterns across 15+ tables), and check constraints would not be enforced. Data integrity bugs would surface only in integration testing.
- **No transaction behavior**: The backend's `withTenant()` transaction wrapper and optimistic concurrency (`WHERE version = :expected`) patterns require a real transactional database to test correctly.
- **No migration testing**: The `drizzle-kit generate` and `drizzle-kit migrate` workflow produces SQL migration files that must execute against a real PostgreSQL-compatible engine. Pure mocks cannot validate migration correctness.

### Managed Cloud Development Database (e.g., Neon, Supabase)

Using a managed PostgreSQL service (Neon serverless PostgreSQL, Supabase) for development was considered:

- **Requires network access**: Violates the offline development requirement. A developer without internet cannot run the application.
- **Per-developer provisioning**: Each developer needs their own database instance to avoid data conflicts. This introduces infrastructure management overhead and recurring costs.
- **Latency**: Network round-trips to a remote database add latency to every query during development. PGlite responds in microseconds; a remote database adds 20-100ms per query depending on geography.
- **Credential management**: Each developer needs database credentials, connection strings, and potentially VPN access. PGlite requires no credentials.
- **Not suitable for demos**: A sales demo at a conference with unreliable WiFi would fail if the application depends on a remote database.

## References

- [Development Guide](../../development.md)
- [Frontend Architecture (SYS-ARCH-001)](../architecture/frontend-architecture.md) -- Section 2.4 (RepositoryProvider)
- [Backend Architecture (SYS-ARCH-002)](../architecture/backend-architecture.md) -- Section 8 (Tenant Isolation)
- [Data Flow (SYS-ARCH-004)](../architecture/data-flow.md) -- Section 2 (Repository Seam Pattern)
- [Database Design (SYS-ARCH-003)](../architecture/database-design.md)
- [PGlite Project](https://pglite.dev)
