# SALIS AUTO -- Project Initiation Document (PID)

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PR2-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Project Definition

### 1.1 Project Title

SALIS AUTO -- Multi-Tenant Automotive Workshop Management Platform

### 1.2 Project Objectives

Deliver a bilingual (EN/AR), ZATCA Phase 2 compliant, multi-tenant SaaS platform that manages the full automotive workshop lifecycle across 13 domains, serving 14 roles through 191+ screens, targeting Saudi Arabian workshops.

### 1.3 Project Scope

**In scope:** 13 domains (Workshop, Registry, Finance, Accounting, CRM & Marketing, Administration, Authentication, AI Platform, Parts & Inventory, Call Center, Reports & Analytics, Team & HR, Portals), ZATCA Phase 2 e-invoicing, customer e-signature approval, multi-tenant architecture, RBAC with 28 modules, notification fan-out (5 channels).

**Out of scope:** Native mobile apps, OEM DMS integration, payroll bank disbursement, multi-currency, offline/PWA mode.

Full scope details in the [Scope Statement](../pmp/scope-statement.md).

### 1.4 Desired Outcomes

- Every workshop tenant processes ZATCA-compliant e-invoices from Day 1.
- Customers approve estimates remotely via OTP + e-signature in under 4 hours (from 48 hours in-person).
- Owners gain real-time cross-branch visibility through role-scoped dashboards.
- Workshop job throughput improves 25% within 6 months of adoption.

---

## 2. Project Approach

### 2.1 Development Methodology

Hybrid approach combining PRINCE2 stage-gate governance with Agile/Scrum execution:

- **PRINCE2 governance:** Stage boundaries, product descriptions, quality register, exception management.
- **Agile execution:** 2-week sprints, product backlog, daily standups, sprint reviews, retrospectives.
- **Rationale:** PRINCE2 provides the control framework needed for regulatory compliance (ZATCA) and stakeholder governance, while Agile enables iterative delivery and rapid feedback across 13 domains.

### 2.2 Technical Approach

| Layer      | Technology                                            |
|------------|-------------------------------------------------------|
| Frontend   | React 18.3 + TypeScript 5.7 + Vite 5.4 + TailwindCSS 3.4 |
| Routing    | React Router 7                                        |
| State      | TanStack React Query (server state), React Context (UI state) |
| Backend    | Express 4.21 + TypeScript                             |
| ORM        | Drizzle ORM 0.36                                      |
| Database   | PostgreSQL (production), PGlite (local development)   |
| Auth       | JWT with refresh token rotation                       |
| i18n       | EN/AR with RTL support (TailwindCSS RTL plugin)       |
| Testing    | Vitest (unit), Supertest (integration), Playwright (E2E) |
| CI/CD      | GitHub Actions                                        |
| Hosting    | GitHub Pages / Vercel / Netlify (frontend SPA)        |

### 2.3 Multi-Tenancy Architecture

- Each tenant (workshop organization) has an `org_id`.
- Branches within an organization have `branch_id`.
- PostgreSQL Row-Level Security (RLS) enforces data isolation at the database layer.
- API middleware enforces org/branch context from JWT claims.
- UI route guards use the `can()` hook to show/hide features per role.

---

## 3. Project Organization

### 3.1 Project Board

| Role              | Responsibility                                     |
|-------------------|----------------------------------------------------|
| Executive         | Owner/CEO -- final authority on scope, budget, schedule |
| Senior User       | Branch Managers + Service Advisors -- represent end users |
| Senior Supplier   | Technical Lead -- represents the delivery team     |

### 3.2 Project Manager

Responsible for day-to-day management, progress reporting, risk management, and stakeholder communication. Authority defined in the [Project Charter](../pmp/project-charter.md).

### 3.3 Team Structure

