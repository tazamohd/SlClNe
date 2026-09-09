# SALIS AUTO -- Deployment Rollback

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-RUN-006                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## Trigger Conditions

Execute this runbook when any of the following occur after a production deployment:

1. **Post-deployment errors** -- error rate exceeds 1% within 30 minutes of deployment (Sentry alert)
2. **Failed health checks** -- `GET /health` or `GET /ready` returns non-200 for three consecutive checks
3. **Critical bug in production** -- P1 or P2 issue traced directly to the latest deployment
4. **ZATCA compliance failure** -- invoice issuance, hash chain, or QR code generation broken by the deployment
5. **Authentication failure** -- users unable to log in after deployment
6. **Data integrity issue** -- RLS bypass, audit log errors, or money column corruption introduced by the deployment
7. **Performance regression** -- API p95 exceeds 2000ms (critical threshold) after deployment, confirmed not caused by external factors

---

## Prerequisites

| Requirement                     | Details                                                         |
|---------------------------------|-----------------------------------------------------------------|
| Previous version artifacts      | Git tag or commit SHA of the last known good version             |
| Database migration rollback     | Drizzle down-migration scripts available in `server/drizzle/`   |
| Feature flag access             | Environment variable or configuration to disable new features   |
| Deployment platform access      | GitHub Actions, Vercel, Netlify dashboard, or cloud provider    |
| DNS / load balancer access      | Ability to route traffic away from the new deployment           |
| Database backup                 | Pre-deployment backup confirmed (per [Deployment Plan](../../project-management/planning/deployment-plan.md)) |
| CTO approval                    | Required for L3 escalation (full rollback with DB migration)    |

---

## Procedure

### Decision Matrix: Determine Rollback Scope

Before executing, determine which rollback scenario applies:

| Symptom                              | Rollback Scope          | Procedure Section |
|--------------------------------------|-------------------------|-------------------|
| Frontend rendering / UI broken       | Frontend-only           | Scenario A        |
| API errors, backend logic failure    | Backend-only            | Scenario B        |
| Both frontend and backend broken     | Full rollback           | Scenario C        |
| Database migration caused data issue | Database-only           | Scenario D        |
| New feature causing issues           | Feature flag kill switch| Quick Fix         |

---

### Quick Fix: Feature Flag Kill Switch

If the issue is isolated to a new feature, disable it without a full rollback.

**Step 1.** Identify the feature flag controlling the new functionality.

**Step 2.** Disable the flag via environment variable or configuration update.

```bash
# Example: Disable a new ZATCA clearance feature
FEATURE_ZATCA_CLEARANCE=false

# Apply without full restart if using runtime configuration
# Otherwise restart the API:
pm2 restart salis-api
# or
kubectl rollout restart deployment salis-api
```

**Step 3.** Verify the feature is disabled and the issue is resolved.

```bash
curl -s https://api.salisauto.com/health | jq .
```

**Step 4.** Monitor error rates for 15 minutes. If the issue persists, proceed to the appropriate rollback scenario.

---

### Scenario A: Frontend-Only Rollback

Use when the backend API is healthy but the React SPA has rendering, routing, or UI issues.

**Step 1.** Identify the last known good frontend deployment.

```bash
# Check recent deployments on GitHub
git log --oneline --tags --decorate -10

# Find the last good tag
git log --format='%H %s' origin/main -10
```

**Step 2.** Rollback via the hosting provider.

**GitHub Pages:**

```bash
# Checkout the last known good version
git checkout LAST_GOOD_TAG

# Rebuild
cd app && npm ci && npm run build

# Force push to gh-pages branch
# (Or trigger the deploy-pages workflow manually with the good tag)
```

**Vercel:**

```bash
# Use the Vercel CLI to promote a previous deployment
vercel rollback

# Or select the specific deployment in the Vercel dashboard
# Deployments > [last good deployment] > Promote to Production
```

**Netlify:**

```bash
# Use the Netlify CLI
netlify deploy --prod --dir=app/dist

# Or use the Netlify dashboard
# Deploys > [last good deploy] > Publish deploy
```

**Step 3.** Verify the frontend is serving the correct version.

```bash
# Check the deployed version (version hash in the bundle filename)
curl -sI https://app.salisauto.com/assets/index-*.js | head -5
```

**Step 4.** Verify core user flows:
- Login page renders correctly (EN + AR)
- Navigation works (React Router 7 client-side routing)
- Dashboard loads with data from the API

