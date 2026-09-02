# SALIS AUTO -- Capacity & Rollback Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-005                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the capacity planning strategy, scaling approach, and rollback procedures for the SALIS AUTO platform. It ensures the system can handle projected load, grow with tenant adoption, and recover gracefully from failed deployments or incidents.

---

## 2. Capacity Planning

### 2.1 Load Projections

| Metric                    | Year 1          | Year 2          | Year 3          |
|---------------------------|-----------------|-----------------|-----------------|
| Tenants (workshops)       | 50              | 150             | 300             |
| Branches (total)          | 75              | 300             | 750             |
| Concurrent users          | 200             | 800             | 2,000           |
| Daily jobs created        | 500             | 2,000           | 5,000           |
| Daily invoices (ZATCA)    | 400             | 1,600           | 4,000           |
| API requests/day          | 100,000         | 500,000         | 1,500,000       |
| Database size             | 5 GB            | 25 GB           | 75 GB           |

### 2.2 Per-Tenant Resource Estimates

| Resource                  | Per Tenant (Avg) | Notes                                      |
|---------------------------|------------------|--------------------------------------------|
| Database rows (Year 1)    | 50,000           | Customers, vehicles, jobs, invoices, parts |
| Storage                   | 100 MB           | Data + attachments (photos, PDFs)          |
| API calls/day             | 2,000            | Based on 10 active users per tenant        |
| ZATCA API calls/day       | 8                | Average 8 invoices per workshop per day    |
| Notification sends/day    | 40               | SMS + WhatsApp + email + push              |

### 2.3 Compute Requirements

| Component          | Year 1                | Year 2                | Year 3                |
|--------------------|-----------------------|-----------------------|-----------------------|
| API servers        | 1 x 2 vCPU, 4GB RAM  | 2 x 2 vCPU, 4GB RAM  | 4 x 4 vCPU, 8GB RAM  |
| Database           | 2 vCPU, 4GB, 50GB SSD| 4 vCPU, 8GB, 100GB SSD| 8 vCPU, 16GB, 250GB SSD|
| Redis (cache)      | 1GB                   | 2GB                   | 4GB                   |
| CDN bandwidth      | 50 GB/month           | 200 GB/month          | 500 GB/month          |
| Frontend hosting   | Static (Vercel/Netlify free tier -> Pro) | Pro tier  | Enterprise            |

---

## 3. Scaling Strategy

### 3.1 Horizontal Scaling (API)

```
Load Balancer
     |
  +--+--+--+
  |  |  |  |
 API API API API    <-- Stateless Express instances
  |  |  |  |
  +--+--+--+
     |
  PostgreSQL
  (Connection Pool)
```

**Scaling triggers:**

| Metric                     | Threshold         | Action                           |
|----------------------------|--------------------|----------------------------------|
| CPU utilization            | > 70% sustained    | Add 1 API instance               |
| Memory utilization         | > 80%              | Add 1 API instance               |
| API P95 response time      | > 500ms sustained  | Add 1 API instance               |
| Active connections         | > 80% pool limit   | Increase pool size or add node   |

**Requirements for horizontal scaling:**

- Express API is stateless (JWT auth, no server-side sessions).
- Database connections managed through PgBouncer connection pooler.
- File uploads go to object storage (S3-compatible), not local disk.
- Rate limiting uses Redis (shared across instances).

### 3.2 Vertical Scaling (Database)

| Growth Event                   | Action                                     |
|--------------------------------|--------------------------------------------|
| DB CPU > 70% sustained         | Upgrade to next vCPU tier                  |
| DB disk > 80%                  | Expand storage allocation                  |
| Slow queries increasing        | Add indexes, optimize queries, read replicas|
| Connection limit approaching   | Increase max_connections + PgBouncer pool   |

### 3.3 Read Replica Strategy (Year 2+)

```
Primary (Write)  --->  Replica 1 (Read: Reports)
                 --->  Replica 2 (Read: Dashboards)
```

- Reports & Analytics queries routed to read replicas.
- Dashboard KPI queries routed to read replicas.
- All write operations (job creation, invoicing, approval actions) go to primary.
- Drizzle ORM configured with primary/replica connection strings.
- Replication lag monitoring: alert if > 5 seconds.

### 3.4 Caching Strategy

| Cache Layer          | Tool       | What Is Cached                              | TTL       |
|----------------------|------------|---------------------------------------------|-----------|
| API response cache   | Redis      | Role permissions, org config, branch settings| 5 min     |
| Query result cache   | React Query| Server state (lists, details)               | Stale: 30s|
| Static assets        | CDN        | JS bundles, CSS, images, fonts               | 1 year    |
| i18n translations    | Browser    | EN/AR translation JSON files                 | 1 hour    |
| ZATCA config         | Redis      | ZATCA credentials, certificate cache          | 1 hour    |

