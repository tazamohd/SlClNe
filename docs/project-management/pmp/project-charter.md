# SALIS AUTO -- Project Charter

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-001                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Project Overview

### 1.1 Project Title

SALIS AUTO -- Multi-Tenant Automotive Workshop Management Platform

### 1.2 Project Vision

Deliver a cloud-native, bilingual (EN/AR with full RTL support) workshop management platform purpose-built for the Saudi Arabian automotive aftermarket. SALIS AUTO will unify every operational domain -- from vehicle check-in through quality-controlled delivery -- into a single SaaS product that enforces ZATCA Phase 2 e-invoicing compliance, scales across branches, and serves 14 distinct user roles through 191+ screens.

### 1.3 Business Need

Saudi Arabia's automotive workshop sector is fragmented across paper-based processes, disconnected point solutions, and non-compliant invoicing. SALIS AUTO addresses:

- **Regulatory gap:** ZATCA Phase 2 mandates XML e-invoices with QR codes, hash chains, and real-time clearance. Most workshops lack compliant systems.
- **Operational inefficiency:** The check-in-to-delivery lifecycle (Check-In, Inspection, Estimate, Repair, QC, Delivery) is typically managed through WhatsApp threads and paper job cards.
- **Multi-branch blindness:** Owners and managers cannot see cross-branch KPIs, technician utilization, or parts inventory in real time.
- **Customer friction:** Estimate approvals require physical visits; no self-service portals exist for tracking repair status.

---

## 2. Project Objectives

| ID    | Objective                                                         | Measure                                     |
|-------|-------------------------------------------------------------------|---------------------------------------------|
| OBJ-1 | Deliver 13 fully integrated domains                              | All 191+ screens functional and tested      |
| OBJ-2 | Achieve ZATCA Phase 2 e-invoicing compliance                     | Successful ZATCA sandbox + production cert  |
| OBJ-3 | Support 14 RBAC roles with triple-layer enforcement              | JWT + UI can() + API middleware + DB RLS    |
| OBJ-4 | Full bilingual EN/AR with RTL layout                             | 100% i18n key coverage, RTL visual audit    |
| OBJ-5 | Sub-2-second page load on 4G connections                         | Lighthouse performance score >= 80          |
| OBJ-6 | Multi-tenant architecture with branch-level data isolation       | Penetration test confirms tenant isolation  |
| OBJ-7 | Customer self-service portal with e-signature estimate approval  | 6-step OTP + canvas signature flow working  |

---

## 3. High-Level Scope

### 3.1 Domains In Scope

| # | Domain                  | Key Capabilities                                                |
|---|-------------------------|-----------------------------------------------------------------|
| 1 | Workshop                | Job lifecycle state machine, bay management, technician assign  |
| 2 | Registry                | Customer/vehicle CRUD, Saudi license plates, service history    |
| 3 | Finance                 | Invoicing, payments, SAR halala-precision, receipt printing     |
| 4 | Accounting              | Chart of accounts, journal entries, trial balance, aging        |
| 5 | CRM & Marketing         | Campaigns, loyalty programs, follow-ups, lead tracking          |
| 6 | Administration          | Tenant config, branch setup, system settings, audit logs        |
| 7 | Authentication          | JWT with refresh rotation, MFA, session management              |
| 8 | AI Platform             | OBD diagnostic chains, predictive maintenance, NLP intake       |
| 9 | Parts & Inventory       | Stock levels, POs, supplier catalog, reorder points             |
| 10| Call Center             | Ticket queue, IVR integration, call logging, escalation         |
| 11| Reports & Analytics     | Dashboards, scheduled reports, KPI widgets, export              |
| 12| Team & HR               | Employee records, attendance, payroll prep, leave management    |
| 13| Portals                 | Customer portal, supplier portal, technician mobile view        |

### 3.2 Out of Scope

- Native mobile applications (iOS/Android) -- web-responsive only for Phase 1.
- Integration with OEM dealer management systems.
- Physical hardware provisioning (OBD dongles, receipt printers).
- Payroll disbursement (payroll preparation only; actual bank transfers are external).

---

## 4. Stakeholders

| Stakeholder               | Role in Project        | Interest Level | Influence Level |
|----------------------------|------------------------|----------------|-----------------|
| Workshop Owner/CEO         | Executive Sponsor      | High           | High            |
| Super Admin                | Platform Administrator | High           | High            |
| Branch Manager             | Operational Lead       | High           | Medium          |
| Service Advisor            | Primary End User       | High           | Medium          |
| Technician                 | End User               | Medium         | Low             |
| QC Inspector               | Quality Gatekeeper     | Medium         | Medium          |
| Storekeeper                | Inventory End User     | Medium         | Low             |
| Accountant                 | Finance End User       | High           | Medium          |
| HR Manager                 | HR End User            | Medium         | Low             |
| Receptionist               | Front-Desk End User    | Medium         | Low             |
| Call Center Agent           | Support End User       | Medium         | Low             |
| Procurement Agent          | Purchasing End User    | Medium         | Low             |
| Supplier                   | External Portal User   | Low            | Low             |
| Customer                   | External Portal User   | High           | Low             |
| ZATCA                      | Regulatory Authority   | Low            | High            |
| Development Team           | Delivery Team          | High           | High            |