| Team                 | Members | Focus                                    |
|----------------------|---------|------------------------------------------|
| Frontend             | 3 devs  | React, TypeScript, RTL, i18n, a11y       |
| Backend              | 3 devs  | Express, Drizzle, PostgreSQL, ZATCA      |
| QA                   | 1       | Test strategy, automation, UAT coord     |
| UX/UI Design         | 1       | Design system, prototypes, RTL audit     |
| Scrum Master         | 1       | Ceremony facilitation, impediment removal|
| Project Manager      | 1       | Governance, reporting, stakeholder mgmt  |

---

## 4. Project Controls

### 4.1 Tolerances

| Control         | Tolerance                                | Escalation To         |
|-----------------|------------------------------------------|-----------------------|
| Time            | +/- 1 sprint per stage                   | Project Board         |
| Cost            | +/- 10% of stage budget                  | Project Board         |
| Scope           | +/- 3 story points per sprint            | Project Manager       |
| Quality         | Zero tolerance on ZATCA, security, a11y  | Project Board         |
| Risk            | Score >= 16 (Critical)                   | Project Board         |
| Benefits        | -15% of projected adoption rate          | Executive             |

### 4.2 Stage Gates

Each stage boundary requires a formal gate review before proceeding:

| Gate | Stage Transition                | Gate Criteria                                    |
|------|---------------------------------|--------------------------------------------------|
| G1   | Initiation -> Planning          | PID approved, team onboarded                     |
| G2   | Planning -> Foundation          | WBS, schedule, risk register baselined           |
| G3   | Foundation -> Core Domains      | Auth + RBAC + i18n functional; CI/CD green       |
| G4   | Core -> Extended Domains        | Workshop + Finance + ZATCA sandbox passing       |
| G5   | Extended -> Integration         | All 13 domains feature-complete                  |
| G6   | Integration -> Testing          | ZATCA prod cert; notifications operational       |
| G7   | Testing -> Deployment           | Coverage targets met; zero P1 bugs               |
| G8   | Deployment -> Close             | UAT signed off; production stable 30 days        |

### 4.3 Progress Reporting

| Report                 | Frequency  | Audience              | Content                           |
|------------------------|------------|-----------------------|-----------------------------------|
| Highlight Report       | Biweekly   | Project Board         | RAG status, milestones, risks     |
| Checkpoint Report      | Per sprint | Project Manager       | Sprint velocity, burndown         |
| End Stage Report       | Per gate   | Project Board         | Stage results, next stage plan    |
| Exception Report       | As needed  | Project Board         | Tolerance breach analysis         |

---

## 5. Quality Management Strategy

### 5.1 Quality Expectations

| Quality Dimension       | Expectation                                         |
|-------------------------|-----------------------------------------------------|
| Functional correctness  | All acceptance criteria met per story                |
| ZATCA compliance        | Phase 2 sandbox + production certification           |
| Security                | OWASP Top 10 addressed; penetration test passed      |
| Performance             | P95 API < 500ms; Lighthouse >= 80                    |
| Accessibility           | WCAG 2.1 AA                                         |
| i18n completeness       | 100% EN/AR key coverage                             |
| RTL correctness         | Visual regression pass for all 191+ screens          |
| Test coverage           | >= 80% unit, >= 70% integration, 100% critical E2E  |

### 5.2 Quality Methods

| Method                  | Tool                | When                          |
|-------------------------|---------------------|-------------------------------|
| Code review             | GitHub PRs          | Every commit                  |
| Unit testing            | Vitest              | CI pipeline, every PR         |
| Integration testing     | Supertest           | CI pipeline, every PR         |
| E2E testing             | Playwright          | Nightly + pre-release         |
| Static analysis         | ESLint + TypeScript strict | Every commit             |
| Security scan           | OWASP ZAP           | Pre-release                   |
| Performance audit       | Lighthouse + k6     | Pre-release                   |
| ZATCA validation        | ZATCA sandbox API   | Nightly (Finance domain)      |
| RTL visual regression   | Playwright screenshots | Pre-release                 |
| Accessibility audit     | axe-core + manual   | Per sprint                    |

See [Quality Register](quality-register.md) for the full quality schedule.

---

## 6. Risk Management Strategy

### 6.1 Risk Process

