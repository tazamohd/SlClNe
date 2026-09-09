# SALIS AUTO -- Performance Degradation Response

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-RUN-004                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## Trigger Conditions

Execute this runbook when any of the following thresholds are breached:

1. **API p95 response time > 500ms** -- APM dashboard alert (SLA target: p95 < 500ms, per [Operations Management Plan](../../management/operations-management-plan.md))
2. **Page load (LCP) > 5s** -- frontend performance monitoring alert (SLA target: p95 LCP < 2.5s)
3. **Error rate > 1%** -- Sentry alert on elevated 5xx responses
4. **Database query time p95 > 200ms** -- database monitoring alert
5. **Connection pool utilization > 80%** -- provider metrics dashboard
6. **ZATCA invoice submission time > 8s** -- ZATCA integration monitoring
7. **Search response time > 800ms** -- search performance monitoring
8. **Memory utilization > 80%** -- infrastructure monitoring alert
9. **CPU utilization > 70% sustained for 15 minutes** -- auto-scaling trigger threshold

---

## Prerequisites

| Requirement              | Details                                                      |
|--------------------------|--------------------------------------------------------------|
| APM access               | New Relic / Datadog dashboard for API latency and throughput |
| Database query logs       | PostgreSQL `pg_stat_statements` or slow query log enabled    |
| Application logs          | Pino structured JSON logs via cloud provider logging         |
| Sentry access             | Error tracking dashboard for stack traces                    |
| Database console           | Read-only production database access                         |
| Infrastructure metrics    | CPU, memory, disk, network dashboards                        |
| Rate limit configuration  | Access to `RATE_LIMIT_MAX` environment variable              |
| On-call roster            | Current on-call engineer contact                             |

---

## Procedure

### Phase 1: Identify the Bottleneck

**Step 1.** Determine the scope of the degradation. Check the APM dashboard for:
- Which API endpoints are slow?
- Is the degradation affecting all tenants or a specific `org_id`?
- When did the degradation start? Correlate with deployments or traffic changes.

**Step 2.** Classify the bottleneck layer.

```
Is the API itself slow (high server processing time)?
  Yes --> Check application layer (Phase 2A)
  No  --> Is the network latency high?
    Yes --> Check infrastructure / CDN / DNS
    No  --> Is the database slow?
      Yes --> Check database layer (Phase 2B)
      No  --> Check external dependencies (ZATCA, SMS, payment gateway)
```

**Step 3.** Check the application health and readiness probes.

```bash
# Liveness (does not touch DB)
curl -w "\nHTTP %{http_code} in %{time_total}s\n" https://api.salisauto.com/health

# Readiness (executes SELECT 1)
curl -w "\nHTTP %{http_code} in %{time_total}s\n" https://api.salisauto.com/ready
```

If `/health` responds but `/ready` returns 503 or is slow, the bottleneck is at the database layer.

### Phase 2A: Application Layer Investigation

**Step 4.** Check current memory and CPU utilization.

```bash
# If running on Kubernetes:
kubectl top pods -l app=salis-api

# If using process manager:
pm2 monit
```

**Step 5.** Review application logs for errors or warnings.

```bash
# Search for recent errors (last 15 minutes)
# Using cloud logging or local logs:
grep -E '"level":(50|40)' /var/log/salis/api.log | tail -50
```

Level 50 = error, level 40 = warn (Pino log levels).

**Step 6.** Check the rate limiter. If a single tenant or IP is consuming excessive resources:

```bash
# Check rate limit headers on a test request
curl -sI https://api.salisauto.com/api/v1/health \
  -H "Authorization: Bearer $TOKEN" \
  | grep -i ratelimit
```

Review `RateLimit-Remaining` across tenants. The rate limit key is `orgId:IP` (per [DevOps Guide](../operations/devops-guide.md)), so one noisy tenant should not exhaust another's budget.

**Step 7.** Check for TanStack Query cache miss storms on the frontend. Symptoms:
- Sudden spike in identical API requests from multiple browser tabs
- Same endpoint hit repeatedly within seconds
- No `staleTime` or `cacheTime` protecting frequently accessed data

