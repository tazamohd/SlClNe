# SALIS AUTO -- Risk Register

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-005                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document identifies, assesses, and plans responses for risks that could impact the SALIS AUTO project's scope, schedule, cost, or quality. It is maintained throughout the project lifecycle and reviewed at every sprint retrospective.

---

## 2. Risk Assessment Framework

### 2.1 Probability Scale

| Level      | Score | Description                              |
|------------|-------|------------------------------------------|
| Rare       | 1     | < 10% chance of occurrence               |
| Unlikely   | 2     | 10--30% chance                           |
| Possible   | 3     | 30--50% chance                           |
| Likely     | 4     | 50--70% chance                           |
| Almost Certain | 5 | > 70% chance                             |

### 2.2 Impact Scale

| Level        | Score | Schedule Impact    | Cost Impact       | Quality Impact          |
|--------------|-------|--------------------|-------------------|-------------------------|
| Negligible   | 1     | < 1 day            | < SAR 5,000       | Cosmetic only           |
| Minor        | 2     | 1--5 days          | SAR 5,000--20,000 | Minor defects           |
| Moderate     | 3     | 1--2 sprints       | SAR 20,000--50,000| Feature degradation     |
| Major        | 4     | 2--4 sprints       | SAR 50,000--150,000| Critical feature gap   |
| Catastrophic | 5     | > 4 sprints        | > SAR 150,000     | Go-live blocked         |

### 2.3 Risk Score Matrix

Risk Score = Probability x Impact. Classification:

| Score Range | Classification | Action                                 |
|-------------|----------------|----------------------------------------|
| 1--4        | Low            | Accept and monitor                     |
| 5--9        | Medium         | Active mitigation plan required        |
| 10--15      | High           | Escalate to PM, dedicated mitigation   |
| 16--25      | Critical       | Escalate to sponsor, immediate action  |

---

## 3. Risk Register

### 3.1 Technical Risks

| Risk ID | Risk Description | Prob | Impact | Score | Category | Response Strategy | Owner | Status |
|---------|-----------------|------|--------|-------|----------|-------------------|-------|--------|
| R-T01 | ZATCA Phase 2 API specification changes during development, requiring rework of XML builder, QR encoding, and hash chain logic | 4 | 4 | 16 | Critical | **Mitigate:** Isolate ZATCA logic behind adapter interface; subscribe to ZATCA developer updates; maintain sandbox test suite that runs nightly | Tech Lead | Open |
| R-T02 | PGlite-to-PostgreSQL migration reveals schema incompatibilities in production-scale data | 3 | 3 | 9 | Medium | **Mitigate:** Run weekly migration rehearsals with synthetic data from Sprint 6 onward; maintain Drizzle migration scripts as single source of truth | DBA | Open |
| R-T03 | Triple-layer RBAC (JWT + UI + API + RLS) introduces performance degradation on complex queries | 3 | 3 | 9 | Medium | **Mitigate:** Benchmark RLS policies early (Sprint 3); cache permission checks in React Query; add database indexes on org_id + branch_id | Tech Lead | Open |
| R-T04 | RTL layout breaks in complex components (data tables, charts, form wizards) | 4 | 2 | 8 | Medium | **Mitigate:** RTL visual regression tests from Sprint 1; use logical CSS properties (inline-start/end); TailwindCSS RTL plugin as foundation | Frontend Lead | Open |
| R-T05 | Job lifecycle state machine edge cases cause orphaned jobs or invalid state transitions | 3 | 4 | 12 | High | **Mitigate:** Formal state machine definition with guard conditions; exhaustive Vitest unit tests for every transition; state machine visualization in docs | Tech Lead | Open |
| R-T06 | React Router 7 + TanStack Query interaction causes stale cache on role-scoped data switches | 2 | 2 | 4 | Low | **Accept:** Document query key conventions including role/branch scope; implement cache invalidation on role context change | Frontend Lead | Open |
| R-T07 | i18n key coverage drifts; new screens ship without Arabic translations | 4 | 3 | 12 | High | **Mitigate:** CI lint rule that fails build on missing i18n keys; translation coverage report in PR checks | Frontend Lead | Open |

### 3.2 Regulatory and Compliance Risks

| Risk ID | Risk Description | Prob | Impact | Score | Category | Response Strategy | Owner | Status |
|---------|-----------------|------|--------|-------|----------|-------------------|-------|--------|
| R-C01 | ZATCA rejects production certification due to hash chain or XML format issues | 3 | 5 | 15 | High | **Mitigate:** Start sandbox testing in Sprint 9; engage ZATCA-certified consultant for pre-audit; maintain regression suite of 50+ invoice scenarios | Finance Lead | Open |
| R-C02 | Saudi VAT rate changes from 15%, requiring tax engine modification | 2 | 3 | 6 | Medium | **Mitigate:** Parameterize VAT rate in tenant configuration rather than hardcode; store historical rates for invoice reprinting | Tech Lead | Open |
| R-C03 | Separation-of-duties enforcement gaps discovered during audit | 2 | 4 | 8 | Medium | **Mitigate:** Automated SoD checks in API middleware; audit log every permission override; quarterly SoD compliance report | Security Lead | Open |
| R-C04 | Data residency requirements mandate Saudi-hosted infrastructure | 2 | 4 | 8 | Medium | **Mitigate:** Architecture designed for cloud-agnostic deployment; evaluate Saudi cloud regions (AWS Bahrain, Oracle Jeddah) as fallback | DevOps Lead | Open |