See [Stakeholder Register](stakeholder-register.md) for full engagement strategies.

---

## 5. Constraints

| Constraint                                       | Impact                                               |
|--------------------------------------------------|------------------------------------------------------|
| ZATCA Phase 2 compliance deadline                | Invoicing module must pass certification before go-live |
| SAR currency stored as integer halalas            | All monetary arithmetic must avoid floating point    |
| Saudi phone format (+966)                         | Validation and OTP delivery must handle Saudi numbers|
| RTL/LTR dual-direction layout                    | Every UI component must render correctly in both     |
| VAT fixed at 15%                                 | Tax engine hardcoded to current Saudi VAT rate       |
| Approval limit hierarchy                         | Owner unlimited; cascading limits down to SAR 5,000  |
| Static hosting targets (GitHub Pages, Vercel, Netlify) | Frontend must be fully static SPA               |

---

## 6. Assumptions

1. The development team has access to ZATCA sandbox credentials for e-invoicing integration testing.
2. PostgreSQL will be the production database; PGlite is used for local development and demos only.
3. All users have modern browsers (Chrome 90+, Safari 15+, Edge 90+).
4. SMS and WhatsApp delivery for OTP and notifications will use a third-party gateway (Twilio or equivalent).
5. The platform will launch with a single Saudi timezone (AST, UTC+3).
6. Initial deployment targets English and Arabic only; additional languages are post-Phase 1.
7. Separation-of-duties pairs (6 pairs) are non-negotiable for regulatory compliance.

---

## 7. Success Criteria

| Criteria                                      | Target                                            |
|-----------------------------------------------|---------------------------------------------------|
| Feature completeness                          | 100% of 191+ screens delivered and functional     |
| ZATCA certification                           | Pass ZATCA Phase 2 compliance audit               |
| Test coverage                                 | >= 80% unit (Vitest), >= 70% integration          |
| Performance                                   | P95 API response < 500ms                          |
| Security                                      | Zero critical/high findings in penetration test   |
| Accessibility                                 | WCAG 2.1 AA compliance across all public screens  |
| User acceptance                               | >= 85% UAT test case pass rate                    |
| Uptime SLA                                    | 99.5% availability in first 90 days               |

---

## 8. High-Level Timeline

| Phase               | Duration    | Key Deliverables                                      |
|----------------------|-------------|-------------------------------------------------------|
| Initiation           | 2 weeks     | Charter, PID, stakeholder analysis                    |
| Planning             | 4 weeks     | WBS, schedule, risk register, backlog                 |
| Foundation           | 6 weeks     | Auth, RBAC, tenant setup, DB schema, CI/CD            |
| Core Domains         | 16 weeks    | Workshop, Registry, Finance, Parts, Accounting        |
| Extended Domains     | 12 weeks    | CRM, HR, Call Center, AI Platform, Portals            |
| Integration & ZATCA  | 6 weeks     | ZATCA certification, notification fan-out, portals    |
| Testing & Hardening  | 4 weeks     | E2E Playwright, penetration test, performance tuning  |
| Deployment & Launch  | 2 weeks     | Production deployment, data migration, go-live        |

Total estimated duration: **52 weeks**.

See [Schedule Management Plan](schedule-management.md) for the detailed milestone plan.

---

## 9. Budget Authority

Approval limits follow the platform's own hierarchy:

| Role                | Approval Limit (SAR) |
|---------------------|----------------------|
| Owner/CEO           | Unlimited            |
| Branch Manager      | 50,000               |
| Accountant          | 25,000               |
| Procurement Agent   | 20,000               |
| HR Manager          | 15,000               |
| Storekeeper (Parts) | 10,000               |
| Service Advisor     | 5,000                |

Project budget decisions above SAR 50,000 require Owner/CEO sign-off.

---

## 10. Project Manager Authority

The Project Manager has authority to:

- Allocate resources within approved sprint capacity.
- Approve scope changes under SAR 10,000 impact; larger changes follow the scope change control process in the [Scope Statement](scope-statement.md).
- Escalate risks rated High or Critical per the [Risk Register](risk-register.md).
- Approve technical design decisions that do not alter the approved tech stack (React 18, TypeScript 5.7, Vite 5.4, TailwindCSS 3.4, Express 4.21, Drizzle ORM 0.36, PostgreSQL).

---

## 11. Approval

| Name                | Role              | Signature       | Date       |
|---------------------|--------------------|-----------------|------------|
|                     | Executive Sponsor  |                 |            |
|                     | Project Manager    |                 |            |
|                     | Technical Lead     |                 |            |
|                     | QA Lead            |                 |            |

---

## 12. References

- [Scope Statement](scope-statement.md)
- [Work Breakdown Structure](wbs.md)
- [Schedule Management Plan](schedule-management.md)
- [Risk Register](risk-register.md)
- [Stakeholder Register](stakeholder-register.md)
- [Communication Plan](communication-plan.md)
- [Business Case (PRINCE2)](../prince2/business-case.md)
- [Product Backlog](../agile/product-backlog.md)
