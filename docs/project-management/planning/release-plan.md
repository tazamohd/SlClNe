# SALIS AUTO -- Release Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PLN-001                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the release strategy for SALIS AUTO, including versioning conventions, feature flags, release cadence, rollout schedule, and the criteria for promoting code from development through staging to production.

---

## 2. Versioning Strategy

### 2.1 Semantic Versioning

SALIS AUTO follows Semantic Versioning (SemVer):

```
MAJOR.MINOR.PATCH
```

| Component | Increment When                                               | Example          |
|-----------|--------------------------------------------------------------|------------------|
| MAJOR     | Breaking API changes or fundamental architecture shifts      | 1.0.0 -> 2.0.0  |
| MINOR     | New domain or feature added (backward compatible)            | 1.0.0 -> 1.1.0  |
| PATCH     | Bug fixes, security patches, minor improvements              | 1.1.0 -> 1.1.1  |

### 2.2 Pre-Release Tags

| Tag       | Purpose                          | Example        |
|-----------|----------------------------------|----------------|
| `-alpha`  | Internal testing only            | 1.0.0-alpha.1  |
| `-beta`   | Staging environment, UAT ready   | 1.0.0-beta.1   |
| `-rc`     | Release candidate, production-ready pending final sign-off | 1.0.0-rc.1 |

---

## 3. Release Cadence

### 3.1 During Development (Pre-Launch)

| Release Type     | Frequency         | Target Environment | Purpose                       |
|------------------|-------------------|--------------------|-------------------------------|
| Dev build        | Every merged PR   | Development        | Continuous integration         |
| Alpha release    | End of each sprint | Staging           | Sprint demo and internal test  |
| Beta release     | End of each stage | Staging            | Stage gate review              |
| Release candidate | Pre-go-live      | Staging + UAT      | Final validation               |
| Production       | Go-live (Week 52) | Production         | Customer-facing release        |

### 3.2 Post-Launch

| Release Type     | Frequency         | Purpose                                    |
|------------------|-------------------|--------------------------------------------|
| Patch release    | As needed         | Critical bug fixes, security patches       |
| Minor release    | Monthly           | Feature additions, improvements            |
| Major release    | Quarterly         | Significant new capabilities               |

---

## 4. Release Plan by Stage

### 4.1 Pre-Launch Releases

| Version       | Stage              | Sprint | Content                                          |
|---------------|--------------------|--------|--------------------------------------------------|
| 0.1.0-alpha   | Foundation         | S3     | Auth + RBAC + i18n framework                     |
| 0.2.0-alpha   | Core: Workshop     | S6     | Workshop lifecycle (Check-In through Delivery)   |
| 0.3.0-alpha   | Core: Registry     | S7     | Customer + Vehicle CRUD + Saudi validations      |
| 0.4.0-alpha   | Core: Finance      | S10    | Invoicing + ZATCA sandbox integration            |
| 0.5.0-alpha   | Core: Accounting   | S11    | Chart of accounts + journal entries               |
| 0.6.0-alpha   | Core: Parts        | S12    | Inventory + PO lifecycle + approval chain         |
| 0.7.0-beta    | Extended           | S17    | CRM, AI, Call Center, HR, Portals                 |
| 0.8.0-beta    | Integration        | S20    | ZATCA prod cert + notifications + reports         |
| 0.9.0-beta    | Testing            | S22    | All tests passing, security hardened              |
| 1.0.0-rc.1    | Deployment         | S23    | Release candidate for UAT                         |
| **1.0.0**     | **Go-Live**        | S23    | **Production release**                            |

### 4.2 Planned Post-Launch Releases

| Version | Target      | Content                                              |
|---------|-------------|------------------------------------------------------|
| 1.1.0   | Go-live +4w | Post-launch fixes, performance tuning, UX polish     |
| 1.2.0   | Go-live +8w | Customer feedback-driven improvements                 |
| 1.3.0   | Go-live +12w| Additional report types, dashboard enhancements       |
| 2.0.0   | Phase 2     | Native mobile app, offline mode, multi-currency       |

---

## 5. Feature Flags

### 5.1 Feature Flag Strategy

Feature flags enable progressive rollout and safe deployment of incomplete or experimental features.

| Flag Purpose            | Implementation                                      |
|-------------------------|-----------------------------------------------------|
| Domain enablement       | Toggle entire domains per tenant                    |
| Feature rollout         | Gradual percentage-based rollout                    |
| Kill switch             | Instantly disable a feature in production           |
| A/B testing             | Split traffic between feature variants              |

### 5.2 Active Feature Flags

