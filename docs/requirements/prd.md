# SALIS AUTO -- Product Requirements Document (PRD)

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-REQ-PRD-001               |
| Version        | 1.0                          |
| Date           | 2026-09-01                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Executive Summary

SALIS AUTO is a cloud-native, multi-tenant SaaS platform purpose-built for the Saudi Arabian automotive aftermarket. The platform delivers end-to-end workshop management across 13 functional domains, serving 14 distinct user roles through 191+ screens with full bilingual (English/Arabic) support and native RTL layout.

**Product Name:** SALIS AUTO

**Market:** Saudi Arabia's automotive aftermarket, valued at SAR 85--95 billion annually, with the workshop services segment accounting for SAR 35--40 billion. The market comprises 25,000--30,000 independent workshops, 2,000--3,000 multi-branch operators, 500--800 franchise dealerships, and 300--500 fleet maintenance providers.

**Problem Statement:** Saudi automotive workshops operate on paper job cards, WhatsApp coordination, disconnected accounting software, and manual estimate approvals. Over 50% of workshops are non-compliant with ZATCA Phase 2 e-invoicing mandates, exposing them to penalties of SAR 5,000+ per non-compliant invoice. No existing platform combines native ZATCA Phase 2 compliance with workshop-specific workflows, Arabic RTL support, and SAR halala-precision arithmetic in a single product.

**Solution:** A unified workshop management platform covering the complete vehicle service lifecycle -- Check-In, Inspection, Estimate, Repair, Quality Check, Delivery -- integrated with invoicing, accounting, CRM, inventory, HR, AI-powered diagnostics, and customer/supplier portals. The platform enforces separation-of-duties, role-based access control with SAR approval ceilings, and field-level data redaction.

**Key Differentiators:**

- **ZATCA-native:** Built-in Phase 2 e-invoicing with UBL 2.1 XML generation, TLV-encoded QR codes, hash chain integrity, and Fatoora API integration -- not a third-party add-on.
- **Arabic-first:** Full RTL layout designed from the ground up, not retrofitted. Saudi license plate validation, +966 phone formatting, and SAR halala-precision currency arithmetic.
- **AI-powered:** Integrated AI Platform with diagnostic chains, predictive maintenance scoring, smart scheduling, damage assessment, and fraud detection.
- **All-in-one multi-tenant:** 13 domains, 191+ screens, and 14 RBAC roles in a single SaaS subscription with PostgreSQL row-level security for tenant isolation.

---

## 2. Product Vision & Strategy

### 2.1 Vision Statement

To be the operating system for every automotive workshop in Saudi Arabia -- the single platform that replaces paper, spreadsheets, and disconnected tools with a unified, compliant, and intelligent digital workplace.

### 2.2 Mission

Deliver a ZATCA-compliant, bilingual workshop management platform that increases technician throughput by 25%, reduces estimate approval time from 48 hours to under 4 hours, and eliminates the regulatory risk of non-compliant invoicing for Saudi workshops.

### 2.3 Strategic Alignment with Vision 2030

| Vision 2030 Goal                     | SALIS AUTO Alignment                                           |
|--------------------------------------|----------------------------------------------------------------|
| Digital Transformation of SMBs      | Cloud SaaS replacing paper-based workshop processes            |
| Economic Diversification             | Supporting automotive services sector growth and formalization  |
| Regulatory Compliance Enforcement    | Native ZATCA Phase 2 e-invoicing automation                    |
| Job Creation and Saudization         | HR and team management with Nitaqat compliance tracking        |
| Technology Adoption                  | AI Platform, mobile Customer App, digital workflows            |
| Transparency and Anti-Corruption     | Audit trails, financial controls, RBAC, separation of duties   |

### 2.4 Target Market

| Segment                  | Count (est.) | Revenue Share | SALIS AUTO Tier   |
|--------------------------|--------------|---------------|-------------------|
| Independent Workshops    | 25,000-30,000| 45%           | Starter           |
| Multi-Branch Operators   | 2,000-3,000  | 25%           | Professional      |
| Franchise Dealerships    | 500-800      | 20%           | Enterprise        |
| Fleet Maintenance        | 300-500      | 10%           | Enterprise        |

**Total Addressable Market (TAM):** SAR 784,800,000/year across all segments. **Serviceable Addressable Market (SAM):** SAR 475,295,000/year after geographic, technology-readiness, and segment-fit filters. **Serviceable Obtainable Market (SOM):** SAR 14,259,000/year at Year 3 (3.0% market share, ~900 workshops).

---

## 3. Target Users & Personas

SALIS AUTO serves 14 roles organized into four persona categories.

### 3.1 Workshop Owner / Manager (Decision-Makers)

| Role ID      | Label              | Arabic                         | Scope    | SAR Ceiling |
|--------------|--------------------|--------------------------------|----------|-------------|
| owner        | Owner / CEO        | المالك / الرئيس التنفيذي       | all      | Unlimited   |
| superadmin   | Super Admin        | المشرف العام                   | platform | Unlimited   |
| manager      | Branch Manager     | مدير الفرع                     | branch   | 50,000      |

These users make strategic and operational decisions, configure branches and roles, and monitor cross-branch KPIs. They require executive dashboards, approval inboxes, and full financial visibility.

### 3.2 Workshop Staff (Operational)

| Role ID      | Label              | Arabic                         | Scope    | SAR Ceiling |
|--------------|--------------------|--------------------------------|----------|-------------|
| advisor      | Service Advisor    | مستشار الخدمة                  | branch   | 5,000       |
| technician   | Technician         | فني                            | own      | 0           |
| qc           | QC Inspector       | مفتش الجودة                    | branch   | 0           |

