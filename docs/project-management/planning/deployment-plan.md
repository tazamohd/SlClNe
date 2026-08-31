# SALIS AUTO -- Deployment Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the deployment procedures for the SALIS AUTO platform across all target environments: GitHub Pages, Vercel, and Netlify for the frontend SPA, and cloud infrastructure for the backend API and PostgreSQL database.

---

## 2. Architecture Overview

```
                 +--------------------+
                 |   Static Hosting   |
                 | (GitHub Pages /    |
                 |  Vercel / Netlify) |
                 +--------+---------+
                          |
                    React SPA
                   (Vite build)
                          |
                   HTTPS API calls
                          |
                 +--------+---------+
                 |   Backend API     |
                 |   (Express 4.21)  |
                 +--------+---------+
                          |
                 +--------+---------+
                 |   PostgreSQL      |
                 | (Drizzle ORM)     |
                 +-------------------+
```

- **Frontend:** Static SPA (React 18.3 + TypeScript 5.7 + Vite 5.4 build), deployed to static hosting.
- **Backend:** Express 4.21 API with Drizzle ORM 0.36, deployed to cloud compute (e.g., Railway, Render, or VPS).
- **Database:** PostgreSQL managed service (e.g., Neon, Supabase, or self-hosted).

---

## 3. Environment Configuration

### 3.1 Environment Matrix

| Environment | Purpose              | Frontend Host       | Backend Host        | Database          |
|-------------|----------------------|---------------------|---------------------|-------------------|
| Local       | Developer workstation | `localhost:5173`   | `localhost:3000`    | PGlite (local)    |
| Development | Integration testing  | Vercel (preview)    | Cloud (dev instance)| PostgreSQL (dev)   |
| Staging     | UAT, demos           | Vercel (staging)    | Cloud (staging)     | PostgreSQL (staging)|
| Production  | Live system          | GitHub Pages/Vercel/Netlify | Cloud (prod) | PostgreSQL (prod)  |

### 3.2 Environment Variables

| Variable                  | Local           | Development       | Staging           | Production        |
|---------------------------|-----------------|-------------------|-------------------|-------------------|
| `VITE_API_BASE_URL`       | `http://localhost:3000` | `https://dev-api.salisauto.com` | `https://staging-api.salisauto.com` | `https://api.salisauto.com` |
| `DATABASE_URL`            | PGlite path     | Dev PG connection  | Staging PG conn   | Prod PG conn      |
| `JWT_SECRET`              | dev-secret      | Generated          | Generated          | Generated (rotated)|
| `JWT_REFRESH_SECRET`      | dev-refresh     | Generated          | Generated          | Generated (rotated)|
| `ZATCA_ENV`               | sandbox         | sandbox            | sandbox            | production         |
| `ZATCA_API_URL`           | ZATCA sandbox URL | ZATCA sandbox    | ZATCA sandbox      | ZATCA prod URL     |
| `SMS_GATEWAY_KEY`         | mock            | Test key           | Test key           | Production key     |
| `WHATSAPP_API_KEY`        | mock            | Test key           | Test key           | Production key     |
| `NODE_ENV`                | development     | development        | staging            | production         |
| `CORS_ORIGIN`             | `*`             | Dev frontend URL   | Staging URL        | Production URL     |

**Security:** Production secrets are stored in the hosting provider's secret manager. Never committed to source control. Rotated quarterly.

---

## 4. CI/CD Pipeline

### 4.1 Pipeline Architecture (GitHub Actions)

```yaml
# Simplified pipeline stages
trigger: push to main / PR to main

stages:
  1. Install    -> npm ci (cached)
  2. Lint       -> ESLint + Prettier check
  3. Type Check -> tsc --noEmit
  4. Unit Test  -> Vitest (coverage report)
  5. Integ Test -> Supertest (against PGlite)
  6. Build      -> Vite build (frontend) + tsc (backend)
  7. E2E Test   -> Playwright (against built artifacts)
  8. Deploy     -> Conditional on branch/tag
```

### 4.2 Deployment Triggers

| Trigger                     | Action                                          |
|-----------------------------|-------------------------------------------------|
| PR opened/updated           | Run stages 1--7; deploy to Vercel preview       |
| Merge to `main`             | Run stages 1--7; deploy to Development          |
| Tag `v*-alpha.*`            | Deploy to Staging                               |
| Tag `v*-beta.*`             | Deploy to Staging + notify stakeholders         |
| Tag `v*-rc.*`               | Deploy to Staging + UAT notification            |
| Tag `v*` (no pre-release)   | Deploy to Production (manual approval gate)     |

---

## 5. Frontend Deployment Procedures

### 5.1 GitHub Pages

```bash
# Build
npm run build                     # Vite produces dist/

# Deploy (via GitHub Actions)
- uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    cname: app.salisauto.com      # Custom domain
```

**Configuration:**
- `vite.config.ts`: Set `base: '/'` (custom domain) or `base: '/repo-name/'` (GitHub Pages default).
- SPA routing: Add `dist/404.html` redirect for client-side routing with React Router 7.
- CNAME file in `public/` for custom domain.

### 5.2 Vercel

