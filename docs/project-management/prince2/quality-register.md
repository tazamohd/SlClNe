# SALIS AUTO -- Quality Register

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PR2-005                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the quality expectations, acceptance criteria, quality review schedule, and quality tracking for all SALIS AUTO deliverables. It serves as the living record of quality activities throughout the project and is updated at each sprint boundary.

---

## 2. Quality Expectations

### 2.1 Customer Quality Expectations

| Stakeholder          | Expectation                                                    |
|----------------------|----------------------------------------------------------------|
| Owner/CEO            | Reliable cross-branch data; ZATCA compliant; professional look |
| Branch Manager       | Fast, intuitive interface; accurate financial reports          |
| Service Advisor      | Quick job creation; mobile-friendly; responsive                |
| Technician           | Simple mobile view; easy time logging                          |
| Customer             | Transparent repair tracking; easy estimate approval            |
| ZATCA                | Full Phase 2 compliance with correct XML, QR, hash chain       |

### 2.2 Project Quality Standards

| Standard              | Target                                                  |
|-----------------------|---------------------------------------------------------|
| Code quality          | TypeScript strict mode; ESLint zero warnings; Prettier  |
| Test coverage (unit)  | >= 80% line coverage (Vitest)                           |
| Test coverage (integ) | >= 70% route coverage (Supertest)                       |
| E2E coverage          | 100% of critical paths (Playwright)                     |
| Performance (API)     | P95 response time < 500ms                               |
| Performance (UI)      | Lighthouse score >= 80                                  |
| Accessibility         | WCAG 2.1 AA compliance                                  |
| Security              | OWASP Top 10 addressed; zero critical/high pen test     |
| i18n completeness     | 100% EN/AR key coverage                                 |
| RTL correctness       | Zero critical layout issues in AR mode                  |
| ZATCA compliance      | Sandbox + production certification                       |
| Uptime (post-launch)  | 99.5% in first 90 days                                  |

---

## 3. Quality Criteria by Product

### 3.1 Authentication (PD-01)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| JWT follows RFC 7519 structure                      | Unit test           | Every PR    | Backend   |
| Refresh token rotation prevents replay              | Integration test    | Every PR    | Backend   |
| MFA OTP expires after 5 minutes                     | Unit test           | Every PR    | Backend   |
| Login form validates +966 phone format              | Unit test + E2E     | Every PR    | Frontend  |
| Brute-force protection (5 attempts, 15-min lockout) | Integration test    | Every PR    | Backend   |

### 3.2 RBAC (PD-02)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| Each of 14 roles accesses only permitted modules     | Integration test    | Every PR    | Backend   |
| Tenant isolation: cross-org data access blocked      | Penetration test    | Per release | Security  |
| 6 SoD pairs: conflicting actions prevented           | Integration test    | Every PR    | Backend   |
| 7 redaction rules: fields return null/masked         | Integration test    | Every PR    | Backend   |
| 8 data scopes filter correctly                       | Integration test    | Every PR    | Backend   |

### 3.3 Workshop (PD-05)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| State machine rejects invalid transitions (422)      | Unit test           | Every PR    | Backend   |
| Every state transition creates audit log entry       | Integration test    | Every PR    | Backend   |
| Check-in through Delivery E2E completes              | Playwright E2E      | Nightly     | QA        |
| Bay management shows real-time occupancy             | Manual test         | Per sprint  | QA        |

### 3.4 Finance & ZATCA (PD-07)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| Invoice amounts stored as integer halalas            | Unit test           | Every PR    | Backend   |
| No floating-point operations in monetary paths       | Static analysis     | Every PR    | Backend   |
| VAT calculated at exactly 15%                        | Unit test           | Every PR    | Backend   |
| ZATCA XML validates against UBL 2.1 schema          | ZATCA sandbox       | Nightly     | Finance   |
| QR code TLV encoding matches specification          | Unit test           | Every PR    | Backend   |
| Hash chain links each invoice to predecessor         | Integration test    | Every PR    | Backend   |
| ZATCA clearance response received without error      | ZATCA sandbox       | Nightly     | Finance   |

### 3.5 Portals (PD-14)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| 6-step e-signature completes end-to-end             | Playwright E2E      | Nightly     | QA        |
| OTP delivered within 60 seconds                     | Integration test    | Per sprint  | Backend   |
| Canvas signature renders on mobile browsers          | Manual test         | Per sprint  | QA        |
| Supplier portal works without full platform login    | Integration test    | Every PR    | Backend   |

### 3.6 Notification Engine (PD-15)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| In-app notification delivered in real-time           | Integration test    | Every PR    | Backend   |
| SMS delivery confirmed via gateway callback          | Integration test    | Per sprint  | Backend   |
| User channel preference respected                    | Unit test           | Every PR    | Backend   |
| Failed delivery retried with exponential backoff     | Unit test           | Every PR    | Backend   |

### 3.7 Approval Chain (PD-16)

| Criterion                                           | Method              | Frequency    | Owner     |
|-----------------------------------------------------|---------------------|-------------|-----------|
| SAR 5,000 routes to Manager (not auto-approved by Advisor) | Integration test | Every PR | Backend |
| SAR 50,001 routes to Owner after Manager             | Integration test    | Every PR    | Backend   |
| Boundary values (exact limit amounts) handled correctly | Unit test         | Every PR    | Backend   |
| Rejection returns PO/estimate to requester           | Integration test    | Every PR    | Backend   |

---

## 4. Quality Review Schedule

### 4.1 Continuous Quality Activities

