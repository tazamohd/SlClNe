# SALIS AUTO — ADR-004: Drizzle ORM over Prisma and TypeORM

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-004                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal — Confidential      |

## Status

Accepted

## Context

The SALIS AUTO backend requires a type-safe database access layer for PostgreSQL that meets several non-negotiable requirements:

1. **Multi-tenant query scoping**: Every tenant-owned table (53 tables with RLS policies) includes `org_id` and `branch_id` columns. The ORM must support composable query builders that inject tenant scoping predicates (`WHERE org_id = :orgId`) reliably across all queries, without relying on developers remembering to add the clause manually. The `withTenant()` transaction wrapper sets PostgreSQL session variables (`SET LOCAL app.org_id = :orgId`) that RLS policies read, but application-level query builders should also scope by `org_id` as a defense-in-depth measure.

2. **Schema-as-code**: The database schema spanning 50+ tables across 13 business domains must be defined in TypeScript, version-controlled alongside application code, and used to generate migration files. The schema definition must serve as the single source of truth for both database structure and TypeScript types.

3. **Complex join performance**: The application performs multi-table joins for business operations — invoices with invoice lines and payments, estimates with estimate lines, purchase orders with PO lines, job cards with assigned technicians and linked vehicles. The ORM must produce efficient SQL without N+1 query patterns or excessive abstraction overhead.

4. **PostgreSQL-specific features**: The schema uses PostgreSQL-specific types and features extensively: `bigint` for monetary values stored as integer halalas, `timestamptz` for all timestamps, `varchar(26)` for ULID primary keys, `jsonb` for flexible data (saved report definitions, campaign rules), row-level security policies, and session-local variables (`SET LOCAL`). The ORM must support these natively, not through escape hatches.

5. **Lightweight runtime**: The backend runs as a Fastify application on standard Node.js hosting. The ORM's runtime footprint should be minimal — no binary engine, no code generation step in the deployment pipeline, no query planning daemon.

6. **Migration workflow**: The development guide specifies `drizzle-kit generate` to create migration files and `drizzle-kit migrate` to apply them. The migration tooling must produce readable, reviewable SQL files that can be checked into version control.

## Decision

Adopt Drizzle ORM 0.36 with drizzle-kit as the database access and migration layer for the SALIS AUTO backend.

### Schema Definition

All tables are defined in TypeScript using Drizzle's `pgTable()` builder in `server/src/db/schema.ts`. The universal column pattern is implemented as a reusable spread object (`tenant`) that provides the standard columns shared across all tenant-owned tables:

| Column       | Drizzle Type                  | Purpose                              |
|--------------|-------------------------------|--------------------------------------|
| `id`         | `varchar(26).primaryKey()`    | ULID primary key                     |
| `org_id`     | `varchar(26).notNull()`       | Tenant identifier (FK to organizations) |
| `branch_id`  | `varchar(26)`                 | Branch within tenant                 |
| `created_at` | `timestamp({ withTimezone: true }).notNull()` | Row creation time     |
| `updated_at` | `timestamp({ withTimezone: true }).notNull()` | Last modification time |
| `created_by` | `varchar(26)`                 | Creating user                        |
| `updated_by` | `varchar(26)`                 | Last modifying user                  |
| `deleted_at` | `timestamp({ withTimezone: true })` | Soft-delete marker              |
| `version`    | `integer().notNull().default(1)` | Optimistic concurrency counter    |

Monetary columns use a `money(name)` helper that wraps `bigint(name, { mode: 'number' })`, ensuring all monetary values are stored as integer halalas (1 SAR = 100 halalas) with consistent bigint handling.

### Relation Declarations

Drizzle `relations()` declarations define the entity graph:

- `organizations` -> many `branches`, many `users`
- `invoices` -> many `invoice_lines`, many `payments`
- `estimates` -> many `estimate_lines`
- `requisitions` -> many `requisition_lines`
- `purchase_orders` -> many `purchase_order_lines`
- `customers` -> many `vehicles`
- `payroll_runs` -> many `payroll_lines`

These declarations enable typed eager loading and join queries without manual SQL JOIN clauses, while producing the same efficient SQL that a hand-written query would generate.

### Query Builders and Tenant Scoping

The `CollectionDef` registry references Drizzle schema table objects directly. The `listRows()` query builder composes search, sort, filter, and pagination predicates on top of the table reference:

- **Search**: `ILIKE` predicates across declared `search` columns, composed with `OR`
- **Sort**: Validated against `sortable` columns; unknown keys return 400
- **Filter**: Equality predicates on `filterable` columns; unknown keys return 400
- **Pagination**: `LIMIT`/`OFFSET` with a total count query, max 200 rows per page
- **Soft deletes**: `WHERE deleted_at IS NULL` by default; `includeDeleted=true` requires `d` permission