1. **Identify:** Any team member can raise a risk at any time (daily standup, Slack, sprint retro).
2. **Assess:** Probability (1--5) x Impact (1--5) = Risk Score.
3. **Plan:** Response strategy (Avoid, Mitigate, Transfer, Accept).
4. **Implement:** Risk owner executes the response plan.
5. **Communicate:** Risks >= High reported in Highlight Report.

### 6.2 Key Risks

| Risk                              | Score | Strategy                           |
|-----------------------------------|-------|------------------------------------|
| ZATCA spec changes                | 16    | Adapter pattern isolation          |
| Key developer attrition           | 12    | Cross-training, documentation      |
| Scope creep                       | 12    | CCB process, PO gatekeeping        |
| Production migration failure      | 10    | 3x rehearsals, rollback script     |

Full register in the [Risk Register](../pmp/risk-register.md).

---

## 7. Change Control Strategy

Changes are managed through the Change Control Board (CCB):

| Change Size             | Authority          | Process                            |
|-------------------------|--------------------|------------------------------------|
| < 3 SP, no schedule hit | Project Manager    | PM approves and updates backlog    |
| 3--13 SP or 1 sprint    | CCB                | Impact analysis + CCB vote         |
| > 13 SP or > 1 sprint   | Project Board      | CCB recommendation + Board approval|

See [Scope Statement](../pmp/scope-statement.md) for the full change control workflow.

---

## 8. Communication Strategy

- **Daily:** Standup (dev team).
- **Biweekly:** Sprint review (all stakeholders), retrospective (scrum team), highlight report (board).
- **Monthly:** Steering committee (sponsor + PM + TL), stakeholder newsletter (all).
- **Event-driven:** Risk escalation, scope changes, incidents.

See [Communication Plan](../pmp/communication-plan.md) for channel details.

---

## 9. Configuration Management

### 9.1 Version Control

- **Source code:** Git (GitHub) with trunk-based development and feature branches.
- **Branch naming:** `feature/[STORY-ID]-description`, `bugfix/[BUG-ID]-description`.
- **Merge policy:** PR with 1+ approval, CI green, no conflicts.
- **Release tagging:** Semantic versioning (e.g., v1.2.3).

### 9.2 Database Schema

- **Migration tool:** Drizzle ORM migrations.
- **Migration naming:** Timestamp-prefixed (e.g., `0001_create_users.ts`).
- **Schema versioning:** Tracked in `drizzle/` directory; see [Migration Plan](../planning/migration-plan.md).

### 9.3 Documentation

- All project management documents stored in `docs/project-management/`.
- Technical documentation co-located with source code.
- API documentation auto-generated from OpenAPI spec.

---

## 10. Tailoring PRINCE2 for SALIS AUTO

| PRINCE2 Element         | Tailoring Decision                                      |
|-------------------------|---------------------------------------------------------|
| Stage Plans             | Aligned to sprint boundaries (2 sprints per stage)      |
| Product Descriptions    | Mapped to epics and features                            |
| Quality Register        | Maintained as living document, updated per sprint       |
| Issue Register          | Tracked in Jira/Linear alongside backlog                |
| Lessons Log             | Captured in sprint retrospectives                       |
| Daily Log               | Replaced by daily standup notes                         |
| Highlight Report        | Biweekly (aligned with sprint cadence)                  |

---

## 11. Approval

| Name | Role              | Decision         | Date |
|------|-------------------|------------------|------|
|      | Executive         | Approve / Reject |      |
|      | Senior User       | Approve / Reject |      |
|      | Senior Supplier   | Approve / Reject |      |
|      | Project Manager   | Approve / Reject |      |

---

## 12. References

- [Business Case](business-case.md)
- [Project Charter](../pmp/project-charter.md)
- [Scope Statement](../pmp/scope-statement.md)
- [Risk Register](../pmp/risk-register.md)
- [Communication Plan](../pmp/communication-plan.md)
- [Quality Register](quality-register.md)
- [Stage Plans](stage-plans.md)
- [Product Descriptions](product-descriptions.md)
