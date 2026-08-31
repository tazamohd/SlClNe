# SALIS AUTO -- Quality Management Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-MGT-008                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Quality Policy Statement

SALIS AUTO is committed to delivering a reliable, secure, and user-friendly automotive
workshop management platform that meets or exceeds the expectations of workshop operators,
technicians, and administrators across Saudi Arabia. Our quality management system is
aligned with ISO 9001:2015 principles and tailored for a multi-tenant SaaS environment
spanning 13 domains, 191+ screens, 14 roles, and 28 RBAC modules.

**Quality principles:**

1. **Customer focus** -- Every quality decision prioritizes the workshop operator experience
   across all 14 roles and bilingual (EN/AR) interfaces.
2. **Evidence-based decisions** -- Quality metrics are measured, tracked, and acted upon
   through automated dashboards and structured reviews.
3. **Continuous improvement** -- Retrospectives, kaizen events, and trend analysis drive
   process refinement every sprint.
4. **Regulatory compliance** -- ZATCA Phase 2, PDPL, and Saudi labor law compliance are
   non-negotiable quality requirements.
5. **Prevention over detection** -- Quality gates at every SDLC stage catch defects
   before they reach production.

---

## 2. Quality Objectives and KPIs

### 2.1 Code Quality

| Metric                          | Target          | Measurement Tool        | Frequency   |
|---------------------------------|-----------------|-------------------------|-------------|
| Unit test coverage              | >= 80%          | Vitest + c8 coverage    | Per commit  |
| Critical bugs in production     | 0               | Issue tracker (P1 tags) | Continuous  |
| High bugs in production         | < 3 per sprint  | Issue tracker (P2 tags) | Per sprint  |
| Static analysis violations      | 0 errors        | ESLint + TypeScript     | Per commit  |
| Security vulnerabilities (high) | 0               | OWASP ZAP + npm audit   | Weekly      |
| Code review turnaround          | < 24 hours      | GitHub PR metrics       | Per PR      |
| Technical debt ratio            | < 5%            | SonarQube               | Monthly     |

### 2.2 User Experience Quality

| Metric                          | Target          | Measurement Tool        | Frequency   |
|---------------------------------|-----------------|-------------------------|-------------|
| Net Promoter Score (NPS)        | > 40            | In-app survey           | Quarterly   |
| Task completion rate            | > 95%           | Usability testing       | Per release |
| RTL/Arabic rendering defects    | 0 P1/P2         | Visual regression tests | Per commit  |
| Accessibility compliance        | WCAG 2.1 AA     | Axe + manual audit      | Per release |
| Mean time to learn (new user)   | < 30 minutes    | Onboarding analytics    | Monthly     |

### 2.3 Service Quality

| Metric                          | Target          | Measurement Tool        | Frequency   |
|---------------------------------|-----------------|-------------------------|-------------|
| Platform uptime                 | >= 99.9%        | Monitoring (uptime)     | Real-time   |
| MTTR for P1 incidents           | < 4 hours       | Incident tracker        | Per event   |
| MTTR for P2 incidents           | < 24 hours      | Incident tracker        | Per event   |
| API response time (p95)         | < 200ms         | APM monitoring          | Real-time   |
| Deployment success rate         | > 95%           | CI/CD pipeline          | Per deploy  |
| Rollback frequency              | < 5% of deploys | Deployment log          | Monthly     |

### 2.4 ZATCA Compliance Quality

| Metric                          | Target          | Measurement Tool        | Frequency   |
|---------------------------------|-----------------|-------------------------|-------------|
| ZATCA validation pass rate      | 100%            | ZATCA sandbox           | Per invoice |
| QR code generation accuracy     | 100%            | Automated validation    | Per invoice |
| Hash chain integrity            | 100%            | Integrity checker       | Daily       |
| UBL 2.1 XML schema compliance   | 100%            | Schema validator        | Per invoice |
| E-invoice submission latency    | < 30 seconds    | APM monitoring          | Per invoice |

---

## 3. QA Process

### 3.1 Code Review Process

All code changes to the SALIS AUTO platform require review before merge:

