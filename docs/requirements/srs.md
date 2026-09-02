# SALIS AUTO — Software Requirements Specification (SRS)

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-REQ-SRS-001               |
| Version        | 1.0                          |
| Date           | 2026-09-01                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal — Confidential      |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification defines the functional and non-functional requirements for SALIS AUTO, a multi-tenant cloud-based SaaS platform for automotive workshop management in the Kingdom of Saudi Arabia. It serves as the authoritative reference for design, development, testing, and acceptance of the system. The document follows IEEE 830 conventions and consolidates requirements from 16 subordinate functional and non-functional requirements documents.

### 1.2 Scope

SALIS AUTO manages the full lifecycle of automotive workshop operations: vehicle check-in, multi-point inspection, estimate approval, repair execution, quality control, delivery, invoicing, and payment collection. Beyond workshop operations, the platform provides CRM and marketing, inventory and procurement, HR and payroll, AI-assisted diagnostics, a call center module, self-service portals for customers, technicians, and suppliers, and comprehensive reporting. The system supports 191+ screens across 13 functional domains, 14 user roles, and bilingual EN/AR operation with full RTL layout.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term   | Definition                                                                 |
|--------|----------------------------------------------------------------------------|
| SAR    | Saudi Riyal — the currency of Saudi Arabia; 1 SAR = 100 halalas           |
| ZATCA  | Zakat, Tax and Customs Authority — Saudi Arabia's tax authority            |
| PGlite | Lightweight PostgreSQL that runs in the browser or Node for development    |
| RLS    | Row-Level Security — PostgreSQL feature enforcing per-tenant data isolation|
| SOD    | Segregation of Duties — control requiring two different people for paired actions |
| RBAC   | Role-Based Access Control — permission model assigning capabilities to roles |
| JWT    | JSON Web Token — compact, self-contained token for authentication          |
| UBL    | Universal Business Language — OASIS XML standard for e-invoicing           |
| TLV    | Tag-Length-Value — binary encoding format used in ZATCA QR codes           |
| PDPL   | Personal Data Protection Law — Saudi Arabia's data privacy regulation      |
| ULID   | Universally Unique Lexicographically Sortable Identifier                   |
| OBD-II | On-Board Diagnostics version II — vehicle diagnostic interface standard    |
| DTC    | Diagnostic Trouble Code — standardized code for vehicle faults             |
| WPS    | Wage Protection System — Saudi electronic salary transfer system           |
| AML    | Anti-Money Laundering — regulations preventing financial crime             |
| BPS    | Basis Points — 1/100th of a percent; 1500 BPS = 15.00% VAT               |

### 1.4 References

| ID         | Document                                                              |
|------------|-----------------------------------------------------------------------|
| FR-WKS-001 | [Workshop Operations FR](./functional/workshop-operations.md)        |
| FR-REG-002 | [Registry FR](./functional/registry.md)                              |
| FR-FIN-003 | [Finance & Accounting FR](./functional/finance-accounting.md)        |
| FR-CRM-004 | [CRM & Marketing FR](./functional/crm-marketing.md)                 |
| FR-INV-005 | [Inventory & Procurement FR](./functional/inventory-procurement.md)  |
| FR-HRT-006 | [HR & Team FR](./functional/hr-team.md)                              |
| FR-AIP-007 | [AI Platform FR](./functional/ai-platform.md)                        |
| FR-ADM-008 | [Administration & Portals FR](./functional/admin-portals.md)         |
| NFR-PRF-001| [Performance NFR](./non-functional/performance.md)                   |
| NFR-SEC-002| [Security NFR](./non-functional/security.md)                         |
| NFR-SCL-003| [Scalability NFR](./non-functional/scalability.md)                   |
| NFR-A11Y-004| [Accessibility NFR](./non-functional/accessibility.md)              |
| NFR-USB-005| [Usability NFR](./non-functional/usability.md)                       |
| NFR-REL-006| [Reliability NFR](./non-functional/reliability.md)                   |
| NFR-L10N-007| [Localization NFR](./non-functional/localization.md)                |
| NFR-CMP-008| [Compliance NFR](./non-functional/compliance.md)                     |
| SYS-ARCH-001| [Frontend Architecture](../system/architecture/frontend-architecture.md) |
| SYS-ARCH-002| [Backend Architecture](../system/architecture/backend-architecture.md)   |
| SYS-ARCH-003| [Database Design](../system/architecture/database-design.md)             |
| SYS-ARCH-005| [Auth Architecture](../system/architecture/auth-architecture.md)         |
| SYS-INT-001| [ZATCA Integration](../system/integration/zatca-integration.md)          |

### 1.5 Overview

Section 2 provides the product perspective, user classes, operating environment, and constraints. Section 3 enumerates all system features with unique IDs and acceptance criteria. Section 4 covers external interface requirements. Section 5 consolidates non-functional requirements. Section 6 defines data requirements including the multi-tenant model and retention policies. Section 7 contains appendices with the RBAC matrix, SOD rules, ZATCA TLV fields, and cross-references.

---

## 2. Overall Description

### 2.1 Product Perspective

SALIS AUTO is a self-contained, multi-tenant SaaS platform. It is not a replacement for or extension of an existing system; it is a new product designed specifically for the Saudi automotive workshop market.

**System Context:**

```
┌──────────────────────────────────────────────────────────┐
│                    External Services                      │
│  ZATCA API  |  Stripe  |  SMS Gateway  |  WhatsApp API   │
└──────┬───────────┬──────────┬──────────────┬─────────────┘
       │           │          │              │
┌──────▼───────────▼──────────▼──────────────▼─────────────┐
│                  SALIS AUTO Backend                       │
│  Fastify + TypeScript + Drizzle ORM                      │
│  REST API (/api/v1) + JWT Auth + RLS                     │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                    PostgreSQL 15+                         │
│  50+ tables | RLS per org_id | Append-only audit_log     │
│  Dev mode: PGlite (in-process)                           │
└──────────────────────────────────────────────────────────┘
       ▲
┌──────┴──────────────────────────────────────────────────┐
│                  SALIS AUTO Frontend                     │
│  React 18 SPA | TypeScript | Vite | TailwindCSS         │
│  191+ screens | EN/AR RTL | 14-role RBAC                │
│  Shells: AppShell | CustomerAppShell (430px) | AuthLayout│
└─────────────────────────────────────────────────────────┘
```

**Multi-Tenant Architecture:** Every tenant-owned table carries an `org_id` column enforced by PostgreSQL Row-Level Security (RLS) policies. Cross-tenant data access is structurally impossible at the database layer. 54 tenant-scoped tables use a universal column pattern including `org_id`, `branch_id`, `created_at`, `updated_at`, `deleted_at` (soft delete), and `version` (optimistic concurrency). Organizations are identified by ULID, carry a subscription plan (starter, business, enterprise), and hold VAT and CR registration numbers for ZATCA compliance.

### 2.2 Product Functions

The platform is organized into 13 functional domains:

| #  | Domain                 | Custom Screens | Feature Screens | Total  |
|----|------------------------|----------------|-----------------|--------|
| 1  | Workshop Operations    | ~8             | ~12             | ~20    |
| 2  | Registry (Customers/Vehicles) | ~4      | ~18             | ~22    |
| 3  | Finance                | ~4             | ~2              | ~6     |
| 4  | Accounting             | ~3             | ~22             | ~25    |
| 5  | CRM & Marketing        | ~6             | ~6              | ~12    |
| 6  | Administration         | ~5             | ~22             | ~27    |
| 7  | Authentication         | ~8             | 0               | ~8     |
| 8  | AI Platform            | ~3             | ~10             | ~13    |
| 9  | Parts & Inventory      | ~2             | ~16             | ~18    |
| 10 | Call Center            | ~2             | ~2              | ~4     |
| 11 | Reports & Analytics    | 0              | ~14             | ~14    |
| 12 | Team & HR              | ~1             | ~13             | ~14    |
| 13 | Portals & Customer App | ~5             | ~20             | ~25    |
|    | **Total**              | **~63**        | **~157**        | **~220** |

### 2.3 User Classes and Characteristics

The system defines 14 roles. Each role has a defined scope, approval ceiling in SAR, and characteristic usage pattern.

| Role ID      | Label               | Scope     | SAR Ceiling | Usage Frequency | Primary Activities                                    |
|--------------|---------------------|-----------|-------------|-----------------|-------------------------------------------------------|
| owner        | Owner / CEO         | all       | Unlimited   | Daily           | Full oversight, approvals, executive reports           |
| superadmin   | Super Admin         | platform  | Unlimited   | Weekly          | Platform administration, tenant management             |
| manager      | Branch Manager      | branch    | 50,000      | Daily           | Branch operations, staff supervision, approvals        |
| accountant   | Accountant          | all       | 25,000      | Daily           | Invoicing, journal entries, payroll, financial reports  |
| procurement  | Procurement Agent   | all       | 20,000      | Daily           | Purchase orders, supplier management, network          |
| hr           | HR Manager          | all       | 15,000      | Weekly          | Employee management, payroll, leave, attendance         |
| parts        | Storekeeper         | branch    | 10,000      | Continuous      | Inventory management, stock movements, parts network   |
| advisor      | Service Advisor     | branch    | 5,000       | Continuous      | Check-in, estimates, customer interaction, job tracking|
| technician   | Technician          | own       | 0           | Continuous      | Assigned repairs, own job cards, technician portal      |
| qc           | QC Inspector        | branch    | 0           | Daily           | Quality control inspections, QC gate approval          |
| frontdesk    | Receptionist        | branch    | 0           | Continuous      | Customer intake, appointment scheduling, kiosk         |
| callcenter   | Call Center Agent   | all       | 0           | Continuous      | Call queue, lead capture, appointment booking           |
| customer     | Customer            | self      | 0           | Occasional      | Customer portal, service tracking, appointments        |
| supplier     | Supplier            | external  | 0           | Weekly          | PO fulfillment, supplier portal, parts network         |

### 2.4 Operating Environment

| Component        | Requirement                                                    |
|------------------|----------------------------------------------------------------|
| Browsers         | Chrome 90+, Safari 14+, Edge 90+, Firefox 90+ (latest -2)     |
| Server Runtime   | Node.js 20+                                                    |
| Database         | PostgreSQL 15+ (production); PGlite (development mode)         |
| Mobile Breakpoint| 860px — below this, DataTable switches to MobileCard layout    |
| Customer Portal  | CustomerAppShell at 430px mobile frame width                   |
| Hosting          | Saudi Arabia data center (data residency requirement)          |

### 2.5 Design and Implementation Constraints

| Constraint         | Detail                                                        |
|--------------------|---------------------------------------------------------------|
| Frontend Framework | React 18.3.1 SPA, TypeScript 5.7, Vite 5.4, TailwindCSS 3.4 |
| API Style          | REST under `/api/v1`, JSON request/response bodies            |
| Authentication     | JWT (HS256), 15-min access tokens, 30-day refresh tokens      |
| ORM                | Drizzle ORM 0.36 — parameterized queries only, no raw SQL     |
| Currency           | All monetary values as integer halalas (bigint); 1 SAR = 100 halalas |
| IDs                | ULID (varchar(26)) for all primary keys                       |
| Hosting Region     | Kingdom of Saudi Arabia — data residency required             |
| Localization       | EN/AR bilingual with full RTL support via CSS logical properties|
| RBAC Source        | Single source of truth in `@salis/contract` shared by client and server |

### 2.6 Assumptions and Dependencies

1. **ZATCA API availability** — Phase 2 integration assumes ZATCA's Fatoora platform is accessible for invoice clearance and reporting.
2. **SMS gateway** — OTP delivery and marketing campaigns depend on a configured SMS provider for Saudi mobile numbers (+966).
3. **Stripe** — Payment processing for subscription billing depends on Stripe API availability in Saudi Arabia.
4. **WhatsApp Business API** — Campaign messaging depends on WhatsApp Business API access.
5. **Internet connectivity** — The platform requires internet access; offline-first operation is not in scope (though a mock repository supports demo mode).
6. **PostgreSQL hosting** — Production requires a managed PostgreSQL 15+ instance in a Saudi data center.
7. **Browser support** — Users are assumed to run evergreen browsers; IE11 is not supported.

---

## 3. System Features

### 3.1 Workshop Management

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-001 | Job Card CRUD                  | Must     | Roles with `jobcards:c` (Owner, Manager, Advisor, Receptionist) can create job cards. Job cards store customer_id, vehicle_id, service type, complaint, priority, and assigned technician. Soft-delete via `deleted_at`. |
| FR-SYS-002 | 6-Stage Lifecycle State Machine| Must     | Job cards progress through: checkin -> inspection -> estimate -> repair -> qc -> delivery -> invoiced -> closed. Only forward-adjacent transitions permitted, enforced by `checkStageTransition()`. Each transition audited. |
| FR-SYS-003 | Bay Scheduling                 | Must     | Appointments reference service bays. Index on `(org_id, scheduled_date, bay)` prevents double-booking. Overlap detection uses `start_minute` and `duration_mins`. |
| FR-SYS-004 | Appointment Management         | Must     | CRUD for appointments with scheduled_date, time_label, start_minute, duration_mins, bay, technician_id. Statuses: awaiting, confirmed, in_progress, completed, cancelled. |
| FR-SYS-005 | Estimate Approval Chain        | Must     | Estimates follow header/line pattern. Amount-based approval routing: Owner unlimited, Manager 50K SAR, Advisor 5K SAR. SOD enforced: `submitted_by != approved_by`. Above-ceiling amounts require escalation. |
| FR-SYS-006 | Inspection Checklists          | Must     | Multi-section inspection with pass/fail/not-applicable items per section. Findings stored in `diag_findings` with DTC code, severity, and evidence. Photo grid via MediaGallery. |
| FR-SYS-007 | QC Gate with SOD               | Must     | QC-to-delivery transition requires `jobcards:a` (approve). QC inspector's user_id must differ from assigned technician's user_id. `requireSodClear()` verifies actor did not perform the repair transition. Rejection audited in separate transaction. |
| FR-SYS-008 | Delivery Confirmation          | Must     | Delivery checklist, digital customer signature capture, vehicle handover updates `last_service_at`. Transition to `invoiced` triggers invoice generation. |
| FR-SYS-009 | Technician Assignment          | Should   | `POST /jobs/:id/assign` with `techId`. Requires `jobcards:e`. Technician must exist within caller's tenant. Assignment audited. `assigned_tech_id` drives data scope for technician role. |
| FR-SYS-010 | Optimistic Concurrency         | Must     | All job card updates use `WHERE version = :current_version`. Conflict returns HTTP 409 with `version_conflict` code. Client must reload and retry. |