---

### Scenario B: Backend-Only Rollback

Use when the React SPA is functional but the Fastify API is returning errors.

**Step 1.** Identify the last known good backend version.

```bash
git log --oneline --tags -10
LAST_GOOD_SHA=$(git rev-parse LAST_GOOD_TAG)
```

**Step 2.** Build and deploy the previous backend version.

```bash
# Checkout the last good version
git checkout $LAST_GOOD_SHA -- server/

# Build
cd server && npm ci && npm run build

# Deploy
NODE_ENV=production node dist/server.js
```

Or via container orchestration:

```bash
# Deploy the previous container image
kubectl set image deployment/salis-api \
  salis-api=registry.example.com/salis-api:LAST_GOOD_TAG

# Monitor the rollout
kubectl rollout status deployment/salis-api
```

**Step 3.** If the previous version expects the previous database schema (before the latest migration), proceed to Scenario D first.

**Step 4.** Verify the API is healthy.

```bash
# Health check (does not touch DB)
curl -s https://api.salisauto.com/health | jq .
# Expected: { "status": "ok", "uptimeSeconds": N }

# Readiness check (executes SELECT 1)
curl -s https://api.salisauto.com/ready | jq .
# Expected: { "status": "ready" }
```

**Step 5.** Verify core API functionality.

```bash
# Test authentication
curl -s -X POST https://api.salisauto.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' \
  | jq '.accessToken | length'

# Test a list endpoint (should return data)
curl -s https://api.salisauto.com/api/v1/customers \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length'
```

---

### Scenario C: Full Rollback (Frontend + Backend + Database)

Use when both layers are broken or when a database migration caused cascading failures.

**Step 1.** Announce a maintenance window. If the outage is already in progress, update the status page.

```
Subject: [SALIS AUTO] Maintenance in Progress
We are performing emergency maintenance to resolve issues from the
latest deployment. Service will be restored as soon as possible.
```

**Step 2.** Execute Scenario D (Database rollback) first if a migration was part of the deployment.

**Step 3.** Execute Scenario B (Backend rollback).

**Step 4.** Execute Scenario A (Frontend rollback).

**Step 5.** Run the full post-deployment verification checklist (see Verification section below).

**Step 6.** Remove the maintenance page and update the status page.

---

### Scenario D: Database-Only Rollback (Migration Revert)

Use when a Drizzle ORM migration caused schema or data issues.

**Step 1.** Identify the problematic migration.

```bash
# Check the migration history
cd server
npx drizzle-kit status
```

**Step 2.** Back up the current database state before reverting.

```bash
pg_dump -h DB_HOST -U salis_app -d salis_production \
  -Fc -f pre-rollback-backup-$(date +%Y%m%d-%H%M%S).dump
```

**Step 3.** Revert the migration.

If Drizzle ORM provides a rollback mechanism:

```bash
npx drizzle-kit down
```

If a manual rollback is needed, apply the reverse migration SQL. Example for a column addition:

```sql
-- Reverse of: ALTER TABLE job_cards ADD COLUMN new_field varchar(255);
ALTER TABLE job_cards DROP COLUMN IF EXISTS new_field;
```

For more complex migrations (data transformations, index changes):

```sql
-- Reverse of index creation
DROP INDEX CONCURRENTLY IF EXISTS idx_new_index;

-- Reverse of data transformation (restore from backup column if created)
UPDATE invoices SET column_name = column_name_backup
WHERE column_name_backup IS NOT NULL;
ALTER TABLE invoices DROP COLUMN IF EXISTS column_name_backup;
```

**Step 4.** Verify the schema matches the expected state for the previous application version.

```bash
# Compare the current schema against the expected schema
npx drizzle-kit check
```

**Step 5.** Verify data integrity after the migration rollback.

```sql
-- RLS policies still active
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
-- Must return 53 rows

-- Audit log trigger intact
UPDATE audit_log SET action = 'test' WHERE id = 'nonexistent';
-- Must fail with trigger error

-- Invoice hash chain intact
SELECT org_id, COUNT(*) AS total,
       COUNT(hash_self) AS hashed
FROM invoices WHERE issued_at IS NOT NULL
GROUP BY org_id
HAVING COUNT(*) != COUNT(hash_self);
-- Must return zero rows

-- Money column integrity
SELECT COUNT(*) FROM invoices
WHERE total_halalas != FLOOR(total_halalas)
   OR tax_halalas != FLOOR(tax_halalas);
-- Must return 0
```

