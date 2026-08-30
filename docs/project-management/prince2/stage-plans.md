# SALIS AUTO -- Stage Plans

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PR2-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the stage boundaries, entry/exit criteria, and stage-level plans for each delivery phase of the SALIS AUTO project. Stages align with the PRINCE2 Managing Stage Boundaries process and map to the sprint schedule in the [Schedule Management Plan](../pmp/schedule-management.md).

---

## 2. Stage Overview

| Stage | Name                    | Weeks   | Sprints | Gate | Key Products                              |
|-------|-------------------------|---------|---------|------|-------------------------------------------|
| 1     | Initiation              | 1--2    | --      | G1   | PID, Charter, Stakeholder Register        |
| 2     | Planning                | 3--6    | S0      | G2   | WBS, Backlog, Schedule, Infrastructure    |
| 3     | Foundation              | 7--12   | S1--S3  | G3   | Auth, RBAC, i18n, CI/CD                   |
| 4     | Core Domains            | 13--30  | S4--S12 | G4   | Workshop, Registry, Finance, Accounting, Parts |
| 5     | Extended Domains        | 31--40  | S13--S17| G5   | CRM, AI, Call Center, HR, Portals         |
| 6     | Integration & ZATCA     | 41--46  | S18--S20| G6   | ZATCA Prod Cert, Notifications, Reports   |
| 7     | Testing & Hardening     | 47--50  | S21--S22| G7   | Test coverage, security, performance      |
| 8     | Deployment & Close      | 51--52  | S23     | G8   | UAT, go-live, post-launch support         |

---

## 3. Stage 1: Initiation (Weeks 1--2)

### 3.1 Objectives

- Formally authorize the project.
- Identify all stakeholders and their engagement needs.
- Establish project governance structure.

### 3.2 Products

| Product                        | Owner    | Acceptance Criteria                           |
|--------------------------------|----------|-----------------------------------------------|
| Project Charter                | PM       | Approved by Executive Sponsor                 |
| Project Initiation Document    | PM       | Approved by Project Board                     |
| Business Case                  | PM       | Investment appraisal validated                |
| Stakeholder Register           | PM       | All 14 roles + external stakeholders listed   |

### 3.3 Entry Criteria

- Funding approved.
- Executive Sponsor identified and available.

### 3.4 Exit Criteria (Gate G1)

- PID signed by Project Board.
- Business case approved.
- Team onboarding initiated.
- Project management tooling set up.

### 3.5 Tolerances

| Dimension | Tolerance       |
|-----------|-----------------|
| Time      | +1 week         |
| Cost      | +10%            |

---

## 4. Stage 2: Planning (Weeks 3--6)

### 4.1 Objectives

- Create the complete project plan.
- Establish the product backlog with prioritized epics.
- Set up the development environment (Sprint 0).

### 4.2 Products

| Product                        | Owner    | Acceptance Criteria                           |
|--------------------------------|----------|-----------------------------------------------|
| Work Breakdown Structure       | PM + TL  | All 13 domains decomposed into work packages  |
| Schedule Baseline              | PM       | Milestones defined, critical path identified  |
| Risk Register                  | PM       | All identified risks assessed and planned     |
| Product Backlog                | PO       | Epics and stories defined per MoSCoW          |
| Communication Plan             | PM       | Approved by Project Board                     |
| Dev Environment (Sprint 0)     | TL       | Vite, Express, Drizzle, CI/CD operational     |

### 4.3 Sprint 0 Deliverables

| Deliverable                         | Status Criteria                            |
|-------------------------------------|--------------------------------------------|
| Vite + TypeScript + TailwindCSS     | `npm run dev` serves empty shell           |
| React Router 7 skeleton             | Route config for all 13 domains            |
| Express API scaffold                | Health endpoint returns 200                |
| Drizzle ORM + PGlite dev setup      | Migration runs locally                     |
| CI/CD pipeline                      | PR triggers lint + test + build            |
| i18n namespace structure             | EN/AR files load correctly                 |

### 4.4 Exit Criteria (Gate G2)

- WBS and schedule baseline approved.
- Product backlog has >= 50 refined stories.
- Sprint 0 infrastructure operational.
- Risk register reviewed and accepted by Project Board.

### 4.5 Tolerances

| Dimension | Tolerance       |
|-----------|-----------------|
| Time      | +1 sprint       |
| Cost      | +10%            |
| Scope     | Sprint 0 items only; no feature work |

---

## 5. Stage 3: Foundation (Weeks 7--12, Sprints S1--S3)

### 5.1 Objectives

- Deliver authentication and session management.
- Implement triple-layer RBAC (JWT + UI + API + RLS).
- Establish i18n/RTL foundation for all subsequent domain work.