### 3.2 Customer & Vehicle Registry

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-011 | Customer CRUD                  | Must     | Customer records with name (required), phone (required, unique per org via `customers_org_phone_idx`), email, type (individual/corporate), fleet_id. Saudi phone format (+966). |
| FR-SYS-012 | Vehicle CRUD with Saudi Plate  | Must     | Vehicle records with plate (unique per org), make_model (required), VIN (17-char, unique per org), mileage_km. Saudi plate format supported. Plate and VIN render LTR in RTL mode. |
| FR-SYS-013 | Fleet Management               | Should   | Fleet records with vehicle_count, active_count, contract terms (value in halalas, start/end/renewal dates). Corporate customers linked via fleet_id. |
| FR-SYS-014 | Service History                | Must     | Vehicle service history composed by querying job cards by vehicle_id. VehicleDetail aggregates completed jobs, estimates, invoices, and inspection findings. |
| FR-SYS-015 | Customer Feedback              | Should   | Feedback records linked to job cards with rating (integer) and comment. Ratings feed into technician performance metrics. |
| FR-SYS-016 | Derived Fields                 | Must     | `vehicle_count` and `total_spent_halalas` are server-maintained, never accepted from clients. Spend tracking enables customer value segmentation. |
| FR-SYS-017 | Phone-Based Lookup             | Must     | Advisors search customers by phone during check-in. `customers_org_phone_idx` unique index enables fast lookup. Inline customer creation if not found. |
| FR-SYS-018 | Field Redaction                | Must     | "Customer contact details" field hidden from Technician, QC, and Supplier roles. Server-side `redact()` nulls values before API response. |

### 3.3 Finance & Invoicing

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-019 | Invoice CRUD with Line Items   | Must     | Invoice header + invoice_lines. Header: customer, vehicle, job_card_id, due_date, status (draft/issued/paid/overdue). Lines: description (EN/AR), kind (part/labour), qty, unit_price_halalas, part_sku. |
| FR-SYS-020 | VAT 15% Auto-Calculation       | Must     | `tax_halalas = subtotal_halalas * 15 / 100`. VAT computed at invoice level (not per line). Rate configurable via `VAT_RATE_BPS` (default 1500 = 15.00%). All amounts as integer halalas. |
| FR-SYS-021 | ZATCA XML Export               | Must     | Invoices exportable in UBL 2.1 XML format. Includes header (seller/buyer, dates, totals), line items, cryptographic stamp, QR code data. Supports B2B Tax Invoice and B2C Simplified Invoice types. |
| FR-SYS-022 | QR Code TLV Generation         | Must     | Five mandatory TLV fields generated at issuance: Tag 1 (Seller Name), Tag 2 (Seller VAT Number), Tag 3 (Invoice Timestamp in ISO 8601), Tag 4 (Invoice Total in SAR), Tag 5 (VAT Amount in SAR). Stored in `qr_code` field. |
| FR-SYS-023 | Hash Chain                     | Must     | Each invoice stores `hash_prev` (SHA-256 of previous invoice) and `hash_self` (SHA-256 of this invoice). Chain provides tamper evidence, sequential integrity, and non-repudiation. |
| FR-SYS-024 | Payment Recording              | Must     | Payments against invoices with method (cash, card, bank_transfer, mada, SADAD), amount_halalas, reference. Server updates `invoices.paid_halalas` as sum of cleared payments. Auto-transition to `paid` when `paid_halalas >= total_halalas`. |
| FR-SYS-025 | Receipt Generation             | Should   | Receipt records with code (unique per org), receipt_date, customer_name, invoice_code, method, amount_halalas. Statuses: pending, confirmed, voided. |
| FR-SYS-026 | Balance Tracking               | Must     | `paid_halalas` maintained by payment route, never client-supplied. Outstanding balance = `total_halalas - paid_halalas`. |
| FR-SYS-027 | Invoice Status Lifecycle       | Must     | draft -> issued -> paid. Overdue status applied when past due_date and not fully paid. Issued invoices are immutable. |
| FR-SYS-028 | ZATCA VAT Numbers              | Must     | `seller_vat_number` sourced from `organizations.vat_number`. `buyer_vat_number` required for B2B invoices, optional for B2C. |

### 3.4 Accounting

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-029 | Chart of Accounts              | Must     | Tree-structured accounts with code (unique per org), name, type (asset/liability/equity/revenue/expense), balance_halalas, parent_id. `children_count` for efficient leaf/branch detection. |
| FR-SYS-030 | Double-Entry Journal Entries   | Must     | Journal entries with entry_date, narration, debit_halalas, credit_halalas. Invariant: `debit_halalas = credit_halalas` validated server-side before posting. Statuses: draft, posted. |
| FR-SYS-031 | Auto-Journal from Transactions | Should   | Invoice issuance, payment recording, and payroll posting generate corresponding journal entries automatically. |
| FR-SYS-032 | Trial Balance                  | Must     | Report summing all account balances to verify debit/credit equality across the chart of accounts. |
| FR-SYS-033 | P&L and Balance Sheet          | Must     | Income Statement and Balance Sheet generated from chart of accounts. "Branch P&L" field redacted from non-authorized roles. |
| FR-SYS-034 | Expense Management             | Must     | Expenses with code, date, category, vendor, amount_halalas, status (pending/approved/rejected/paid). Amount-based approval routing per role ceiling. |
| FR-SYS-035 | Bank Reconciliation            | Should   | Bank statement import with statement_date, description, amount_halalas, direction (credit/debit). Matching engine links statement lines to recorded receipts. `matched` flag with receipt reference. |

### 3.5 CRM & Marketing

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-036 | Lead Pipeline                  | Must     | Leads with name, company, value_halalas, source, stage (new -> qualified -> proposal -> negotiation -> closed_won/closed_lost), score (0-100). Index on `(org_id, stage)`. |
| FR-SYS-037 | Lead Conversion                | Must     | Converting a lead creates an opportunity and sets `converted_opportunity_id`. Conversion is idempotent: replay returns existing opportunity. |
| FR-SYS-038 | Opportunities                  | Must     | Opportunities with value_halalas, probability_pct (0-100), close_date, owner_name. Weighted pipeline: expected revenue = `value_halalas * probability_pct / 100`. |
| FR-SYS-039 | Multi-Channel Campaigns        | Should   | Campaigns across email, SMS, WhatsApp, social channels. Performance funnel: reach -> opens -> clicks -> conversions. Budget tracking in halalas (budget vs. spent). |
| FR-SYS-040 | Customer Segments              | Should   | Rule-based segments with JSON criteria (spend thresholds, visit frequency, vehicle make, fleet membership). Member count tracked. Segments target campaign audiences. |
| FR-SYS-041 | CRM Tasks                      | Should   | Tasks with title, assignee, due_date, priority, status (todo/in_progress/done), type (call/email/meeting/follow_up). `own` data scope via `created_by`. |
| FR-SYS-042 | Public Lead Intake             | Should   | Unauthenticated `public_leads` endpoint for web form submissions. Submissions land in configured org (`PUBLIC_LEAD_ORG_ID`). Accepted leads promoted to CRM pipeline. |

