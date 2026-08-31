# Glossary

Extended glossary of 80+ terms used in SALIS AUTO, organized by category. Use this reference to understand domain-specific, technical, financial, and platform terminology.

---

## Domain Terms (Workshop & Automotive)

| Term | Definition |
|------|-----------|
| **Job Card** | A work order tracking a vehicle through the workshop. Progresses through six stages: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery. Stored in the `job_cards` table. |
| **Estimate** | A cost quotation presented to the customer for approval before repair work begins. Contains line items for parts and labor. Stored in `estimates` and `estimate_lines`. |
| **Invoice** | A billing document issued after service completion. Carries ZATCA Phase 2 compliance fields. Stored in `invoices` and `invoice_lines`. |
| **Receipt** | A payment acknowledgment document. Stored in `receipts`. |
| **Check-In** | The first workshop stage where a vehicle is received, customer and vehicle info are recorded, and the service type is selected. |
| **QC Gate** | Quality Control checkpoint. An inspection of completed repair work by a QC Inspector who must be different from the repairing technician (segregation of duties). |
| **Bay** | A designated workshop work area where vehicles are serviced. Used in appointment scheduling to prevent double-booking. |
| **Service Template** | A reusable definition of a service type (e.g., oil change, brake inspection) with standard duration, required parts, and pricing. Stored in `services`. |
| **Fleet** | A group of vehicles belonging to a corporate customer, managed under a single contract. Stored in `fleets`. |
| **Appointment** | A scheduled service visit with a date, time, bay, and technician assignment. Stored in `appointments`. |
| **Complaint** | A text description of the customer's reported vehicle issue, recorded on the job card. |
| **Stage** | One of six sequential phases a job card passes through. The `stage` field on `job_cards` tracks current position. |
| **Priority** | Job urgency level: `urgent`, `high`, `medium`, `low`. Rendered by `PriorityBadge`. |

---

## Financial Terms

| Term | Definition |
|------|-----------|
| **Halala** (pl. Halalas) | The smallest unit of Saudi currency. 1 SAR = 100 halalas. All money in SALIS AUTO is stored as integer halalas (`bigint`) to avoid floating-point rounding errors. |
| **SAR** | Saudi Riyal, the official currency of Saudi Arabia. Displayed using the `Money` component in JetBrains Mono font, always LTR. |
| **VAT** | Value Added Tax. Saudi Arabia charges 15% VAT on most goods and services. Computed as `taxHalalas = subtotalHalalas * 0.15`. |
| **ZATCA** | Zakat, Tax and Customs Authority (formerly GAZT). The Saudi government body that regulates taxation and e-invoicing. |
| **Chart of Accounts** | A structured list of all accounts used in the organization's ledger. Stored in `chart_of_accounts` with hierarchical parent/child relationships. |
| **Journal Entry** | A double-entry accounting record where debits must equal credits. Stored in `journal_entries`. |
| **Debit** | An entry on the left side of a ledger account. Increases assets and expenses; decreases liabilities and equity. |
| **Credit** | An entry on the right side of a ledger account. Increases liabilities and equity; decreases assets and expenses. |
| **Ledger** | The complete record of all financial transactions, organized by account. |
| **P&L** | Profit and Loss statement. Summarizes revenue, costs, and expenses over a period. |
| **Accounts Receivable (AR)** | Money owed to the organization by customers for services rendered. Tracked via `invoices.paidHalalas < invoices.totalHalalas`. |
| **Accounts Payable (AP)** | Money the organization owes to suppliers for goods or services received. |
| **Approval Ceiling** | The maximum SAR amount a role can approve without escalation. E.g., Branch Manager: SAR 50,000. |
| **Bank Reconciliation** | Matching bank statement lines with internal records. Stored in `bank_statements` with match tracking. |

---

## Technical Terms

| Term | Definition |
|------|-----------|
| **ULID** | Universally Unique Lexicographically Sortable Identifier. A 26-character string used as the primary key (`id`) for all records. ULIDs are time-ordered, making them suitable for both uniqueness and chronological sorting. |
| **JWT** | JSON Web Token. Used for authentication. Access tokens carry claims: `sub` (user ID), `role`, `org_id`, `branch_id`, `scope`. Signed with HMAC-SHA256 (HS256). |
| **RBAC** | Role-Based Access Control. The permission system using 14 roles, 28 modules, and 5 action codes (v/c/e/x/a). |
| **RLS** | Row-Level Security. A PostgreSQL feature that restricts which rows a database user can access. Enforced via `SET LOCAL app.org_id` per request. |
| **ORM** | Object-Relational Mapping. SALIS AUTO uses Drizzle ORM 0.36 for type-safe database access. |
| **SPA** | Single Page Application. The frontend is a React SPA that handles routing client-side via React Router. |
| **HMR** | Hot Module Replacement. Vite's development feature that updates modules in the browser without a full page reload. |
| **SSR** | Server-Side Rendering. Not currently used; the app is a client-rendered SPA. |
| **CSR** | Client-Side Rendering. The current rendering approach — React runs entirely in the browser. |
| **API** | Application Programming Interface. SALIS AUTO exposes a REST API with 21 collection endpoints. |
| **REST** | Representational State Transfer. The architectural style for the API: resource-oriented URLs, HTTP methods, JSON payloads. |
| **CORS** | Cross-Origin Resource Sharing. Configured via `CORS_ORIGIN` to allow the frontend to make API requests to a different origin. |
| **XSS** | Cross-Site Scripting. Prevented by React's default escaping and CSV export formula injection protection. |
| **CSRF** | Cross-Site Request Forgery. Mitigated by using JWT Bearer tokens (not cookies) for authentication. |
| **OWASP** | Open Web Application Security Project. The security practices and Top 10 risks that inform the platform's security design. |
| **Zod** | A TypeScript-first schema validation library used for request body validation. Shared between frontend and server via the contract package. |

