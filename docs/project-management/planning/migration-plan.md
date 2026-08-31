# SALIS AUTO -- Migration Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the data migration strategy for the SALIS AUTO platform, covering the PGlite-to-PostgreSQL migration path, Drizzle ORM schema migration management, schema versioning practices, and the data migration procedures for tenant onboarding and production cutover.

---

## 2. Migration Contexts

SALIS AUTO has three distinct migration contexts:

| Context                       | Description                                                |
|-------------------------------|------------------------------------------------------------|
| **Dev-to-Prod**               | PGlite (local dev) schema parity with PostgreSQL (prod)    |
| **Schema Evolution**          | Ongoing schema changes managed by Drizzle ORM migrations   |
| **Tenant Onboarding**         | Seeding a new tenant (org + branches) with initial data    |

---

## 3. PGlite to PostgreSQL Migration

### 3.1 Architecture

```
Development                    Production
+-----------+                  +----------------+
|  PGlite   |  -- schema -->  |  PostgreSQL    |
|  (local)  |     parity      |  (managed)     |
+-----------+                  +----------------+
     |                                |
     +--- Drizzle ORM schema --------+
          (single source of truth)
```

PGlite provides a PostgreSQL-compatible SQL engine for local development. The Drizzle ORM schema definitions serve as the single source of truth for both environments.

### 3.2 Schema Parity Strategy

| Principle                                   | Implementation                                    |
|---------------------------------------------|---------------------------------------------------|
| Single schema definition                    | Drizzle schema files in `src/db/schema/`          |
| Same migration files run on both engines    | Drizzle Kit generates SQL compatible with both    |
| Test migrations against both engines         | CI runs migrations on PGlite; staging on PostgreSQL|
| No PGlite-specific SQL                       | Avoid features not supported by PGlite            |

### 3.3 Known PGlite Limitations

| PostgreSQL Feature          | PGlite Support | Mitigation                                   |
|-----------------------------|----------------|----------------------------------------------|
| Row-Level Security (RLS)    | Limited        | RLS tested on PostgreSQL in staging only      |
| Full-text search (tsvector) | Limited        | Use LIKE/ILIKE in dev; GIN indexes in prod    |
| Extensions (pgcrypto, etc.) | Limited        | Wrap extension calls in adapter functions     |
| Connection pooling          | N/A (embedded) | PgBouncer config tested in staging only       |
| Concurrent writes           | Limited        | Dev is single-user; load tests on PostgreSQL  |

### 3.4 Pre-Production Migration Checklist

| Step | Activity                                        | Verification                              |
|------|-------------------------------------------------|-------------------------------------------|
| 1    | Export PGlite schema to SQL DDL                 | Compare with PostgreSQL DDL               |
| 2    | Run all Drizzle migrations on fresh PostgreSQL  | All migrations apply cleanly              |
| 3    | Seed production data (see Section 6)            | Seed data matches expected counts         |
| 4    | Run integration tests against PostgreSQL        | All tests pass                            |
| 5    | Enable RLS policies                             | Tenant isolation verified                 |
| 6    | Run performance benchmarks                      | Query times within tolerance              |
| 7    | Validate ZATCA invoice data integrity           | Hash chain recalculated and verified      |

---

## 4. Drizzle ORM Migration Management

### 4.1 Migration Directory Structure

```
drizzle/
  migrations/
    0000_initial_schema.sql
    0001_add_users_table.sql
    0002_add_jobs_table.sql
    0003_add_invoices_table.sql
    ...
    meta/
      _journal.json              # Migration journal (auto-generated)
      0000_snapshot.json
      0001_snapshot.json
      ...
```

### 4.2 Migration Workflow

```
1. Modify Drizzle schema file (src/db/schema/*.ts)
2. Generate migration:  npx drizzle-kit generate
3. Review generated SQL in drizzle/migrations/
4. Test migration:      npx drizzle-kit migrate (local PGlite)
5. Commit schema + migration files together
6. CI validates migration on clean PGlite instance
7. Staging deployment runs migration on PostgreSQL
8. Production deployment runs migration with backup
```

### 4.3 Migration Naming Convention

```
NNNN_description.sql
```

- `NNNN`: 4-digit sequential number (auto-generated by Drizzle Kit).
- `description`: Brief snake_case description of the change.

### 4.4 Migration Rules