| Activity                    | Tool / Method          | Trigger           | Owner      |
|-----------------------------|------------------------|-------------------|------------|
| Linting                     | ESLint                 | Every commit      | CI         |
| Type checking               | TypeScript compiler    | Every commit      | CI         |
| Formatting                  | Prettier               | Every commit      | CI         |
| Unit tests                  | Vitest                 | Every PR          | CI         |
| Integration tests           | Supertest              | Every PR          | CI         |
| i18n key coverage           | Custom lint rule       | Every PR          | CI         |
| Code review                 | GitHub PRs             | Every PR          | Team       |

### 4.2 Sprint-Level Quality Activities

| Activity                        | Tool / Method             | When              | Owner      |
|---------------------------------|---------------------------|-------------------|------------|
| E2E critical path tests         | Playwright                | Nightly           | QA         |
| RTL visual regression           | Playwright screenshots    | Pre-sprint-review | QA         |
| ZATCA sandbox validation        | ZATCA API                 | Nightly (Finance) | Finance    |
| Accessibility check             | axe-core                  | Per new screen    | QA         |
| Performance check               | Lighthouse                | Per sprint        | DevOps     |
| Sprint DoD audit                | Checklist review          | Sprint review day | SM + QA    |

### 4.3 Stage-Level Quality Activities

| Activity                        | Tool / Method             | When              | Owner      |
|---------------------------------|---------------------------|-------------------|------------|
| Security scan                   | OWASP ZAP                 | Per stage gate    | Security   |
| Penetration test (RBAC)         | Manual + automated        | G3, G7            | Security   |
| Load test                       | k6                        | G6, G7            | DevOps     |
| ZATCA certification submission  | ZATCA portal              | G6                | Finance    |
| Full RTL audit (all screens)    | Manual + Playwright       | G7                | QA + UX    |
| WCAG 2.1 AA audit               | axe-core + manual         | G7                | QA         |

### 4.4 Release-Level Quality Activities

| Activity                        | Tool / Method             | When              | Owner      |
|---------------------------------|---------------------------|-------------------|------------|
| Full regression suite           | Vitest + Supertest + PW   | Pre-release       | QA         |
| UAT                             | Manual (role-based)       | G8                | PO + QA    |
| Deployment smoke test           | Playwright                | Post-deploy       | DevOps     |
| Data migration validation       | Row count + checksum      | Post-migration    | DBA        |

---

## 5. Quality Log

This section is populated as quality activities are performed. Each entry records the result.

### 5.1 Log Template

| Entry ID | Date | Product | Activity | Result | Defects Found | Action Taken | Owner |
|----------|------|---------|----------|--------|---------------|-------------|-------|
| Q-001    |      |         |          |        |               |             |       |

### 5.2 Quality Metrics Dashboard

Track the following metrics per sprint:

| Metric                        | Target         | Sprint N Actual | Trend |
|-------------------------------|----------------|-----------------|-------|
| Unit test coverage            | >= 80%         |                 |       |
| Integration test coverage     | >= 70%         |                 |       |
| E2E tests passing             | 100%           |                 |       |
| Open P1 bugs                  | 0              |                 |       |
| Open P2 bugs                  | <= 3           |                 |       |
| i18n key coverage (EN)        | 100%           |                 |       |
| i18n key coverage (AR)        | 100%           |                 |       |
| RTL issues (open)             | 0 critical     |                 |       |
| Lighthouse score              | >= 80          |                 |       |
| ZATCA sandbox pass rate       | 100%           |                 |       |
| Security findings (crit/high) | 0              |                 |       |

---

## 6. Defect Classification

| Priority | Definition                                    | Resolution SLA    |
|----------|-----------------------------------------------|-------------------|
| P1       | System crash, data loss, security breach       | Fix within 4 hours|
| P2       | Major feature broken, no workaround            | Fix within 24 hours|
| P3       | Feature partially broken, workaround available | Fix within sprint |
| P4       | Cosmetic issue, minor UX problem               | Backlog           |

### 6.1 Defect Workflow

```
Open -> In Analysis -> In Fix -> In Test -> Verified -> Closed
                                        \-> Reopened -> In Fix
```

---

## 7. Acceptance Criteria Summary

| Deliverable                   | Acceptance Authority | Criteria Source                         |
|-------------------------------|----------------------|-----------------------------------------|
| Sprint increment              | Product Owner        | Story acceptance criteria + DoD         |
| Stage deliverable             | Project Board        | Stage exit criteria (Stage Plans)       |
| ZATCA compliance              | ZATCA authority      | ZATCA Phase 2 specification             |
| Security posture              | Security Lead        | OWASP Top 10 + pen test report          |
| Final release                 | Executive Sponsor    | UAT >= 85% pass rate                    |

---

## 8. Quality Improvement Process

1. **Retrospective input:** Quality issues are raised in sprint retrospectives.
2. **Root cause analysis:** Recurring defect patterns trigger RCA.
3. **DoD updates:** Quality improvements are codified in the [Definition of Done](../agile/definition-of-done.md).
4. **Quality gate tightening:** If a stage gate reveals systematic issues, tolerance thresholds are tightened for subsequent stages.
5. **Training:** Skill gaps (e.g., RTL best practices, ZATCA XML) trigger team training sessions.

---

## 9. References

- [Definition of Done](../agile/definition-of-done.md)
- [Product Descriptions](product-descriptions.md)
- [Test Plan](../planning/test-plan.md)
- [Stage Plans](stage-plans.md)
- [Risk Register](../pmp/risk-register.md)
- [Communication Plan](../pmp/communication-plan.md)
