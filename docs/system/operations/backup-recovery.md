# Backup and Recovery

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-OPS-003                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

This document describes the data protection strategy for SALIS AUTO, covering database backup procedures, disaster recovery planning, data export capabilities, and the architectural decisions that support recoverability.

## 2. Data Architecture for Recovery

### 2.1 Data Tiers

| Tier | Data                              | Loss Impact                       | Recovery Source          |
|------|-----------------------------------|-----------------------------------|--------------------------|
| 1    | PostgreSQL database (all tenants) | Total business data loss           | Database backups         |
| 2    | Audit log                         | Compliance and forensic trail lost | Database backups (same)  |
| 3    | Application configuration         | Environment variables, secrets     | Deployment configuration |
| 4    | Frontend static assets            | SPA unavailable                    | Git repository + rebuild |

### 2.2 Immutable Audit Trail

The audit log is append-only at the database level. A PostgreSQL trigger refuses UPDATE and DELETE operations, so even the application role cannot alter history. This means:

- Backups of the audit log are forensically reliable
- Point-in-time recovery preserves the exact audit state at the restore point
- No application-level backup of the audit trail is needed beyond the database backup

### 2.3 Soft Deletes

Records are never physically removed from the database. The `deleted_at` timestamp marks a record as deleted, but the row remains. This means:

- Accidental deletes are recoverable without restoring from backup
- The `restore` audit action documents when a soft-deleted record is brought back
- Physical deletion requires direct database access, which is a separate administrative action

## 3. Database Backup Strategy

### 3.1 PostgreSQL Backup Methods

| Method                   | RPO          | Use Case                         |
|--------------------------|--------------|----------------------------------|
| Continuous WAL archiving | Minutes      | Production point-in-time recovery |
| Scheduled `pg_dump`      | Hours        | Development and staging           |
| Logical replication      | Near-zero    | Cross-region standby              |

### 3.2 Recommended Backup Schedule

| Environment | Method          | Frequency      | Retention       |
|-------------|-----------------|----------------|-----------------|
| Production  | WAL archiving   | Continuous     | 30 days         |
| Production  | Full `pg_dump`  | Daily          | 90 days         |
| Staging     | Full `pg_dump`  | Weekly         | 14 days         |
| Development | PGlite (local)  | Not backed up  | Developer local  |

### 3.3 Multi-Tenant Considerations

All tenants share a single database with row-level security. Backups capture all tenants together. Per-tenant backup is not natively supported but can be achieved through:

1. Logical dump with `WHERE org_id = :id` filtering
2. CSV export via the `/export` endpoint (limited to 50,000 rows per collection)

### 3.4 Backup Verification

Backup integrity should be verified by:

1. Restoring to a test database on a regular schedule
2. Running the readiness probe (`GET /ready` -> `SELECT 1`) against the restored database
3. Verifying row counts across key tables match the source

## 4. Disaster Recovery

### 4.1 Recovery Objectives

| Metric | Target    | Rationale                                    |
|--------|-----------|----------------------------------------------|
| RPO    | < 1 hour  | WAL archiving captures changes continuously  |
| RTO    | < 4 hours | Database restore + migration + app startup   |

### 4.2 Recovery Procedures

#### Scenario 1: Database Corruption or Loss

1. Provision a new PostgreSQL instance
2. Restore from the most recent WAL archive or `pg_dump`
3. Apply any pending migrations from `server/drizzle/`
4. Verify with readiness probe
5. Update `DATABASE_URL` in application configuration
6. Restart application processes

#### Scenario 2: Application Process Failure

1. Container orchestrator detects liveness probe failure (`GET /health`)
2. Container is automatically restarted
3. No data loss (database is external)
4. Verify readiness probe passes after restart

#### Scenario 3: Region-Level Outage

1. Failover to standby region (if logical replication is configured)
2. Update DNS to point to the standby
3. Verify all health checks pass
4. Monitor for replication lag resolution

#### Scenario 4: Accidental Data Deletion

1. If soft-deleted: restore through the API (requires `d` permission)
2. If hard-deleted: restore from point-in-time backup
3. Audit log preserves the deletion event for forensic review

### 4.3 Data Integrity Invariants

The following invariants must hold after any recovery:

| Invariant                          | Verification                        |
|------------------------------------|-------------------------------------|
| Audit log is complete              | No gaps in ULID sequence per tenant |
| RLS policies are active            | `TENANT_TABLES` all have FORCE RLS  |
| Append-only trigger exists         | UPDATE/DELETE on audit_log fails    |
| Version counters are consistent    | No duplicate versions per record    |
| Money columns are integer halalas  | No fractional values in `*_halalas` |

## 5. Data Export for Recovery

### 5.1 CSV Export Endpoint

Every collection supports `GET /{path}/export` with the `x` (export) permission:

| Setting            | Value                              |
|--------------------|------------------------------------|
| Max rows           | 50,000 (`MAX_EXPORT_ROWS`)        |
| Page size          | 200 (`EXPORT_PAGE_SIZE`)          |
| Formula protection | Cells starting with `=+\-@\t\r` are prefixed with `'` |
| Truncation signal  | `X-Export-Truncated: true` header  |

### 5.2 Idempotency Key Retention

The `idempotency_keys` table stores request/response pairs. These are not needed for recovery but are useful for post-incident investigation to determine which requests were processed.

## 6. Secret Recovery

| Secret          | Recovery Method                           |
|-----------------|-------------------------------------------|
| `JWT_SECRET`    | Regenerate; all active sessions invalidated |
| `DATABASE_URL`  | Retrieve from deployment configuration     |
| User passwords  | bcrypt hashes; users must reset passwords   |
| Refresh tokens  | SHA-256 digests only; users must re-login   |
| OTP codes       | Hashed; expired within minutes              |

Rotating `JWT_SECRET` invalidates all outstanding access tokens (15-minute impact) and refresh tokens (30-day impact). Users must log in again.

## 7. Development Environment Recovery

The development environment uses PGlite, which stores data locally. Loss of the PGlite database is not a concern because:

1. Fixture data is generated from code (`app/src/data/generated/tables.ts`)
2. The seed process can recreate development data from scratch
3. No production data resides in the development environment

## 8. Compliance Considerations

### 8.1 Saudi Data Residency

Backups containing Saudi customer data should be stored within Saudi Arabia or in jurisdictions permitted by Saudi data protection regulations. The database contains PII (customer names, phone numbers, emails, VAT numbers) that is subject to these requirements.

### 8.2 Audit Log Retention

The audit log serves as the compliance record for all business mutations. Retention should align with:

- Saudi commercial law record-keeping requirements
- ZATCA e-invoicing audit requirements
- Internal policy on financial record retention

### 8.3 Backup Encryption

Database backups should be encrypted at rest and in transit. The `DATABASE_URL` connection should use TLS (`sslmode=require` or `verify-full`).

## Related Documents

- [DevOps Guide](./devops-guide.md)
- [Data Protection](../security/data-protection.md)
- [Database Design](../architecture/database-design.md)
- [Environment Setup](./environment-setup.md)
