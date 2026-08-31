# SALIS AUTO -- Scope Statement

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PMP-002                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the detailed scope for the SALIS AUTO platform, including deliverables, exclusions, acceptance criteria, and the scope change control process. It expands on the high-level scope established in the [Project Charter](project-charter.md).

---

## 2. Product Scope Description

SALIS AUTO is a multi-tenant, bilingual (EN/AR) web application for managing automotive workshops in Saudi Arabia. The platform covers the full workshop lifecycle (Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery) and extends into finance, HR, CRM, inventory, and customer-facing portals. It enforces ZATCA Phase 2 e-invoicing, supports 14 RBAC roles across 28 modules, and delivers 191+ screens organized into 13 domains.

---

## 3. Deliverables

### 3.1 Software Deliverables

| Deliverable                          | Description                                                              |
|--------------------------------------|--------------------------------------------------------------------------|
| Frontend SPA                         | React 18.3 + TypeScript 5.7 + Vite 5.4 + TailwindCSS 3.4 application   |
| Backend API                          | Express 4.21 REST API with Drizzle ORM 0.36 on PostgreSQL               |
| Authentication Module                | JWT with refresh token rotation, MFA support, session management         |
| RBAC Engine                          | Triple-layer: JWT claims, UI `can()` guards, API middleware, DB RLS      |
| ZATCA Integration                    | Phase 2 e-invoicing with XML generation, QR codes, hash chains           |
| Customer Portal                      | Self-service: repair tracking, estimate approval (OTP + e-signature)     |
| Supplier Portal                      | PO acknowledgment, invoice submission, catalog management                |
| Notification System                  | Fan-out: in-app, SMS, WhatsApp, email, push notifications                |
| AI/OBD Module                        | 5-desk diagnostic handoff chain, predictive maintenance scoring          |
| CI/CD Pipeline                       | Automated build, test, deploy to GitHub Pages / Vercel / Netlify         |

### 3.2 Documentation Deliverables

| Deliverable                   | Description                                              |
|-------------------------------|----------------------------------------------------------|
| API Documentation             | OpenAPI 3.1 spec for all endpoints                       |
| User Guides                   | Per-role guides in English and Arabic                    |
| Admin Guide                   | Tenant onboarding (3 paths), configuration, RBAC setup   |
| Database Schema Docs          | Drizzle schema documentation with ER diagrams            |
| Deployment Runbook            | Step-by-step for each target (GitHub Pages, Vercel, etc) |

### 3.3 Testing Deliverables

| Deliverable                   | Tool                  | Coverage Target       |
|-------------------------------|-----------------------|-----------------------|
| Unit Tests                    | Vitest                | >= 80%                |
| Integration Tests             | Supertest             | >= 70%                |
| End-to-End Tests              | Playwright            | Critical paths 100%   |
| Performance Tests             | k6 / Lighthouse       | P95 < 500ms API       |
| Security Assessment           | OWASP ZAP + manual    | Zero critical/high    |

---

## 4. Domain-Level Scope

### 4.1 Workshop Domain

- Job card creation, editing, lifecycle state machine (6 states)
- Bay management and technician assignment
- Service type catalog (maintenance, repair, body, electrical, AC)
- Real-time job status dashboard per branch
- OBD diagnostic report integration (5-desk handoff)

### 4.2 Registry Domain (Customers & Vehicles)

- Customer CRUD with Saudi phone (+966) validation
- Vehicle CRUD with Saudi license plate format support
- Service history timeline per vehicle
- Customer-vehicle relationship management (many-to-many)

### 4.3 Finance Domain

- Invoice generation (SAR, stored as integer halalas to avoid floating-point)
- ZATCA Phase 2 compliant e-invoices: XML, QR code, hash chain
- Payment recording (cash, card, bank transfer, credit)
- Receipt printing with Arabic/English dual-language support
- Credit note and refund workflows
- VAT 15% calculation and reporting

### 4.4 Accounting Domain

- Chart of accounts (Saudi standard classification)
- Double-entry journal entries
- Trial balance, income statement, balance sheet
- Accounts receivable/payable aging reports
- Bank reconciliation

### 4.5 CRM & Marketing Domain

- Customer segmentation and tagging
- Campaign management (SMS, WhatsApp, email)
- Loyalty program with points and tiers
- Follow-up scheduling and reminders
- Lead pipeline tracking

### 4.6 Administration Domain

- Multi-tenant configuration (3 onboarding paths)
- Branch management (create, configure, deactivate)
- System settings (business hours, holidays, defaults)
- Audit log viewer with filters
- Role and permission management UI

### 4.7 Authentication Domain

- Login with email/phone + password
- JWT access token + refresh token rotation
- Multi-factor authentication (OTP via SMS)
- Password reset flow
- Session management (active sessions, force logout)

### 4.8 AI Platform Domain

- OBD-II diagnostic code parsing and interpretation
- 5-desk diagnostic handoff: Advisor -> Technician -> QC -> Parts -> Advisor
- Predictive maintenance scoring
- Natural language service request intake
- AI-assisted estimate generation

### 4.9 Parts & Inventory Domain

