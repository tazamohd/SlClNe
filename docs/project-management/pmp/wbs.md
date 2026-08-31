# SALIS AUTO -- Work Breakdown Structure

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This WBS decomposes the SALIS AUTO platform into manageable work packages organized by domain. Each leaf-level work package maps to one or more user stories in the [Product Backlog](../agile/product-backlog.md) and is estimable, assignable, and testable.

---

## 2. WBS Numbering Convention

```
SA-<Phase>.<Domain>.<Feature>.<Work Package>
```

- **Phase:** 1 = Foundation, 2 = Core, 3 = Extended, 4 = Integration, 5 = Testing, 6 = Deployment
- **Domain:** Two-digit domain code (01--13)
- **Feature:** Sequential feature within domain
- **Work Package:** Leaf-level task

---

## 3. Phase 1 -- Foundation

### SA-1.00 Project Management

| WP ID        | Work Package                          | Effort (SP) |
|--------------|---------------------------------------|-------------|
| SA-1.00.01   | Project charter and PID              | 5           |
| SA-1.00.02   | WBS and schedule baseline            | 8           |
| SA-1.00.03   | Risk register and mitigation plans   | 5           |
| SA-1.00.04   | Communication plan and RACI          | 3           |
| SA-1.00.05   | Backlog grooming and sprint 0        | 8           |

### SA-1.07 Authentication Domain

| WP ID        | Work Package                                      | Effort (SP) |
|--------------|---------------------------------------------------|-------------|
| SA-1.07.01   | DB schema: users, sessions, refresh_tokens        | 5           |
| SA-1.07.02   | JWT access token issuance and validation           | 8           |
| SA-1.07.03   | Refresh token rotation with revocation             | 8           |
| SA-1.07.04   | Login page (EN/AR) with +966 phone support         | 5           |
| SA-1.07.05   | Password reset flow (email + SMS OTP)              | 5           |
| SA-1.07.06   | MFA enrollment and verification                    | 8           |
| SA-1.07.07   | Session management UI (active sessions, logout)    | 5           |

### SA-1.06 Administration Domain -- RBAC

| WP ID        | Work Package                                      | Effort (SP) |
|--------------|---------------------------------------------------|-------------|
| SA-1.06.01   | Role schema: 14 roles, 28 modules                 | 8           |
| SA-1.06.02   | Permission seed data and migration                 | 5           |
| SA-1.06.03   | JWT claims embedding (role, branch, org, scope)    | 5           |
| SA-1.06.04   | UI `can()` hook and route guards                   | 8           |
| SA-1.06.05   | API middleware: role + scope enforcement            | 8           |
| SA-1.06.06   | DB RLS policies for tenant isolation               | 13          |
| SA-1.06.07   | 6 separation-of-duties pair enforcement            | 8           |
| SA-1.06.08   | 7 field-level redaction rules                      | 5           |
| SA-1.06.09   | 8 data scopes implementation                       | 8           |
| SA-1.06.10   | Role management UI (create, edit, clone roles)     | 5           |

### SA-1.14 Infrastructure

| WP ID        | Work Package                                      | Effort (SP) |
|--------------|---------------------------------------------------|-------------|
| SA-1.14.01   | Vite project scaffold + TypeScript config          | 3           |
| SA-1.14.02   | TailwindCSS + RTL plugin setup                     | 3           |
| SA-1.14.03   | React Router 7 routing skeleton                    | 5           |
| SA-1.14.04   | TanStack React Query provider + defaults           | 3           |
| SA-1.14.05   | Express API scaffold + middleware stack             | 5           |
| SA-1.14.06   | Drizzle ORM setup + PostgreSQL connection           | 5           |
| SA-1.14.07   | PGlite local dev environment                       | 3           |
| SA-1.14.08   | i18n framework (EN/AR) with namespace loading      | 8           |
| SA-1.14.09   | CI/CD pipeline (lint, test, build, deploy)          | 8           |
| SA-1.14.10   | Multi-tenant schema design (org_id, branch_id)     | 8           |

---

## 4. Phase 2 -- Core Domains

### SA-2.01 Workshop Domain

| WP ID        | Work Package                                        | Effort (SP) |
|--------------|-----------------------------------------------------|-------------|
| SA-2.01.01   | Job card schema and CRUD API                        | 8           |
| SA-2.01.02   | Job lifecycle state machine (6 states)               | 13          |
| SA-2.01.03   | Check-in form with vehicle lookup                    | 8           |
| SA-2.01.04   | Inspection checklist (configurable per service type) | 8           |
| SA-2.01.05   | Estimate builder with line items                     | 8           |
| SA-2.01.06   | Repair tracking with technician time logging          | 8           |
| SA-2.01.07   | QC inspection form and pass/fail workflow             | 5           |
| SA-2.01.08   | Delivery confirmation and handoff                     | 5           |
| SA-2.01.09   | Bay management dashboard                              | 8           |
| SA-2.01.10   | Technician assignment and workload balancing           | 8           |
| SA-2.01.11   | Service type catalog CRUD                              | 5           |
| SA-2.01.12   | Real-time job status board                             | 8           |