| Flag Name                  | Domain          | Type       | Default | Description                           |
|----------------------------|-----------------|------------|---------|---------------------------------------|
| `ff_zatca_enabled`         | Finance         | Boolean    | true    | Enable/disable ZATCA e-invoicing      |
| `ff_ai_diagnostics`        | AI Platform     | Boolean    | false   | OBD diagnostic features               |
| `ff_customer_portal`       | Portals         | Boolean    | false   | Customer self-service portal           |
| `ff_supplier_portal`       | Portals         | Boolean    | false   | Supplier portal access                 |
| `ff_esignature`            | Portals         | Boolean    | false   | E-signature estimate approval          |
| `ff_loyalty_program`       | CRM             | Boolean    | false   | Loyalty points and tiers               |
| `ff_predictive_maintenance`| AI Platform     | Boolean    | false   | Predictive maintenance scoring         |
| `ff_whatsapp_notifications`| Notifications   | Boolean    | false   | WhatsApp channel for notifications     |
| `ff_auto_po`               | Parts           | Boolean    | false   | Automatic PO generation at reorder     |
| `ff_multi_branch_transfer` | Parts           | Boolean    | false   | Stock transfer between branches        |

### 5.3 Feature Flag Lifecycle

1. **Created:** Developer adds flag in code and config.
2. **Development:** Flag is `false` in production, `true` in dev/staging.
3. **Beta rollout:** Flag enabled for specific tenants in production.
4. **General availability:** Flag enabled for all tenants.
5. **Cleanup:** Flag removed from codebase; feature is always on.

Flag cleanup must happen within 2 sprints of general availability.

---

## 6. Rollout Strategy

### 6.1 Production Rollout Phases

| Phase              | Scope                     | Duration | Success Criteria                     |
|--------------------|---------------------------|----------|--------------------------------------|
| Internal dogfooding | Development team only     | 1 week   | No P1/P2 bugs in daily use          |
| Pilot              | 2--3 selected workshops   | 2 weeks  | >= 90% satisfaction; < 5 P3 bugs     |
| Early access       | 10--15 workshops          | 2 weeks  | Stable performance under load        |
| General availability | All onboarded workshops | Ongoing  | SLA metrics met                      |

### 6.2 Rollout Decision Gates

| Gate                  | Decision Maker    | Go/No-Go Criteria                          |
|-----------------------|-------------------|--------------------------------------------|
| Internal -> Pilot     | Project Manager   | Zero P1 bugs; all critical paths tested    |
| Pilot -> Early Access | PO + PM           | Pilot feedback incorporated; < 3 P2 bugs  |
| Early -> GA           | Executive Sponsor | SLA targets met; UAT >= 85% pass rate      |

---

## 7. Release Process

### 7.1 Release Checklist

| Step | Activity                                        | Owner     | Verification               |
|------|-------------------------------------------------|-----------|-----------------------------|
| 1    | Feature freeze (no new features in release branch) | TL     | Branch protection rules     |
| 2    | Full regression suite (Vitest + Supertest + PW) | QA        | All tests green             |
| 3    | ZATCA sandbox validation (Finance releases)     | Finance   | Zero validation errors      |
| 4    | RTL visual regression                           | QA        | Screenshot comparison pass  |
| 5    | Performance check (Lighthouse + k6)             | DevOps    | Scores within tolerance     |
| 6    | Security scan (OWASP ZAP)                       | Security  | Zero critical/high          |
| 7    | Release notes drafted                           | PO        | Reviewed by PM              |
| 8    | Staging deployment                              | DevOps    | Smoke tests pass            |
| 9    | UAT sign-off (if applicable)                    | PO        | Pass rate >= 85%            |
| 10   | Production deployment                           | DevOps    | [Deployment Plan](deployment-plan.md) |
| 11   | Post-deployment smoke test                      | QA        | Critical paths verified     |
| 12   | Release announcement                            | PM        | Sent to all stakeholders    |

### 7.2 Hotfix Process

For P1 bugs in production:

1. Branch from production tag: `hotfix/[BUG-ID]-description`.
2. Fix and test (unit + integration + affected E2E).
3. Code review (expedited: 1 reviewer, ZATCA/security specialist if relevant).
4. Deploy to staging, smoke test.
5. Deploy to production.
6. Cherry-pick fix to main branch.
7. Increment PATCH version (e.g., 1.0.0 -> 1.0.1).

---

## 8. Release Notes Template

```
# SALIS AUTO v[X.Y.Z] Release Notes

**Release Date:** [Date]
**Environment:** Production / Staging

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
- [Any known issues with workarounds]

## Upgrade Notes
- [Database migrations required]
- [Configuration changes needed]
```

---

## 9. Rollback Triggers

A release is rolled back if any of the following occur within 4 hours of deployment:

- P1 bug discovered in production.
- ZATCA invoice generation fails for any tenant.
- Authentication or RBAC bypass detected.
- Data integrity issue (cross-tenant data leak, incorrect financial calculations).
- API error rate exceeds 5%.
- Page load time exceeds 5 seconds for P95.

Rollback procedure is defined in the [Capacity Rollback Plan](capacity-rollback-plan.md).

---

## 10. References

- [Deployment Plan](deployment-plan.md)
- [Capacity Rollback Plan](capacity-rollback-plan.md)
- [Test Plan](test-plan.md)
- [Schedule Management Plan](../pmp/schedule-management.md)
- [Definition of Done](../agile/definition-of-done.md)
- [Quality Register](../prince2/quality-register.md)