### 5.2 Sprint Plan

| Sprint | Focus                                              | Target SP |
|--------|----------------------------------------------------|-----------|
| S1     | DB schema, Drizzle migrations, user model           | 40        |
| S2     | JWT auth, refresh rotation, login UI (EN/AR)        | 40        |
| S3     | RBAC: 14 roles, can() hook, API middleware, RLS     | 40        |

### 5.3 Key Products

| Product                           | Quality Criteria                                   |
|-----------------------------------|----------------------------------------------------|
| Authentication Module             | Login, logout, MFA, refresh rotation tested        |
| RBAC Engine                       | 14 roles, 28 modules, 8 data scopes enforced       |
| Separation-of-Duties              | 6 pairs enforced at API layer                      |
| Field-Level Redaction             | 7 rules active; unauthorized fields return null     |
| i18n Framework                    | EN/AR keys load; language switch works             |
| RTL Foundation                    | TailwindCSS RTL plugin configured; sample screens  |

### 5.4 Exit Criteria (Gate G3)

- A user can log in, receive a JWT, and access role-appropriate routes.
- Tenant isolation confirmed: User in Org A cannot access Org B data.
- i18n toggle switches all labels between EN and AR.
- RTL layout verified on login and dashboard screens.
- Unit test coverage >= 80% for auth and RBAC modules.
- CI/CD pipeline deploys to staging.

### 5.5 Tolerances

| Dimension | Tolerance                                       |
|-----------|-------------------------------------------------|
| Time      | +1 sprint (no tolerance on auth/RBAC delivery)  |
| Quality   | Zero tolerance on security items                |

---

## 6. Stage 4: Core Domains (Weeks 13--30, Sprints S4--S12)

### 6.1 Objectives

- Deliver the five core business domains: Workshop, Registry, Finance (with ZATCA), Accounting, Parts & Inventory.
- Achieve ZATCA sandbox certification.

### 6.2 Sprint Plan

| Sprint | Focus                                                | Target SP |
|--------|------------------------------------------------------|-----------|
| S4     | Workshop: job card schema, state machine              | 40        |
| S5     | Workshop: check-in, inspection, estimate builder      | 40        |
| S6     | Workshop: repair, QC, delivery, bay management        | 40        |
| S7     | Registry: customer + vehicle CRUD, Saudi validations  | 40        |
| S8     | Finance: invoice schema, halala math, payments        | 40        |
| S9     | Finance: ZATCA XML, QR code, hash chain               | 40        |
| S10    | Finance: ZATCA API integration, credit notes          | 40        |
| S11    | Accounting: CoA, journals, trial balance, reports     | 40        |
| S12    | Parts: stock, PO lifecycle, approval chain            | 40        |

### 6.3 Key Products

| Product                           | Quality Criteria                                      |
|-----------------------------------|-------------------------------------------------------|
| Workshop Module                   | 6-state lifecycle machine; E2E Playwright tests pass |
| Registry Module                   | Saudi plate + +966 validation; M:N vehicle-customer  |
| Finance Module                    | Halala integer math; ZATCA sandbox clearance passing  |
| Accounting Module                 | Double-entry validation; trial balance balances       |
| Parts & Inventory Module          | Approval chain (SAR 10K/20K/50K) enforced            |

### 6.4 Mid-Stage Checkpoint (After S7, Week 20)

Review progress on Workshop and Registry before starting Finance. Decision: proceed or re-plan.

### 6.5 Exit Criteria (Gate G4)

- Workshop lifecycle (Check-In through Delivery) fully operational.
- ZATCA sandbox tests passing for standard invoice, credit note, and debit note.
- Parts approval chain enforces SAR limits correctly.
- All core domain screens available in EN and AR with RTL.

### 6.6 Tolerances

| Dimension | Tolerance                                          |
|-----------|----------------------------------------------------|
| Time      | +2 sprints (absorbs from project reserve)          |
| Scope     | "Could Have" stories can be deferred to Stage 5    |
| Quality   | Zero tolerance on ZATCA and financial accuracy     |

---

## 7. Stage 5: Extended Domains (Weeks 31--40, Sprints S13--S17)

### 7.1 Objectives

- Deliver CRM, AI Platform, Call Center, Team & HR, and Portals domains.
- Complete the customer e-signature estimate approval flow.

### 7.2 Sprint Plan

| Sprint | Focus                                                | Target SP |
|--------|------------------------------------------------------|-----------|
| S13    | CRM: segmentation, campaigns, loyalty                | 40        |
| S14    | AI Platform: OBD parser, 5-desk handoff              | 40        |
| S15    | Call Center + HR: tickets, employees, attendance      | 40        |
| S16    | HR: leave, payroll prep, performance                  | 40        |
| S17    | Portals: customer, supplier, technician mobile        | 40        |