| Rule                                              | Rationale                                   |
|---------------------------------------------------|---------------------------------------------|
| Never modify a committed migration file           | Breaks migration journal integrity          |
| Always generate new migration for schema changes  | Maintains audit trail                       |
| Include both up and down (when possible)          | Enables rollback                            |
| Test migration on empty database and populated DB | Catches data-dependent issues               |
| Migration must be idempotent                      | Safe to re-run if interrupted               |
| No data manipulation in schema migrations         | Data migrations are separate scripts        |

---

## 5. Schema Versioning

### 5.1 Schema Version Tracking

| Method                    | Location                           |
|---------------------------|------------------------------------|
| Drizzle migration journal | `drizzle/migrations/meta/_journal.json` |
| Application version       | `package.json` version             |
| Database version table    | `schema_version` table in PostgreSQL |

### 5.2 Schema Version Table

```sql
CREATE TABLE schema_version (
  id          SERIAL PRIMARY KEY,
  version     VARCHAR(20) NOT NULL,
  applied_at  TIMESTAMP DEFAULT NOW(),
  description TEXT,
  checksum    VARCHAR(64) NOT NULL    -- SHA-256 of migration file
);
```

### 5.3 Version Compatibility Matrix

| App Version | Schema Version | Backward Compatible | Notes                     |
|-------------|----------------|---------------------|---------------------------|
| 0.1.x       | 0001--0010     | Yes                 | Foundation tables         |
| 0.2.x--0.6.x| 0011--0040    | Yes                 | Core domain tables        |
| 0.7.x       | 0041--0060     | Yes                 | Extended domain tables    |
| 0.8.x       | 0061--0070     | Yes                 | Integration additions     |
| 1.0.0       | 0071+          | N/A (first release) | Full production schema    |

---

## 6. Tenant Onboarding Data Seeding

### 6.1 Three Onboarding Paths

| Path          | Description                                      | Data Seeded                              |
|---------------|--------------------------------------------------|------------------------------------------|
| Fresh tenant  | New workshop signs up                             | Org, default branch, admin user, defaults|
| Branch add    | Existing org adds a new branch                   | Branch record, branch-level defaults     |
| Demo tenant   | Pre-populated demo environment                    | Full sample data across all domains      |

### 6.2 Seed Data: Fresh Tenant

| Table / Entity          | Records Created                                   |
|-------------------------|---------------------------------------------------|
| `organizations`         | 1 record (org_id, name, ZATCA config)             |
| `branches`              | 1 default branch                                  |
| `users`                 | 1 Owner/CEO user (initial admin)                  |
| `roles`                 | 14 role definitions (copied from template)        |
| `permissions`           | 28 module permission mappings                     |
| `chart_of_accounts`     | Saudi-standard CoA (pre-configured)               |
| `system_settings`       | Business hours, VAT rate (15%), currency (SAR)    |
| `service_types`         | Default service categories (maintenance, repair, body, electrical, AC) |
| `approval_limits`       | 7 tier limits (5K, 10K, 15K, 20K, 25K, 50K, unlimited) |

### 6.3 Seed Data: Demo Tenant

| Table / Entity          | Records Created                                   |
|-------------------------|---------------------------------------------------|
| All fresh tenant data   | (as above)                                        |
| `customers`             | 20 sample customers with +966 phones              |
| `vehicles`              | 30 sample vehicles with Saudi plates              |
| `jobs`                  | 10 jobs in various lifecycle states                |
| `invoices`              | 5 sample invoices (ZATCA sandbox format)           |
| `parts`                 | 50 sample parts with stock levels                  |
| `purchase_orders`       | 3 POs in various approval states                   |
| `employees`             | 15 employees across 2 branches                     |

---

## 7. Production Cutover Procedure

### 7.1 Pre-Cutover (T-7 days)

| Step | Activity                                              | Owner    |
|------|-------------------------------------------------------|----------|
| 1    | Full database backup of staging                       | DBA      |
| 2    | Dry run: run all migrations on staging backup         | DBA      |
| 3    | Verify data integrity post-migration (checksums)      | DBA      |
| 4    | Rehearse cutover steps on staging                      | DevOps   |
| 5    | Document rollback procedure                           | DevOps   |

### 7.2 Pre-Cutover (T-1 day)

