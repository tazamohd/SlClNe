# SALIS AUTO -- Release Process

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-DEV-006                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Semantic Versioning

SALIS AUTO follows Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

| Component | Increment When                                           | Example          |
|-----------|----------------------------------------------------------|------------------|
| MAJOR     | Breaking API changes, architectural shifts, data model changes | 1.0.0 > 2.0.0 |
| MINOR     | New domains, features, or backward-compatible enhancements | 1.0.0 > 1.1.0 |
| PATCH     | Bug fixes, security patches, minor improvements          | 1.1.0 > 1.1.1   |

### 1.1 Pre-Release Tags

| Tag       | Purpose                              | Example        |
|-----------|--------------------------------------|----------------|
| `-alpha`  | Internal testing, sprint demos       | 0.4.0-alpha    |
| `-beta`   | Staging environment, UAT-ready       | 0.7.0-beta     |
| `-rc`     | Release candidate, final sign-off    | 1.0.0-rc.1     |

---

## 2. Release Cadence

### 2.1 Pre-Launch Releases

Aligned with the [Release Plan](../project-management/planning/release-plan.md):

| Version       | Stage              | Sprint | Content                                          |
|---------------|--------------------|--------|--------------------------------------------------|
| 0.1.0-alpha   | Foundation         | S3     | Auth + RBAC + i18n framework                     |
| 0.2.0-alpha   | Core: Workshop     | S6     | Workshop lifecycle (Check-In through Delivery)   |
| 0.3.0-alpha   | Core: Registry     | S7     | Customer + Vehicle CRUD + Saudi validations      |
| 0.4.0-alpha   | Core: Finance      | S10    | Invoicing + ZATCA sandbox integration            |
| 0.5.0-alpha   | Core: Accounting   | S11    | Chart of accounts + journal entries              |
| 0.6.0-alpha   | Core: Parts        | S12    | Inventory + PO lifecycle + approval chain        |
| 0.7.0-beta    | Extended           | S17    | CRM, AI, Call Center, HR, Portals                |
| 0.8.0-beta    | Integration        | S20    | ZATCA prod cert + notifications + reports        |
| 0.9.0-beta    | Testing            | S22    | All tests passing, security hardened             |
| 1.0.0-rc.1    | Deployment         | S23    | Release candidate for UAT                        |
| **1.0.0**     | **Go-Live**        | S23    | **Production release**                           |

### 2.2 Post-Launch Cadence

| Release Type | Frequency         | Purpose                                    |
|--------------|-------------------|--------------------------------------------|
| Patch        | As needed         | Critical bug fixes, security patches       |
| Minor        | Monthly           | New features, improvements                 |
| Major        | Quarterly         | Significant new capabilities               |

Planned post-launch releases:

| Version | Target       | Content                                              |
|---------|--------------|------------------------------------------------------|
| 1.1.0   | Go-live +4w  | Post-launch fixes, performance tuning, UX polish     |
| 1.2.0   | Go-live +8w  | Customer feedback-driven improvements                |
| 1.3.0   | Go-live +12w | Additional report types, dashboard enhancements      |
| 2.0.0   | Phase 2      | Native mobile app, offline mode, multi-currency      |

---

## 3. Release Types

### 3.1 Major Release

Breaking changes that require migration steps or client updates. Requires executive sponsor approval at the rollout gate.

- API contract changes (endpoint removals, response shape changes)
- Database schema changes that are not backward compatible
- Authentication or authorization model changes

### 3.2 Minor Release

New features and backward-compatible enhancements. Follows the standard release process (Section 5).

- New domain modules (CRM, HR, Fleet)
- New screen additions within existing domains
- Feature flag promotions to general availability

### 3.3 Patch Release

Bug fixes and security patches. Follows an abbreviated process: fix, test, deploy.

- Bug fixes for reported issues
- Security vulnerability patches
- Performance improvements

### 3.4 Hotfix Release

Critical production fixes that bypass the standard release cycle. See Section 7 for the hotfix process.

- P1 bugs affecting production users
- Security incidents requiring immediate response
- ZATCA compliance failures

---

## 4. Release Process

### Step 1: Feature Freeze

Create the release branch and lock it from new features:

```bash
git checkout develop
git pull origin develop
git checkout -b release/1.2.0
```

Only bug fixes and release preparation commits go to the release branch after this point. Branch protection rules enforce this.

### Step 2: QA Testing on Staging

Deploy the release branch to the staging environment and run the full test suite:

```bash
# Unit and integration tests
cd app && npm test
cd server && npm test

# Type checking
cd app && npm run typecheck
cd server && npm run typecheck

# E2E tests
cd app && npx playwright test
```