Workshop staff execute the vehicle service lifecycle. Service advisors manage job cards and customer communication. Technicians perform repairs with visibility limited to their own assignments. QC inspectors provide independent quality verification, enforcing the separation-of-duties rule that the same person cannot both perform a repair and pass its quality check.

### 3.3 Back-Office (Support Functions)

| Role ID      | Label              | Arabic                         | Scope    | SAR Ceiling |
|--------------|--------------------|--------------------------------|----------|-------------|
| accountant   | Accountant         | محاسب                          | all      | 25,000      |
| hr           | HR Manager         | مدير الموارد البشرية            | all      | 15,000      |
| procurement  | Procurement Agent  | وكيل المشتريات                 | all      | 20,000      |
| parts        | Storekeeper        | أمين المستودع                  | branch   | 10,000      |
| frontdesk    | Receptionist       | موظف الاستقبال                 | branch   | 0           |
| callcenter   | Call Center Agent  | موظف مركز الاتصال              | all      | 0           |

Back-office roles handle financial operations, human resources, procurement, inventory management, and customer intake. SOD pairs prevent conflicts such as raising and approving the same purchase order or creating a supplier and approving their payment.

### 3.4 External (Portal Users)

| Role ID      | Label              | Arabic                         | Scope    | SAR Ceiling |
|--------------|--------------------|--------------------------------|----------|-------------|
| customer     | Customer           | عميل                           | self     | 0           |
| supplier     | Supplier           | مورّد                          | external | 0           |

External users access purpose-built portals. Customers use the mobile-optimized Customer App (430px frame) for bookings, live service tracking, estimate approvals via e-signature, and invoice viewing. Suppliers access the Supplier Portal for order management and catalog publishing.

---

## 4. Product Scope

### 4.1 Domains In Scope

SALIS AUTO is organized into 13 functional domains.

**1. Workshop (Operations)** -- The core domain covering the complete vehicle service lifecycle through six stages: Check-In, Inspection, Estimate, Repair, Quality Check, and Delivery. Includes job card management, bay assignment, technician scheduling, and workflow automation with approval gates.

**2. Registry (Customers & Vehicles)** -- Customer and vehicle master data management with Saudi-specific validations: license plate formats, +966 phone numbers, national ID integration. Includes service history, fleet management, vehicle health monitoring, and loyalty tracking.

**3. Finance** -- Invoicing and payment processing with SAR halala-precision arithmetic (money stored as integer halalas). Covers invoice creation, payment recording, receipt generation, Stripe integration, and refund management. All invoices are ZATCA Phase 2 compliant.

**4. Accounting** -- Full double-entry accounting with chart of accounts, journal entries, general ledger, trial balance, balance sheet, income statement, cash flow, accounts receivable/payable, bank reconciliation, expense tracking, and budget management.

**5. CRM & Marketing** -- Customer relationship management with lead pipeline, opportunity tracking, campaign management (email, SMS, WhatsApp), customer segmentation, loyalty programs, and referral tracking. Drives repeat business and customer retention.

**6. Administration** -- Platform configuration including tenant setup, branch management, user/team administration, role and permission matrix editing, system settings, integration management, audit logging, and compliance tools including ZATCA and VAT configuration.

**7. Authentication** -- Secure access control with JWT-based authentication (15-minute access tokens, 14-day refresh tokens), MFA via TOTP/SMS, SSO integration, OTP verification, session management, account lockout, and password policies.

**8. AI Platform** -- Intelligent automation including conversational AI assistant, knowledge base for repair procedures, AI agent orchestration, smart scheduling, damage assessment via computer vision, ML-powered fraud detection, predictive maintenance, voice command interface, and workflow automation.

**9. Parts & Inventory Network** -- Parts inventory management with stock levels, reorder points, SKU tracking, and B2B parts marketplace. Includes purchase order lifecycle with approval chains, supplier catalog integration, automated reorder triggers, and inter-branch stock transfer.

**10. Call Center** -- Inbound/outbound call management with queue assignment, IVR integration, call logging with recordings, disposition tracking, wait-time monitoring, escalation workflows, and queue analytics.

**11. Reports & Analytics** -- Business intelligence and reporting across all domains. Executive dashboards, operational reports, workshop/inventory/sales reports, custom report builder, scheduled report delivery, KPI widgets, heatmaps, and profit analysis. All reports support bilingual export.

**12. Team & HR** -- Employee management including staff directory, scheduling, performance reviews, timesheet and payroll preparation, leave management, training/LMS, technician certifications, leaderboards, and wearable device integration for technician productivity.

**13. Portals** -- External-facing interfaces: Customer App (mobile-optimized, 430px frame, bottom tab bar), Supplier Portal, Procurement Portal, Technician Portal, Kiosk Check-In, and Super Admin Portal. Each portal is tailored to its audience with appropriate RBAC enforcement.

### 4.2 Explicit Exclusions (Phase 1)

- **Offline-first mobile:** Phase 1 is web-responsive only. Native iOS/Android apps and offline mode are planned for Phase 2 (v2.0.0).
- **Multi-currency:** Phase 1 supports SAR only. Multi-currency support is planned for Phase 2.
- **Custom hardware:** The platform does not provision or manage physical devices (OBD dongles, receipt printers, barcode scanners). Hardware integration APIs are provided for third-party devices.
- **OEM dealer management integrations:** Direct connections to manufacturer DMS systems are out of scope.
- **Payroll disbursement:** The platform prepares payroll data but does not execute bank transfers. Actual disbursement is handled by external banking systems.

---

## 5. Feature Requirements by Domain

### 5.1 Workshop (Operations)

**Purpose:** Manage the complete vehicle service lifecycle from customer arrival through vehicle delivery, ensuring quality control, approval compliance, and real-time visibility.