### SA-2.02 Registry Domain

| WP ID        | Work Package                                        | Effort (SP) |
|--------------|-----------------------------------------------------|-------------|
| SA-2.02.01   | Customer schema with Saudi phone validation          | 5           |
| SA-2.02.02   | Customer CRUD + search + pagination                  | 8           |
| SA-2.02.03   | Vehicle schema with Saudi plate format               | 5           |
| SA-2.02.04   | Vehicle CRUD + VIN decoder integration               | 8           |
| SA-2.02.05   | Customer-vehicle linking (M:N)                        | 5           |
| SA-2.02.06   | Service history timeline component                    | 5           |
| SA-2.02.07   | Customer merge/dedup utility                          | 8           |

### SA-2.03 Finance Domain

| WP ID        | Work Package                                        | Effort (SP) |
|--------------|-----------------------------------------------------|-------------|
| SA-2.03.01   | Invoice schema (halala integer storage)              | 5           |
| SA-2.03.02   | Invoice generation from job estimate                  | 8           |
| SA-2.03.03   | ZATCA Phase 2 XML builder                             | 13          |
| SA-2.03.04   | QR code generation with ZATCA TLV encoding            | 8           |
| SA-2.03.05   | Hash chain implementation for invoice sequence         | 8           |
| SA-2.03.06   | ZATCA API integration (clearance + reporting)          | 13          |
| SA-2.03.07   | Payment recording (cash, card, bank, credit)           | 8           |
| SA-2.03.08   | Receipt printing (dual-language)                       | 5           |
| SA-2.03.09   | Credit note and refund workflow                        | 8           |
| SA-2.03.10   | VAT 15% calculation engine                             | 5           |

### SA-2.04 Accounting Domain

| WP ID        | Work Package                                        | Effort (SP) |
|--------------|-----------------------------------------------------|-------------|
| SA-2.04.01   | Chart of accounts (Saudi standard)                   | 8           |
| SA-2.04.02   | Journal entry CRUD with double-entry validation       | 8           |
| SA-2.04.03   | Trial balance report                                  | 5           |
| SA-2.04.04   | Income statement and balance sheet                    | 8           |
| SA-2.04.05   | AR/AP aging reports                                   | 5           |
| SA-2.04.06   | Bank reconciliation workflow                          | 8           |

### SA-2.09 Parts & Inventory Domain

| WP ID        | Work Package                                        | Effort (SP) |
|--------------|-----------------------------------------------------|-------------|
| SA-2.09.01   | Part/product schema with branch stock levels          | 5           |
| SA-2.09.02   | Stock level dashboard with alerts                     | 8           |
| SA-2.09.03   | Purchase order lifecycle (request -> approve -> receive) | 13       |
| SA-2.09.04   | Approval chain (Parts SAR 10K -> Procurement SAR 20K -> Manager SAR 50K) | 8 |
| SA-2.09.05   | Supplier catalog and pricing tiers                    | 5           |
| SA-2.09.06   | Reorder point configuration and auto-PO               | 8           |
| SA-2.09.07   | Parts compatibility matrix                            | 8           |
| SA-2.09.08   | Stock transfer between branches                       | 5           |
| SA-2.09.09   | Goods receipt and discrepancy handling                 | 5           |

---

## 5. Phase 3 -- Extended Domains

### SA-3.05 CRM & Marketing Domain

| WP ID        | Work Package                        | Effort (SP) |
|--------------|-------------------------------------|-------------|
| SA-3.05.01   | Customer segmentation engine        | 8           |
| SA-3.05.02   | Campaign builder (SMS/WhatsApp/email) | 8         |
| SA-3.05.03   | Loyalty program (points, tiers)     | 8           |
| SA-3.05.04   | Follow-up scheduler                 | 5           |
| SA-3.05.05   | Lead pipeline board                 | 5           |

### SA-3.08 AI Platform Domain

| WP ID        | Work Package                              | Effort (SP) |
|--------------|-------------------------------------------|-------------|
| SA-3.08.01   | OBD-II code parser and lookup             | 8           |
| SA-3.08.02   | 5-desk diagnostic handoff chain            | 13          |
| SA-3.08.03   | Predictive maintenance scoring model       | 13          |
| SA-3.08.04   | NLP service intake                         | 8           |
| SA-3.08.05   | AI-assisted estimate generation            | 8           |