The `withTenant()` wrapper opens a PostgreSQL transaction and sets session variables via `SET LOCAL`:

```sql
SET LOCAL app.org_id    = :orgId;
SET LOCAL app.branch_id = :branchId;
SET LOCAL app.user_id   = :userId;
SET LOCAL app.scope     = :scope;
```

This activates RLS policies defined on all 53 tenant-owned tables in the `TENANT_TABLES` array. The `OWNED_TABLES` subset applies additional narrowing under `own`/`assigned`/`self` scopes (e.g., technicians see only their assigned job cards via `assigned_tech_id`).

### Migration Workflow

```bash
cd server
npm run db:generate   # drizzle-kit generate -- reads schema.ts, produces SQL migration files
npm run db:migrate    # drizzle-kit migrate -- applies pending migrations to the database
```

Migration files are SQL, checked into version control, and reviewable in pull requests. Drizzle-kit compares the current schema definition against the database state and generates only the necessary `ALTER TABLE` statements.

### PGlite Compatibility

Drizzle ORM 0.36 connects to PGlite through its PostgreSQL-compatible driver interface. When `DATABASE_URL` is not set, the server instantiates PGlite and passes the connection to Drizzle. The same schema definitions, query builders, and migration logic work against both PGlite (local development) and production PostgreSQL.

## Consequences

### Positive

- **SQL-like query API**: Drizzle's query builder maps directly to SQL constructs. Developers writing `db.select().from(invoices).where(eq(invoices.orgId, orgId))` produce predictable SQL without abstraction leaks. There is no query translation layer that generates surprising SQL — what you write is close to what executes.
- **TypeScript-first schema**: Table definitions in `pgTable()` produce TypeScript types automatically. Column types, nullability, and default values are inferred at the type level. The `CollectionDef` registry and route handlers benefit from full type inference without a separate code generation step.
- **No binary runtime**: Drizzle ORM is a pure JavaScript/TypeScript library. There is no query engine binary to bundle (~15MB for Prisma Client), no native addon to compile, and no platform-specific build step. The deployment artifact is standard Node.js code.
- **Composable query builders**: The `listRows()` function composes search, sort, filter, and pagination predicates dynamically. Each predicate is a Drizzle `where` clause composed with `and()`/`or()`. This composability is essential for the `CollectionDef` pattern where 46 collections share the same query pipeline with different column configurations.
- **PostgreSQL-native types**: `bigint`, `timestamptz`, `varchar`, `jsonb`, `integer` — Drizzle maps these directly to PostgreSQL types without translation. The `money()` helper produces `bigint` columns with `{ mode: 'number' }` for JavaScript-side integer arithmetic, preventing floating-point errors on monetary calculations.
- **Lightweight migrations**: `drizzle-kit generate` produces readable SQL migration files. `drizzle-kit migrate` applies them. The tooling is simple, the output is auditable, and migration files are standard SQL — a DBA can review them without understanding Drizzle-specific syntax.
- **Multi-tenant scoping via `SET LOCAL`**: Drizzle's transaction API supports raw SQL execution within a transaction context, enabling the `withTenant()` pattern of setting session-local variables for RLS. This is a standard PostgreSQL feature that Drizzle does not abstract away or interfere with.

### Negative

- **Steeper learning curve for SQL-unfamiliar developers**: Drizzle's query API is closer to raw SQL than Prisma's declarative API. Developers accustomed to Prisma's `findMany({ where: { ... }, include: { ... } })` syntax must learn Drizzle's `select().from().where().leftJoin()` pattern. This is a training investment, though it produces developers who understand the SQL their code generates.
- **Smaller community than Prisma**: As of 2026, Drizzle's community, while growing rapidly, is smaller than Prisma's. There are fewer Stack Overflow answers, fewer blog posts, and fewer third-party integrations. Debugging obscure issues may require reading Drizzle's source code directly.
- **Migration tooling maturity**: Drizzle-kit's migration generation is less battle-tested than Prisma Migrate for complex schema changes (e.g., renaming columns with data migration, splitting tables). Some migration scenarios require manual SQL amendments to the generated files.
- **No built-in database seeding**: Drizzle does not provide a built-in seed mechanism comparable to Prisma's `prisma db seed`. The SALIS AUTO backend implements seeding as custom TypeScript scripts that use Drizzle's insert API.
- **Relation API is query-time, not schema-enforced**: Drizzle's `relations()` declarations do not generate foreign key constraints at the database level — they are TypeScript-level metadata for typed joins. Foreign key constraints must be declared separately in the schema definition using `.references()`. This dual declaration (relation + reference) can be a source of inconsistency if one is updated without the other.

### Neutral

