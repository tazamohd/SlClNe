# SALIS AUTO -- Database Failover

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-RUN-001                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## Trigger Conditions

Execute this runbook when any of the following conditions are observed:

1. **Primary database unresponsive** -- `pg_isready` returns non-zero for more than 60 seconds
2. **Replication lag exceeds 30 seconds** -- monitored via `pg_stat_replication` on the primary or provider metrics dashboard
3. **Health check failures** -- the readiness probe (`GET /ready` executing `SELECT 1`) returns HTTP 503 for three consecutive checks
4. **Connection pool exhaustion** -- database connection pool utilization exceeds 95% and queries are timing out
5. **Automated alert** -- PagerDuty or UptimeRobot fires a database-down alert (P1 severity per [Incident Response Plan](../incident-response.md))

---

## Prerequisites

| Requirement                | Details                                                        |
|----------------------------|----------------------------------------------------------------|
| SSH access                 | Root or `postgres` user on primary and replica hosts           |
| PostgreSQL client tools    | `psql`, `pg_isready`, `pg_ctl` available on both hosts         |
| Replica in place           | A streaming replica built with `pg_basebackup`, WAL shipping confirmed healthy |
| Connection string registry | Access to environment variable configuration (hosting provider secrets manager) |
| Monitoring access          | Sentry, APM dashboard, and database provider metrics console   |
| Communication channel      | Slack #incidents access for real-time coordination             |
| On-call roster             | Current on-call engineer and DBA contact information           |
| Backup verification        | Latest `pg_dump` confirmed restorable (per [Backup and Recovery](../operations/backup-recovery.md)) |

---

## Procedure

### Phase 1: Verify Primary Failure

**Step 1.** Check primary database connectivity from the application host.

```bash
pg_isready -h PRIMARY_HOST -p 5432 -U salis_app
```

Expected output if the primary is down:

```
PRIMARY_HOST:5432 - no response
```

**Step 2.** Attempt a direct connection to rule out network issues.

```bash
psql "postgresql://salis_app@PRIMARY_HOST:5432/salis_production?sslmode=require" \
  -c "SELECT 1;"
```

If this times out or returns a connection error, proceed to Step 3.

**Step 3.** Check the primary host process status (if SSH access is available).

```bash
ssh PRIMARY_HOST "pg_ctl status -D /var/lib/postgresql/16/main"
```

**Step 4.** Verify this is not a transient issue. Wait 60 seconds and repeat Steps 1-2. If the primary remains unresponsive, proceed to Phase 2.

**Step 5.** Open an incident in Slack #incidents and classify as P1 per the [Incident Response Plan](../incident-response.md). Assign an Incident Commander (DBA for database issues).

### Phase 2: Assess Replica Health

**Step 6.** Verify the replica is running and accessible.

```bash
pg_isready -h REPLICA_HOST -p 5432 -U salis_app
```

**Step 7.** Check replication status on the replica.

```bash
psql "postgresql://salis_app@REPLICA_HOST:5432/salis_production?sslmode=require" \
  -c "SELECT pg_is_in_recovery(), pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn(), pg_last_xact_replay_timestamp();"
```

Record the `pg_last_xact_replay_timestamp()` value. This indicates the last transaction replicated. Any data after this timestamp may be lost (the RPO impact).

**Step 8.** Calculate approximate data loss window.

```bash
psql "postgresql://salis_app@REPLICA_HOST:5432/salis_production?sslmode=require" \
  -c "SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

Document the lag value. If lag exceeds the 1-hour RPO target, escalate to CTO immediately.

### Phase 3: Promote Replica

**Step 9.** Stop the application to prevent writes to the failed primary.

```bash
# If using container orchestration:
kubectl scale deployment salis-api --replicas=0

# If using process manager:
pm2 stop salis-api
```

**Step 10.** Promote the replica to primary.

```bash
# PostgreSQL 12+:
ssh REPLICA_HOST "pg_ctl promote -D /var/lib/postgresql/16/main"
```

Or via SQL if connected:

```sql
SELECT pg_promote(wait_seconds => 60);
```

**Step 11.** Verify promotion succeeded. The replica should no longer report recovery mode.

```bash
psql "postgresql://salis_app@REPLICA_HOST:5432/salis_production?sslmode=require" \
  -c "SELECT pg_is_in_recovery();"
```

Expected result: `f` (false). The server is now a read-write primary.

### Phase 4: Update Connection Strings

**Step 12.** Update the `DATABASE_URL` environment variable in the hosting provider's secrets manager to point to the new primary (REPLICA_HOST).

```
DATABASE_URL=postgresql://salis_app:PASSWORD@REPLICA_HOST:5432/salis_production?sslmode=require
```

**Step 13.** If a separate `DATABASE_ADMIN_URL` exists for migrations, update it as well.

**Step 14.** Restart the application with the new connection string.

```bash
# Container orchestration:
kubectl scale deployment salis-api --replicas=2

