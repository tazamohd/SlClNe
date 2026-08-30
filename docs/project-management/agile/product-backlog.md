# SALIS AUTO -- Product Backlog

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-AGI-001                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the product backlog for SALIS AUTO, organized as epics mapped to the 13 platform domains. Each epic is prioritized using the MoSCoW framework, and decomposed into features in the [Epic Breakdown](epic-breakdown.md) and stories in [User Stories](user-stories.md).

---

## 2. Prioritization Framework

### 2.1 MoSCoW Definitions

| Priority       | Definition                                                                   | Target     |
|----------------|-----------------------------------------------------------------------------|------------|
| **Must Have**  | Non-negotiable for launch. Without it, the platform has no viable product.  | Sprint 1--20 |
| **Should Have**| Important but not fatal if delayed. Significant business value.              | Sprint 15--22|
| **Could Have** | Desirable. Enhances UX or efficiency but launch-viable without it.          | Sprint 20--23|
| **Won't Have** | Acknowledged but explicitly excluded from Phase 1.                          | Phase 2+   |

### 2.2 Prioritization Criteria

Each backlog item is scored against:

| Criterion            | Weight | Description                                              |
|----------------------|--------|----------------------------------------------------------|
| Business value       | 30%    | Revenue impact, competitive advantage, user demand       |
| Regulatory necessity | 25%    | ZATCA compliance, Saudi labor law, data residency        |
| Technical dependency | 25%    | Blocks other features; on critical path                  |
| User reach           | 10%    | Number of roles/users impacted                           |
| Complexity risk      | 10%    | Inversely scored -- simpler items rank higher when tied  |

---

## 3. Epic Registry

### 3.1 Must Have Epics

| Epic ID | Domain                | Epic Title                                  | Stories | Points | Sprint Target |
|---------|-----------------------|---------------------------------------------|---------|--------|---------------|
| E-01    | Authentication        | User Authentication & Session Management    | 7       | 44     | S1--S2        |
| E-02    | Administration        | RBAC & Multi-Tenant Foundation              | 10      | 73     | S2--S3        |
| E-03    | Workshop              | Workshop Lifecycle Management               | 12      | 102    | S4--S6        |
| E-04    | Registry              | Customer & Vehicle Registry                 | 7       | 44     | S7            |
| E-05    | Finance               | Invoicing, Payments & ZATCA Compliance      | 10      | 81     | S8--S10       |
| E-06    | Accounting            | Core Accounting & Financial Reports         | 6       | 42     | S11           |
| E-07    | Parts & Inventory     | Inventory Management & Procurement          | 9       | 62     | S12           |
| E-08    | Portals               | Customer & Supplier Self-Service Portals    | 7       | 47     | S17           |
| E-09    | Infrastructure        | Platform Infrastructure & CI/CD             | 10      | 61     | S1 (Sprint 0) |

### 3.2 Should Have Epics

| Epic ID | Domain                | Epic Title                                  | Stories | Points | Sprint Target |
|---------|-----------------------|---------------------------------------------|---------|--------|---------------|
| E-10    | Reports & Analytics   | Dashboards, KPIs & Export                   | 6       | 36     | S18--S20      |
| E-11    | CRM & Marketing       | Customer Engagement & Campaigns             | 5       | 34     | S13           |
| E-12    | Team & HR             | Employee Management & Payroll Prep          | 5       | 31     | S15--S16      |
| E-13    | Call Center           | Support Tickets & Call Management           | 5       | 29     | S15           |

### 3.3 Could Have Epics

| Epic ID | Domain                | Epic Title                                  | Stories | Points | Sprint Target |
|---------|-----------------------|---------------------------------------------|---------|--------|---------------|
| E-14    | AI Platform           | OBD Diagnostics & Predictive Maintenance    | 5       | 50     | S14           |

### 3.4 Won't Have (Phase 2)

| Epic ID | Domain            | Epic Title                                        | Rationale                          |
|---------|-------------------|---------------------------------------------------|------------------------------------|
| E-15    | Mobile            | Native iOS/Android Applications                   | Web-responsive for Phase 1        |
| E-16    | Integration       | OEM DMS Integration                                | Requires manufacturer agreements  |
| E-17    | Finance           | Multi-Currency Support                             | SAR only for Phase 1              |
| E-18    | Infrastructure    | Offline Mode / PWA                                 | Service worker investment deferred|
| E-19    | Registry          | Urdu/Hindi/Tagalog Localization                    | EN/AR only for Phase 1            |

---

## 4. Backlog by Domain

### 4.1 E-01: Authentication (Must Have)

| Story ID   | Title                                    | Points | Priority  |
|------------|------------------------------------------|--------|-----------|
| AUTH-001   | Email/phone login with +966 validation   | 5      | Must      |
| AUTH-002   | JWT access token issuance                | 8      | Must      |
| AUTH-003   | Refresh token rotation with revocation   | 8      | Must      |
| AUTH-004   | Password reset (email + SMS OTP)         | 5      | Must      |
| AUTH-005   | MFA enrollment and verification          | 8      | Must      |
| AUTH-006   | Session management UI                    | 5      | Must      |
| AUTH-007   | Login page bilingual (EN/AR + RTL)       | 5      | Must      |

### 4.2 E-02: RBAC & Administration (Must Have)