- **Drizzle Studio**: Drizzle provides a database GUI (Drizzle Studio) for browsing data during development. It is available but not required — developers can use any PostgreSQL client (`psql`, pgAdmin, DataGrip). Its availability does not influence the architectural decision.
- **Version pinning**: Drizzle ORM 0.36 is pinned in `package.json`. The ORM is under active development with frequent minor releases. Upgrades should be tested against the full test suite before deployment, as with any actively developed dependency.

## Alternatives Considered

### Prisma ORM

Prisma is the most widely adopted TypeScript ORM. It was evaluated extensively and rejected for the following reasons:

- **Heavy client binary**: Prisma Client requires a platform-specific query engine binary (~15MB) that must be generated (`prisma generate`) before each build and bundled with the deployment artifact. This binary adds to container image size, complicates multi-architecture builds (ARM vs x86), and introduces a non-trivial build step in the CI pipeline.
- **Schema DSL vs TypeScript**: Prisma defines the database schema in its own DSL (`schema.prisma`), not in TypeScript. This creates a boundary between the schema language and the application language. Drizzle's TypeScript schema definitions are importable, composable, and benefit from IDE tooling (autocompletion, rename refactoring, go-to-definition) without context switching to a different file format.
- **Less flexible raw SQL**: While Prisma supports `$queryRaw` and `$executeRaw`, these return untyped results. Drizzle's `sql` template tag produces typed results that integrate with the query builder's type inference. The `withTenant()` pattern of executing `SET LOCAL` within a transaction is more naturally expressed through Drizzle's transaction API.
- **Client generation step**: Every schema change requires `prisma generate` to update the TypeScript client. This code generation step adds friction to the development workflow and must be coordinated with schema changes in pull requests.
- **PGlite driver compatibility**: Prisma's query engine binary communicates with PostgreSQL through its own protocol layer. Connecting Prisma to PGlite for local development requires the `@prisma/adapter-pg` driver adapter, which adds configuration complexity. Drizzle connects to PGlite natively through its standard PostgreSQL driver interface.

### TypeORM

TypeORM was the first major TypeScript ORM and remains in use in many production codebases. It was rejected for the following reasons:

- **Decorator-based entity definition**: TypeORM uses TypeScript decorators (`@Entity()`, `@Column()`, `@ManyToOne()`) for schema definition. Decorators are a legacy pattern (TC39 Stage 3 decorators differ from TypeORM's experimental decorators), require `experimentalDecorators` in `tsconfig.json`, and interact poorly with modern TypeScript strict mode settings.
- **Weaker TypeScript inference**: TypeORM's query builder produces less precise TypeScript types than Drizzle's. Complex queries involving joins, aggregations, or subqueries often degrade to `any` types, losing the type safety that motivates using an ORM in the first place.
- **Performance overhead**: TypeORM's Active Record and Data Mapper patterns introduce per-entity object instantiation overhead. For list queries returning hundreds of rows (e.g., the 200-row page size used by `listRows()`), this overhead accumulates. Drizzle returns plain objects without entity hydration.
- **Maintenance trajectory**: TypeORM's release cadence has slowed relative to Drizzle and Prisma. Critical issues and pull requests remain open for extended periods. For a greenfield project with a multi-year horizon, selecting an actively maintained ORM reduces long-term maintenance risk.
- **Migration reliability**: TypeORM's `synchronize` option (auto-applying schema changes) is known to cause data loss in production. While this can be disabled, TypeORM's migration generation has produced incorrect SQL for complex schema changes in documented cases.

### Kysely (Query Builder Only)

Kysely is a type-safe SQL query builder for TypeScript — not a full ORM. It was considered as a lightweight alternative:

- **No schema definition**: Kysely does not define database schema; it requires a separate type definition that mirrors the database structure. This creates a synchronization burden between the database and the TypeScript types. Drizzle serves as both schema definition (source of truth for migrations) and type generator.
- **No migration tooling**: Kysely does not provide migration generation. A separate tool would be needed, adding another dependency and workflow step.
- **Appropriate for query-only use cases**: Kysely is well-suited for applications that manage schema separately and need only a type-safe query builder. SALIS AUTO requires an integrated schema + query + migration solution, which Drizzle provides as a single package.

## References

- [Backend Architecture (SYS-ARCH-002)](../architecture/backend-architecture.md) -- Section 4 (Collection Engine), Section 5 (Query Layer), Section 8 (Tenant Isolation)
- [Database Design (SYS-ARCH-003)](../architecture/database-design.md) -- Sections 2-7 (Schema Design)
- [Data Flow (SYS-ARCH-004)](../architecture/data-flow.md) -- Section 5 (Backend Data Flow)
- [Development Guide](../../development.md) -- Scripts: `db:generate`, `db:migrate`
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