---

## Automotive Terms

| Term | Definition |
|------|-----------|
| **OBD** | On-Board Diagnostics. A standardized vehicle diagnostic interface (OBD-II). SALIS AUTO connects to OBD devices for live data and DTC reading. Stored in `obd_devices`. |
| **DTC** | Diagnostic Trouble Code. A standardized code indicating a vehicle malfunction (e.g., P0300 = random misfire). Stored in `dtc_codes` and `obd_dtc_readings`. |
| **VIN** | Vehicle Identification Number. A unique 17-character code identifying a vehicle. Stored in `vehicles.vin`, unique per organization. |
| **Torque Spec** | The specified tightening force for fasteners, measured in Newton-meters (Nm). Documented in knowledge base procedures. |
| **TSB** | Technical Service Bulletin. Manufacturer notices about known issues and recommended fixes. Flagged on KB procedures via `kb_procedures.tsb`. |
| **Mileage** | Distance traveled by a vehicle, stored in kilometers (`vehicles.mileageKm`). |
| **Service History** | The chronological record of all services performed on a vehicle, derived from completed job cards. |
| **Freeze Frame** | A snapshot of vehicle sensor data captured at the moment a DTC was triggered. Tracked via `dtc_codes.freezeFrame`. |
| **OEM** | Original Equipment Manufacturer. Refers to the vehicle's maker and their specific parts and tools. |

---

## Saudi Terms

| Term | Definition |
|------|-----------|
| **CR Number** | Commercial Registration Number. A unique identifier for registered businesses in Saudi Arabia. Stored in `organizations.crNumber`. |
| **VAT Number** | Value Added Tax registration number issued by ZATCA. Format: 15 digits starting and ending with 3. Stored in `organizations.vatNumber`. |
| **Iqama** | Residence permit for foreign nationals working in Saudi Arabia. May be relevant for employee records. |
| **Kafala** | The sponsorship system governing foreign workers in Saudi Arabia. Relevant to HR and employee management. |
| **Saudization** | (Nitaqat program) Government policy requiring a percentage of Saudi nationals in the workforce. Relevant to HR compliance reporting. |
| **Zakat** | Islamic wealth tax. Managed by ZATCA alongside VAT. |
| **Hejri** | The Islamic (Hijri) calendar. Some official documents in Saudi Arabia use Hijri dates. |

---

## Platform-Specific Terms

| Term | Definition |
|------|-----------|
| **Data Scope** | The visibility level assigned to a role. One of: `platform`, `all`, `org`, `branch`, `assigned`, `own`, `external`, `self`. Determines which rows a user can access. |
| **Permission Module** | One of 28 functional areas in the RBAC system (e.g., `jobcards`, `invoices`, `inventory`). Each module has up to 5 actions. |
| **Separation of Duties** | A control requiring two different users for complementary actions. Six pairs are enforced (e.g., Raise PO / Approve PO). |
| **Repository Seam** | The interface boundary between screens and data access. `fixtureRepository` serves mock data; `httpRepository` makes real API calls. Selected by the presence of `VITE_API_BASE_URL`. |
| **Collection Engine** | The `useCollection` hook backed by TanStack Query that fetches, caches, and paginates data from the repository seam. |
| **Feature Screen** | A data-driven screen rendered by the `FeatureScreen` component using definitions that declare KPI stats, tabs, and table sections. Approximately 157 screens use this pattern. |
| **Design Bundle** | The original Claude Design `.dc.html` prototypes from `project/` that define the visual look and behavior of each screen. |
| **Tenant** | An organization in the multi-tenant system. All data is isolated by `org_id`. |
| **Soft Delete** | Records are marked as deleted by setting `deleted_at` to a timestamp rather than physically removing them. Soft-deleted records are excluded from queries but retained for audit. |
| **Optimistic Concurrency** | The `version` field on every record. When updating, the server checks that `version` matches; a stale version returns `409 conflict`. |
| **Universal Columns** | The set of columns present on every tenant-owned table: `id`, `org_id`, `branch_id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`, `version`. |
| **AppShell** | The primary layout shell for authenticated screens, containing the Sidebar and Topbar. |
| **CustomerAppShell** | The mobile-optimized shell for customer-facing screens, with a 430px frame and bottom tab bar. |
| **PendingScreen** | A placeholder component displayed for screens not yet implemented. Shows the screen's name and purpose. |
| **Field Redaction** | Hiding sensitive field values (salary, cost price, profit margin) from roles that should not see them. Implemented via `FIELD_RULES` and `ReadField.redacted`. |
| **Mock Mode** | The default data mode when `VITE_API_BASE_URL` is not set. Serves fixture data from `generated/tables.ts`. Data does not persist. |
| **Idempotency Key** | A client-provided unique key sent with write requests. If the same key is replayed, the server returns the stored response instead of creating a duplicate effect. Stored in `idempotency_keys`. |
| **Audit Log** | An append-only record of all data changes. The `audit_log` table has database triggers preventing UPDATE and DELETE. |

---

## See Also

- [Data Dictionary](./data-dictionary.md) — Database table and column definitions
- [RBAC Matrix](./rbac-matrix.md) — Role and permission reference
- [FAQ](./faq.md) — Frequently asked questions