| Criterion                       | Requirement                                          |
|---------------------------------|------------------------------------------------------|
| Minimum reviewers               | 2 approved reviews required                          |
| Review scope                    | Logic, security, performance, i18n, accessibility    |
| RBAC changes                    | Additional review by CTO (touches 14 roles x 28 modules) |
| Database migrations             | DBA review required; rollback script mandatory       |
| ZATCA-related changes           | Compliance lead must approve                         |
| Review SLA                      | First review within 24 hours; final approval within 48 hours |

### 3.2 Automated Testing Strategy

| Test Layer             | Framework       | Coverage Target | Execution Trigger        |
|------------------------|-----------------|-----------------|--------------------------|
| Unit tests             | Vitest          | >= 80%          | Every commit (CI)        |
| API integration tests  | Supertest       | All endpoints   | Every PR (CI)            |
| E2E tests              | Playwright      | Critical paths  | Nightly + pre-release    |
| Visual regression      | Playwright       | RTL + LTR       | Every PR (CI)            |
| Performance tests      | k6              | API benchmarks  | Weekly + pre-release     |
| Security scans         | OWASP ZAP       | Full surface    | Weekly (CI)              |
| Accessibility tests    | Axe-core        | All pages       | Every PR (CI)            |
| ZATCA validation       | Custom harness  | All invoice types| Every PR touching finance|

### 3.3 Static Analysis

| Tool              | Purpose                      | Enforcement                           |
|-------------------|------------------------------|---------------------------------------|
| ESLint            | Code style and error detection| CI gate -- zero errors allowed        |
| TypeScript strict | Type safety                  | CI gate -- strict mode, no `any`      |
| npm audit         | Dependency vulnerabilities   | CI gate -- zero high/critical         |
| Zod schemas       | Runtime input validation     | All API endpoints validated           |
| Drizzle type-gen  | Database schema type safety  | CI gate -- types match migrations     |

---

## 4. Defect Management

### 4.1 Severity Classification

| Severity | Name     | Definition                                                | Examples                                           |
|----------|----------|-----------------------------------------------------------|----------------------------------------------------|
| P1       | Critical | Platform unusable or data integrity at risk for all tenants| Auth failure, data breach, ZATCA submission down   |
| P2       | High     | Major feature broken affecting multiple tenants            | Invoice creation fails, RLS policy error, payment down |
| P3       | Medium   | Minor feature issue or single-tenant impact                | Report export error, RTL alignment, slow query     |
| P4       | Low      | Cosmetic or enhancement                                    | Tooltip text, icon alignment, color inconsistency  |

### 4.2 SLA by Severity

| Severity | Acknowledge   | Fix Deployed  | Communication                             |
|----------|---------------|---------------|-------------------------------------------|
| P1       | 30 minutes    | 4 hours       | Status page update every 30 minutes       |
| P2       | 2 hours       | 24 hours      | Affected tenants notified within 4 hours  |
| P3       | 1 business day| 1 sprint      | Tracked in sprint backlog                 |
| P4       | 3 business days| Backlog      | Visible in public roadmap                 |

### 4.3 Defect Lifecycle

```
New -> Triaged -> Assigned -> In Progress -> In Review -> Testing -> Verified -> Closed
                     |                                        |
                     +--- Won't Fix ---+                      +--- Reopened ---+
                     +--- Duplicate ---+
```

| State        | Owner            | Exit Criteria                                   |
|-------------|------------------|-------------------------------------------------|
| New          | Reporter         | Severity assigned, reproduction steps documented |
| Triaged      | QA Lead          | Severity confirmed, sprint assigned              |
| Assigned     | Developer        | Developer acknowledged                           |
| In Progress  | Developer        | Fix implemented, unit tests pass                 |
| In Review    | Reviewer (x2)    | Code review approved                             |
| Testing      | QA Engineer      | Regression test passed, no side effects          |
| Verified     | QA Lead          | Verified in staging environment                  |
| Closed       | QA Lead          | Deployed to production, monitoring confirms fix  |

---

## 5. Quality Gates

### 5.1 Gate Matrix