### 3.6 Inventory & Procurement

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-043 | Parts CRUD with SKU            | Must     | Parts with name, sku (unique per org), price_halalas, cost_halalas (redacted by role), on_hand, reserved, reorder_level, backorderable flag. Available = on_hand - reserved. |
| FR-SYS-044 | Stock Levels and Reorder       | Must     | Parts with `on_hand <= reorder_level` trigger reorder alerts. Backorderable parts can be allocated beyond available stock; non-backorderable parts prevent over-allocation. |
| FR-SYS-045 | Inventory Movement Ledger      | Must     | Signed-delta ledger (`inventory_movements`) with types: in (+N), out (-N), adjust (+N), adjust_down (-N), transfer (+/-N paired), return (+N). `on_hand` reconstructable from `SUM(delta)`. |
| FR-SYS-046 | PO Lifecycle with Approval/SOD | Must     | Purchase orders with supplier, status (draft/submitted/approved/ordered/partial/received/cancelled). SOD enforced: `submitted_by != approved_by` via `requireDifferentApprover()`. `requireSodClear()` checks audit trail. |
| FR-SYS-047 | Supplier Management            | Must     | Suppliers with code (unique per org), name (EN/AR), contact info, status (active/inactive/suspended). SOD pair "Create supplier / Approve supplier payment" declared. |
| FR-SYS-048 | Goods Receipt                  | Must     | `received_qty` on PO lines tracks partial deliveries. Invariant: `received_qty <= qty`. PO transitions to `received` when all lines fully received. Stock `in` movement created. |
| FR-SYS-049 | Stock Adjustments with SOD     | Must     | Adjust and adjust_down movements for count corrections. SOD pair "Issue stock / Adjust stock count" (medium risk) enforced: same person cannot issue and adjust for same part. |
| FR-SYS-050 | Inter-Branch Transfers         | Should   | Transfer movements create paired debit/credit rows sharing a `transfer_id`. Source branch debited (-N), destination branch credited (+N). |

### 3.7 HR & Team

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-051 | Technician Profiles            | Must     | Technicians with name, specialty, active_jobs count, rating (derived from feedback), user_id (links to auth). user_id enables QC independence checks and data scoping. |
| FR-SYS-052 | Performance Tracking           | Should   | Technician rating derived from customer feedback scores. Active job count for workload balancing. Leaderboards and performance review screens. |
| FR-SYS-053 | Attendance and Timesheets      | Should   | Timesheets with employee_id, work_date, clock_in/clock_out (HH:MM), minutes (integer). Index on `(org_id, employee_id, work_date)`. Saudi labor law limits: 8 hours/day, 48 hours/week. |
| FR-SYS-054 | Leave Management               | Should   | Leave requests with type (annual/sick/emergency/unpaid), start_date, end_date, days, status (submitted/approved/rejected). Approval gated on `hr:a`. Saudi labor law entitlements enforced. |
| FR-SYS-055 | Payroll Processing             | Must     | Payroll runs by period (YYYY-MM, unique per org). Lines per employee: gross, allowances, deductions, net (server-computed: net = gross + allowances - deductions). Posted runs are immutable. All amounts in integer halalas. |
| FR-SYS-056 | Salary Redaction               | Must     | Employee salary field hidden from Advisor, Technician, QC, Storekeeper, Receptionist, Call Center, Procurement, Supplier, Customer. Server-side `GLOBAL_REDACTIONS` nulls salary fields in API responses. |

### 3.8 AI Platform

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-057 | Chat Assistant                 | Should   | Conversational AI interface with message history, suggested prompts, token usage tracking. Conversations tenant-scoped via org_id. |
| FR-SYS-058 | Knowledge Base                 | Should   | Structured repair procedures with code, title (EN/AR), category, vehicle make, estimated minutes, torque specs (EN/AR), step count, TSB flag, media attachments. Searchable by category and make. |
| FR-SYS-059 | AI Agents                      | Could    | Agent registry with name, role, model, status (active/inactive/error), task count, success_rate. Agent dashboard for monitoring. |
| FR-SYS-060 | OBD-II Diagnostics             | Could    | OBD device tracking with bay, VIN, real-time readings (RPM, coolant, voltage, load, DTC count). DTC reading storage with severity and clearing status. Diagnostic report generation. |
| FR-SYS-061 | Workflow Automation            | Could    | Visual workflow builder and automation rules. Prompt library for reusable templates. AI-powered service advisor, damage assessment, and fraud detection planned. |

### 3.9 Administration

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-062 | User CRUD                      | Must     | Users with email (unique per org), name (EN/AR), role (one of 14), password_hash (Argon2id), status (active/inactive/locked). `users_org_email_idx` enforces per-org uniqueness. |
| FR-SYS-063 | Role Management                | Must     | 28 RBAC modules, 6 actions (v/c/e/d/a/x). Permission matrix in `@salis/contract` shared by frontend and backend. Roles are system-defined (not user-customizable in v1). |
| FR-SYS-064 | Branch Management              | Must     | Branches with name (EN/AR), city, is_main flag. Branch scoping: users with `branch` scope see only their branch's data. |
| FR-SYS-065 | Organization Settings          | Must     | Organization profile (name, VAT number, CR number), notification preferences, default formatting, integration configuration. |
| FR-SYS-066 | Audit Log                      | Must     | Append-only audit trail. Database trigger refuses UPDATE/DELETE. Fields: actor_id, actor_role, action (18 types), entity, entity_id, before/after JSON, reason, source, request_id, ip, user_agent, timestamp. Same-transaction writes. Credential scrubbing via `scrub()`. |
| FR-SYS-067 | Feature Flags                  | Should   | Feature-level configuration for progressive rollout. OEM integrations, system integrations gated on settings module. |
| FR-SYS-068 | Approval Inbox                 | Must     | Centralized approval queue (gated on `approvals` module). Roles with `a` grant can view and act on pending approvals. Amount-based routing with ceiling checks. |
| FR-SYS-069 | Backup and Recovery            | Should   | Backup management screen (gated on `settings`). Database backup scheduling and restore capabilities. |
| FR-SYS-070 | Subscription Management        | Should   | Organization plan management: starter, business, enterprise tiers. Concurrent user limits per tier (25/100/500). |