# Process manager:
pm2 restart salis-api
```

### Phase 5: Verify Data Integrity

**Step 15.** Run the readiness probe to confirm connectivity.

```bash
curl -s https://api.salisauto.com/ready | jq .
```

Expected: `{ "status": "ready" }`.

**Step 16.** Verify RLS policies are active on all 53 tenant tables.

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (SELECT unnest(ARRAY[
    'customers', 'vehicles', 'job_cards', 'invoices',
    'payments', 'estimates', 'parts', 'employees'
  ]));
```

All rows must show `rowsecurity = t`.

**Step 17.** Verify the audit log append-only trigger exists and is functional.

```sql
-- This should fail with a trigger error:
UPDATE audit_log SET action = 'test' WHERE id = 'nonexistent';
```

**Step 18.** Verify invoice hash chain integrity for each organization.

```sql
SELECT org_id, COUNT(*) AS issued_count,
       COUNT(hash_self) AS hashed_count,
       COUNT(hash_prev) AS chained_count
FROM invoices
WHERE issued_at IS NOT NULL
GROUP BY org_id;
```

`hashed_count` must equal `issued_count`. `chained_count` must equal `issued_count - 1` per org (first invoice has NULL `hash_prev`).

**Step 19.** Verify money column integrity -- no fractional values in halala columns.

```sql
SELECT COUNT(*) AS fractional_values
FROM invoices
WHERE total_halalas != FLOOR(total_halalas)
   OR tax_halalas != FLOOR(tax_halalas)
   OR subtotal_halalas != FLOOR(subtotal_halalas);
```

Expected: `0`.

### Phase 6: Notify Stakeholders

**Step 20.** Post an update to Slack #incidents with:
- Time of failure detection
- Duration of outage
- Data loss window (from Step 8)
- Current system status

**Step 21.** Send notification to PM for customer communication per the [Communication Plan](../incident-response.md#8-communication-plan).

**Step 22.** Update the status page to reflect service restoration.

---

## Verification

Confirm all of the following before closing the incident:

| Check                              | Command / Method                              | Expected Result           |
|------------------------------------|-----------------------------------------------|---------------------------|
| Application health                 | `GET /health`                                 | `{ "status": "ok" }`     |
| Database readiness                 | `GET /ready`                                  | `{ "status": "ready" }`  |
| API response time                  | APM dashboard p95 latency                     | < 500ms                   |
| Error rate                         | Sentry error count                            | < 0.1%                    |
| RLS policies active               | `pg_tables.rowsecurity` check                 | All `true`                |
| Audit log immutability             | UPDATE attempt on `audit_log`                 | Trigger error             |
| ZATCA invoice hash chain           | Hash chain count query                        | No gaps                   |
| Login flow functional              | Manual test (EN + AR)                         | Successful login          |
| Invoice issuance functional        | Issue a test invoice on staging               | QR code + hash generated  |
| New replica provisioning started   | `pg_basebackup` initiated against new primary | Streaming replication     |

---

## Rollback

If the promoted replica exhibits data corruption or application errors:

1. **Stop the application** immediately to prevent further writes to the corrupted instance.
2. **Provision a new PostgreSQL instance** from the most recent verified backup (`pg_dump` or WAL archive).
3. **Apply pending migrations** from `server/drizzle/` if the backup predates recent schema changes.
4. **Update `DATABASE_URL`** to point to the restored instance.
5. **Restart the application** and run the full verification checklist above.
6. **Assess data loss** by comparing the restored instance timestamp against the last known good transaction.

If the original primary recovers:

1. **Do not reconnect the application** to the old primary. It may have diverged.
2. **Demote the old primary** by stopping PostgreSQL on it.
3. **Rebuild it as a replica** of the new primary using `pg_basebackup`.
4. **Verify replication** is streaming correctly before decommissioning any intermediate instances.

---

## Escalation

| Condition                                      | Escalate To              | Method          | Timeframe     |
|------------------------------------------------|--------------------------|-----------------|---------------|
| Primary down confirmed                         | On-call DBA              | PagerDuty       | Immediate     |
| Replication lag > 1 hour (RPO breach)           | CTO                      | Phone call      | Immediate     |
| Promotion fails                                | Cloud provider support   | Support ticket  | Within 15 min |
| Data integrity check fails after promotion      | Team Lead + CTO          | Slack + phone   | Immediate     |
| Application errors after failover              | On-call backend engineer | PagerDuty       | Within 5 min  |
| ZATCA hash chain broken                        | Sr. Backend Dev 2 (ZATCA)| Slack + phone   | Within 15 min |
| Outage duration exceeds 4-hour RTO target       | CTO + Steering Committee | Email + phone   | Immediate     |

---

## Related Documents

- [Backup and Recovery](../operations/backup-recovery.md)
- [DevOps Guide](../operations/devops-guide.md)
- [Incident Response Plan](../incident-response.md)
- [Operations Management Plan](../../management/operations-management-plan.md)
- [Deployment Rollback](./deployment-rollback.md)