### 3.3 Organizational and Resource Risks

| Risk ID | Risk Description | Prob | Impact | Score | Category | Response Strategy | Owner | Status |
|---------|-----------------|------|--------|-------|----------|-------------------|-------|--------|
| R-O01 | Key developer attrition mid-project, especially ZATCA or RBAC specialists | 3 | 4 | 12 | High | **Mitigate:** Cross-training on all critical modules; pair programming on ZATCA and RBAC; comprehensive code documentation | PM | Open |
| R-O02 | Arabic translation quality is poor, causing user confusion | 3 | 3 | 9 | Medium | **Mitigate:** Engage native Arabic speaker for review; use automotive-specific glossary; UAT with Arabic-primary users | PO | Open |
| R-O03 | Stakeholder scope creep through informal feature requests | 4 | 3 | 12 | High | **Mitigate:** Enforce scope change control process (see [Scope Statement](scope-statement.md)); all requests through Product Owner; CCB for changes > 3 SP | PM | Open |
| R-O04 | Workshop owners resist adoption due to process change | 3 | 3 | 9 | Medium | **Mitigate:** Early pilot with 2--3 workshops; role-based training program; champion program with incentives | PO | Open |

### 3.4 Integration and External Risks

| Risk ID | Risk Description | Prob | Impact | Score | Category | Response Strategy | Owner | Status |
|---------|-----------------|------|--------|-------|----------|-------------------|-------|--------|
| R-I01 | SMS/WhatsApp gateway provider (Twilio or equivalent) has service disruption, blocking OTP and notifications | 3 | 3 | 9 | Medium | **Mitigate:** Abstract notification behind channel adapter; configure fallback provider; implement retry with exponential backoff | Backend Lead | Open |
| R-I02 | Customer e-signature (OTP + canvas) flow has usability issues on mobile browsers | 3 | 3 | 9 | Medium | **Mitigate:** Mobile-first design for signature canvas; test on top 5 Saudi mobile browsers; fallback to typed name confirmation | UX Lead | Open |
| R-I03 | OBD diagnostic 5-desk handoff chain introduces latency and data loss between desks | 2 | 3 | 6 | Medium | **Mitigate:** Event-sourced handoff log; optimistic UI updates; websocket for real-time desk notifications | Tech Lead | Open |
| R-I04 | Multi-tenant onboarding (3 paths) has edge cases in branch configuration | 3 | 2 | 6 | Medium | **Mitigate:** Automated onboarding E2E tests for all 3 paths; seed data validation script; rollback procedure for failed onboarding | Backend Lead | Open |

### 3.5 Deployment and Operations Risks

| Risk ID | Risk Description | Prob | Impact | Score | Category | Response Strategy | Owner | Status |
|---------|-----------------|------|--------|-------|----------|-------------------|-------|--------|
| R-D01 | Static hosting (GitHub Pages/Vercel/Netlify) limitations block required server features | 2 | 3 | 6 | Medium | **Mitigate:** Strict SPA architecture; API deployed separately; validate all hosting targets in Sprint 1 | DevOps Lead | Open |
| R-D02 | Database migration fails during production cutover, causing data loss | 2 | 5 | 10 | High | **Mitigate:** Rehearse migration 3 times before go-live; point-in-time backup before cutover; automated rollback script; see [Migration Plan](../planning/migration-plan.md) | DBA | Open |
| R-D03 | Go-live performance issues under production load | 3 | 4 | 12 | High | **Mitigate:** Load test with k6 at 2x expected users; performance budget per API endpoint; CDN for static assets; see [Capacity Rollback Plan](../planning/capacity-rollback-plan.md) | DevOps Lead | Open |

---

## 4. Risk Heatmap Summary

|                  | Negligible (1) | Minor (2) | Moderate (3) | Major (4)  | Catastrophic (5) |
|------------------|----------------|-----------|--------------|------------|-------------------|
| **Almost Certain (5)** |          |           |              |            |                   |
| **Likely (4)**         |          | R-T04     | R-T07, R-O03 | R-T01      |                   |
| **Possible (3)**       |          | R-I04, R-T06* | R-O02, R-O04, R-I01, R-I02, R-T02, R-T03 | R-T05, R-O01, R-D03 | R-C01 |
| **Unlikely (2)**       |          |           | R-C02, R-I03, R-D01 | R-C03, R-C04 | R-D02       |
| **Rare (1)**           |          |           |              |            |                   |