Additional QA checks:
- ZATCA sandbox validation (for finance-related releases)
- RTL visual regression (screenshot comparison)
- Performance check (Lighthouse audit, k6 load tests)
- Security scan (OWASP ZAP)

### Step 3: Release Notes Preparation

Draft release notes following the template in the [Release Plan](../project-management/planning/release-plan.md):

```markdown
# SALIS AUTO v1.2.0 Release Notes

**Release Date:** 2026-09-15
**Environment:** Production

## New Features
- [Feature description] (Story ID)

## Improvements
- [Improvement description] (Story ID)

## Bug Fixes
- [Bug description] (Bug ID)

## ZATCA Updates
- [Any ZATCA-related changes]

## Breaking Changes
- [Any breaking changes, if MAJOR version]

## Known Issues
- [Issues with workarounds]

## Upgrade Notes
- [Database migrations required]
- [Configuration changes needed]
```

### Step 4: Version Bump

Update version numbers in the codebase:

```bash
# Update package.json files
cd app && npm version 1.2.0 --no-git-tag-version
cd ../server && npm version 1.2.0 --no-git-tag-version

# Update CHANGELOG.md with release notes
# Commit version bump
git add -A
git commit -m "chore: bump version to 1.2.0"
```

### Step 5: Build Artifacts

**Frontend bundle:**

```bash
cd app
npm run build    # tsc -b && vite build
# Output: app/dist/ with hashed chunks and code splitting
```

**Backend package:**

```bash
cd server
npm run build    # TypeScript compilation
# Output: server/dist/ with compiled JavaScript
```

### Step 6: Deploy to Staging and Smoke Test

Deploy build artifacts to the staging environment. Run smoke tests against staging:

- Login with multiple roles
- Create and view records across domains
- Verify ZATCA invoice generation (if applicable)
- Test RTL layout in Arabic mode
- Verify health endpoints respond (`/health`, `/ready`)

### Step 7: Deploy to Production

Follow the deployment plan. The frontend deploys to GitHub Pages via `.github/workflows/deploy-pages.yml` (triggered on push to `main`). The backend deploys as a Node.js process with:

1. Database migrations applied first (using `DATABASE_ADMIN_URL` if available)
2. Compiled TypeScript output deployed
3. `npm ci --production` for clean dependencies
4. Environment variables configured per the [Environment Setup](../system/operations/environment-setup.md)

### Step 8: Post-Deployment Verification

After production deployment, verify:

- Health endpoints: `GET /health` (200), `GET /ready` (200)
- Login works for all demo roles
- Critical business paths: create job card, generate invoice, approve estimate
- No elevated error rates in logs
- Response times within acceptable range

### Step 9: Tag Release in Git

```bash
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0

# Merge release branch back to develop
git checkout develop
git merge release/1.2.0
git push origin develop
```

---

## 5. Feature Flags

### 5.1 Active Flags

| Flag Name                    | Domain      | Default | Description                        |
|------------------------------|-------------|---------|------------------------------------|
| `ff_zatca_enabled`           | Finance     | true    | ZATCA e-invoicing                  |
| `ff_ai_diagnostics`          | AI Platform | false   | OBD diagnostic features            |
| `ff_customer_portal`         | Portals     | false   | Customer self-service portal       |
| `ff_supplier_portal`         | Portals     | false   | Supplier portal access             |
| `ff_esignature`              | Portals     | false   | E-signature estimate approval      |
| `ff_loyalty_program`         | CRM         | false   | Loyalty points and tiers           |
| `ff_predictive_maintenance`  | AI Platform | false   | Predictive maintenance scoring     |
| `ff_whatsapp_notifications`  | Notifications| false  | WhatsApp notification channel      |
| `ff_auto_po`                 | Parts       | false   | Auto PO generation at reorder      |
| `ff_multi_branch_transfer`   | Parts       | false   | Stock transfer between branches    |

### 5.2 Flag Naming Convention

```
ff_{domain}_{feature_name}
```

All flags are prefixed with `ff_` and use snake_case. The domain segment groups flags by business area.

### 5.3 Flag Lifecycle

1. **Created**: Developer adds flag in code and configuration.
2. **Development**: `false` in production, `true` in dev/staging.
3. **Beta rollout**: Enabled for specific tenants in production.
4. **General availability**: Enabled for all tenants.
5. **Cleanup**: Flag removed from codebase within 2 sprints of GA.

---

## 6. Rollback Procedures

### 6.1 Rollback Triggers

A release is rolled back if any of the following occur within 4 hours of deployment:

- P1 bug discovered in production
- ZATCA invoice generation fails for any tenant
- Authentication or RBAC bypass detected
- Data integrity issue (cross-tenant data leak, incorrect financial calculations)
- API error rate exceeds 5%
- P95 page load time exceeds 5 seconds

### 6.2 Frontend Rollback

The frontend is a static SPA deployed to GitHub Pages. Rollback by reverting the deployment:

```bash
# Revert to previous commit on main
git revert HEAD
git push origin main
# GitHub Pages workflow deploys the reverted version
```

### 6.3 Backend Rollback

Redeploy the previous version's compiled artifacts. Database migrations are forward-only (see Section 8), so the previous backend version must remain compatible with the current schema.

### 6.4 Rollback Communication

Notify stakeholders within 30 minutes of a rollback decision. Include the reason, affected features, and estimated timeline for the fix.

---

## 7. Hotfix Process

For P1 bugs in production that cannot wait for the next release:

```bash
# 1. Branch from the production tag
git checkout v1.2.0
git checkout -b hotfix/BUG-123-payment-calculation

# 2. Apply the fix
# ... code changes ...

# 3. Test (unit + integration + affected E2E)
cd app && npm test
cd server && npm test

# 4. Code review (expedited: 1 reviewer minimum)
# For ZATCA or security issues, include a domain specialist

# 5. Deploy to staging, smoke test
# 6. Deploy to production

# 7. Tag the hotfix
git tag -a v1.2.1 -m "Hotfix: payment calculation fix (BUG-123)"
git push origin v1.2.1

# 8. Cherry-pick to develop
git checkout develop
git cherry-pick <hotfix-commit-sha>
git push origin develop
```

---

## 8. Database Migrations in Releases

### 8.1 Forward-Only Migrations

All database migrations are forward-only. There are no "down" migrations. This prevents data loss from rollback scripts that cannot anticipate production data.

### 8.2 Backward Compatibility Window

When a release includes schema changes, maintain backward compatibility for one release cycle:

1. **Release N**: Add new columns as nullable, deploy new code that writes to both old and new columns.
2. **Release N+1**: Migrate data, make new columns non-nullable, remove old column references from code.

### 8.3 Migration Execution in Deployment

Migrations run before the application starts, using `DATABASE_ADMIN_URL` (elevated privileges) when available, falling back to `DATABASE_URL`. The key migration `0001_rls.sql` applies RLS policies to all 53 tenant tables.

```bash
cd server
npx drizzle-kit migrate    # Apply pending migrations
```

---

## 9. Post-Release Monitoring

### 9.1 Error Rate Monitoring

Monitor structured JSON logs (Pino) for elevated error rates in the first 4 hours after deployment:

| Metric                    | Threshold        | Action                  |
|---------------------------|------------------|-------------------------|
| 5xx error rate            | > 1%             | Investigate immediately |
| 5xx error rate            | > 5%             | Trigger rollback        |
| P95 response time         | > 2s             | Investigate             |
| P95 page load time        | > 5s             | Trigger rollback        |
| Auth failure rate         | > 10%            | Investigate token issues|

### 9.2 Health Check Monitoring

Verify health endpoints continuously after deployment:

```bash
# Liveness (never touches DB)
curl -f http://api.salisauto.com/health

# Readiness (tests DB connection)
curl -f http://api.salisauto.com/ready
```

### 9.3 Key Business Metrics

After a release, verify these business operations work end-to-end:

- Job card creation and lifecycle transitions (check-in > repair > QC > delivery)
- Invoice generation and ZATCA compliance
- Estimate approval workflow (SOD enforcement)
- Customer and vehicle CRUD operations
- Parts inventory movements

---

## 10. Release Communication

### 10.1 Internal Announcement

Before production deployment, notify the team:

- What is being released (version, key changes)
- When the deployment window is
- Who is on call for issues
- Rollback plan if problems arise

### 10.2 Customer Release Notes

For minor and major releases, prepare customer-facing release notes:

- New features available (with screenshots if applicable)
- Improvements to existing workflows
- Any required actions from workshop administrators
- Known issues and workarounds

### 10.3 Deployment Window

Production deployments should target low-traffic periods. Coordinate with the operations team to schedule a maintenance window if the release includes database migrations or breaking changes.

---

## Related Documents

- [Release Plan](../project-management/planning/release-plan.md)
- [Local Development Guide](./local-development.md)
- [Debugging Guide](./debugging-guide.md)
- [DevOps Guide](../system/operations/devops-guide.md)
- [Environment Setup](../system/operations/environment-setup.md)
- [Frontend Architecture](../system/architecture/frontend-architecture.md)
- [Backend Architecture](../system/architecture/backend-architecture.md)