| Story ID   | Title                                         | Points | Priority  |
|------------|-----------------------------------------------|--------|-----------|
| RBAC-001   | 14-role schema with 28 module mappings        | 8      | Must      |
| RBAC-002   | Permission seed and migration                 | 5      | Must      |
| RBAC-003   | JWT claims: role, branch, org, scope           | 5      | Must      |
| RBAC-004   | UI `can()` hook and route guards              | 8      | Must      |
| RBAC-005   | API middleware enforcement                     | 8      | Must      |
| RBAC-006   | PostgreSQL RLS for tenant isolation            | 13     | Must      |
| RBAC-007   | 6 separation-of-duties pairs                  | 8      | Must      |
| RBAC-008   | 7 field-level redaction rules                  | 5      | Must      |
| RBAC-009   | 8 data scopes (platform to self)               | 8      | Must      |
| RBAC-010   | Role management UI                             | 5      | Should    |

### 4.3 E-03: Workshop (Must Have)

| Story ID   | Title                                       | Points | Priority  |
|------------|---------------------------------------------|--------|-----------|
| WRK-001    | Job card schema and CRUD                    | 8      | Must      |
| WRK-002    | 6-state lifecycle state machine              | 13     | Must      |
| WRK-003    | Vehicle check-in form                        | 8      | Must      |
| WRK-004    | Inspection checklist (configurable)          | 8      | Must      |
| WRK-005    | Estimate builder with line items             | 8      | Must      |
| WRK-006    | Repair tracking + time logging               | 8      | Must      |
| WRK-007    | QC inspection pass/fail                      | 5      | Must      |
| WRK-008    | Delivery confirmation                        | 5      | Must      |
| WRK-009    | Bay management dashboard                     | 8      | Should    |
| WRK-010    | Technician assignment + workload             | 8      | Should    |
| WRK-011    | Service type catalog                         | 5      | Must      |
| WRK-012    | Real-time job status board                   | 8      | Should    |

### 4.4 E-05: Finance & ZATCA (Must Have)

| Story ID   | Title                                       | Points | Priority  |
|------------|---------------------------------------------|--------|-----------|
| FIN-001    | Invoice schema (halala integers)            | 5      | Must      |
| FIN-002    | Invoice generation from estimate            | 8      | Must      |
| FIN-003    | ZATCA Phase 2 XML builder                   | 13     | Must      |
| FIN-004    | QR code with TLV encoding                   | 8      | Must      |
| FIN-005    | Hash chain for invoice sequence             | 8      | Must      |
| FIN-006    | ZATCA API clearance/reporting               | 13     | Must      |
| FIN-007    | Payment recording (4 methods)               | 8      | Must      |
| FIN-008    | Receipt printing (bilingual)                | 5      | Should    |
| FIN-009    | Credit note and refund workflow             | 8      | Should    |
| FIN-010    | VAT 15% calculation engine                  | 5      | Must      |

---

## 5. Cross-Cutting Concerns

These items span multiple epics and are tracked as standalone backlog items:

| Story ID   | Title                                          | Points | Priority  | Affects              |
|------------|------------------------------------------------|--------|-----------|----------------------|
| XC-001     | i18n framework (EN/AR) with namespace loading  | 8      | Must      | All domains          |
| XC-002     | RTL layout foundation (TailwindCSS plugin)     | 5      | Must      | All domains          |
| XC-003     | Notification fan-out engine (5 channels)       | 13     | Must      | Workshop, Finance, CRM|
| XC-004     | Approval chain orchestrator                     | 8      | Must      | Finance, Parts, HR   |
| XC-005     | Multi-tenant onboarding (3 paths)               | 8      | Must      | Administration       |
| XC-006     | Audit log aggregation                           | 5      | Should    | All domains          |
| XC-007     | Global search across entities                   | 5      | Could     | All domains          |

---

## 6. Backlog Grooming Process

| Activity                     | Frequency    | Participants              | Output                      |
|------------------------------|-------------|---------------------------|-----------------------------|
| Backlog refinement           | Weekly      | PO, TL, Senior devs      | Refined stories ready for sprint |
| Epic review                  | Monthly     | PO, PM, Sponsor           | Priority adjustments         |
| Story point estimation       | Per refinement | Dev team (Planning Poker) | Estimated stories            |
| Acceptance criteria review   | Per refinement | PO, QA Lead              | Testable acceptance criteria |
| Technical spike planning     | As needed   | TL, Senior devs           | Spike stories added          |

---

## 7. Velocity and Capacity

| Metric                    | Baseline         | Notes                                    |
|---------------------------|------------------|------------------------------------------|
| Team size                 | 6 developers     | Full-stack, with ZATCA specialist         |
| Sprint duration           | 2 weeks          | 10 working days                          |
| Target velocity           | 40 SP/sprint     | Based on Sprint 0 calibration            |
| Total backlog             | 892 SP           | Per [WBS](../pmp/wbs.md) summary         |
| Estimated sprints         | 23               | Including buffer sprints                 |

---

## 8. References

- [Epic Breakdown](epic-breakdown.md)
- [User Stories](user-stories.md)
- [Definition of Done](definition-of-done.md)
- [Sprint Template](sprint-template.md)
- [Work Breakdown Structure](../pmp/wbs.md)
- [Scope Statement](../pmp/scope-statement.md)