### 3.5 CDN Configuration

| Asset Type            | Cache Policy                                     |
|-----------------------|--------------------------------------------------|
| JS/CSS bundles        | `Cache-Control: public, max-age=31536000, immutable` (hashed filenames) |
| `index.html`          | `Cache-Control: no-cache` (always fresh)         |
| Translation JSON      | `Cache-Control: public, max-age=3600`            |
| API responses         | Not cached at CDN layer (dynamic)                |

---

## 4. Performance Budgets

### 4.1 API Performance Budget

| Endpoint Category         | P50 Target | P95 Target | P99 Target |
|---------------------------|------------|------------|------------|
| Simple CRUD (GET/POST)    | 50ms       | 200ms      | 500ms      |
| Complex queries (reports) | 200ms      | 800ms      | 2000ms     |
| ZATCA API calls           | 500ms      | 2000ms     | 5000ms     |
| File upload               | 200ms      | 1000ms     | 3000ms     |
| Search (full-text)        | 100ms      | 500ms      | 1000ms     |

### 4.2 Frontend Performance Budget

| Metric                    | Target                              |
|---------------------------|-------------------------------------|
| First Contentful Paint    | < 1.5s                              |
| Largest Contentful Paint  | < 2.5s                              |
| Time to Interactive       | < 3.5s                              |
| Cumulative Layout Shift   | < 0.1                               |
| Initial JS bundle         | < 200KB gzipped                     |
| Total page weight         | < 500KB gzipped (initial load)      |
| Lighthouse Performance    | >= 80                               |

---

## 5. Rollback Procedures

### 5.1 Rollback Decision Matrix

| Condition                                    | Severity | Action                         | Decision Maker   |
|----------------------------------------------|----------|--------------------------------|------------------|
| P1 bug in core workflow                      | Critical | Full rollback                  | PM + TL          |
| ZATCA invoice generation broken              | Critical | Full rollback                  | PM + Finance     |
| Auth/RBAC bypass discovered                  | Critical | Immediate rollback             | TL (no approval) |
| Data integrity issue (cross-tenant leak)     | Critical | Immediate rollback + forensics | TL + Security    |
| API error rate > 5%                          | High     | Rollback if not fixed in 30 min| PM               |
| Performance degradation (P95 > 2s)           | High     | Investigate; rollback if > 1hr | TL               |
| P2 bug with no workaround                   | Medium   | Hotfix preferred; rollback if needed | PM          |
| Minor UI issue                               | Low      | Hotfix in next sprint          | No rollback      |

### 5.2 Frontend Rollback

**Time to rollback:** < 5 minutes.

All three hosting providers support instant rollback:

| Provider      | Rollback Method                                              |
|---------------|--------------------------------------------------------------|
| GitHub Pages  | `git revert` + push to gh-pages branch; or redeploy previous tag |
| Vercel        | Dashboard -> Deployments -> Promote previous deployment      |
| Netlify       | Dashboard -> Deploys -> Publish previous deploy              |

```bash
# GitHub Pages rollback via CLI
git checkout v1.0.0       # Previous release tag
npm run build
npx gh-pages -d dist

# Vercel rollback via CLI
vercel rollback [deployment-url]

# Netlify rollback via CLI
netlify deploy --prod --dir=dist  # From previous build
```

### 5.3 Backend API Rollback

**Time to rollback:** < 10 minutes.

```bash
# Option 1: Redeploy previous container/build
# (Cloud provider specific -- Railway, Render, etc.)
railway deploy --rollback

# Option 2: Docker-based rollback
docker pull salisauto/api:v1.0.0-previous
docker stop salisauto-api
docker run -d --name salisauto-api salisauto/api:v1.0.0-previous
```

### 5.4 Database Rollback

**Time to rollback:** 15--60 minutes (depending on database size).

| Scenario                          | Method                                      | RTO          |
|-----------------------------------|---------------------------------------------|--------------|
| Failed migration (no data loss)   | Run down migration or manual reverse SQL    | 15 min       |
| Data corruption (limited)         | Point-in-time recovery (PITR)               | 30 min       |
| Full database restore needed      | Restore from pre-deployment backup          | 30--60 min   |

```bash
# Drizzle migration rollback (if supported)
npx drizzle-kit rollback

# PostgreSQL point-in-time recovery
pg_restore -d salisauto_prod \
  --target-time="2026-08-30 14:00:00+03" \
  backup_file.dump

# Full backup restore
pg_restore -d salisauto_prod \
  --clean --if-exists \
  pre_deployment_backup.dump
```

