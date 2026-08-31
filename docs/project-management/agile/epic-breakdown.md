# SALIS AUTO -- Epic Breakdown

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-AGI-005                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Active                                     |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document decomposes each of the 13 domain epics (plus infrastructure) into features and stories. It bridges the gap between the high-level [Product Backlog](product-backlog.md) and the detailed [User Stories](user-stories.md), providing a mid-level view of the platform's feature set.

---

## 2. Epic Summary

| Epic ID | Domain                | Epic Title                                | Priority | Stories | Points |
|---------|-----------------------|-------------------------------------------|----------|---------|--------|
| E-01    | Authentication        | User Authentication & Session Management  | Must     | 7       | 44     |
| E-02    | Administration        | RBAC & Multi-Tenant Foundation            | Must     | 10      | 73     |
| E-03    | Workshop              | Workshop Lifecycle Management             | Must     | 12      | 102    |
| E-04    | Registry              | Customer & Vehicle Registry               | Must     | 7       | 44     |
| E-05    | Finance               | Invoicing, Payments & ZATCA Compliance    | Must     | 10      | 81     |
| E-06    | Accounting            | Core Accounting & Financial Reports       | Must     | 6       | 42     |
| E-07    | Parts & Inventory     | Inventory Management & Procurement        | Must     | 9       | 62     |
| E-08    | Portals               | Customer & Supplier Self-Service Portals  | Must     | 7       | 47     |
| E-09    | Infrastructure        | Platform Infrastructure & CI/CD           | Must     | 10      | 61     |
| E-10    | Reports & Analytics   | Dashboards, KPIs & Export                 | Should   | 6       | 36     |
| E-11    | CRM & Marketing       | Customer Engagement & Campaigns           | Should   | 5       | 34     |
| E-12    | Team & HR             | Employee Management & Payroll Prep        | Should   | 5       | 31     |
| E-13    | Call Center           | Support Tickets & Call Management         | Should   | 5       | 29     |
| E-14    | AI Platform           | OBD Diagnostics & Predictive Maintenance  | Could    | 5       | 50     |

---

## 3. E-01: Authentication -- Feature Breakdown

### Feature F-01.1: Credential-Based Login
| Story ID | Title                               | Points | Priority |
|----------|-------------------------------------|--------|----------|
| AUTH-001 | Email/phone login with +966 validation | 5    | Must     |
| AUTH-007 | Login page bilingual (EN/AR + RTL)  | 5      | Must     |

### Feature F-01.2: Token Management
| Story ID | Title                               | Points | Priority |
|----------|-------------------------------------|--------|----------|
| AUTH-002 | JWT access token issuance           | 8      | Must     |
| AUTH-003 | Refresh token rotation + revocation | 8      | Must     |

### Feature F-01.3: Account Security
| Story ID | Title                               | Points | Priority |
|----------|-------------------------------------|--------|----------|
| AUTH-004 | Password reset (email + SMS OTP)    | 5      | Must     |
| AUTH-005 | MFA enrollment and verification     | 8      | Must     |
| AUTH-006 | Session management UI               | 5      | Must     |

---

## 4. E-02: RBAC & Administration -- Feature Breakdown

### Feature F-02.1: Role & Permission Schema
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| RBAC-001 | 14-role schema with 28 module mappings  | 8      | Must     |
| RBAC-002 | Permission seed data and migration      | 5      | Must     |
| RBAC-010 | Role management UI                      | 5      | Should   |

### Feature F-02.2: Triple-Layer Enforcement
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| RBAC-003 | JWT claims (role, branch, org, scope)   | 5      | Must     |
| RBAC-004 | UI `can()` hook and route guards        | 8      | Must     |
| RBAC-005 | API middleware enforcement              | 8      | Must     |
| RBAC-006 | PostgreSQL RLS for tenant isolation     | 13     | Must     |

### Feature F-02.3: Advanced Access Control
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| RBAC-007 | 6 separation-of-duties pairs            | 8      | Must     |
| RBAC-008 | 7 field-level redaction rules           | 5      | Must     |
| RBAC-009 | 8 data scopes (platform to self)        | 8      | Must     |

---

## 5. E-03: Workshop -- Feature Breakdown

### Feature F-03.1: Job Management
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| WRK-001  | Job card schema and CRUD                | 8      | Must     |
| WRK-002  | 6-state lifecycle state machine         | 13     | Must     |
| WRK-011  | Service type catalog                    | 5      | Must     |

### Feature F-03.2: Workshop Process Flow
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| WRK-003  | Vehicle check-in form                   | 8      | Must     |
| WRK-004  | Inspection checklist (configurable)     | 8      | Must     |
| WRK-005  | Estimate builder with line items        | 8      | Must     |
| WRK-006  | Repair tracking + time logging          | 8      | Must     |
| WRK-007  | QC inspection pass/fail                 | 5      | Must     |
| WRK-008  | Delivery confirmation                   | 5      | Must     |