### 7.3 Exit Criteria (Gate G5)

- All 13 domains feature-complete (Must Have stories done).
- Customer portal 6-step e-signature approval flow operational.
- Supplier portal PO acknowledgment and invoice submission working.
- All new screens pass i18n and RTL visual audit.

### 7.4 Tolerances

| Dimension | Tolerance                                                |
|-----------|----------------------------------------------------------|
| Time      | +1 sprint                                                |
| Scope     | "Could Have" epics (E-14: AI) can be reduced in scope    |

---

## 8. Stage 6: Integration & ZATCA (Weeks 41--46, Sprints S18--S20)

### 8.1 Objectives

- Obtain ZATCA production certification.
- Wire up notification fan-out (5 channels).
- Build cross-domain approval orchestrator.
- Deliver Reports & Analytics dashboards.

### 8.2 Sprint Plan

| Sprint | Focus                                                | Target SP |
|--------|------------------------------------------------------|-----------|
| S18    | ZATCA prod cert + notification fan-out                | 40        |
| S19    | Approval orchestrator + multi-tenant onboarding       | 40        |
| S20    | Reports & Analytics dashboards + export               | 40        |

### 8.3 Exit Criteria (Gate G6)

- ZATCA production certificate obtained.
- Notification fan-out delivers to all 5 channels (in-app, SMS, WhatsApp, email, push).
- Multi-tenant onboarding works for all 3 paths.
- Owner and Manager dashboards operational with correct data scoping.

### 8.4 Tolerances

| Dimension | Tolerance                                                  |
|-----------|-------------------------------------------------------------|
| Time      | +1 sprint (ZATCA cert timeline is external dependency)     |
| Quality   | Zero tolerance on ZATCA certification                      |

---

## 9. Stage 7: Testing & Hardening (Weeks 47--50, Sprints S21--S22)

### 9.1 Objectives

- Close test coverage gaps.
- Execute security and performance audits.
- Fix all P1 and P2 bugs.

### 9.2 Sprint Plan

| Sprint | Focus                                                | Target SP |
|--------|------------------------------------------------------|-----------|
| S21    | Unit + integration test gap closure; security scan    | 40        |
| S22    | E2E Playwright suite; RTL visual regression; perf     | 40        |

### 9.3 Exit Criteria (Gate G7)

- Unit coverage >= 80% (Vitest).
- Integration coverage >= 70% (Supertest).
- E2E critical paths 100% green (Playwright).
- OWASP ZAP scan: zero critical/high findings.
- Lighthouse score >= 80 on key pages.
- Zero open P1 or P2 bugs.

### 9.4 Tolerances

| Dimension | Tolerance                                |
|-----------|------------------------------------------|
| Time      | +1 sprint (from project reserve)         |
| Quality   | Zero tolerance -- this is the quality gate|

---

## 10. Stage 8: Deployment & Close (Weeks 51--52, Sprint S23)

### 10.1 Objectives

- Complete UAT with workshop stakeholders.
- Execute production data migration.
- Go live.
- Establish 30-day post-launch support.

### 10.2 Activities

| Activity                          | Duration | Owner         |
|-----------------------------------|----------|---------------|
| UAT execution (role-based)        | 3 days   | PO + QA       |
| UAT defect fixing                 | 2 days   | Dev team      |
| Data migration (PGlite -> PG)     | 1 day    | DBA           |
| Production deployment             | 1 day    | DevOps        |
| Smoke testing                     | 0.5 day  | QA            |
| Go-live announcement              | 0.5 day  | PM            |
| Post-launch monitoring (30 days)  | Ongoing  | DevOps + Dev  |

### 10.3 Exit Criteria (Gate G8)

- UAT pass rate >= 85%.
- Production deployment successful.
- Data migration verified (row counts, checksums).
- 30-day post-launch support period completed with < 5 P2 incidents.
- Lessons learned documented.
- Project formally closed.

---

## 11. Exception Management

If any stage exceeds its tolerances:

1. Project Manager prepares an Exception Report.
2. Exception Report submitted to the Project Board within 24 hours.
3. Project Board decides: approve exception, re-plan the stage, or escalate.
4. If approved, an Exception Plan replaces the remaining stage plan.

---

## 12. References

- [Project Initiation Document](project-initiation-document.md)
- [Schedule Management Plan](../pmp/schedule-management.md)
- [Work Breakdown Structure](../pmp/wbs.md)
- [Risk Register](../pmp/risk-register.md)
- [Quality Register](quality-register.md)
- [Product Descriptions](product-descriptions.md)
- [Deployment Plan](../planning/deployment-plan.md)
- [Migration Plan](../planning/migration-plan.md)