**Key Features:**
- Job card creation, assignment, and lifecycle state management
- Six-stage workflow: Check-In, Inspection, Estimate, Repair, QC, Delivery
- Service bay dashboard with real-time bay utilization
- Appointment scheduling with calendar view and AI-powered smart assignment
- Estimate creation with line items, labor, parts, and VAT calculation
- Customer estimate approval via portal e-signature (SMS OTP)
- Technician assignment and workload balancing
- Photo upload for vehicle condition documentation
- QC gate with pass/fail checklist and approval action
- Delivery checklist with customer signature capture
- Service templates for common repair types
- Live service tracking for customer visibility

**RBAC Modules:** `jobcards`, `appointments`, `estimates`
**Screens:** ~8 custom, ~12 feature-driven (~20 total)
**Cross-Reference:** [SA-REQ-F-001 Workshop Operations](./functional/workshop-operations.md)

### 5.2 Registry (Customers & Vehicles)

**Purpose:** Maintain comprehensive customer and vehicle records with Saudi-specific data formats and service history tracking.

**Key Features:**
- Customer CRUD with +966 phone validation and national ID
- Vehicle CRUD with Saudi license plate format validation
- Service history timeline per vehicle
- Fleet management with contract tracking
- Vehicle health monitoring and mileage tracking
- Customer loyalty program and LTV analysis
- VIN decoder integration
- Customer feedback and ratings collection
- Appointment reminders via SMS/WhatsApp

**RBAC Modules:** `customers`, `vehicles`
**Screens:** ~4 custom, ~18 feature-driven (~22 total)
**Cross-Reference:** [SA-REQ-F-002 Registry](./functional/registry.md)

### 5.3 Finance

**Purpose:** Handle invoicing, payments, and receipts with ZATCA Phase 2 compliance and SAR halala-precision arithmetic.

**Key Features:**
- Multi-step invoice creation with line items and tax calculation
- ZATCA Phase 2 e-invoice generation (UBL 2.1 XML, QR code, hash chain)
- Standard and simplified tax invoice support
- Credit and debit note generation
- Payment recording (bank transfer, Mada, credit card, cash)
- Stripe payment processing integration
- Receipt generation and printing
- Refund management with ZATCA-compliant credit notes
- Invoice aging and overdue tracking

**RBAC Modules:** `invoices`, `payments`
**Screens:** ~4 custom, ~2 feature-driven (~6 total)
**Cross-Reference:** [SA-REQ-F-003 Finance & Accounting](./functional/finance-accounting.md)

### 5.4 Accounting

**Purpose:** Provide full double-entry accounting with Saudi regulatory compliance, enabling financial control and audit readiness.

**Key Features:**
- Chart of accounts with tree-structured hierarchy
- Journal entry creation with debit/credit validation
- General ledger, trial balance, balance sheet, income statement
- Cash flow statement generation
- Accounts receivable and payable management
- Bank account management and reconciliation
- Budget management and cost center tracking
- Expense tracking and categorization
- Tax management (VAT 15%)
- Financial reporting with bilingual export

**RBAC Modules:** `accounting`
**Screens:** ~3 custom, ~22 feature-driven (~25 total)
**Cross-Reference:** [SA-REQ-F-003 Finance & Accounting](./functional/finance-accounting.md)

### 5.5 CRM & Marketing

**Purpose:** Drive customer acquisition, retention, and engagement through structured relationship management and multi-channel campaigns.

**Key Features:**
- Lead pipeline with scoring, stage tracking, and source attribution
- Opportunity management with probability and close-date tracking
- Campaign management (email, SMS, WhatsApp) with reach/conversion analytics
- Customer segmentation with rule-based membership
- Marketing automation and scheduled follow-ups
- Google Business Profile integration
- Social media monitoring
- CRM task management and calendar

**RBAC Modules:** `crm`
**Screens:** ~6 custom, ~6 feature-driven (~12 total)
**Cross-Reference:** [SA-REQ-F-004 CRM & Marketing](./functional/crm-marketing.md)

### 5.6 Administration

**Purpose:** Configure and manage the platform at the organization, branch, and user level with full audit trail and compliance tooling.

**Key Features:**
- Organization and branch management
- User and team administration with role assignment
- Role definition with 28-module permission matrix editor
- System settings and advanced configuration
- Integration management (ZATCA, Stripe, SMS, WhatsApp)
- Audit log with searchable activity trail
- ZATCA, VAT, and Zakat settings
- Document management and OCR
- Data import/export and backup
- Compliance management (safety, environmental, ISO)

**RBAC Modules:** `admin`, `settings`, `audit`
**Screens:** ~5 custom, ~22 feature-driven (~27 total)
**Cross-Reference:** [SA-REQ-F-008 Administration & Portals](./functional/admin-portals.md)

### 5.7 Authentication

**Purpose:** Secure platform access with modern authentication, multi-factor verification, and session management.

**Key Features:**
- Email + password authentication with role-aware redirect
- Account registration and onboarding
- Password reset via email link
- 6-digit OTP verification (SMS)
- SSO provider integration
- Two-factor authentication setup (TOTP with QR code)
- JWT token management (15-minute access, 14-day refresh)
- Session expiry and account lockout
- Logout confirmation

**RBAC Modules:** Ungated (public screens)
**Screens:** ~8 custom, 0 feature-driven (~8 total)
**Cross-Reference:** [SA-REQ-F-008 Administration & Portals](./functional/admin-portals.md)

### 5.8 AI Platform

**Purpose:** Augment workshop operations with artificial intelligence for diagnostics, scheduling, fraud detection, and automated workflows.

**Key Features:**
- Conversational AI assistant with suggested prompts
- Knowledge base for repair procedures (by make, category)
- AI agent orchestration dashboard with success rate tracking
- Smart scheduling and technician assignment
- Smart damage assessment via computer vision
- ML-powered fraud detection
- Neural network predictive maintenance
- Voice command interface
- Prompt library and workflow builder
- AI-powered chatbot for customer support

