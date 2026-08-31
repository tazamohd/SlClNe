# SALIS AUTO -- Product Descriptions

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-PR2-004                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the product breakdown structure for SALIS AUTO, providing a description, quality criteria, quality method, and quality tolerances for each major deliverable. Products are organized by domain and align with the epics in the [Product Backlog](../agile/product-backlog.md).

---

## 2. Product Breakdown Overview

```
SALIS AUTO Platform
|
|-- Platform Foundation
|   |-- PD-01: Authentication Module
|   |-- PD-02: RBAC Engine
|   |-- PD-03: Infrastructure & CI/CD
|   |-- PD-04: i18n & RTL Framework
|
|-- Core Business Products
|   |-- PD-05: Workshop Module
|   |-- PD-06: Registry Module
|   |-- PD-07: Finance Module
|   |-- PD-08: Accounting Module
|   |-- PD-09: Parts & Inventory Module
|
|-- Extended Business Products
|   |-- PD-10: CRM & Marketing Module
|   |-- PD-11: AI Platform Module
|   |-- PD-12: Call Center Module
|   |-- PD-13: Team & HR Module
|   |-- PD-14: Portals Module
|
|-- Cross-Cutting Products
|   |-- PD-15: Notification Engine
|   |-- PD-16: Approval Chain Orchestrator
|   |-- PD-17: Reports & Analytics Module
|   |-- PD-18: Audit Log System
```

---

## 3. Platform Foundation Products

### PD-01: Authentication Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Secure user authentication and session management for all 14 roles    |
| **Composition**     | Login form (EN/AR), JWT issuance, refresh token rotation, MFA, password reset, session management UI |
| **Derivation**      | Epic E-01 (7 stories, 44 SP)                                         |
| **Format**          | React components + Express API endpoints + PostgreSQL tables          |
| **Quality Criteria**| JWT follows RFC 7519; refresh rotation prevents replay; MFA via SMS OTP; +966 phone validation |
| **Quality Method**  | Vitest unit tests (>= 80%); Supertest integration tests; Playwright E2E (login, token refresh, MFA) |
| **Quality Tolerance**| Zero tolerance on auth bypass vulnerabilities                        |

### PD-02: RBAC Engine

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Enforce role-based access control across all platform features        |
| **Composition**     | 14 role definitions, 28 module mappings, JWT claim embedding, `can()` UI hook, API middleware, PostgreSQL RLS, 6 SoD pairs, 7 redaction rules, 8 data scopes |
| **Derivation**      | Epic E-02 (10 stories, 73 SP)                                        |
| **Format**          | TypeScript role config, React hook, Express middleware, SQL RLS policies |
| **Quality Criteria**| Triple-layer enforcement verified at each layer independently; tenant isolation confirmed by cross-tenant access test |
| **Quality Method**  | Penetration test (manual); integration tests per role/scope combo; automated SoD verification |
| **Quality Tolerance**| Zero tolerance on tenant data leaks; zero tolerance on SoD violations |

### PD-03: Infrastructure & CI/CD

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Development environment, build tooling, and deployment pipeline       |
| **Composition**     | Vite 5.4 + React 18.3 scaffold, Express 4.21 API scaffold, Drizzle ORM 0.36 + PGlite local dev, GitHub Actions CI/CD, multi-tenant DB schema |
| **Derivation**      | Epic E-09 (10 stories, 61 SP)                                        |
| **Format**          | Config files, pipeline YAML, TypeScript scaffolds                    |
| **Quality Criteria**| CI runs in < 10 min; deploys to GitHub Pages/Vercel/Netlify succeed; PGlite parity with PostgreSQL for schema |
| **Quality Method**  | Pipeline execution audit; deployment smoke tests                      |
| **Quality Tolerance**| +10% on CI time; zero tolerance on deployment failures               |

### PD-04: i18n & RTL Framework

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Bilingual (EN/AR) with correct right-to-left layout rendering        |
| **Composition**     | i18n namespace loader, EN + AR translation files, TailwindCSS RTL plugin, locale-aware date/number/currency formatting |
| **Derivation**      | Cross-cutting stories XC-001, XC-002                                  |
| **Format**          | JSON translation files, TailwindCSS config, React context             |
| **Quality Criteria**| 100% key coverage for both languages; RTL renders correctly for all components; SAR formatting follows Saudi conventions |
| **Quality Method**  | CI lint for missing keys; RTL visual regression (Playwright screenshots); manual review by native Arabic speaker |
| **Quality Tolerance**| Zero missing keys in production build; maximum 5 RTL cosmetic issues at any release |

---

## 4. Core Business Products