```bash
# Check request frequency to a specific endpoint
grep "GET /api/v1/customers" /var/log/salis/access.log \
  | awk '{print $1, $4}' | sort | uniq -c | sort -rn | head -20
```

### Phase 2B: Database Layer Investigation

**Step 8.** Check active connections and connection pool status.

```sql
SELECT count(*) AS total_connections,
       count(*) FILTER (WHERE state = 'active') AS active,
       count(*) FILTER (WHERE state = 'idle') AS idle,
       count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_tx
FROM pg_stat_activity
WHERE datname = 'salis_production';
```

If `idle_in_transaction` is high, there may be a connection leak.

**Step 9.** Identify slow queries currently running.

```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration,
       query, state, wait_event_type, wait_event
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT ILIKE '%pg_stat_activity%'
ORDER BY duration DESC
LIMIT 10;
```

**Step 10.** Check `pg_stat_statements` for the slowest queries over the recent period.

```sql
SELECT query, calls, mean_exec_time, max_exec_time,
       total_exec_time, rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Step 11.** For any slow query identified, run `EXPLAIN ANALYZE` to understand the execution plan.

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM job_cards
WHERE org_id = 'example-org'
  AND status = 'in_progress'
ORDER BY created_at DESC
LIMIT 50;
```

Look for:
- **Seq Scan** on large tables (missing index)
- **Nested Loop** with high row counts (N+1 query pattern)
- **Sort** with high memory usage (missing index for ORDER BY)
- **Hash Join** with large hash tables (query optimization needed)

**Step 12.** Check for lock contention.

```sql
SELECT blocked.pid AS blocked_pid,
       blocked.query AS blocked_query,
       blocking.pid AS blocking_pid,
       blocking.query AS blocking_query
FROM pg_stat_activity AS blocked
JOIN pg_locks AS blocked_locks ON blocked.pid = blocked_locks.pid
JOIN pg_locks AS blocking_locks ON blocked_locks.locktype = blocking_locks.locktype
  AND blocked_locks.relation = blocking_locks.relation
  AND blocked_locks.pid != blocking_locks.pid
JOIN pg_stat_activity AS blocking ON blocking_locks.pid = blocking.pid
WHERE NOT blocked_locks.granted;
```

### Phase 3: Common Scenarios and Fixes

#### Scenario 1: N+1 Query Pattern

**Symptoms:** Many small, identical queries executing sequentially. High `calls` count in `pg_stat_statements` for simple SELECT queries.

**Fix:** Identify the API endpoint generating the pattern. Add a JOIN or batch query in the Drizzle ORM layer.

```sql
-- Bad: N+1 (one query per vehicle)
SELECT * FROM vehicles WHERE id = $1;  -- repeated N times

-- Good: Batch query
SELECT * FROM vehicles WHERE id = ANY($1::uuid[]);
```

#### Scenario 2: Missing Database Index

**Symptoms:** `EXPLAIN ANALYZE` shows Seq Scan on a table with many rows, high execution time.

**Fix:** Add the appropriate index.

```sql
-- Example: Missing index on job_cards for status filtering
CREATE INDEX CONCURRENTLY idx_job_cards_org_status
ON job_cards (org_id, status, created_at DESC);

-- Verify the index is used
EXPLAIN (ANALYZE) SELECT * FROM job_cards
WHERE org_id = 'example-org' AND status = 'in_progress'
ORDER BY created_at DESC LIMIT 50;
```

Use `CREATE INDEX CONCURRENTLY` to avoid locking the table during creation.

#### Scenario 3: Connection Pool Exhaustion

**Symptoms:** `idle_in_transaction` connections are high, new connections time out, `/ready` probe returns 503.

**Quick fix:**

```sql
-- Terminate idle-in-transaction connections older than 5 minutes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle in transaction'
  AND query_start < now() - interval '5 minutes';
```

**Permanent fix:** Set `idle_in_transaction_session_timeout` in PostgreSQL configuration.

```sql
ALTER SYSTEM SET idle_in_transaction_session_timeout = '300000';  -- 5 minutes in ms
SELECT pg_reload_conf();
```

#### Scenario 4: Large Payload Responses

**Symptoms:** Specific endpoints return slowly, high network transfer time, response body > 1 MB.