### SA-3.10 Call Center Domain

| WP ID        | Work Package                        | Effort (SP) |
|--------------|-------------------------------------|-------------|
| SA-3.10.01   | Call logging schema and UI          | 5           |
| SA-3.10.02   | Ticket queue with SLA tracking      | 8           |
| SA-3.10.03   | IVR integration hooks               | 8           |
| SA-3.10.04   | Escalation workflow engine          | 5           |
| SA-3.10.05   | Callback scheduling                 | 3           |

### SA-3.12 Team & HR Domain

| WP ID        | Work Package                         | Effort (SP) |
|--------------|--------------------------------------|-------------|
| SA-3.12.01   | Employee record CRUD (Saudi ID)      | 5           |
| SA-3.12.02   | Attendance (clock in/out)            | 5           |
| SA-3.12.03   | Leave management                     | 8           |
| SA-3.12.04   | Payroll preparation reports          | 8           |
| SA-3.12.05   | Performance review templates         | 5           |

### SA-3.13 Portals Domain

| WP ID        | Work Package                                    | Effort (SP) |
|--------------|--------------------------------------------------|-------------|
| SA-3.13.01   | Customer portal: repair status tracking          | 8           |
| SA-3.13.02   | Customer portal: estimate approval (6-step e-sig) | 13         |
| SA-3.13.03   | Customer portal: invoice viewer                  | 5           |
| SA-3.13.04   | Customer portal: service rating                  | 3           |
| SA-3.13.05   | Supplier portal: PO acknowledgment               | 5           |
| SA-3.13.06   | Supplier portal: invoice submission               | 5           |
| SA-3.13.07   | Technician mobile view: job list + time logging   | 8           |

---

## 6. Phase 4 -- Integration

| WP ID        | Work Package                                | Effort (SP) |
|--------------|---------------------------------------------|-------------|
| SA-4.01      | ZATCA production certification               | 13          |
| SA-4.02      | Notification fan-out engine (5 channels)     | 13          |
| SA-4.03      | Approval chain orchestrator                  | 8           |
| SA-4.04      | Cross-domain event bus                       | 8           |
| SA-4.05      | Multi-tenant onboarding flow (3 paths)       | 8           |
| SA-4.06      | Audit log aggregation and viewer             | 5           |
| SA-4.07      | Reports & Analytics: KPI dashboards           | 13          |
| SA-4.08      | Reports & Analytics: scheduled reports        | 5           |
| SA-4.09      | Reports & Analytics: export engine            | 5           |

---

## 7. Phase 5 -- Testing & Hardening

| WP ID        | Work Package                             | Effort (SP) |
|--------------|------------------------------------------|-------------|
| SA-5.01      | Unit test gap closure (Vitest >= 80%)    | 13          |
| SA-5.02      | Integration test suite (Supertest >= 70%) | 13         |
| SA-5.03      | E2E critical path suite (Playwright)      | 13          |
| SA-5.04      | RTL visual regression tests               | 8           |
| SA-5.05      | Performance tuning (Lighthouse >= 80)     | 8           |
| SA-5.06      | Security penetration test                  | 8           |
| SA-5.07      | WCAG 2.1 AA accessibility audit           | 8           |
| SA-5.08      | Load testing (k6)                          | 5           |

---

## 8. Phase 6 -- Deployment & Launch

| WP ID        | Work Package                                  | Effort (SP) |
|--------------|-----------------------------------------------|-------------|
| SA-6.01      | Production environment provisioning            | 5           |
| SA-6.02      | PGlite to PostgreSQL data migration            | 8           |
| SA-6.03      | DNS and SSL configuration                      | 3           |
| SA-6.04      | User acceptance testing (UAT)                  | 8           |
| SA-6.05      | Training materials and role-based user guides  | 8           |
| SA-6.06      | Go-live checklist and cutover                  | 5           |
| SA-6.07      | Post-launch monitoring and support (30 days)   | 13          |

---

## 9. WBS Summary

| Phase                  | Work Packages | Total Story Points |
|------------------------|---------------|--------------------|
| Foundation             | 31            | 192                |
| Core Domains           | 44            | 307                |
| Extended Domains       | 27            | 189                |
| Integration            | 9             | 78                 |
| Testing & Hardening    | 8             | 76                 |
| Deployment & Launch    | 7             | 50                 |
| **Total**              | **126**       | **892**            |

---

## 10. References

- [Project Charter](project-charter.md)
- [Scope Statement](scope-statement.md)
- [Schedule Management Plan](schedule-management.md)
- [Product Backlog](../agile/product-backlog.md)
- [Epic Breakdown](../agile/epic-breakdown.md)