### PD-05: Workshop Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Manage the full workshop repair lifecycle from check-in to delivery   |
| **Composition**     | Job card CRUD, 6-state lifecycle state machine (Check-In -> Inspection -> Estimate -> Repair -> QC -> Delivery), bay management dashboard, technician assignment, service type catalog, real-time job status board |
| **Derivation**      | Epic E-03 (12 stories, 102 SP)                                       |
| **Format**          | React screens (12+), Express APIs, PostgreSQL tables (jobs, bays, service_types) |
| **Quality Criteria**| State machine enforces valid transitions only; audit log captures every transition; technician time logging accurate to the minute |
| **Quality Method**  | Vitest for state machine logic; Playwright E2E for full lifecycle; manual testing with Service Advisor and Technician roles |
| **Quality Tolerance**| Zero tolerance on invalid state transitions; <= 2s page load on job status board |

### PD-06: Registry Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Maintain customer and vehicle records with Saudi-specific validations |
| **Composition**     | Customer CRUD, vehicle CRUD, Saudi plate format validation, +966 phone validation, VIN decoder, service history timeline, customer-vehicle M:N linking, merge/dedup utility |
| **Derivation**      | Epic E-04 (7 stories, 44 SP)                                         |
| **Format**          | React screens (8+), Express APIs, PostgreSQL tables (customers, vehicles, customer_vehicles) |
| **Quality Criteria**| Saudi plate regex matches all valid formats; +966 validation rejects invalid numbers; service history correctly aggregates across vehicles |
| **Quality Method**  | Unit tests for validation regex; integration tests for CRUD + search; UAT with Receptionist role |
| **Quality Tolerance**| Zero false negatives on valid Saudi plates                           |

### PD-07: Finance Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Invoice management with ZATCA Phase 2 e-invoicing compliance         |
| **Composition**     | Invoice schema (halala integer storage), invoice generation from estimates, ZATCA XML builder (UBL 2.1), QR code generator (TLV encoding), hash chain for invoice sequence, ZATCA API integration (clearance + reporting), payment recording (4 methods), receipt printing (bilingual), credit note workflow, VAT 15% engine |
| **Derivation**      | Epic E-05 (10 stories, 81 SP)                                        |
| **Format**          | React screens (15+), Express APIs, PostgreSQL tables, XML templates  |
| **Quality Criteria**| All monetary arithmetic uses integer halalas with zero floating-point operations; ZATCA XML validates against official schema; QR code TLV matches ZATCA specification; hash chain is tamper-evident |
| **Quality Method**  | ZATCA sandbox API validation (nightly); Vitest for halala arithmetic edge cases; manual audit of XML against ZATCA spec; Playwright E2E for invoice-to-payment flow |
| **Quality Tolerance**| Zero tolerance on ZATCA validation errors; zero tolerance on rounding errors |

### PD-08: Accounting Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Core accounting functions with Saudi-standard chart of accounts       |
| **Composition**     | Chart of accounts, double-entry journal entries, trial balance, income statement, balance sheet, AR/AP aging, bank reconciliation |
| **Derivation**      | Epic E-06 (6 stories, 42 SP)                                         |
| **Quality Criteria**| Double-entry validation (debits = credits); trial balance always balances; aging correctly calculates overdue periods |
| **Quality Method**  | Vitest for double-entry validation; integration tests with sample data sets; Accountant UAT |
| **Quality Tolerance**| Zero tolerance on unbalanced entries                                 |

### PD-09: Parts & Inventory Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Track parts stock and manage procurement with approval chains        |
| **Composition**     | Part schema with branch stock, stock dashboard, PO lifecycle, approval chain (SAR 10K/20K/50K/unlimited), supplier catalog, reorder alerts, auto-PO, parts compatibility matrix, stock transfer, goods receipt |
| **Derivation**      | Epic E-07 (9 stories, 62 SP)                                         |
| **Quality Criteria**| Approval limits correctly enforced (Storekeeper SAR 10K, Procurement SAR 20K, Manager SAR 50K, Owner unlimited); stock levels never go negative; reorder alerts fire at configured thresholds |
| **Quality Method**  | Integration tests for approval chain with boundary values; E2E for PO lifecycle; Storekeeper + Procurement Agent UAT |
| **Quality Tolerance**| Zero tolerance on approval limit bypass                              |

---

## 5. Extended Business Products

### PD-10: CRM & Marketing Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Drive customer engagement and repeat business                        |
| **Composition**     | Segmentation engine, campaign builder (SMS/WhatsApp/email), loyalty program, follow-up scheduler, lead pipeline |
| **Derivation**      | Epic E-11 (5 stories, 34 SP)                                         |
| **Quality Criteria**| Segmentation queries return correct customer sets; campaign messages deliver through notification gateway; loyalty points accrue correctly |
| **Quality Method**  | Integration tests for segmentation queries; gateway delivery logs; UAT with Branch Manager |
| **Quality Tolerance**| <= 2% false positives in segmentation                                |