### Feature F-03.3: Workshop Operations
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| WRK-009  | Bay management dashboard                | 8      | Should   |
| WRK-010  | Technician assignment + workload        | 8      | Should   |
| WRK-012  | Real-time job status board              | 8      | Should   |

---

## 6. E-04: Registry -- Feature Breakdown

### Feature F-04.1: Customer Management
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| REG-001  | Customer schema with +966 validation    | 5      | Must     |
| REG-002  | Customer CRUD + search + pagination     | 8      | Must     |
| REG-007  | Customer merge/dedup utility            | 8      | Should   |

### Feature F-04.2: Vehicle Management
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| REG-003  | Vehicle schema with Saudi plate format  | 5      | Must     |
| REG-004  | Vehicle CRUD + VIN decoder              | 8      | Must     |
| REG-005  | Customer-vehicle linking (M:N)          | 5      | Must     |
| REG-006  | Service history timeline                | 5      | Must     |

---

## 7. E-05: Finance & ZATCA -- Feature Breakdown

### Feature F-05.1: Invoice Management
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| FIN-001  | Invoice schema (halala integers)        | 5      | Must     |
| FIN-002  | Invoice generation from estimate        | 8      | Must     |
| FIN-010  | VAT 15% calculation engine              | 5      | Must     |

### Feature F-05.2: ZATCA Phase 2 Compliance
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| FIN-003  | ZATCA Phase 2 XML builder               | 13     | Must     |
| FIN-004  | QR code with TLV encoding               | 8      | Must     |
| FIN-005  | Hash chain for invoice sequence         | 8      | Must     |
| FIN-006  | ZATCA API clearance/reporting           | 13     | Must     |

### Feature F-05.3: Payments & Adjustments
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| FIN-007  | Payment recording (4 methods)           | 8      | Must     |
| FIN-008  | Receipt printing (bilingual)            | 5      | Should   |
| FIN-009  | Credit note and refund workflow         | 8      | Should   |

---

## 8. E-06: Accounting -- Feature Breakdown

### Feature F-06.1: General Ledger
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| ACC-001  | Chart of accounts (Saudi standard)      | 8      | Must     |
| ACC-002  | Journal entry CRUD + double-entry       | 8      | Must     |

### Feature F-06.2: Financial Reports
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| ACC-003  | Trial balance report                    | 5      | Must     |
| ACC-004  | Income statement and balance sheet      | 8      | Must     |
| ACC-005  | AR/AP aging reports                     | 5      | Should   |
| ACC-006  | Bank reconciliation workflow            | 8      | Should   |

---

## 9. E-07: Parts & Inventory -- Feature Breakdown

### Feature F-07.1: Stock Management
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| INV-001  | Part/product schema + branch stock      | 5      | Must     |
| INV-002  | Stock level dashboard with alerts       | 8      | Must     |
| INV-008  | Stock transfer between branches         | 5      | Should   |

### Feature F-07.2: Procurement
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| INV-003  | PO lifecycle (request->approve->receive)| 13     | Must     |
| INV-004  | Approval chain (SAR 10K/20K/50K)       | 8      | Must     |
| INV-005  | Supplier catalog and pricing tiers      | 5      | Must     |
| INV-006  | Reorder point + auto-PO                 | 8      | Should   |

### Feature F-07.3: Parts Intelligence
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| INV-007  | Parts compatibility matrix              | 8      | Should   |
| INV-009  | Goods receipt + discrepancy handling     | 5      | Must     |

---

## 10. E-08: Portals -- Feature Breakdown

### Feature F-08.1: Customer Portal
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| PTL-001  | Repair status tracking                  | 8      | Must     |
| PTL-002  | Estimate approval (6-step e-signature)  | 13     | Must     |
| PTL-003  | Invoice viewer                          | 5      | Must     |
| PTL-004  | Service rating                          | 3      | Should   |

### Feature F-08.2: Supplier Portal
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| PTL-005  | PO acknowledgment                       | 5      | Must     |
| PTL-006  | Invoice submission                      | 5      | Must     |

### Feature F-08.3: Technician Mobile View
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| PTL-007  | Job list + time logging (mobile-first)  | 8      | Must     |

---

## 11. E-09: Infrastructure -- Feature Breakdown

### Feature F-09.1: Frontend Foundation
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| INF-001  | Vite + TypeScript scaffold              | 3      | Must     |
| INF-002  | TailwindCSS + RTL plugin               | 3      | Must     |
| INF-003  | React Router 7 skeleton                 | 5      | Must     |
| INF-004  | TanStack React Query provider           | 3      | Must     |
| INF-008  | i18n framework (EN/AR)                  | 8      | Must     |