**RBAC Modules:** `ai`
**Screens:** ~3 custom, ~10 feature-driven (~13 total)
**Cross-Reference:** [SA-REQ-F-007 AI Platform](./functional/ai-platform.md)

### 5.9 Parts & Inventory Network

**Purpose:** Manage parts inventory, automate procurement, and connect workshops with suppliers through a B2B network.

**Key Features:**
- Parts inventory with SKU, stock levels, and reorder points
- B2B parts supply network marketplace
- Purchase order lifecycle (create, approve, receive, close)
- Supplier catalog management
- Automated reorder at threshold (feature flag `ff_auto_po`)
- Inter-branch stock transfer (feature flag `ff_multi_branch_transfer`)
- Parts availability checking
- Smart parts recommendation
- Procurement agent portal with quotation comparison

**RBAC Modules:** `inventory`, `network`, `procurement`
**Screens:** ~2 custom, ~16 feature-driven (~18 total)
**Cross-Reference:** [SA-REQ-F-005 Inventory & Procurement](./functional/inventory-procurement.md)

### 5.10 Call Center

**Purpose:** Manage inbound and outbound customer communications with queue management, call logging, and performance analytics.

**Key Features:**
- Active call queue with status and wait-time display
- Agent assignment and routing
- Historical call log with duration, disposition, and recordings
- IVR management
- Queue analytics and performance dashboards
- Escalation workflows

**RBAC Modules:** `callcenter`
**Screens:** ~2 custom, ~2 feature-driven (~4 total)
**Cross-Reference:** [SA-REQ-F-008 Administration & Portals](./functional/admin-portals.md)

### 5.11 Reports & Analytics

**Purpose:** Deliver actionable business intelligence through pre-built and custom reports across all operational domains.

**Key Features:**
- Executive dashboard with cross-branch KPIs
- Operational, workshop, inventory, and sales reports
- Insurance and loan reporting
- Custom report builder with drag-and-drop
- Scheduled report delivery (email)
- BI dashboard with heatmaps and trend analysis
- Profit analysis and productivity tracker
- KPI dashboard with real-time widgets
- Bilingual report export (PDF, Excel)

**RBAC Modules:** `reports`, `execreports`
**Screens:** 0 custom, ~14 feature-driven (~14 total)
**Cross-Reference:** [SA-REQ-F-003 Finance & Accounting](./functional/finance-accounting.md)

### 5.12 Team & HR

**Purpose:** Manage workshop workforce including scheduling, performance, payroll preparation, and professional development.

**Key Features:**
- Technician directory with specialty, certification, and rating
- Staff scheduling and shift management
- Performance reviews and leaderboards
- Timesheet management and time clock
- Payroll preparation (data export, not disbursement)
- Leave request management
- Training and LMS integration
- Wearable device integration for productivity tracking

**RBAC Modules:** `technicians`, `hr`
**Screens:** ~1 custom, ~13 feature-driven (~14 total)
**Cross-Reference:** [SA-REQ-F-006 HR & Team](./functional/hr-team.md)

### 5.13 Portals

**Purpose:** Provide tailored external-facing interfaces for customers, suppliers, technicians, and procurement agents.

**Key Features:**
- **Customer App:** Mobile-optimized (430px frame) with home dashboard, vehicle garage, appointment booking, live service tracking, profile management, estimate approval via e-signature
- **Technician Portal:** Job list, time clock, parts requests, repair guides, diagnostic software access
- **Supplier Portal:** Order management, catalog publishing, delivery tracking
- **Procurement Portal:** Requisitions, quotation comparison, payment tracking
- **Kiosk Check-In:** Self-service vehicle intake for front-desk deployment
- **Super Admin Portal:** Platform-wide administration and monitoring

**RBAC Modules:** `portalcustomer`, `portaltech`, `portalsupplier`, `portalprocure`, `kiosk`
**Screens:** ~5 custom, ~20 feature-driven (~25 total)
**Cross-Reference:** [SA-REQ-F-008 Administration & Portals](./functional/admin-portals.md)

---

## 6. Workshop Lifecycle

The workshop lifecycle is the core workflow of SALIS AUTO, governing every vehicle from arrival to departure.

### 6.1 Lifecycle Stages

```
Check-In --> Inspection --> Estimate --> Repair --> QC --> Delivery
```

| Stage       | Primary Role     | Key Actions                                         | Approval Gate        |
|-------------|------------------|-----------------------------------------------------|----------------------|
| Check-In    | Receptionist / Advisor | Customer lookup, vehicle info, service selection, photo upload | None (intake)    |
| Inspection  | Technician       | Multi-section checklist, findings entry, photo grid  | None (data capture)  |
| Estimate    | Service Advisor  | Line items (labor + parts), VAT calc, send to customer | Customer approval (e-signature via SMS OTP) |
| Repair      | Technician       | Execute authorized work, log time, request parts     | None (execution)     |
| QC          | QC Inspector     | Pass/fail checklist, verify repair quality            | QC approval (SOD: technician cannot self-approve) |
| Delivery    | Service Advisor  | Delivery checklist, customer signature, handover      | Customer sign-off    |

### 6.2 Role Handoffs

- **Receptionist** creates the job card and hands off to the **Service Advisor**.
- **Service Advisor** assigns the job to a **Technician** for inspection.
- **Technician** completes inspection; **Service Advisor** prepares the estimate.
- **Customer** approves the estimate via portal e-signature.
- **Technician** performs the repair; **Storekeeper** issues requested parts.
- **QC Inspector** independently verifies the work (SOD enforcement: the repairing technician cannot pass QC on their own work).
- **Service Advisor** completes the delivery checklist; **Customer** signs for handover.
- **Accountant** generates the ZATCA-compliant invoice; **Receptionist/Advisor** collects payment.