### PD-11: AI Platform Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Diagnostic intelligence and predictive maintenance                   |
| **Composition**     | OBD-II code parser, 5-desk diagnostic handoff, predictive maintenance scoring, NLP intake, AI-assisted estimates |
| **Derivation**      | Epic E-14 (5 stories, 50 SP)                                         |
| **Quality Criteria**| OBD codes correctly parsed per SAE J2012; handoff chain completes all 5 desks; predictions have documented confidence scores |
| **Quality Method**  | Unit tests for OBD parser against known code database; E2E for handoff chain; accuracy validation against historical data |
| **Quality Tolerance**| OBD parser accuracy >= 99% for standard codes                        |

### PD-12: Call Center Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Manage customer support tickets and call logging                     |
| **Composition**     | Call logging, ticket queue with SLA, IVR hooks, escalation workflows, callback scheduling |
| **Derivation**      | Epic E-13 (5 stories, 29 SP)                                         |
| **Quality Criteria**| SLA timers accurate; escalation triggers at correct thresholds; callback reminders fire on schedule |
| **Quality Method**  | Integration tests for SLA timer logic; E2E for escalation flow; Agent UAT |
| **Quality Tolerance**| SLA timer accuracy within 1 minute                                   |

### PD-13: Team & HR Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Employee records, time tracking, and payroll preparation              |
| **Composition**     | Employee CRUD (Saudi ID), attendance, leave management, payroll prep reports, performance reviews |
| **Derivation**      | Epic E-12 (5 stories, 31 SP)                                         |
| **Quality Criteria**| Saudi ID validation correct; leave balance calculation accurate; payroll prep matches attendance records |
| **Quality Method**  | Unit tests for ID validation and balance math; HR Manager UAT |
| **Quality Tolerance**| Zero tolerance on payroll calculation errors                         |

### PD-14: Portals Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Self-service access for customers, suppliers, and technicians        |
| **Composition**     | Customer portal (repair tracking, 6-step estimate approval, invoices, ratings), supplier portal (PO ack, invoice submission), technician mobile view (jobs, time log) |
| **Derivation**      | Epic E-08 (7 stories, 47 SP)                                         |
| **Quality Criteria**| 6-step e-signature flow completes end-to-end; OTP delivered within 30 seconds; canvas signature captures on mobile and desktop; supplier portal accessible without full platform login |
| **Quality Method**  | Playwright E2E for estimate approval flow; mobile browser testing (top 5 Saudi devices); Customer + Supplier UAT |
| **Quality Tolerance**| OTP delivery within 60 seconds (external dependency)                 |

---

## 6. Cross-Cutting Products

### PD-15: Notification Engine

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Fan-out notifications across 5 channels                              |
| **Composition**     | In-app notifications, SMS (via gateway), WhatsApp Business API, email, push notifications; channel preference per user; delivery tracking |
| **Quality Criteria**| Message delivered to correct channel per user preference; delivery status tracked; retry on transient failure |
| **Quality Method**  | Integration tests with mock gateways; delivery log audit; UAT with multi-channel test users |
| **Quality Tolerance**| In-app delivery: zero tolerance; external channels: <= 5% failure rate |

### PD-16: Approval Chain Orchestrator

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Route decisions through role-based approval hierarchy based on SAR amount |
| **Composition**     | Limit configuration (Owner unlimited, Manager 50K, Accountant 25K, Procurement 20K, HR 15K, Parts 10K, Advisor 5K), multi-step routing, timeout/escalation, approval audit log |
| **Quality Criteria**| Correct approver identified for every amount tier; escalation on timeout; full audit trail |
| **Quality Method**  | Unit tests for routing logic with boundary values; integration tests for multi-step chains |
| **Quality Tolerance**| Zero tolerance on routing to wrong approver                          |

### PD-17: Reports & Analytics Module

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Role-scoped dashboards and report generation                         |
| **Composition**     | Owner dashboard (cross-branch), Manager dashboard (single branch), KPI widgets, scheduled reports, export (PDF, Excel, CSV), 8 data scope enforcement |
| **Quality Criteria**| Data scope enforcement: each role sees only permitted data; exports match on-screen data; scheduled reports deliver on time |
| **Quality Method**  | Integration tests for scope filtering; export file validation; UAT with Owner and Manager roles |
| **Quality Tolerance**| Zero tolerance on data scope violations                              |

### PD-18: Audit Log System

| Attribute           | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| **Purpose**         | Immutable record of all security-relevant and business-critical actions |
| **Composition**     | Log capture (who, what, when, from where), log viewer with filters, retention policy, export |
| **Quality Criteria**| Every state change, approval action, auth event, and data access logged; logs are append-only |
| **Quality Method**  | Integration tests verifying log entries for each auditable action; penetration test confirms logs cannot be modified |
| **Quality Tolerance**| Zero tolerance on missing audit entries for security events          |

---

## 7. References

- [Product Backlog](../agile/product-backlog.md)
- [Epic Breakdown](../agile/epic-breakdown.md)
- [Quality Register](quality-register.md)
- [Definition of Done](../agile/definition-of-done.md)
- [Scope Statement](../pmp/scope-statement.md)
- [Test Plan](../planning/test-plan.md)