| Step | Activity                                              | Owner    |
|------|-------------------------------------------------------|----------|
| 1    | Final staging rehearsal with production-like data      | DBA      |
| 2    | Confirm rollback script works                         | DevOps   |
| 3    | Notify all stakeholders of maintenance window         | PM       |
| 4    | Prepare monitoring dashboard for cutover              | DevOps   |

### 7.3 Cutover (T-0)

| Step | Time     | Activity                                        | Owner    | Rollback Point |
|------|----------|-------------------------------------------------|----------|----------------|
| 1    | T+0 min  | Enable maintenance mode                         | DevOps   | --             |
| 2    | T+5 min  | Take full database backup                       | DBA      | Restore backup |
| 3    | T+15 min | Run all Drizzle migrations                      | DBA      | Restore backup |
| 4    | T+25 min | Verify migration: table counts, checksums       | DBA      | Restore backup |
| 5    | T+30 min | Enable RLS policies                             | DBA      | Disable RLS    |
| 6    | T+35 min | Verify tenant isolation with test queries        | DBA      | Disable RLS    |
| 7    | T+40 min | Deploy backend API                               | DevOps   | Revert deploy  |
| 8    | T+45 min | Verify API health check                          | DevOps   | Revert deploy  |
| 9    | T+50 min | Deploy frontend SPA                              | DevOps   | Revert deploy  |
| 10   | T+55 min | Smoke tests (login, job create, invoice)         | QA       | Full rollback  |
| 11   | T+60 min | Disable maintenance mode                         | DevOps   | --             |
| 12   | T+65 min | ZATCA production clearance test                  | Finance  | --             |
| 13   | T+90 min | Go/No-Go decision                                | PM       | Full rollback  |

### 7.4 Post-Cutover Verification

| Check                                   | Expected Result                       | Owner    |
|-----------------------------------------|---------------------------------------|----------|
| Row counts match pre-migration counts   | Within expected delta                 | DBA      |
| ZATCA invoice hash chain intact          | Chain validates from first to last    | Finance  |
| All 14 role logins succeed               | Dashboard loads per role              | QA       |
| Cross-tenant access blocked              | 403 on cross-org/branch queries       | Security |
| Financial data checksums match           | Zero discrepancy                      | DBA      |

---

## 8. Rollback Procedures

### 8.1 Schema Rollback

```bash
# Rollback last migration (if Drizzle supports down migration)
npx drizzle-kit rollback

# Manual rollback: restore from backup
pg_restore -d salisauto_prod backup_pre_migration.dump
```

### 8.2 Full Rollback Decision Tree

```
Migration failed?
  -> Yes -> Restore database backup
            Revert API deployment
            Revert frontend deployment
            Disable maintenance mode
            Notify stakeholders
  -> No  -> Smoke tests pass?
              -> Yes -> Continue to go-live
              -> No  -> Assess severity
                          -> P1 -> Full rollback
                          -> P2 -> Hotfix attempt (30 min window)
                                    -> Fixed -> Continue
                                    -> Not fixed -> Full rollback
```

---

## 9. Data Integrity Validation

### 9.1 Validation Checks

| Check                              | Method                                     |
|------------------------------------|--------------------------------------------|
| Table row counts                   | `SELECT COUNT(*) FROM <table>`             |
| Financial data checksums           | `SELECT SUM(amount_halalas) FROM invoices` |
| Hash chain integrity               | Recalculate hash chain and compare         |
| Foreign key consistency            | `SELECT * FROM ... WHERE FK NOT IN ...`    |
| Orphaned records                   | Check for records without parent            |
| Duplicate detection                | Unique constraint verification              |
| Encoding verification              | Arabic text round-trip test                 |

### 9.2 Automated Validation Script

A migration validation script runs automatically post-migration:

```
1. Count rows in all tables -> compare with pre-migration snapshot
2. Sum all financial columns -> compare with pre-migration totals
3. Verify ZATCA hash chain -> recalculate and compare
4. Test Arabic text storage -> insert/read/compare
5. Verify RLS policies -> run cross-tenant query (expect 0 rows)
6. Generate validation report
```

---

## 10. References

- [Deployment Plan](deployment-plan.md)
- [Capacity Rollback Plan](capacity-rollback-plan.md)
- [Risk Register](../pmp/risk-register.md) (R-T02, R-D02)
- [Stage Plans](../prince2/stage-plans.md)
- [Test Plan](test-plan.md)