**Step 6.** Restart the application to ensure it connects cleanly with the reverted schema.

```bash
pm2 restart salis-api
# or
kubectl rollout restart deployment salis-api
```

---

## Verification

Run the full verification checklist after any rollback scenario:

| Check                              | Command / Method                           | Expected Result                  |
|------------------------------------|--------------------------------------------|----------------------------------|
| API liveness                       | `GET /health`                              | `{ "status": "ok" }`            |
| API readiness                      | `GET /ready`                               | `{ "status": "ready" }`         |
| API p95 response time              | APM dashboard                              | < 500ms                          |
| Error rate                         | Sentry dashboard                           | < 0.1%                           |
| Login flow (EN)                    | Manual test                                | Successful login                 |
| Login flow (AR)                    | Manual test with RTL layout                | Successful login                 |
| Job card creation                  | Create a test job card                     | Created successfully             |
| Invoice issuance                   | Issue a test invoice                       | QR code + hash chain populated   |
| ZATCA compliance                   | Verify ZATCA fields on issued invoice      | All fields present               |
| Customer search                    | Search for existing customer               | Results returned < 800ms         |
| CSV export                         | Export a small collection                  | CSV downloaded correctly         |
| RLS isolation                      | Query as different tenants                 | Tenant A cannot see Tenant B     |
| Audit log immutability             | Attempt UPDATE on `audit_log`              | Trigger error                    |
| Rate limiting functional           | Check `RateLimit-*` headers                | Headers present                  |
| Frontend static assets             | Load the SPA in browser                    | No 404s on JS/CSS chunks        |
| WebSocket connections (if used)    | Check real-time features                   | Connected and receiving          |

---

## Rollback

If the rollback itself causes issues:

1. **Rollback of rollback** -- deploy the newest version again and use feature flags to disable the problematic functionality while the underlying issue is fixed.
2. **Database rollback fails** -- restore from the pre-deployment backup (Step 2 of Scenario D).
   ```bash
   pg_restore -h DB_HOST -U salis_app -d salis_production \
     --clean --if-exists pre-rollback-backup-TIMESTAMP.dump
   ```
3. **Cannot determine the last good version** -- check the deployment log, CI/CD pipeline history, and Git tags. The [Deployment Plan](../../project-management/planning/deployment-plan.md) requires a release tag for every production deployment.
4. **Data was written to new schema columns** -- data written to columns that exist only in the new migration will be lost when the migration is reverted. Assess the impact and communicate to affected users.

---

## Escalation

| Condition                                      | Escalate To              | Method          | Timeframe     |
|------------------------------------------------|--------------------------|-----------------|---------------|
| Rollback decision needed                       | Team Lead                | Slack           | Within 5 min  |
| Full rollback with DB migration revert         | CTO (L3 approval)       | Phone + Slack   | Before starting|
| Rollback does not resolve the issue            | CTO + Team Lead          | Phone           | Immediate     |
| Data loss from migration rollback              | CTO + DBA               | Phone + Slack   | Immediate     |
| ZATCA compliance broken during rollback window | Sr. Backend Dev 2 (ZATCA)| Slack + phone   | Within 15 min |
| Rollback exceeds 1-hour window                 | CTO                      | Phone           | After 1 hour  |
| Customer-facing impact during rollback          | PM (for customer comms)  | Slack           | Immediate     |

---

## Post-Rollback Actions

1. **Root cause analysis** -- identify why the deployment failed and what testing gap allowed it through the CI/CD pipeline
2. **Fix forward** -- prepare a corrected version for re-deployment, tested against the specific failure scenario
3. **Update test suite** -- add test coverage for the scenario that caused the rollback
4. **Update deployment checklist** -- add any missing pre-deployment checks to the [Deployment Plan](../../project-management/planning/deployment-plan.md)
5. **Post-mortem** -- if the rollback caused customer impact, complete a post-mortem within 48 hours per [Incident Response Plan](../incident-response.md)

---

## Related Documents

- [Deployment Plan](../../project-management/planning/deployment-plan.md)
- [DevOps Guide](../operations/devops-guide.md)
- [Incident Response Plan](../incident-response.md)
- [Database Failover](./database-failover.md)
- [Performance Degradation Response](./performance-degradation.md)
- [Backup and Recovery](../operations/backup-recovery.md)
- [Operations Management Plan](../../management/operations-management-plan.md)