### 6.3 SOD Enforcement Points in the Lifecycle

| Point in Lifecycle        | SOD Pair                           | Risk Level |
|---------------------------|------------------------------------|------------|
| Repair completion + QC    | Perform repair / Pass quality check | High       |
| Parts request + stock     | Issue stock / Adjust stock count    | Medium     |
| Estimate invoicing        | Post journal entry / Approve journal entry | High  |

---

## 7. ZATCA Compliance

### 7.1 Phase 2 E-Invoicing Requirements

SALIS AUTO implements ZATCA Phase 2 (Integration Phase) e-invoicing as a native capability. All VAT-registered businesses are required to issue compliant electronic invoices through integration with ZATCA's Fatoora platform.

### 7.2 Invoice Types

| Type                  | Use Case                                   | ZATCA Requirement          |
|-----------------------|--------------------------------------------|----------------------------|
| Standard Tax Invoice  | B2B transactions above SAR 1,000           | Real-time clearance via API |
| Simplified Tax Invoice| B2C transactions and small amounts          | Near-real-time reporting    |
| Credit Note           | Refunds, corrections, returns              | Linked to original invoice  |
| Debit Note            | Additional charges after original invoice  | Linked to original invoice  |

### 7.3 Technical Requirements

| Requirement            | Implementation                                                  |
|------------------------|-----------------------------------------------------------------|
| XML Format             | UBL 2.1 (Universal Business Language) per ZATCA specification   |
| QR Code                | TLV-encoded with seller name, VAT number, timestamp, total, VAT amount |
| Hash Chain             | SHA-256 hash of previous invoice ensures tamper-proof sequence  |
| Digital Signature      | Cryptographic signing per ZATCA certificate                     |
| Fatoora API            | Direct REST API integration for real-time clearance/reporting   |
| UUID                   | Unique identifier per invoice for traceability                  |
| Document Retention     | 7-year retention of all invoices and supporting documents       |

### 7.4 QR Code Fields (TLV Encoded)

| Tag | Field              | Description                      |
|-----|--------------------|----------------------------------|
| 1   | Seller Name        | Workshop legal name (Arabic)     |
| 2   | VAT Registration   | 15-digit VAT number              |
| 3   | Timestamp          | Invoice date and time (ISO 8601) |
| 4   | Invoice Total      | Total amount including VAT (SAR) |
| 5   | VAT Amount         | Total VAT amount (SAR)           |

### 7.5 Certification Process

1. **Sandbox testing:** Validate invoice generation against ZATCA sandbox environment.
2. **Compliance review:** Submit sample invoices for ZATCA review and feedback.
3. **Production onboarding:** Obtain production API credentials and certificates.
4. **Go-live verification:** Confirm successful real-time clearance of production invoices.

### 7.6 Penalty Context

Non-compliance with ZATCA Phase 2 carries penalties starting at SAR 5,000 per non-compliant invoice, with escalating fines for repeat violations. Severe non-compliance can result in business license suspension. SALIS AUTO eliminates this risk through native, always-on compliance.

---

## 8. User Experience Requirements

### 8.1 Bilingual Support (EN/AR with RTL)

- Full Arabic (AR) and English (EN) language support across all 191+ screens.
- RTL layout designed from the ground up, not retrofitted. Every UI component renders correctly in both directions.
- Language toggle accessible from any screen without page reload.
- Arabic translations reviewed by native speakers for automotive domain accuracy.
- 100% i18n key coverage -- no hardcoded strings.

### 8.2 Responsive Design

- Desktop-first for internal workshop screens (AppShell with sidebar navigation).
- Mobile-optimized Customer App with 430px frame and bottom tab bar (CustomerAppShell).
- Breakpoints: 430px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide).
- Touch-friendly targets (minimum 44px) on all interactive elements.

### 8.3 Design System

- Built on TailwindCSS 3.4 with custom SALIS AUTO design tokens.
- Consistent component library: DataTable, AuthCard, WorkflowStepper, Checklist, CodeInput, badges, status indicators.
- Color system: `--salis-blue`, `--salis-navy`, `--salis-blue-bright`, `--salis-orange` with semantic variants.
- Typography scale optimized for both Latin and Arabic scripts.

### 8.4 Accessibility (WCAG 2.1 AA)

- All public-facing screens must pass WCAG 2.1 AA compliance.
- Keyboard navigation for all interactive elements.
- Screen reader compatibility with semantic HTML and ARIA labels.
- Sufficient color contrast ratios (4.5:1 for text, 3:1 for UI components).
- Focus indicators on all interactive elements.

### 8.5 Performance

- Sub-2-second page load on 4G connections.
- Lighthouse performance score >= 80.
- P95 API response time < 500ms.
- Static SPA deployment (GitHub Pages, Vercel, Netlify compatible).

---

## 9. RBAC & Authorization Model

### 9.1 Authorization Architecture

SALIS AUTO enforces triple-layer authorization:

1. **JWT tokens:** 15-minute access tokens with role and scope claims; 14-day refresh tokens with rotation.
2. **UI enforcement:** `can()` helper gates navigation, buttons, and field visibility.
3. **API middleware:** Server-side permission checks on every endpoint.
4. **Database RLS:** PostgreSQL row-level security policies enforce tenant and branch isolation.

### 9.2 Roles Table (14 Roles)