- Stock level tracking per branch and warehouse
- Purchase order lifecycle (request, approve, receive, reconcile)
- Supplier catalog with pricing tiers
- Reorder point alerts and auto-PO generation
- Parts compatibility matrix (vehicle make/model/year)
- Approval chain: Storekeeper (SAR 10K) -> Procurement (SAR 20K) -> Manager (SAR 50K)

### 4.10 Call Center Domain

- Inbound/outbound call logging
- Ticket queue with priority and SLA tracking
- IVR integration hooks
- Escalation workflows (Agent -> Supervisor -> Manager)
- Customer callback scheduling

### 4.11 Reports & Analytics Domain

- Role-based dashboards (Owner sees all branches; Manager sees own branch)
- KPI widgets: revenue, job throughput, technician utilization, NPS
- Scheduled report generation and email delivery
- Export to PDF, Excel, CSV
- 8 data scopes enforced: platform, all, org, branch, own, assigned, external, self

### 4.12 Team & HR Domain

- Employee records with Saudi ID validation
- Attendance tracking (clock in/out)
- Leave management (request, approve, balance)
- Payroll preparation (hours, overtime, deductions -- no disbursement)
- Performance review templates

### 4.13 Portals Domain

- **Customer Portal:** Track repair status, view/approve estimates (6-step: review -> accept terms -> OTP -> canvas signature -> confirm -> download), view invoices, rate service
- **Supplier Portal:** Acknowledge POs, submit invoices, update catalog/pricing
- **Technician Mobile View:** Assigned jobs, time logging, parts requests, photo upload

---

## 5. Exclusions

| Item                                     | Rationale                                          |
|------------------------------------------|----------------------------------------------------|
| Native mobile apps (iOS/Android)         | Phase 1 is web-responsive only                     |
| OEM DMS integration                      | Requires manufacturer partnerships; deferred       |
| Hardware procurement                     | OBD dongles, printers are customer-provided         |
| Payroll bank disbursement                | Integration with Saudi banks is Phase 2            |
| Multi-currency support                   | SAR only for Phase 1                               |
| Languages beyond EN/AR                   | Urdu, Hindi, Tagalog considered for Phase 2        |
| Offline mode / PWA                       | Requires service worker investment; Phase 2        |

---

## 6. Acceptance Criteria

| Criterion                                              | Threshold                             |
|--------------------------------------------------------|---------------------------------------|
| All 191+ screens render correctly in EN and AR (RTL)   | 100% visual audit pass               |
| ZATCA Phase 2 e-invoicing certified                    | ZATCA sandbox + production approval   |
| RBAC triple-layer enforcement verified                 | Penetration test confirms isolation   |
| Separation-of-duties (6 pairs) enforced                | Audit log shows enforcement           |
| Field-level redaction (7 rules) operational            | Role-based data access verified       |
| Customer e-signature flow functional                   | End-to-end 6-step test passes         |
| Notification fan-out (5 channels) operational          | In-app, SMS, WhatsApp, email, push    |
| Approval chain cascade functional                      | SAR limit enforcement at each tier    |
| Unit test coverage                                     | >= 80% (Vitest)                       |
| E2E critical paths                                     | 100% pass (Playwright)               |

---

## 7. Scope Change Control Process

### 7.1 Change Request Workflow

1. **Submission:** Any stakeholder submits a Change Request (CR) via the project management tool.
2. **Impact Analysis:** The technical lead assesses effort, schedule impact, and cost (in story points and SAR).
3. **Classification:**
   - **Minor** (< 3 story points, no schedule impact): PM approves.
   - **Moderate** (3--13 story points, up to 1 sprint delay): Change Control Board (CCB) reviews.
   - **Major** (> 13 story points or > 1 sprint delay): Executive Sponsor approval required.
4. **Decision:** Approve, Defer, or Reject with rationale documented.
5. **Implementation:** Approved CRs are added to the [Product Backlog](../agile/product-backlog.md) and prioritized in the next sprint planning.
6. **Verification:** QA confirms the change meets acceptance criteria per the [Definition of Done](../agile/definition-of-done.md).

### 7.2 Change Control Board

| Member              | Role                 |
|---------------------|----------------------|
| Executive Sponsor   | Final authority      |
| Project Manager     | Chair                |
| Technical Lead      | Impact assessor      |
| QA Lead             | Quality assessor     |
| Product Owner       | Business assessor    |

---

## 8. Constraints and Dependencies

### 8.1 Technical Constraints

- Frontend must be deployable as static assets (GitHub Pages, Vercel, Netlify).
- All monetary values stored as integer halalas (1 SAR = 100 halalas).
- React Router 7 for client-side routing; no server-side rendering.
- TanStack React Query for server state management.

### 8.2 External Dependencies

| Dependency                     | Impact if Delayed                                |
|--------------------------------|--------------------------------------------------|
| ZATCA sandbox access           | Blocks e-invoicing integration testing           |
| SMS gateway credentials        | Blocks OTP and notification testing              |
| WhatsApp Business API approval | Blocks WhatsApp notification channel             |
| Saudi address database         | Blocks city/district auto-complete               |

---

## 9. References

- [Project Charter](project-charter.md)
- [Work Breakdown Structure](wbs.md)
- [Product Backlog](../agile/product-backlog.md)
- [Definition of Done](../agile/definition-of-done.md)
- [Risk Register](risk-register.md)
- [Test Plan](../planning/test-plan.md)
