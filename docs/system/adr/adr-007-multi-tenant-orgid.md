# SALIS AUTO -- ADR-007: Multi-Tenancy via org_id with Row-Level Security

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-ADR-007                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Accepted                     |
| Classification | Internal -- Confidential     |

## Status

Accepted

## Context

SALIS AUTO serves multiple automotive workshops (organizations) on a shared platform.
Each organization operates independently with its own employees, customers, vehicles,
job cards, invoices, inventory, accounting records, and HR data. Some organizations
have multiple branches. The platform must guarantee strict data isolation between
tenants while remaining operationally efficient at scale.

Key requirements driving the multi-tenancy design:

1. **Regulatory compliance**: Saudi Personal Data Protection Law (PDPL) and ZATCA
   e-invoicing regulations require that one organization's financial and personal
   data cannot be accessed by another organization under any circumstance --
   including application bugs, misrouted queries, or compromised accounts.
2. **Scalability**: The platform must support hundreds of organizations without
   proportional infrastructure costs. Schema-per-tenant or database-per-tenant
   models become operationally prohibitive at this scale.
3. **Shared reference data**: Platform-level tables (`garage_applications`,
   `supplier_applications`, `subscription_requests`, `support_tickets`) exist
   above tenancy for platform administration and must remain accessible across
   the control plane.
4. **Branch sub-scoping**: Within an organization, certain roles (branch manager,
   service advisor, technician, receptionist) should see only data from their
   assigned branch, not all branches in the organization.
5. **14-role RBAC with data scopes**: Roles define 6 distinct data scopes (`all`,
   `platform`, `branch`, `own`, `external`, `self`) that layer on top of tenant
   isolation (see [RBAC Definition](../../../app/src/data/generated/rbac.ts)).

The database schema defines 50+ tables across 13 business domains, with 53
tenant-owned tables carrying RLS policies
(see [Database Design](../architecture/database-design.md), Section 7).

## Decision

SALIS AUTO uses **shared-schema multi-tenancy** with an `org_id` column on every
tenant-scoped table, enforced at three layers: application middleware, ORM query
builder, and PostgreSQL Row-Level Security (RLS) policies.

### Universal Tenant Columns

Every tenant-owned table includes the following columns via the `tenant` spread
pattern in the Drizzle ORM schema:

| Column       | Type                   | Purpose                              |
|--------------|------------------------|--------------------------------------|
| `id`         | `varchar(26)` PK       | ULID primary key                     |
| `org_id`     | `varchar(26)` NOT NULL | Tenant identifier (FK to `organizations`) |
| `branch_id`  | `varchar(26)` nullable | Branch within the tenant             |
| `created_at` | `timestamptz` NOT NULL | Row creation timestamp               |
| `updated_at` | `timestamptz` NOT NULL | Last modification timestamp          |
| `created_by` | `varchar(26)` nullable | User who created the row             |
| `updated_by` | `varchar(26)` nullable | User who last modified the row       |
| `deleted_at` | `timestamptz` nullable | Soft-delete marker                   |
| `version`    | `integer` NOT NULL     | Optimistic concurrency counter       |

The `organizations` table itself sits above tenancy -- a row *is* the tenant --
and carries its own subset: `id`, `name`, `slug`, `cr_number`, `vat_number`,
`plan`, `status`, timestamps, and `version`.

### Triple-Layer Enforcement

#### Layer 1: Authentication Middleware

The `onRequest` hook extracts the JWT access token, verifies it using `jose`
(HS256, issuer `salis-auto`, audience `salis-auto-api`), and constructs a
`Principal` object containing `userId`, `orgId`, `branchId`, `role`, and `scope`.
The `scope` is derived from the role (not from the JWT claim) via
`principalFromClaims`, preventing privilege escalation through token manipulation.

#### Layer 2: ORM Query Builder (Drizzle)

Every database operation passes through `withTenant(db, principal, fn)`, which
sets PostgreSQL session variables before executing the query:

```sql
SET LOCAL app.org_id    = :orgId;
SET LOCAL app.branch_id = :branchId;
SET LOCAL app.user_id   = :userId;
SET LOCAL app.scope     = :scope;
```

Additionally, the query builder auto-appends `.where(eq(table.orgId, ctx.orgId))`
to all tenant-scoped queries, providing defense-in-depth at the application layer.

#### Layer 3: PostgreSQL Row-Level Security (RLS)

RLS policies are applied with `FORCE` on all 53 tenant-owned tables (listed in the
`TENANT_TABLES` array). The base policy filters on:

```sql
current_setting('app.org_id') = org_id
```

This is the last line of defense: even if a handler omits a `WHERE org_id = ...`
clause, or if a raw SQL query bypasses the ORM, the RLS policy prevents
cross-tenant data access at the database engine level.

#### Ownership Narrowing

Tables in the `OWNED_TABLES` set apply additional RLS narrowing under
`own`/`assigned`/`self` scopes:

| Table          | Ownership Column    | Scope Narrowing                      |
|----------------|---------------------|--------------------------------------|
| `job_cards`    | `assigned_tech_id`  | Technician sees only assigned jobs   |
| `appointments` | `technician_id`     | Technician sees own appointments     |
| `crm_tasks`    | `created_by`        | Agent sees own CRM tasks             |
| `user_sessions`| `user_id`           | User sees only own sessions          |

### 14 Roles with Data Scopes

The RBAC system defines 14 roles, each assigned a default data scope that
determines row visibility within the tenant:

| Scope      | Roles                                        | Visibility               |
|------------|----------------------------------------------|--------------------------|
| `all`      | owner, accountant, hr, callcenter, procurement | All data in the org     |
| `platform` | superadmin                                    | Cross-org platform data  |
| `branch`   | manager, advisor, qc, parts, frontdesk        | Own branch only          |
| `own`      | technician                                    | Own assigned records     |
| `external` | supplier                                      | Supplier-visible records |
| `self`     | customer                                      | Own customer records     |

These scopes are enforced at the RLS layer, not just the application layer.
A branch-scoped manager cannot see data from another branch even by crafting
direct SQL through a hypothetical injection vector.

### Cross-Tenant Behavior

| Operation       | Cross-Tenant Result                                 |
|-----------------|-----------------------------------------------------|
| Read by ID      | `404 Not Found` (never `403 Forbidden`)             |
| List            | Empty result set                                    |
| Update          | `404 Not Found` (row not visible to RLS)            |
| Delete          | `404 Not Found` (row not visible to RLS)            |

Cross-tenant access returns `404` rather than `403` to avoid confirming that a
record exists in another tenant. This is a deliberate information disclosure
prevention measure.

### Branch-Level Sub-Scoping

Within a tenant, the `branch_id` column enables fine-grained data partitioning.
Branch-scoped roles (manager, advisor, technician, QC inspector, receptionist)
see only rows matching their `branch_id`. Organization-scoped roles (owner,
accountant, HR) see all branches.

### Segregation of Duties

Tables carrying `submitted_by` and `approved_by` columns (`estimates`,
`requisitions`, `purchase_orders`, `insurance_claims`) enforce that the person
who creates a record cannot also approve it. This is enforced at the application
layer and audited via the append-only `audit_log` table.

## Consequences

### Positive

- **Defense-in-depth isolation**: Three independent layers must all fail
  simultaneously for a cross-tenant data leak to occur. A bug in any single layer
  is caught by the others.
- **Simple mental model**: Every table has `org_id`. Every query includes `org_id`.
  There are no exceptions to reason about.
- **Operational efficiency**: A single database, single schema, single connection
  pool serves all tenants. Migrations run once and apply to all tenants.
- **Shared reference data**: Platform-level tables (4 tables above tenancy) are
  naturally accessible without special tenant context.
- **Indexing efficiency**: Compound indexes on `(org_id, ...)` serve both tenant
  isolation and query performance simultaneously.
- **Cross-tenant analytics**: Platform administrators (superadmin role) can run
  aggregate queries across tenants for operational metrics without data export.

### Negative

- **Query discipline**: Forgetting `org_id` does not leak data (RLS prevents that)
  but produces confusing empty results during development.
- **RLS performance overhead**: ~2% query overhead from additional predicate
  evaluation, acceptable for the isolation guarantee.
- **Tenant data migration**: Moving a tenant requires careful export/import with
  `org_id` remapping, FK preservation, and ZATCA hash chain continuity.
- **Connection pooling**: All tenants share one pool; expensive tenant queries can
  affect others. Mitigated by query timeouts and connection limits.
- **Schema evolution**: Changes to the `tenant` spread affect all 53 tables.

### Neutral

- **Soft deletes interact with RLS**: The `deleted_at` column and RLS policies
  operate independently. A soft-deleted row is still tenant-isolated; the
  `?includeDeleted=true` parameter requires the `d` (delete) permission.
- **Optimistic concurrency**: The `version` column operates within the tenant
  boundary. Version conflicts are per-row, not cross-tenant.
- **Audit trail scoping**: The append-only `audit_log` table is tenant-scoped
  (`org_id`), so audit queries are naturally filtered to the requesting tenant.

## Alternatives Considered

### 1. Schema-Per-Tenant (PostgreSQL Schemas)

Each organization gets its own PostgreSQL schema within a shared database.

**Rejected because:**
- Schema explosion at scale: hundreds of organizations with 50+ tables each
  degrades PostgreSQL catalog performance.
- Migrations must apply to every tenant schema individually; a failure on one
  leaves the system inconsistent.
- Connection pooling across schemas is impractical (`search_path` binding).
- Cross-tenant queries for platform analytics require fragile UNION ALL.
- Drizzle ORM assumes a single schema; multi-schema support would need custom tooling.

### 2. Database-Per-Tenant

Each organization gets its own PostgreSQL database instance.

**Rejected because:**
- Operational overhead: independent backup, monitoring, and connection config per DB.
- Linear cost scaling -- database instances are the most expensive component.
- Platform-level tables must be duplicated or accessed via foreign data wrappers.
- Schema migrations must be coordinated across all instances.

### 3. Shared Schema Without RLS (Application-Only Enforcement)

Rely solely on middleware and ORM to append `WHERE org_id = ...` without
database-level RLS.

**Rejected because:**
- A single missed `WHERE` clause leaks data across tenants -- error-prone with
  50+ tables and dozens of query sites.
- Raw SQL, migrations, and maintenance scripts bypass the ORM entirely.
- PDPL and ZATCA require demonstrable isolation guarantees that application-layer-only
  enforcement cannot provide to auditors.
- RLS provides a provable database-engine-level guarantee regardless of application bugs.

## References

- [Database Design](../architecture/database-design.md) -- SYS-ARCH-003, Sections 2, 7
- [Auth Architecture](../architecture/auth-architecture.md) -- SYS-ARCH-005, Sections 4, 6
- [Data Protection](../security/data-protection.md) -- SYS-SEC-004, Section 7
- [RBAC Definition](../../../app/src/data/generated/rbac.ts) -- 14 roles, scopes, field rules
- PostgreSQL Row-Level Security documentation
- Saudi Personal Data Protection Law (PDPL)
- ZATCA Phase 2 E-Invoicing Technical Requirements