### 3.10 Authentication

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-071 | Email/Password Login           | Must     | `POST /auth/login` with email (3-254 chars) and password (1-200 chars). Returns JWT access token (15-min TTL) and refresh token (30-day TTL). Argon2id hashing (m=19 MiB, t=2, p=1). |
| FR-SYS-072 | JWT Access Token               | Must     | HS256 signed, 15-minute TTL. Claims: sub (userId), role, org_id, branch_id, scope, name. Issuer: `salis-auto`. Audience: `salis-auto-api`. Stateless verification. |
| FR-SYS-073 | Refresh Token Rotation         | Must     | 30-day TTL. Audience: `salis-auto-api-refresh`. Each use issues new pair and retires old token. `user_sessions` tracks family_id. Reuse of retired token triggers family-wide revocation (theft detection). |
| FR-SYS-074 | OTP Verification               | Must     | 6-digit numeric codes via email or SMS. Stored as hash. TTL: 10 minutes. Max 5 attempts. 60-second resend cooldown. Regex: `^\d{6}$`. |
| FR-SYS-075 | Two-Factor Authentication      | Should   | TOTP 2FA enrollment via QR code (`/auth/2fa/enrol`, `/auth/2fa/verify`). WebAuthn/FIDO2 biometric auth (`/auth/biometric/enrol`, `/auth/biometric/challenge`). Configuration-gated. |
| FR-SYS-076 | SSO Login                      | Could    | SSO provider initiation and callback (`/auth/sso/start`, `/auth/sso/callback`). Requires `SSO_ISSUER_URL`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`. Returns 503 when unconfigured. |
| FR-SYS-077 | Password Reset                 | Must     | Forgot password (`/auth/forgot-password`) sends reset link. Reset password (`/auth/reset-password`) with token validation. |
| FR-SYS-078 | Session Management             | Must     | `user_sessions` table with user_id, refresh_token_hash (SHA-256), family_id, user_agent, ip, expires_at, revoked_at, replaced_by. Account lockout after 8 failed attempts for 300 seconds. Rate limit: 10 login/min/IP, 20 auth/min/IP. |

### 3.11 Portals

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-079 | Customer App Portal            | Must     | 430px mobile frame with bottom tab navigation (CustomerAppShell). Screens: Home (hero card, service status), Garage (vehicles), Appointments (booking), Service Tracking (live progress), Profile. Customer role: `vx` on `portalcustomer`. |
| FR-SYS-080 | Technician Portal              | Must     | Job queue and assignments dashboard. Job detail with repair actions. Technician role: `vx` on `portaltech`. Knowledge base access gated on `technicians` module. |
| FR-SYS-081 | Supplier Portal                | Should   | Order dashboard and PO fulfillment. Supplier role: `vx` on `portalsupplier`. View only on their own POs. |
| FR-SYS-082 | Procurement Portal             | Should   | Procurement dashboard and requisition management. Procurement role: `vx` on `portalprocure`. |
| FR-SYS-083 | Kiosk Check-In                 | Could    | Self-service vehicle check-in at workshop. Receptionist role: `vcex` on `kiosk` module. |
| FR-SYS-084 | Super Admin Portal             | Must     | Platform-level administration: garage applications, supplier applications, subscription management, support tickets, system health. Gated on `settings` module. |
| FR-SYS-085 | Customer Approval Portal       | Should   | Customer-facing estimate approval screen (`CustomerApproval`). Gated on `estimates` module. |

### 3.12 Reports & Analytics

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-086 | Executive Dashboard            | Must     | KPI overview with revenue, job volume, customer metrics. Gated on `execreports` module. Access: Owner, Manager, Accountant, Super Admin (vx). |
| FR-SYS-087 | Operational Reports            | Must     | Workshop, inventory, and operational reports. Gated on `reports` module. Export to CSV with 50,000-row ceiling and formula injection protection. |
| FR-SYS-088 | Custom Report Builder          | Should   | User-defined reports stored in `saved_reports` table. Report definitions saved as JSON (filters, columns). Per-user report ownership. |
| FR-SYS-089 | BI Dashboard                   | Could    | Business intelligence with heatmaps, profit analysis, productivity tracker. Gated on `execreports`. |
| FR-SYS-090 | KPI Tracking                   | Should   | KPI dashboard, leaderboards, performance metrics. Specialized reports: sales, insurance, loan portfolios. |

### 3.13 Call Center

| ID          | Requirement                    | Priority | Acceptance Criteria                                                                                    |
|-------------|--------------------------------|----------|--------------------------------------------------------------------------------------------------------|
| FR-SYS-091 | Call Queue                     | Must     | Active call queue with status (waiting/active/on_hold), wait time, agent assignment. Agent availability tracking. |
| FR-SYS-092 | Call Logging                   | Must     | Call history with duration, disposition, recording references. Agent performance metrics. |
| FR-SYS-093 | IVR Integration                | Could    | IVR management and queue analytics integration. Configuration-gated feature screen. |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

| Interface         | Description                                                                                  |
|-------------------|----------------------------------------------------------------------------------------------|
| AppShell          | Main application shell with fixed sidebar (desktop) or overlay drawer (mobile <=860px). Module-based navigation grouped by domain. RBAC-hidden modules excluded from sidebar. |
| CustomerAppShell  | Mobile-first portal at 430px frame width with bottom tab bar navigation. 5 tabs: Home, Garage, Appointments, Tracking, Profile. |
| AuthLayout        | Centered authentication card with brand backdrop. Used by Login, Register, Forgot Password, Reset Password, OTP, SSO, 2FA screens. |
| RTL Support       | Full right-to-left layout via CSS logical properties. `dir="rtl"` on document root for Arabic. Direction overrides for LTR-only content (plates, VINs, SKUs, phone numbers, codes). |
| Responsive Design | Single breakpoint at 860px. Desktop: full DataTable with sortable columns. Mobile: MobileCard stacked list with keyboard-accessible cards. Dual-layout rendering, not a narrowed table. |
| Theme Support     | Dark mode default. Light/dark toggle via CSS custom properties. Both themes WCAG AA compliant. System preference detection via `prefers-color-scheme`. |

### 4.2 Hardware Interfaces

| Interface        | Description                                                          | Status  |
|------------------|----------------------------------------------------------------------|---------|
| OBD-II Readers   | Vehicle diagnostic interface for DTC scanning and live telemetry     | Future  |
| Barcode Scanners | Inventory part scanning for SKU lookup and stock movements           | Planned |
| Receipt Printers | Thermal receipt printing for payment confirmations                   | Planned |

### 4.3 Software Interfaces

| System              | Protocol      | Purpose                                                         |
|---------------------|---------------|-----------------------------------------------------------------|
| ZATCA Fatoora API   | REST/XML      | UBL 2.1 XML invoice submission, X.509 digital signing, clearance and reporting |
| Stripe API          | REST/JSON     | Payment processing for subscription billing and customer payments |
| SMS Gateway         | REST/JSON     | OTP delivery, marketing campaigns, appointment reminders (Saudi +966 numbers) |
| WhatsApp Business   | REST/JSON     | WhatsApp campaign messaging and notifications                    |
| Email SMTP          | SMTP/TLS      | Transactional email (password reset, OTP), email marketing campaigns |

### 4.4 Communication Interfaces

| Protocol      | Usage                                                                     |
|---------------|---------------------------------------------------------------------------|
| HTTPS/TLS 1.3| All client-server communication encrypted. HSTS enforced.                 |
| REST JSON API | All data operations via `/api/v1` prefix. Consistent error envelope. CORS restricted to allowed origins. |
| WebSocket     | Real-time service tracking for customer portal (live repair progress updates). Planned. |
| X.509         | Digital certificate signing for ZATCA invoice XML submissions.            |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID        | Requirement                           | Target        | Maximum       |
|-----------|---------------------------------------|---------------|---------------|
| NFR-001   | API read (single record) latency      | < 100ms       | 200ms         |
| NFR-002   | API read (list/paginated) latency     | < 150ms       | 300ms         |
| NFR-003   | API write (create/update) latency     | < 200ms       | 500ms         |
| NFR-004   | Job card state transition latency     | < 200ms       | 500ms         |
| NFR-005   | Initial page load (LCP)               | < 2s          | 3s            |
| NFR-006   | Client-side navigation                | < 500ms       | 1s            |
| NFR-007   | Time to Interactive (4G)              | < 3s          | 5s            |
| NFR-008   | Concurrent users (Business tier)      | 100           | —             |
| NFR-009   | Initial JS bundle (gzipped)           | < 200KB       | 350KB         |
| NFR-010   | CSV export (up to 50,000 rows)        | < 5s          | 10s           |
| NFR-011   | Arabic translation load               | < 200ms       | 500ms         |
| NFR-012   | DataTable render (200 rows)           | < 200ms       | 500ms         |

**Caching:** React Query with 60-second staleTime, no refetch-on-window-focus. Cache invalidation on mutation success. 409 Conflict triggers automatic refetch.

**Peak Hours:** Workshop peak (8:00-10:00 AM drop-off) generates 3-5x normal write volume. System must maintain targets during peaks.

### 5.2 Security

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-013   | JWT token architecture                         | HS256 access tokens (15-min) + refresh tokens (30-day). httpOnly pattern for refresh. Family-based theft detection. |
| NFR-014   | Password hashing                               | Argon2id with OWASP parameters: m=19 MiB, t=2, p=1.      |
| NFR-015   | Triple-layer RBAC                              | Navigation (sidebar hiding), Screen (`SCREEN_MODULE` gating), API (`requirePermission()` middleware). Client and server read same matrix. |
| NFR-016   | OWASP Top 10 compliance                        | SQL injection prevented (parameterized queries via Drizzle). XSS via React escaping + CSP. CSRF via JWT + SameSite. |
| NFR-017   | Data encryption                                | TLS 1.3 in transit. AES-256 at rest for PII and financial data. |
| NFR-018   | Audit trail security                           | Append-only (DB trigger refuses UPDATE/DELETE). Credential scrubbing. Same-transaction writes. Request-ID correlation. |
| NFR-019   | Field-level redaction                          | 7 redaction rules enforced server-side. Protected values nulled via `redact()` before serialization. Values never reach the wire. |
| NFR-020   | Account lockout                                | 8 failed attempts, 300-second lockout. Per-identity tracking. |
| NFR-021   | Rate limiting                                  | Auth: 20/min/IP. Login: 10/min/IP. Export: 5/min/user. General: per orgId:IP. |
| NFR-022   | Input validation                               | Zod schema validation on every request body. SERVER_OWNED_KEYS stripped from client input. |

### 5.3 Scalability

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-023   | Horizontal app scaling                         | Stateless JWT verification. No server-side sessions. No sticky sessions. Any instance serves any tenant. |
| NFR-024   | Multi-tenant isolation via org_id              | 54 tenant-scoped tables with RLS. Cross-tenant reads return 404 (not 403). Per-tenant unique constraints. |
| NFR-025   | Connection pooling                             | PostgreSQL connection pooler. RLS context set per-transaction via `withTenant()`. |
| NFR-026   | Database partitioning (growth)                 | Hash partitioning by org_id for high-volume tables (audit_log, inventory_movements, job_cards). |
| NFR-027   | Pagination ceiling                             | Max 200 rows/page. Export ceiling: 50,000 rows. No unpaginated list endpoints. |
| NFR-028   | CDN static assets                              | Vite-built bundles via CDN with content-addressable filenames. Immutable 1-year cache. index.html no-cache. |
| NFR-029   | Idempotency                                    | `idempotency_keys` table prevents duplicate effects. Same key + same body returns stored response. Same key + different body returns 409. |

### 5.4 Reliability

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-030   | Platform availability                          | 99.9% uptime SLO (~43 min/month downtime).                |
| NFR-031   | Database availability                          | 99.95% uptime SLO (~22 min/month downtime).               |
| NFR-032   | RPO (Recovery Point Objective)                 | < 1 hour. Database backups and WAL archiving.             |
| NFR-033   | RTO (Recovery Time Objective)                  | < 4 hours. Documented failover procedure.                 |
| NFR-034   | Optimistic concurrency control                 | Integer `version` column on all tenant tables. `WHERE version = :expected`. Conflict returns 409. |
| NFR-035   | Soft deletes                                   | `deleted_at` timestamp. No physical row removal. FK integrity preserved. Restorable via `restore` audit action. |
| NFR-036   | Transaction isolation                          | Single-transaction writes (data + audit). Automatic rollback on error. SOD rejections audited in separate transaction. |
| NFR-037   | Graceful degradation                           | Repository seam: `mockRepository` enables offline demo mode. SSO/WebAuthn return 503 when unconfigured. OTP transport degrades explicitly. |

### 5.5 Usability

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-038   | Task completion rate                           | > 95% for core workshop workflows (check-in through delivery). |
| NFR-039   | NPS (Net Promoter Score)                       | > 40 target across all user roles.                        |
| NFR-040   | System font stack                              | font-ui, font-display, font-action (system UI), font-mono (JetBrains Mono for codes). Arabic glyphs via system fonts. |
| NFR-041   | Component library                              | Standardized components: Button (4 variants), Card, KpiCard, DataTable/MobileCard, Badge, Modal, Drawer, Toast, Alert, EmptyState, Skeleton, WorkflowStepper, Timeline, KanbanView, CalendarView. |
| NFR-042   | Progressive disclosure                         | List -> detail navigation. Popover/Tooltip for contextual info. Drawer for side details. Tabs within detail views. |
| NFR-043   | Mobile-first dual layout                       | 860px breakpoint. Below: MobileCard stacked list with keyboard-accessible cards. Above: full DataTable. No horizontal scrolling on mobile. |

### 5.6 Accessibility

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-044   | WCAG 2.1 AA conformance                        | All 191+ screens. Level AAA stretch goal for critical workflows. |
| NFR-045   | ARIA patterns                                  | Implemented: tablist/tab/tabpanel, aria-current="step", radiogroup, table roles, dialog, alert, status, searchbox, pagination. |
| NFR-046   | Keyboard navigation                            | All interactive elements focusable. Focus order follows visual order in both LTR/RTL. Modal/drawer focus trapping. Skip links. |
| NFR-047   | Screen reader support                          | Proper heading hierarchy. Landmark regions (main, nav, aside). Form labels via htmlFor. aria-sort on tables. aria-invalid on errors. `lang` attribute for bilingual content. |
| NFR-048   | Color contrast                                 | Normal text 4.5:1, large text 3:1, UI components 3:1, focus indicators 3:1. Status indicators use icons + text + color. |
| NFR-049   | Touch targets                                  | Minimum 44x44 CSS pixels. Pinch-to-zoom not disabled. Content reflows at 320px. |

### 5.7 Localization

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-050   | EN/AR bilingual                                | ~2,122 generated translation entries + manual overrides. Three-level fallback: AR_OVERRIDES -> AR -> English key. |
| NFR-051   | RTL toggle                                     | `dir="rtl"` on HTML root for Arabic. CSS logical properties throughout (margin-inline-start, text-align: start). Direction overrides for LTR-only content. |
| NFR-052   | Locale-aware formatting                        | Currency: SAR 1,234.56 (EN) / ١٬٢٣٤٫٥٦ ر.س (AR). Dates: locale-appropriate. Numbers: locale-specific separators. Phone: +966 format in both locales. |
| NFR-053   | Translation function `t()`                     | Accessed via `usePreferences()` hook. Lazy-loaded Arabic translations cached after first load. No label ever renders empty. |
| NFR-054   | Database bilingual columns                     | `_ar` suffixed columns (name_ar, description_ar, title_ar, etc.) across 15+ tables. API returns both EN and AR fields. |

### 5.8 Compliance

| ID        | Requirement                                    | Detail                                                    |
|-----------|------------------------------------------------|-----------------------------------------------------------|
| NFR-055   | ZATCA Phase 2 e-invoicing                      | UBL 2.1 XML export. TLV QR codes (5 tags). SHA-256 hash chain. Seller/buyer VAT numbers. X.509 digital signing. B2B Tax Invoice and B2C Simplified Invoice types. |
| NFR-056   | PDPL (Saudi data privacy)                      | PII identified across 7 tables. Field-level redaction (7 rules). Credential scrubbing in audit. Data minimization via derived fields. Data residency in Saudi Arabia. |
| NFR-057   | Saudi labor law                                | Leave types per regulation (annual 21-30 days, sick up to 120 days, emergency 5 days). Working hour limits (8/day, 48/week, Ramadan reduction). WPS-compatible payroll. |
| NFR-058   | AML compliance                                 | SOD enforcement prevents single-person financial control. Audit trail for all financial transactions. Approval ceilings limit unauthorized spending. |
| NFR-059   | Data retention (7 years)                       | Financial records: 7 years. PII: 3 years post-relationship. Audit log: indefinite (append-only). Backups: 90 days. Application logs: 1 year. |

---

## 6. Data Requirements

### 6.1 Data Model Overview

The database contains 50+ tables organized across domains. All tables use ULID primary keys (varchar(26)), integer halalas for monetary values (bigint), and bilingual columns (_ar suffix) where applicable.

**Core Table Groups:**

| Group                    | Tables | Key Tables                                                    |
|--------------------------|--------|---------------------------------------------------------------|
| Tenancy & Identity       | 3      | organizations, branches, users                                |
| Session Management       | 2      | user_sessions, otp_challenges                                 |
| Customers & Vehicles     | 4      | customers, vehicles, fleets, services                         |
| Workshop Core            | 4      | job_cards, estimates, estimate_lines, diag_findings           |
| Appointments             | 1      | appointments                                                  |
| Finance                  | 4      | invoices, invoice_lines, payments, receipts                   |
| Accounting               | 4      | chart_of_accounts, journal_entries, expenses, bank_statements |
| Inventory                | 3      | parts, inventory_movements, suppliers                         |
| Procurement              | 4      | requisitions, requisition_lines, purchase_orders, purchase_order_lines |
| HR & Payroll             | 5      | employees, departments, technicians, payroll_runs, payroll_lines |
| Time & Leave             | 2      | timesheets, leave_requests                                    |
| CRM                      | 5      | leads, public_leads, opportunities, campaigns, segments, crm_tasks |
| AI Platform              | 4      | conversations, kb_procedures, ai_agents, obd_devices          |
| System                   | 4      | audit_log, idempotency_keys, saved_reports, system_health     |

**Universal Column Pattern (all tenant tables):**

| Column       | Type                    | Purpose                                    |
|--------------|-------------------------|--------------------------------------------|
| id           | varchar(26) PK          | ULID primary key                           |
| org_id       | varchar(26) NOT NULL    | Tenant identifier (FK to organizations)    |
| branch_id    | varchar(26) nullable    | Branch within tenant                       |
| created_at   | timestamptz NOT NULL    | Creation timestamp                         |
| updated_at   | timestamptz NOT NULL    | Last modification timestamp                |
| created_by   | varchar(26) nullable    | Creating user                              |
| updated_by   | varchar(26) nullable    | Last modifying user                        |
| deleted_at   | timestamptz nullable    | Soft-delete marker                         |
| version      | integer NOT NULL        | Optimistic concurrency counter (default 1) |

### 6.2 Data Retention

| Data Category     | Retention Period | Rationale                                          |
|-------------------|------------------|----------------------------------------------------|
| Financial records | 7 years          | Saudi commercial and tax law requirements          |
| PII               | 3 years          | Post-customer relationship, per PDPL               |
| Audit log         | Indefinite       | Append-only; regulatory and SOD enforcement        |
| Application logs  | 1 year           | Operational troubleshooting                        |
| Database backups  | 90 days          | RPO compliance and disaster recovery               |
| Session data      | 30 days          | Refresh token TTL; expired sessions purged         |

### 6.3 Multi-Tenant Isolation

**org_id Scoping:** Every tenant-owned table (54 tables declared in `TENANT_TABLES`) carries `org_id` referencing `organizations.id` with `ON DELETE RESTRICT`. No tenant can be accidentally deleted.

**Row-Level Security (RLS):** PostgreSQL RLS policies applied via migration (`drizzle/0001_rls.sql`). The `withTenant()` function sets RLS context per-transaction. Cross-tenant reads return 404, not 403, to prevent entity existence disclosure.

**Branch Partitioning:** Users with `branch` scope see only data from their assigned branch via `branch_id` filtering. The owner and accountant roles use `all` scope (cross-branch visibility). The technician role uses `own` scope (only assigned records).

**Per-Tenant Unique Constraints:**

| Table            | Unique Columns     | Purpose                           |
|------------------|--------------------|-----------------------------------|
| users            | (org_id, email)    | One email per organization        |
| customers        | (org_id, phone)    | One phone per organization        |
| vehicles         | (org_id, plate)    | One plate per organization        |
| vehicles         | (org_id, vin)      | One VIN per organization          |
| parts            | (org_id, sku)      | One SKU per organization          |
| invoices         | (org_id, code)     | One code per organization         |
| job_cards        | (org_id, code)     | One code per organization         |
| purchase_orders  | (org_id, code)     | One code per organization         |
| payroll_runs     | (org_id, period)   | One period per organization       |

---

## 7. Appendices

### Appendix A — RBAC Permission Matrix

The complete 14-role x 28-module permission matrix is maintained in `app/src/data/generated/rbac.ts` and documented in the [RBAC Matrix Reference](./rbac-matrix.md).

**Grant Alphabet:**

| Code | Action  | Description                                    |
|------|---------|------------------------------------------------|
| v    | view    | See data and navigate to the module            |
| c    | create  | Add new records                                |
| e    | edit    | Modify existing records                        |
| d    | delete  | Soft-delete records                            |
| a    | approve | Approve/reject with ceiling check              |
| x    | export  | Export data to CSV                             |

**28 Modules:** dashboard, jobcards, appointments, estimates, customers, vehicles, inventory, procurement, invoices, payments, accounting, hr, technicians, crm, callcenter, reports, approvals, kiosk, execreports, portaltech, portalcustomer, portalsupplier, portalprocure, ai, admin, settings, audit, network.

**Approval Ceilings:**

| Role         | Ceiling (SAR) | Ceiling (Halalas) |
|--------------|---------------|-------------------|
| Owner        | Unlimited     | null              |
| Super Admin  | Unlimited     | null              |
| Manager      | 50,000        | 5,000,000         |
| Accountant   | 25,000        | 2,500,000         |
| Procurement  | 20,000        | 2,000,000         |
| HR Manager   | 15,000        | 1,500,000         |
| Storekeeper  | 10,000        | 1,000,000         |
| Advisor      | 5,000         | 500,000           |
| All others   | 0             | 0                 |

### Appendix B — Segregation of Duties Rules

Six SOD pairs are declared. Enforcement status depends on the availability of audit signatures for the activities in each pair.

| #  | Activity A              | Activity B                | Risk   | Status        |
|----|-------------------------|---------------------------|--------|---------------|
| 1  | Raise purchase order    | Approve purchase order    | High   | **Enforced** — `requireDifferentApprover()` + audit signatures on `purchase_order` |
| 2  | Create supplier         | Approve supplier payment  | High   | Unobservable — no supplier-payment approval route yet |
| 3  | Post journal entry      | Approve journal entry     | High   | Unobservable — no journal approval route yet |
| 4  | Perform repair          | Pass quality check        | High   | **Enforced** — transition audit signatures on `job_card`, `technicians.user_id` resolution |
| 5  | Issue stock             | Adjust stock count        | Medium | **Enforced** — movement audit signatures on `part` (type `out` vs `adjust`/`adjust_down`) |
| 6  | Create employee         | Approve payroll run       | Medium | Unobservable — no payroll approval route yet |

**Enforcement Mechanism:** `requireSodClear()` queries audit history for the entity (limited to 200 rows), matches audit rows to activity signatures, and rejects with 403 if the current actor performed the counterpart activity. SOD rejections are audited in a separate transaction to survive the caller's rollback.

### Appendix C — ZATCA QR Code TLV Fields

| Tag | Field              | Source                              | Encoding       |
|-----|--------------------|-------------------------------------|----------------|
| 1   | Seller Name        | `organizations.name`                | UTF-8 string   |
| 2   | Seller VAT Number  | `invoices.seller_vat_number`        | UTF-8 string   |
| 3   | Invoice Timestamp  | `invoices.issued_at` (ISO 8601)     | UTF-8 string   |
| 4   | Invoice Total      | `invoices.total_halalas / 100`      | Decimal string |
| 5   | VAT Amount         | `invoices.tax_halalas / 100`        | Decimal string |

**Hash Chain:** Each invoice stores `hash_prev` (SHA-256 of previous invoice) and `hash_self` (SHA-256 of this invoice data). Altering any invoice in the chain breaks integrity from that point forward. The chain proves sequential integrity and non-repudiation.

**XML Format:** UBL 2.1 (Universal Business Language) compliant XML including header (seller/buyer, dates, totals), line items (description, quantity, unit price, VAT), cryptographic stamp (hash chain reference), and QR code data.

### Appendix D — Glossary

A comprehensive glossary of domain terms is maintained in the project [Glossary](./glossary.md).

Key domain terms:

| Term                | Definition                                                             |
|---------------------|------------------------------------------------------------------------|
| Job Card            | The central record tracking a vehicle repair from check-in to delivery |
| Halalas             | Subunit of SAR; 100 halalas = 1 SAR. All money stored as integer halalas |
| Stage               | Position in the workshop lifecycle (checkin/inspection/estimate/repair/qc/delivery/invoiced/closed) |
| Estimate            | Itemized cost proposal for a repair, subject to approval chain        |
| Bay                 | Physical service location in the workshop for vehicle repair           |
| Hash Chain          | Sequential SHA-256 linking of invoices for ZATCA tamper evidence       |
| Approval Ceiling    | Maximum SAR amount a role can approve without escalation              |
| Data Scope          | Row-level visibility: all, platform, branch, own, self, external      |
| Collection Engine   | Generic CRUD handler that all data routes share for consistent behavior|
| Tenant              | An organization (org_id) representing one workshop business            |

### Appendix E — References

**Functional Requirements Documents (8):**

- [FR-WKS-001 — Workshop Operations](./functional/workshop-operations.md)
- [FR-REG-002 — Registry](./functional/registry.md)
- [FR-FIN-003 — Finance & Accounting](./functional/finance-accounting.md)
- [FR-CRM-004 — CRM & Marketing](./functional/crm-marketing.md)
- [FR-INV-005 — Inventory & Procurement](./functional/inventory-procurement.md)
- [FR-HRT-006 — HR & Team](./functional/hr-team.md)
- [FR-AIP-007 — AI Platform](./functional/ai-platform.md)
- [FR-ADM-008 — Administration & Portals](./functional/admin-portals.md)

**Non-Functional Requirements Documents (8):**

- [NFR-PRF-001 — Performance](./non-functional/performance.md)
- [NFR-SEC-002 — Security](./non-functional/security.md)
- [NFR-SCL-003 — Scalability](./non-functional/scalability.md)
- [NFR-A11Y-004 — Accessibility](./non-functional/accessibility.md)
- [NFR-USB-005 — Usability](./non-functional/usability.md)
- [NFR-REL-006 — Reliability](./non-functional/reliability.md)
- [NFR-L10N-007 — Localization](./non-functional/localization.md)
- [NFR-CMP-008 — Compliance](./non-functional/compliance.md)

**Architecture Documents (5):**

- [SYS-ARCH-001 — Frontend Architecture](../system/architecture/frontend-architecture.md)
- [SYS-ARCH-002 — Backend Architecture](../system/architecture/backend-architecture.md)
- [SYS-ARCH-003 — Database Design](../system/architecture/database-design.md)
- [SYS-ARCH-005 — Auth Architecture](../system/architecture/auth-architecture.md)
- [SYS-INT-001 — ZATCA Integration](../system/integration/zatca-integration.md)

**RBAC Source of Truth:**

- `app/src/data/generated/rbac.ts` — 14 roles, 28 modules, 6 actions, 6 SOD pairs, 7 field-redaction rules

---

*End of Document — SA-REQ-SRS-001 v1.0*