| Role ID      | Label              | Scope    | SAR Ceiling | Category       |
|--------------|--------------------|----------|-------------|----------------|
| owner        | Owner / CEO        | all      | Unlimited   | Decision-Maker |
| superadmin   | Super Admin        | platform | Unlimited   | Decision-Maker |
| manager      | Branch Manager     | branch   | 50,000      | Decision-Maker |
| accountant   | Accountant         | all      | 25,000      | Back-Office    |
| procurement  | Procurement Agent  | all      | 20,000      | Back-Office    |
| hr           | HR Manager         | all      | 15,000      | Back-Office    |
| parts        | Storekeeper        | branch   | 10,000      | Back-Office    |
| advisor      | Service Advisor    | branch   | 5,000       | Workshop Staff |
| technician   | Technician         | own      | 0           | Workshop Staff |
| qc           | QC Inspector       | branch   | 0           | Workshop Staff |
| frontdesk    | Receptionist       | branch   | 0           | Back-Office    |
| callcenter   | Call Center Agent  | all      | 0           | Back-Office    |
| customer     | Customer           | self     | 0           | External       |
| supplier     | Supplier           | external | 0           | External       |

### 9.3 RBAC Modules (28)

The permission matrix covers 28 modules: `dashboard`, `jobcards`, `appointments`, `estimates`, `customers`, `vehicles`, `inventory`, `procurement`, `invoices`, `payments`, `accounting`, `hr`, `technicians`, `crm`, `callcenter`, `reports`, `approvals`, `kiosk`, `execreports`, `portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`, `ai`, `admin`, `settings`, `audit`, `network`.

### 9.4 Permission Actions (6)

| Code | Action   | Description                                    |
|------|----------|------------------------------------------------|
| v    | view     | Read access to module data                     |
| c    | create   | Create new records                             |
| e    | edit     | Modify existing records                        |
| d    | delete   | Remove records (soft delete)                   |
| a    | approve  | Approve pending items (estimates, POs, journals)|
| x    | export   | Export data to CSV/PDF/Excel                   |

### 9.5 Separation of Duties (SOD) -- 5 High/Medium Risk Pairs

| Duty A                   | Duty B                     | Risk Level |
|--------------------------|----------------------------|------------|
| Raise purchase order     | Approve purchase order     | High       |
| Create supplier          | Approve supplier payment   | High       |
| Post journal entry       | Approve journal entry      | High       |
| Perform repair           | Pass quality check         | High       |
| Issue stock              | Adjust stock count         | Medium     |

An additional medium-risk pair exists for HR: Create employee / Approve payroll run. SOD enforcement is non-negotiable and applies regardless of role; no single user may hold both duties in a pair.

### 9.6 Field-Level Redaction (7 Rules)

| Protected Field              | Hidden From                                                              |
|------------------------------|--------------------------------------------------------------------------|
| Part cost / margin           | advisor, technician, qc, frontdesk, callcenter, customer, supplier       |
| Labour cost rate             | technician, qc, frontdesk, callcenter, customer, supplier                |
| Employee salary              | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |
| Supplier purchase price      | advisor, technician, qc, frontdesk, callcenter, customer                 |
| Customer contact details     | technician, qc, supplier                                                 |
| Bank account details         | advisor, technician, qc, parts, frontdesk, callcenter, hr, procurement, supplier, customer |
| Branch P&L                   | advisor, technician, qc, parts, frontdesk, callcenter, procurement, supplier, customer |

---

## 10. Pricing & Packaging

### 10.1 Subscription Tiers

| Feature                        | Starter              | Professional          | Enterprise            |
|--------------------------------|-----------------------|-----------------------|-----------------------|
| **Monthly Price**              | **SAR 999**           | **SAR 2,499**         | **Custom**            |
| Annual Price (15% discount)    | SAR 10,190/year       | SAR 25,490/year       | Custom                |
| Branches                       | 1                     | Up to 3               | Unlimited             |
| Users                          | Up to 10              | Up to 50              | Unlimited             |
| Storage                        | 10 GB                 | 50 GB                 | Custom                |
| Support SLA                    | Email, 24-hr response | Email + phone, 4-hr   | Dedicated AM, 1-hr    |
| Uptime SLA                     | 99.5%                 | 99.9%                 | 99.95% with credits   |

### 10.2 Module Access by Tier

| Module                         | Starter | Professional | Enterprise |
|--------------------------------|---------|--------------|------------|
| Workshop (Job Cards, Bays)     | Yes     | Yes          | Yes        |
| Registry (Vehicles, Customers) | Yes     | Yes          | Yes        |
| Finance (Invoicing, Payments)  | Yes     | Yes          | Yes        |
| ZATCA Phase 2 E-Invoicing      | Basic   | Full         | Full       |
| Accounting                     | Basic   | Full         | Full       |
| Parts & Inventory              | Basic   | Full         | Full       |
| Reports & Analytics            | Basic   | Full         | Full       |
| Administration                 | Basic   | Full         | Full       |
| Authentication                 | Yes     | Yes          | Yes        |
| Arabic RTL Support             | Yes     | Yes          | Yes        |
| CRM & Marketing                | --      | Yes          | Yes        |
| AI Platform                    | --      | Yes          | Yes        |
| Call Center                    | --      | Yes          | Yes        |
| Team & HR                      | --      | Yes          | Yes        |
| Portals (Customer App)         | --      | Yes          | Yes        |
| API Access                     | --      | Read-only    | Full       |

### 10.3 Enterprise Pricing Guidelines

| Branch Count  | Indicative Monthly Price | Per-Branch Rate      |
|---------------|--------------------------|----------------------|
| 4-5           | SAR 4,000-5,000          | SAR 1,000/branch     |
| 6-10          | SAR 6,000-8,000          | SAR 800/branch       |
| 11-20         | SAR 10,000-14,000        | SAR 700/branch       |
| 20+           | SAR 14,000+              | SAR 600/branch       |

---

## 11. Success Metrics & KPIs

### 11.1 Business Metrics