*R-T06 is scored 4 (Low) and is accepted.

---

## 5. Risk Review Schedule

| Event                    | Frequency   | Participants                      |
|--------------------------|-------------|-----------------------------------|
| Daily standup            | Daily       | Dev team (flag new risks)         |
| Sprint retrospective     | Biweekly    | Scrum team (review risk register) |
| Risk review meeting      | Monthly     | PM, Tech Lead, PO, QA Lead       |
| Sponsor risk briefing    | Quarterly   | PM, Executive Sponsor             |

---

## 6. Risk Response Strategies

### 6.1 Avoid

Eliminate the threat by changing the project plan. Used when the risk is unacceptable and can be prevented.

- **R-T01 (ZATCA spec changes):** Cannot be fully avoided since ZATCA controls the specification, but the adapter pattern isolates blast radius.

### 6.2 Mitigate

Reduce probability or impact to an acceptable level. This is the primary strategy for most SALIS AUTO risks.

| Risk ID | Mitigation Action                                      | Cost (SP) | Owner       |
|---------|-------------------------------------------------------|-----------|-------------|
| R-T01   | Adapter interface for ZATCA logic; nightly sandbox CI | 8         | Tech Lead   |
| R-T02   | Weekly migration rehearsals from Sprint 6 onward      | 3/sprint  | DBA         |
| R-T03   | Benchmark RLS in Sprint 3; permission caching         | 5         | Tech Lead   |
| R-T05   | Formal state machine definition with guard conditions | 8         | Tech Lead   |
| R-T07   | CI lint rule for missing i18n keys                    | 3         | Frontend    |
| R-C01   | ZATCA consultant pre-audit; 50+ invoice test suite    | 13        | Finance     |
| R-O01   | Pair programming on critical modules; docs            | 5/sprint  | PM          |
| R-O03   | Scope change control process; CCB enforcement         | 0         | PM          |
| R-D02   | 3x migration rehearsals; automated rollback script    | 8         | DBA         |
| R-D03   | k6 load test at 2x expected; perf budget per endpoint | 8         | DevOps      |

### 6.3 Transfer

Shift the risk impact to a third party.

- **R-I01 (SMS gateway disruption):** Contract with SMS provider includes SLA guarantees and credits; configure backup provider for failover.
- **R-C04 (Data residency):** Cloud provider contractually guarantees data stays in designated region.

### 6.4 Accept

Acknowledge the risk and prepare a contingency plan without proactive action.

- **R-T06 (React Query stale cache):** Low score (4). Document query key conventions; fix reactively if encountered.
- **R-C02 (VAT rate change):** VAT is parameterized in config; change requires a config update, not code change.

---

## 7. Risk Monitoring Indicators

Early warning indicators that a risk is materializing:

| Risk ID | Leading Indicator                                        | Monitoring Method          |
|---------|----------------------------------------------------------|----------------------------|
| R-T01   | ZATCA publishes draft specification update               | ZATCA developer portal RSS |
| R-T03   | RLS query times exceeding 200ms in staging               | APM dashboard              |
| R-T05   | QA reports orphaned jobs or unexpected state transitions  | Playwright E2E failures    |
| R-T07   | i18n CI lint warnings trending upward                    | Sprint metrics             |
| R-C01   | ZATCA sandbox returns new validation error codes         | Nightly CI report          |
| R-O01   | Team member gives notice or requests transfer             | HR notification            |
| R-O03   | Informal feature requests increasing in Slack            | Scrum Master observation   |
| R-D03   | API P95 response time increasing sprint over sprint      | APM trend charts           |

---

## 8. Contingency Budget

A risk contingency reserve of 15% of the total project budget (SAR 249,150) is allocated. Drawdowns require PM approval for Medium risks and Sponsor approval for High/Critical risks.

| Reserve Allocation          | Amount (SAR) | Trigger                                 |
|-----------------------------|--------------|----------------------------------------|
| ZATCA re-certification      | 60,000       | Spec change requiring rework            |
| Staff augmentation          | 80,000       | Key developer departure                 |
| Infrastructure scaling      | 40,000       | Performance issues requiring upgrade    |
| Security remediation        | 30,000       | Pen test findings requiring rework      |
| Unallocated                 | 39,150       | Unanticipated risks                     |

---

## 9. Escalation Thresholds

| Risk Score | Escalation Target      | Response Time |
|------------|------------------------|---------------|
| Low (1--4) | Team lead              | Next standup  |
| Medium (5--9) | Project Manager     | Within 2 days |
| High (10--15) | PM + Sponsor        | Within 1 day  |
| Critical (16--25) | Sponsor + CCB   | Immediate     |

---

## 10. References

- [Project Charter](project-charter.md)
- [Scope Statement](scope-statement.md)
- [Schedule Management Plan](schedule-management.md)
- [Migration Plan](../planning/migration-plan.md)
- [Capacity Rollback Plan](../planning/capacity-rollback-plan.md)
- [Test Plan](../planning/test-plan.md)