| Stage          | Gate ID | Quality Gate                                | Pass Criteria                               | Gatekeeper      |
|----------------|---------|---------------------------------------------|----------------------------------------------|-----------------|
| Requirements   | QG-01   | Requirements review                         | All acceptance criteria defined; bilingual    | Product Owner   |
| Requirements   | QG-02   | RBAC mapping complete                       | Screen -> module -> role permissions mapped  | CTO             |
| Design         | QG-03   | UX design review                            | RTL + LTR mockups approved; WCAG AA checked  | UX Lead         |
| Design         | QG-04   | Architecture review                         | ADR documented; scalability assessed         | CTO             |
| Development    | QG-05   | Code review passed                          | 2 approvals; no security findings            | Lead Developer  |
| Development    | QG-06   | Unit test coverage                          | >= 80% coverage on changed files             | CI Pipeline     |
| Development    | QG-07   | Static analysis clean                       | 0 ESLint errors; 0 TypeScript errors         | CI Pipeline     |
| Testing        | QG-08   | Integration tests pass                      | All API tests green; Supertest suite passes  | QA Lead         |
| Testing        | QG-09   | E2E critical path pass                      | Playwright suite green for affected domains  | QA Lead         |
| Testing        | QG-10   | Security scan clean                         | 0 high/critical OWASP ZAP findings          | CTO             |
| Testing        | QG-11   | ZATCA validation pass                       | 100% pass rate on sandbox submissions        | Compliance Lead |
| UAT            | QG-12   | User acceptance test                        | >= 85% test cases passed by business users   | Product Owner   |
| Deployment     | QG-13   | Staging smoke test                          | All 13 domains functional; monitoring green  | DevOps Lead     |
| Deployment     | QG-14   | Production canary                           | Error rate < 0.1% after 15-minute canary     | DevOps Lead     |
| Post-deploy    | QG-15   | Production verification                     | KPIs stable for 24 hours post-deploy         | CTO             |

---

## 6. User Acceptance Testing (UAT)

### 6.1 UAT Process

| Phase              | Duration    | Participants                              | Activities                                |
|--------------------|-------------|-------------------------------------------|-------------------------------------------|
| UAT Planning       | 2 days      | Product Owner, QA Lead                    | Test case selection, environment setup    |
| UAT Preparation    | 1 day       | QA Lead, DevOps                           | Staging deploy, test data seeding         |
| UAT Execution      | 3-5 days    | Business users (all 14 roles)             | Execute test cases, log findings          |
| UAT Review         | 1 day       | Product Owner, QA Lead, Development       | Triage findings, fix critical items       |
| UAT Sign-off       | 1 day       | Product Owner, Branch Manager             | Formal acceptance or rejection            |

### 6.2 UAT Pass Criteria

| Criterion                                   | Threshold       |
|---------------------------------------------|-----------------|
| Overall test case pass rate                  | >= 85%          |
| P1 defects found                             | 0 (blocker)     |
| P2 defects found                             | <= 2 (tracked)  |
| ZATCA invoice flow pass rate                 | 100%            |
| Bilingual (EN/AR) coverage verified          | 100% of tested screens |
| Role-based access verified                   | All 14 roles tested    |

### 6.3 UAT Participants by Role

| Role              | UAT Focus Area                                    | Domain Coverage          |
|-------------------|---------------------------------------------------|--------------------------|
| Owner             | Dashboard, reports, approvals, settings           | All 13 domains           |
| Branch Manager    | Operations oversight, staff management            | Workshop, HR, Inventory  |
| Service Advisor   | Customer interaction, estimates, job lifecycle     | Workshop, Registry, CRM  |
| Technician        | Job execution, parts requests                     | Workshop, Inventory      |
| QC Inspector      | Quality checks, inspection workflows              | Workshop (QC Gate)       |
| Storekeeper       | Inventory management, stock operations            | Inventory, Procurement   |
| Accountant        | Invoicing, payments, VAT (15%), financial reports | Finance, Accounting      |
| HR Manager        | Employee management, attendance, payroll          | HR & Team                |
| Receptionist      | Check-in, appointment scheduling                  | Workshop, Registry       |
| Call Center Agent  | Customer inquiries, appointment booking           | CRM, Registry            |
| Procurement Agent | Purchase orders, supplier management              | Procurement, Network     |
| Supplier          | Portal access, order fulfillment                  | Supplier Portal          |
| Customer          | Portal access, appointment requests               | Customer Portal          |
| Super Admin       | Platform configuration, tenant management         | Admin, Settings          |