| Metric                               | Target (Year 1)      | Target (Year 3)       |
|---------------------------------------|----------------------|-----------------------|
| Annual Recurring Revenue (ARR)        | SAR 1,200,000        | SAR 8,640,000         |
| Workshops Onboarded                   | 50                   | 300                   |
| Monthly ARPU                          | SAR 2,000            | SAR 2,400             |
| Customer Churn Rate (monthly)         | < 5%                 | < 3%                  |
| Net Promoter Score (NPS)              | > 40                 | > 60                  |
| Payback Period                        | 18 months            | --                    |
| 3-Year ROI                            | --                   | 350%                  |

### 11.2 Operational Metrics (Per Workshop)

| Metric                               | Baseline (Manual)    | Target (SALIS AUTO)   |
|---------------------------------------|----------------------|-----------------------|
| Estimate Approval Time                | 48 hours             | < 4 hours             |
| Invoice Processing Time               | 15 minutes           | < 2 minutes           |
| Job Throughput per Technician (weekly) | Baseline             | +25% improvement      |
| Parts Procurement Cycle Time          | Baseline             | -40% reduction        |
| Customer No-Show Rate                 | Baseline             | -30% reduction        |
| Bay Utilization Rate                  | ~60%                 | > 80%                 |
| Mean Time to Repair (MTTR)            | Baseline             | -20% reduction        |

### 11.3 Product Metrics

| Metric                               | Target               |
|---------------------------------------|----------------------|
| Daily Active Users (DAU)              | 70% of licensed users |
| Feature Adoption (core workflow)      | > 90% within 30 days |
| Customer App Adoption                 | > 50% of end customers|
| P95 API Response Time                 | < 500ms              |
| Lighthouse Performance Score          | >= 80                |
| ZATCA Invoice Success Rate            | 100%                 |
| UAT Test Case Pass Rate               | >= 85%               |
| Test Coverage (unit)                  | >= 80%               |
| System Uptime (first 90 days)         | 99.5%                |

---

## 12. Release Roadmap

### 12.1 Pre-Launch Releases

| Version       | Stage              | Sprint | Content                                          |
|---------------|--------------------|--------|--------------------------------------------------|
| 0.1.0-alpha   | Foundation         | S3     | Auth + RBAC + i18n framework                     |
| 0.2.0-alpha   | Core: Workshop     | S6     | Workshop lifecycle (Check-In through Delivery)   |
| 0.3.0-alpha   | Core: Registry     | S7     | Customer + Vehicle CRUD + Saudi validations      |
| 0.4.0-alpha   | Core: Finance      | S10    | Invoicing + ZATCA sandbox integration            |
| 0.5.0-alpha   | Core: Accounting   | S11    | Chart of accounts + journal entries               |
| 0.6.0-alpha   | Core: Parts        | S12    | Inventory + PO lifecycle + approval chain         |
| 0.7.0-beta    | Extended           | S17    | CRM, AI, Call Center, HR, Portals                 |
| 0.8.0-beta    | Integration        | S20    | ZATCA production certification + notifications   |
| 0.9.0-beta    | Testing            | S22    | All tests passing, security hardened              |
| 1.0.0-rc.1    | Deployment         | S23    | Release candidate for UAT                         |
| **1.0.0**     | **Go-Live**        | **S23**| **Production release (Week 52)**                 |

### 12.2 Post-Launch Roadmap

| Version | Target          | Content                                              |
|---------|-----------------|------------------------------------------------------|
| 1.1.0   | Go-live + 4w    | Post-launch fixes, performance tuning, UX polish     |
| 1.2.0   | Go-live + 8w    | Customer feedback-driven improvements                 |
| 1.3.0   | Go-live + 12w   | Additional report types, dashboard enhancements       |
| 2.0.0   | Phase 2         | Native mobile app, offline mode, multi-currency       |

### 12.3 Post-Launch Cadence

| Release Type     | Frequency         | Purpose                                    |
|------------------|-------------------|--------------------------------------------|
| Patch release    | As needed         | Critical bug fixes, security patches       |
| Minor release    | Monthly           | Feature additions, improvements            |
| Major release    | Quarterly         | Significant new capabilities               |

See [Release Plan](../project-management/planning/release-plan.md) for full versioning strategy, feature flags, rollout phases, and release process.

---

## 13. Assumptions & Constraints

### 13.1 Technical Constraints

| Constraint                                       | Impact                                               |
|--------------------------------------------------|------------------------------------------------------|
| Tech stack: React 18, TypeScript 5.7, Vite 5.4, TailwindCSS 3.4, Express 4.21, Drizzle ORM 0.36, PostgreSQL | All development must use approved stack |
| SAR stored as integer halalas                    | All monetary arithmetic avoids floating point; 1 SAR = 100 halalas |
| VAT fixed at 15%                                 | Tax engine hardcoded to current Saudi VAT rate       |
| JWT: 15-minute access, 14-day refresh            | Token refresh rotation required for session continuity |
| Static SPA hosting (GitHub Pages, Vercel, Netlify)| Frontend must be fully static; no server-side rendering |
| PostgreSQL for production; PGlite for local dev  | ORM queries must be compatible with both             |

### 13.2 Regulatory Constraints

| Constraint                                       | Impact                                               |
|--------------------------------------------------|------------------------------------------------------|
| ZATCA Phase 2 e-invoicing mandate               | Invoicing module must pass certification before go-live |
| Saudi phone format (+966)                         | Validation and OTP delivery must handle Saudi numbers |
| Saudization (Nitaqat) requirements               | HR module must support workforce nationalization tracking |
| Consumer protection regulations                  | Transparent pricing and warranty tracking required    |
| Data retention: 7 years for financial records    | Archival and retention policies must be enforced      |

### 13.3 Assumptions