**Fix:** Check if pagination is being bypassed. The export endpoint is limited to 50,000 rows (`MAX_EXPORT_ROWS`), but list endpoints should use standard pagination.

```bash
# Check response size
curl -s -o /dev/null -w "%{size_download}" \
  https://api.salisauto.com/api/v1/job_cards \
  -H "Authorization: Bearer $TOKEN"
```

#### Scenario 5: Cache Miss Storm (TanStack Query)

**Symptoms:** Identical GET requests spike after a deployment or cache invalidation.

**Quick fix:** This is a frontend issue. Verify `staleTime` and `gcTime` values in the React Query configuration. No server-side action needed unless it causes backend overload.

If backend is overloaded, temporarily increase the rate limit:

```bash
# Update environment variable
RATE_LIMIT_MAX=600  # Temporarily double from default 300
```

Restart the application after updating.

### Phase 4: Horizontal Scaling (if investigation does not resolve)

**Step 13.** If the bottleneck is CPU or memory on the application layer, scale horizontally.

```bash
# Kubernetes:
kubectl scale deployment salis-api --replicas=4

# Auto-scaling group: adjust minimum instances
```

**Step 14.** If the bottleneck is database read capacity, consider adding a read replica (per [Operations Management Plan](../../management/operations-management-plan.md) scaling strategy).

**Step 15.** If the bottleneck is database write capacity, consider vertical scaling (upgrading the instance class).

---

## Verification

Confirm all of the following before closing the performance incident:

| Metric                       | Target              | Measurement Method               |
|------------------------------|---------------------|----------------------------------|
| API p50 response time        | < 200ms             | APM dashboard                    |
| API p95 response time        | < 500ms             | APM dashboard                    |
| API p99 response time        | < 1s                | APM dashboard                    |
| Database query time p95      | < 200ms             | `pg_stat_statements`             |
| Error rate                   | < 0.1%              | Sentry dashboard                 |
| Page load (LCP) p95          | < 2.5s              | Frontend performance monitoring  |
| Connection pool utilization  | < 80%               | Database provider metrics        |
| CPU utilization              | < 70%               | Infrastructure dashboard         |
| Memory utilization           | < 80%               | Infrastructure dashboard         |
| ZATCA submission time        | < 8s p95            | ZATCA integration monitoring     |
| Search response time         | < 800ms p95         | APM dashboard                    |

---

## Rollback

If a performance fix introduces new issues:

1. **Revert database indexes** if they cause write performance degradation.
   ```sql
   DROP INDEX CONCURRENTLY idx_name;
   ```
2. **Revert scaling changes** by reducing replica count to the previous value.
3. **Revert rate limit changes** by restoring the original `RATE_LIMIT_MAX` value (default: 300).
4. **Revert application changes** via the [Deployment Rollback](./deployment-rollback.md) runbook.
5. **Revert connection pool changes** by restoring the original `idle_in_transaction_session_timeout` value.

---

## Escalation

| Condition                                      | Escalate To              | Method          | Timeframe     |
|------------------------------------------------|--------------------------|-----------------|---------------|
| p95 > 2000ms (critical threshold)              | Team Lead                | PagerDuty       | Immediate     |
| Error rate > 5%                                | Team Lead + CTO          | PagerDuty       | Immediate     |
| Database connection pool > 95%                 | DBA (Sr. Backend Dev 1)  | Slack + phone   | Within 5 min  |
| Performance degradation not resolved in 30 min | Team Lead                | Slack           | After 30 min  |
| ZATCA submission failures due to timeouts      | Sr. Backend Dev 2 (ZATCA)| Slack + phone   | Within 15 min |
| Scaling required beyond current infrastructure | CTO + DevOps             | Email + Slack   | Within 1 hour |
| Suspected DDoS or abuse                        | CTO + Security           | PagerDuty       | Immediate     |

---

## Related Documents

- [DevOps Guide](../operations/devops-guide.md)
- [Operations Management Plan](../../management/operations-management-plan.md)
- [Incident Response Plan](../incident-response.md)
- [Database Failover](./database-failover.md)
- [Deployment Rollback](./deployment-rollback.md)
- [Backup and Recovery](../operations/backup-recovery.md)