```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Configuration:**
- Environment variables set in Vercel dashboard per environment.
- Preview deployments enabled for PRs.
- Production branch: `main` with manual promotion.

### 5.3 Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Configuration:**
- Build environment variables set in Netlify dashboard.
- Deploy previews for PRs.
- Branch deploys for staging.

---

## 6. Backend Deployment Procedures

### 6.1 API Server Deployment

```bash
# Build
npm run build:api                 # TypeScript compilation

# Start
NODE_ENV=production node dist/server.js
```

**Health Check Endpoint:**
```
GET /api/health
Response: { "status": "ok", "version": "1.0.0", "timestamp": "..." }
```

### 6.2 Database Migrations

```bash
# Run pending migrations (Drizzle ORM)
npx drizzle-kit migrate

# Verify migration status
npx drizzle-kit status
```

**Migration Protocol:**
1. Backup database before migration.
2. Run migrations on staging first.
3. Verify data integrity post-migration.
4. Run on production during maintenance window.
5. Verify production data integrity.

---

## 7. Deployment Checklist

### 7.1 Pre-Deployment

| Step | Activity                                        | Owner     | Verified |
|------|-------------------------------------------------|-----------|----------|
| 1    | All CI pipeline stages green                    | DevOps    | [ ]      |
| 2    | Release tag created and pushed                  | TL        | [ ]      |
| 3    | Release notes prepared                          | PO        | [ ]      |
| 4    | Database backup taken                           | DBA       | [ ]      |
| 5    | Database migrations tested on staging           | DBA       | [ ]      |
| 6    | Feature flags configured for release            | TL        | [ ]      |
| 7    | Environment variables verified                  | DevOps    | [ ]      |
| 8    | Rollback plan reviewed                          | DevOps    | [ ]      |
| 9    | Monitoring and alerting configured              | DevOps    | [ ]      |
| 10   | Stakeholders notified of deployment window      | PM        | [ ]      |

### 7.2 Deployment Steps

| Step | Activity                                        | Owner     | Verified |
|------|-------------------------------------------------|-----------|----------|
| 1    | Enable maintenance page (if needed)             | DevOps    | [ ]      |
| 2    | Run database migrations                         | DBA       | [ ]      |
| 3    | Deploy backend API                              | DevOps    | [ ]      |
| 4    | Verify API health check                         | DevOps    | [ ]      |
| 5    | Deploy frontend SPA                             | DevOps    | [ ]      |
| 6    | Verify frontend loads correctly                 | QA        | [ ]      |
| 7    | Run post-deployment smoke tests                 | QA        | [ ]      |
| 8    | Disable maintenance page                        | DevOps    | [ ]      |

### 7.3 Post-Deployment

| Step | Activity                                        | Owner     | Verified |
|------|-------------------------------------------------|-----------|----------|
| 1    | Smoke test: login flow (EN + AR)                | QA        | [ ]      |
| 2    | Smoke test: job creation lifecycle               | QA        | [ ]      |
| 3    | Smoke test: ZATCA invoice generation             | QA        | [ ]      |
| 4    | Smoke test: customer portal access               | QA        | [ ]      |
| 5    | Verify monitoring dashboards                    | DevOps    | [ ]      |
| 6    | Check error rates in logging                    | DevOps    | [ ]      |
| 7    | Confirm ZATCA clearance working (prod)          | Finance   | [ ]      |
| 8    | Send deployment success notification            | PM        | [ ]      |

---

## 8. Monitoring and Alerting

### 8.1 Monitoring Stack

| Component        | Tool                           | What It Monitors                    |
|------------------|--------------------------------|-------------------------------------|
| Uptime           | UptimeRobot / Better Uptime    | API health endpoint, frontend URL   |
| Error tracking   | Sentry                         | Frontend + backend errors           |
| APM              | New Relic / Datadog             | API response times, throughput      |
| Logs             | Cloud provider logging          | Application logs, access logs       |
| Database         | PG provider metrics             | Connection pool, query time, disk   |

### 8.2 Alert Thresholds

| Metric                     | Warning         | Critical          | Notification      |
|----------------------------|-----------------|-------------------|--------------------|
| API error rate             | > 1%            | > 5%              | Slack + email      |
| API P95 response time      | > 500ms         | > 2000ms          | Slack + email      |
| Frontend error rate        | > 0.5%          | > 2%              | Slack              |
| Database connection pool   | > 80% utilized  | > 95% utilized    | Slack + PagerDuty  |
| Disk usage                 | > 80%           | > 90%             | Email              |
| Uptime check failure       | 1 failure       | 3 consecutive     | Slack + PagerDuty  |
| ZATCA API errors           | Any failure     | 3+ in 1 hour      | Slack + email      |

---

## 9. DNS and SSL Configuration

| Domain                        | Target                    | SSL             |
|-------------------------------|---------------------------|-----------------|
| `app.salisauto.com`           | Frontend (static host)    | Auto (provider) |
| `api.salisauto.com`           | Backend API               | Let's Encrypt   |
| `staging.salisauto.com`       | Staging frontend          | Auto (provider) |
| `staging-api.salisauto.com`   | Staging backend           | Let's Encrypt   |

SSL certificates are auto-renewed. HSTS enabled with 1-year max-age.

---

## 10. References

- [Release Plan](release-plan.md)
- [Capacity Rollback Plan](capacity-rollback-plan.md)
- [Migration Plan](migration-plan.md)
- [Test Plan](test-plan.md)
- [Stage Plans](../prince2/stage-plans.md)