1. The development team has access to ZATCA sandbox credentials for integration testing.
2. All users have modern browsers (Chrome 90+, Safari 15+, Edge 90+).
3. SMS and WhatsApp delivery uses a third-party gateway (Twilio or equivalent).
4. The platform launches with a single timezone (AST, UTC+3).
5. Initial deployment supports English and Arabic only.
6. Separation-of-duties pairs are non-negotiable for regulatory compliance.
7. Internet connectivity is required for all operations (offline mode is Phase 2).

### 13.4 Data Residency

All customer data must reside within Saudi Arabia or GCC-approved data centers in compliance with Saudi data protection regulations. Cloud infrastructure providers must offer KSA-region deployments.

### 13.5 Browser Support

| Browser          | Minimum Version |
|------------------|-----------------|
| Google Chrome    | 90+             |
| Apple Safari     | 15+             |
| Microsoft Edge   | 90+             |
| Firefox          | 90+             |

---

## 14. Dependencies & Integrations

### 14.1 External Service Dependencies

| Integration          | Purpose                                    | Phase   | Priority  |
|----------------------|--------------------------------------------|---------|-----------|
| ZATCA Fatoora API    | E-invoice clearance and reporting          | Phase 1 | Critical  |
| Stripe               | Payment processing (Mada, credit card)     | Phase 1 | High      |
| SMS Gateway (Twilio)  | OTP verification, appointment reminders    | Phase 1 | High      |
| WhatsApp Business API | Customer notifications, campaign delivery  | Phase 1 | Medium    |
| Email Service (SMTP)  | Transactional emails, report delivery      | Phase 1 | High      |
| OBD Diagnostic API   | Vehicle diagnostic data integration        | Phase 2 | Low       |

### 14.2 ZATCA Integration Detail

| Component            | Specification                              |
|----------------------|--------------------------------------------|
| API Endpoint         | Fatoora Portal REST API                    |
| Authentication       | OAuth 2.0 with ZATCA-issued credentials    |
| Invoice Format       | UBL 2.1 XML                                |
| Signing              | X.509 certificate (ZATCA-issued)           |
| Environments         | Sandbox (testing) + Production             |
| SLA Requirement      | Invoice clearance within 24 hours          |

### 14.3 Payment Integration

| Component            | Specification                              |
|----------------------|--------------------------------------------|
| Provider             | Stripe (Saudi market-enabled)              |
| Payment Methods      | Mada debit, Visa/Mastercard, bank transfer |
| Currency             | SAR only (Phase 1)                         |
| PCI Compliance       | Stripe handles PCI DSS; no card data stored|
| Webhook Events       | Payment confirmation, refund, dispute       |

### 14.4 Notification Channels

| Channel              | Use Cases                                  | Provider        |
|----------------------|--------------------------------------------|-----------------|
| SMS                  | OTP, appointment reminders, status updates | Twilio          |
| WhatsApp             | Estimate approvals, service updates        | WhatsApp Business API |
| Email                | Invoices, reports, account management      | SMTP / SendGrid |
| Push (Phase 2)       | Mobile app notifications                   | FCM / APNs      |

---

## 15. References

### 15.1 Functional Requirements Documents

| Document ID  | Title                        | Path                                              |
|--------------|------------------------------|----------------------------------------------------|
| SA-REQ-F-001 | Workshop Operations          | [./functional/workshop-operations.md](./functional/workshop-operations.md) |
| SA-REQ-F-002 | Registry                     | [./functional/registry.md](./functional/registry.md) |
| SA-REQ-F-003 | Finance & Accounting         | [./functional/finance-accounting.md](./functional/finance-accounting.md) |
| SA-REQ-F-004 | CRM & Marketing              | [./functional/crm-marketing.md](./functional/crm-marketing.md) |
| SA-REQ-F-005 | Inventory & Procurement      | [./functional/inventory-procurement.md](./functional/inventory-procurement.md) |
| SA-REQ-F-006 | HR & Team                    | [./functional/hr-team.md](./functional/hr-team.md) |
| SA-REQ-F-007 | AI Platform                  | [./functional/ai-platform.md](./functional/ai-platform.md) |
| SA-REQ-F-008 | Administration & Portals     | [./functional/admin-portals.md](./functional/admin-portals.md) |

### 15.2 Project Management Documents

| Document                     | Path                                                              |
|------------------------------|-------------------------------------------------------------------|
| Business Case (PRINCE2)     | [../project-management/prince2/business-case.md](../project-management/prince2/business-case.md) |
| Project Charter (PMP)       | [../project-management/pmp/project-charter.md](../project-management/pmp/project-charter.md) |
| Scope Statement              | [../project-management/pmp/scope-statement.md](../project-management/pmp/scope-statement.md) |
| Release Plan                 | [../project-management/planning/release-plan.md](../project-management/planning/release-plan.md) |

### 15.3 Marketing & Market Intelligence

| Document                     | Path                                                              |
|------------------------------|-------------------------------------------------------------------|
| Market Analysis              | [../marketing/market-analysis.md](../marketing/market-analysis.md) |
| Competitive Analysis         | [../marketing/competitive-analysis.md](../marketing/competitive-analysis.md) |
| Pricing Guide                | [../marketing/pricing-guide.md](../marketing/pricing-guide.md) |

### 15.4 Technical References

| Document                     | Path                                                              |
|------------------------------|-------------------------------------------------------------------|
| Domain Reference             | [../domains.md](../domains.md)                                    |
| RBAC Data (Source of Truth)  | `app/src/data/generated/rbac.ts`                                  |

---

*This document is the authoritative product requirements reference for SALIS AUTO. All functional specifications, design decisions, and implementation work must align with the scope, roles, and constraints defined herein. Changes require formal change control through the SALIS AUTO PMO.*