### Feature F-09.2: Backend Foundation
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| INF-005  | Express API scaffold + middleware       | 5      | Must     |
| INF-006  | Drizzle ORM + PostgreSQL connection     | 5      | Must     |
| INF-007  | PGlite local dev environment            | 3      | Must     |
| INF-010  | Multi-tenant schema design              | 8      | Must     |

### Feature F-09.3: DevOps
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| INF-009  | CI/CD pipeline (lint, test, build, deploy) | 8   | Must     |

---

## 12. E-10: Reports & Analytics -- Feature Breakdown

### Feature F-10.1: Dashboards
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| RPT-001  | Owner cross-branch dashboard            | 8      | Should   |
| RPT-002  | Branch Manager dashboard                | 5      | Should   |
| RPT-003  | KPI widgets (revenue, throughput, NPS)  | 8      | Should   |

### Feature F-10.2: Report Engine
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| RPT-004  | Scheduled report generation             | 5      | Should   |
| RPT-005  | Export to PDF, Excel, CSV               | 5      | Should   |
| RPT-006  | Data scope enforcement (8 scopes)       | 5      | Must     |

---

## 13. E-11: CRM & Marketing -- Feature Breakdown

### Feature F-11.1: Customer Engagement
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| CRM-001  | Customer segmentation engine            | 8      | Should   |
| CRM-004  | Follow-up scheduler                     | 5      | Should   |
| CRM-005  | Lead pipeline board                     | 5      | Could    |

### Feature F-11.2: Campaigns
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| CRM-002  | Campaign builder (SMS/WhatsApp/email)   | 8      | Should   |
| CRM-003  | Loyalty program (points, tiers)         | 8      | Could    |

---

## 14. E-12: Team & HR -- Feature Breakdown

### Feature F-12.1: Employee Records
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| HR-001   | Employee record CRUD (Saudi ID)         | 5      | Should   |
| HR-005   | Performance review templates            | 5      | Could    |

### Feature F-12.2: Time & Leave
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| HR-002   | Attendance (clock in/out)               | 5      | Should   |
| HR-003   | Leave management                        | 8      | Should   |
| HR-004   | Payroll preparation reports             | 8      | Should   |

---

## 15. E-13: Call Center -- Feature Breakdown

### Feature F-13.1: Ticket Management
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| CC-001   | Call logging schema and UI              | 5      | Should   |
| CC-002   | Ticket queue with SLA tracking          | 8      | Should   |
| CC-005   | Callback scheduling                     | 3      | Could    |

### Feature F-13.2: Escalation
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| CC-003   | IVR integration hooks                   | 8      | Should   |
| CC-004   | Escalation workflow engine              | 5      | Should   |

---

## 16. E-14: AI Platform -- Feature Breakdown

### Feature F-14.1: OBD Diagnostics
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| AI-001   | OBD-II code parser and lookup           | 8      | Could    |
| AI-002   | 5-desk diagnostic handoff chain         | 13     | Could    |

### Feature F-14.2: Intelligence
| Story ID | Title                                   | Points | Priority |
|----------|-----------------------------------------|--------|----------|
| AI-003   | Predictive maintenance scoring          | 13     | Could    |
| AI-004   | NLP service intake                      | 8      | Could    |
| AI-005   | AI-assisted estimate generation         | 8      | Could    |

---

## 17. Dependency Map Between Epics

| From Epic | To Epic   | Dependency Description                                     |
|-----------|-----------|------------------------------------------------------------|
| E-09      | All       | Infrastructure must be ready before any domain work        |
| E-01      | All       | Authentication required for all authenticated screens      |
| E-02      | All       | RBAC required for all role-based access                    |
| E-04      | E-03      | Registry (vehicle lookup) needed for Workshop check-in     |
| E-03      | E-05      | Workshop estimates feed into Finance invoices              |
| E-05      | E-06      | Finance transactions feed into Accounting journal entries  |
| E-07      | E-03      | Parts availability needed during Workshop repair step      |
| E-03, E-05| E-08      | Portals display Workshop status and Finance invoices       |
| E-02      | E-07      | RBAC approval limits needed for Parts procurement chain    |
| E-04      | E-11      | Registry customer data feeds CRM segmentation              |

---

## 18. References

- [Product Backlog](product-backlog.md)
- [User Stories](user-stories.md)
- [Work Breakdown Structure](../pmp/wbs.md)
- [Schedule Management Plan](../pmp/schedule-management.md)
- [Definition of Done](definition-of-done.md)