---

## 7. Customer Satisfaction Measurement

### 7.1 Measurement Framework

| Method                    | Frequency   | Target Audience         | Metric                  |
|---------------------------|-------------|-------------------------|-------------------------|
| In-app NPS survey         | Quarterly   | All active users        | NPS > 40                |
| Post-interaction CSAT     | Per event   | After support tickets   | CSAT >= 4.0 / 5.0       |
| Feature satisfaction poll  | Per release | Users of new features   | Satisfaction >= 80%     |
| Support ticket analysis   | Monthly     | All tickets             | Resolution rate > 90%   |
| Churn exit survey         | Per event   | Churning customers      | Root cause categorization|
| Annual user research      | Annual      | 20+ users across roles  | Qualitative insights    |

### 7.2 Feedback Integration

| Feedback Source              | Processing                                      | Owner           |
|------------------------------|--------------------------------------------------|-----------------|
| NPS detractors (score 0-6)   | Contacted within 48 hours; root cause tracked    | Product Owner   |
| CSAT below 3.0               | Escalated to CTO; fix within current sprint      | QA Lead         |
| Recurring support themes     | Converted to backlog items at monthly review     | Product Owner   |
| Feature requests             | Scored by impact x effort; roadmap candidates    | Product Owner   |
| Arabic/RTL complaints        | Fast-tracked for localization fixes              | UX Lead         |

---

## 8. Continuous Improvement

### 8.1 Sprint Retrospectives

Every sprint concludes with a retrospective covering quality dimensions:

| Dimension        | Review Questions                                                  |
|------------------|-------------------------------------------------------------------|
| Defect trends    | Are P1/P2 counts trending down? Any repeated root causes?        |
| Test coverage    | Did coverage increase? Any domains below 80%?                    |
| Deployment       | Was the deployment smooth? Any rollbacks?                        |
| Customer impact  | Any customer-reported issues? NPS/CSAT movement?                 |
| Process          | Did quality gates catch issues early? Any gate bypasses?         |

### 8.2 Kaizen Events

Quarterly kaizen events target specific quality improvement areas:

| Quarter   | Focus Area                        | Expected Outcome                           |
|-----------|-----------------------------------|--------------------------------------------|
| Q4 2026   | ZATCA validation automation       | 100% automated pre-submission validation   |
| Q1 2027   | RTL visual regression coverage    | Playwright RTL suite for all 191+ screens  |
| Q2 2027   | API performance optimization      | p95 latency < 150ms                        |
| Q3 2027   | Test automation for 13 domains    | 90%+ E2E coverage for critical paths       |

### 8.3 Quality Trend Tracking

| Metric                     | Tracked Since | Trend Target      | Review Cadence |
|----------------------------|---------------|-------------------|----------------|
| Defect escape rate         | Sprint 1      | Decreasing        | Per sprint     |
| Test coverage              | Sprint 1      | Increasing to 90% | Per sprint     |
| ZATCA rejection rate       | Go-live       | Stable at < 0.1%  | Daily          |
| Customer satisfaction      | Go-live       | Increasing        | Monthly        |
| Deployment lead time       | Sprint 1      | Decreasing        | Per sprint     |
| Mean time to detect (MTTD) | Go-live       | Decreasing        | Monthly        |

---

## 9. Cross-References

| Document                                         | Relevance                                   |
|--------------------------------------------------|---------------------------------------------|
| [Testing Strategy](../system/testing-strategy.md) | Detailed test framework and execution plan |
| [Definition of Done](../project-management/agile/definition-of-done.md) | Sprint-level quality criteria |
| [Quality Register](../project-management/prince2/quality-register.md) | Quality audit records       |
| [Incident Response Plan](../system/incident-response.md) | Defect escalation procedures       |
| [Coding Standards](../system/coding-standards.md) | Code quality standards                     |
| [Security Architecture](../system/security/security-architecture.md) | Security quality controls  |
| [Risk Management Plan](risk-management-plan.md)  | Quality-related risk items                  |
| [Compliance Management Plan](compliance-management-plan.md) | Regulatory quality requirements |
| [Accessibility Audit](../A11Y_AUDIT.md)          | WCAG compliance status                      |

---

## 10. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial release                |