### 5.5 Full System Rollback Procedure

| Step | Time    | Action                                          | Owner     |
|------|---------|--------------------------------------------------|-----------|
| 1    | T+0 min | Decision to rollback communicated                | PM        |
| 2    | T+1 min | Enable maintenance page                          | DevOps    |
| 3    | T+2 min | Rollback frontend (Vercel/Netlify instant)       | DevOps    |
| 4    | T+3 min | Rollback backend API (redeploy previous version) | DevOps    |
| 5    | T+5 min | Rollback database (if migration involved)        | DBA       |
| 6    | T+20 min| Verify API health check                          | DevOps    |
| 7    | T+22 min| Run smoke tests                                  | QA        |
| 8    | T+30 min| Disable maintenance page                         | DevOps    |
| 9    | T+35 min| Notify stakeholders of rollback                  | PM        |
| 10   | T+60 min| Post-mortem initiated                            | PM + TL   |

---

## 6. Disaster Recovery

### 6.1 Backup Strategy

| Backup Type              | Frequency    | Retention | Storage          |
|--------------------------|-------------|-----------|------------------|
| Full database backup     | Daily       | 30 days   | Cloud storage    |
| Incremental backup       | Hourly      | 7 days    | Cloud storage    |
| Transaction log (WAL)    | Continuous  | 7 days    | Cloud storage    |
| Configuration backup     | Per change  | 90 days   | Git repository   |
| Source code              | Continuous  | Permanent | GitHub           |

### 6.2 Recovery Objectives

| Metric                          | Target                              |
|---------------------------------|-------------------------------------|
| Recovery Time Objective (RTO)   | < 1 hour                            |
| Recovery Point Objective (RPO)  | < 1 hour (WAL-based PITR)           |
| Maximum data loss               | < 1 hour of transactions            |

### 6.3 Disaster Recovery Scenarios

| Scenario                        | Recovery Procedure                            | RTO       |
|---------------------------------|-----------------------------------------------|-----------|
| Single API instance failure     | Auto-replaced by orchestrator/load balancer   | < 5 min   |
| All API instances down          | Redeploy from last known good build           | < 15 min  |
| Database primary failure        | Promote read replica (Year 2+) or PITR restore| < 30 min |
| Hosting provider outage         | Deploy to alternate provider (e.g., GH Pages) | < 1 hour |
| Data corruption                 | PITR to last known good state                 | < 1 hour  |
| Region-level outage             | Cross-region replica (Year 3) or manual redeploy | < 4 hours|

---

## 7. Monitoring for Capacity Decisions

### 7.1 Key Metrics to Watch

| Metric                        | Tool              | Alert Threshold              |
|-------------------------------|-------------------|------------------------------|
| API request rate              | APM (Datadog/NR)  | > 120% of baseline           |
| Database connections          | PG metrics         | > 80% pool utilization       |
| Database disk usage           | Cloud monitoring   | > 80% allocated              |
| Database CPU                  | Cloud monitoring   | > 70% sustained 15 min       |
| Memory usage (API)            | Container metrics  | > 80% allocated              |
| ZATCA API response time       | Custom monitoring  | P95 > 3s                     |
| Notification queue depth      | Redis metrics      | > 1000 pending               |
| CDN bandwidth                 | CDN dashboard      | > 80% of plan limit          |

### 7.2 Capacity Review Schedule

| Review                         | Frequency   | Participants         | Output                     |
|--------------------------------|-------------|----------------------|----------------------------|
| Daily metrics check            | Daily       | DevOps               | Alert triage               |
| Weekly capacity review         | Weekly      | DevOps + TL          | Scaling recommendations    |
| Monthly capacity planning      | Monthly     | PM + DevOps + TL     | Budget and resource plan   |
| Quarterly growth review        | Quarterly   | PM + Sponsor + DevOps| Infrastructure roadmap     |

---

## 8. Cost Optimization

| Strategy                        | Implementation                                |
|---------------------------------|-----------------------------------------------|
| Right-sizing                    | Match instance size to actual utilization     |
| Auto-scaling (Year 2+)         | Scale API instances based on CPU/request rate |
| Reserved instances              | Commit to 1-year DB instances for 30% savings |
| CDN optimization               | Cache static assets aggressively               |
| Query optimization              | Regular EXPLAIN ANALYZE on slow queries        |
| Cleanup                         | Archive old audit logs and job history > 2 years|

---

## 9. References

- [Deployment Plan](deployment-plan.md)
- [Migration Plan](migration-plan.md)
- [Release Plan](release-plan.md)
- [Risk Register](../pmp/risk-register.md) (R-D02, R-D03)
- [Test Plan](test-plan.md) (Performance testing section)
