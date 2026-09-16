<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/requirements.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/registry.ts + server/src/routes/*.ts (functional behaviour)
       - packages/contract/src/rules/*.ts (business rules)
       - packages/contract/src/rbac.ts (security requirements)
       - server/src/db/schema.ts (data requirements)
       - server/drizzle/*.sql (isolation requirements)
       - project-control/MASTER_REGISTRY.json (interface requirements)
-->

# Requirements catalogue

**Status:** GENERATED · **Sources as of:** 2026-09-16 · 151 requirements

## What these requirements are, and what they are not

This is a catalogue of **requirements as built**. Every entry is derived from something the implementation actually does — an endpoint, a rule guard, a database constraint, a permission grant — and carries `IMPLEMENTATION_DERIVED` saying so.

It answers: *what does this system guarantee, and what proves it.* That is the question an auditor, a new engineer and a release gate ask.

It does **not** answer: *what did the business ask for, and did we build it.* The evidence for the first half of that question — elicited, numbered, stakeholder-signed requirements — is not in this workspace. The eight documents under `docs/requirements/functional/` are domain narratives with a document ID each, not itemised requirements. Closing that gap needs a business analyst and a stakeholder, not a generator, and the gap report records it as an open item rather than filling it in.

## Identifier scheme

| Prefix | Kind | Derived from |
| --- | --- | --- |
| `FR-<CAPABILITY>-nnn` | Functional — capability level | The capability registry |
| `FR-RULE-<domain>-<fn>` | Functional — rule level | A guard or calculation in `packages/contract/src/rules` |
| `NFR-<area>-nnn` | Non-functional | A gate, ratchet or contract test that measures it |
| `DR-<TABLE>` | Data | A table in the schema |
| `SR-RBAC-<module>` / `SR-SOD-nnn` | Security | The permission matrix and the SOD pairs |

## Functional requirements

| ID | Statement | Capability | Endpoints | Screens | Evidence |
| --- | --- | --- | --- | --- | --- |
| FR-WORKSHOP-001 | The system provides workshop operations through 16 screens and 76 API endpoints, gated by the `jobcards`, `appointments`, `estimates` permission modules. | CAP-WORKSHOP | 76 | 16 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-CUSTOMERS-001 | The system provides customer management through 3 screens and 19 API endpoints, gated by the `customers` permission module. | CAP-CUSTOMERS | 19 | 3 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-VEHICLES-001 | The system provides vehicle management through 4 screens and 9 API endpoints, gated by the `vehicles` permission module. | CAP-VEHICLES | 9 | 4 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-INVENTORY-001 | The system provides parts and inventory through 7 screens and 13 API endpoints, gated by the `inventory` permission module. | CAP-INVENTORY | 13 | 7 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-PROCUREMENT-001 | The system provides procurement through 1 screens and 28 API endpoints, gated by the `procurement` permission module. | CAP-PROCUREMENT | 28 | 1 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-BILLING-001 | The system provides invoicing and payments through 6 screens and 24 API endpoints, gated by the `invoices`, `payments` permission modules. | CAP-BILLING | 24 | 6 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-ACCOUNTING-001 | The system provides accounting and finance through 7 screens and 50 API endpoints, gated by the `accounting` permission module. | CAP-ACCOUNTING | 50 | 7 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-HR-001 | The system provides hr and payroll through 5 screens and 52 API endpoints, gated by the `hr`, `technicians` permission modules. | CAP-HR | 52 | 5 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-CRM-001 | The system provides crm and sales through 12 screens and 45 API endpoints, gated by the `crm`, `callcenter` permission modules. | CAP-CRM | 45 | 12 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-REPORTING-001 | The system provides reporting and analytics through 11 screens and 0 API endpoints, gated by the `reports`, `execreports` permission modules. | CAP-REPORTING | — | 11 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-GOVERNANCE-001 | The system provides approvals and governance through 2 screens and 5 API endpoints, gated by the `approvals`, `audit` permission modules. | CAP-GOVERNANCE | 5 | 2 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-PORTALS-001 | The system provides portals and channels through 11 screens and 0 API endpoints, gated by the `portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`, `kiosk` permission modules. | CAP-PORTALS | — | 11 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-AI-001 | The system provides ai and automation through 10 screens and 8 API endpoints, gated by the `ai` permission module. | CAP-AI | 8 | 10 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-PLATFORM-001 | The system provides administration and platform through 36 screens and 19 API endpoints, gated by the `admin`, `settings`, `dashboard`, `network`, `ungated`, `platform` permission modules. | CAP-PLATFORM | 19 | 36 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-IDENTITY-001 | The system provides identity and access through 18 screens and 24 API endpoints, gated by the `auth` permission module. | CAP-IDENTITY | 24 | 18 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-WEBSITE-001 | The system provides public website and acquisition through 32 screens and 0 API endpoints, gated by the domain permission modules. | CAP-WEBSITE | — | 32 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-CUSTOMERAPP-001 | The system provides customer mobile application through 11 screens and 0 API endpoints, gated by the domain permission modules. | CAP-CUSTOMERAPP | — | 11 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-DESIGNSYSTEM-001 | The system provides design system and reference surfaces through 233 screens and 0 API endpoints, gated by the domain permission modules. | CAP-DESIGNSYSTEM | — | 233 | `project-control/CAPABILITY_REGISTRY.json` |
| FR-RULE-APPROVALS-checkApprovalCeiling | A value above the role's ceiling must escalate rather than be approved. | — | — | — | `packages/contract/src/rules/approvals.ts` |
| FR-RULE-APPROVALS-checkQcIndependence | A technician cannot pass QC on a repair they performed. | — | — | — | `packages/contract/src/rules/approvals.ts` |
| FR-RULE-APPROVALS-checkSelfApproval | The approver must not be the submitter — the first and most-broken SOD pair, and the one that lets a single person move money on their own say-so. | — | — | — | `packages/contract/src/rules/approvals.ts` |
| FR-RULE-INVENTORY-checkMovement | No negative stock unless the part is explicitly backorderable, and never a consumption larger than what is unreserved — unless it consumes a reservation, in which case the reservation is the bound. | — | — | — | `packages/contract/src/rules/inventory.ts` |
| FR-RULE-INVENTORY-checkReceipt | Receiving quantity ≤ ordered quantity; over-receipt needs approval. | — | — | — | `packages/contract/src/rules/inventory.ts` |
| FR-RULE-INVENTORY-checkReservation | `Reserved ≤ Available`. | — | — | — | `packages/contract/src/rules/inventory.ts` |
| FR-RULE-INVENTORY-checkReservationRelease | A release cannot give back more than is held. | — | — | — | `packages/contract/src/rules/inventory.ts` |
| FR-RULE-MONEY-checkJournalBalanced | Double-entry: debits must equal credits. | — | — | — | `packages/contract/src/rules/money.ts` |
| FR-RULE-MONEY-checkPayment | `Payment.amount ≤ invoice.balance`, and a cancelled invoice takes none. | — | — | — | `packages/contract/src/rules/money.ts` |
| FR-RULE-MONEY-checkRefund | `Refund ≤ amount collected`. | — | — | — | `packages/contract/src/rules/money.ts` |
| FR-RULE-MONEY-computeInvoiceTotals | `total = subtotal + tax − discount`, with tax computed on the discounted net. Rounding happens at the subtotal and at the tax, not on every line, so a 500-line invoice does not drift by 500 halalas. | — | — | — | `packages/contract/src/rules/money.ts` |
| FR-RULE-PROCUREMENT-checkPurchaseOrderApprovable | A purchase order may only be approved while it is a draft. | — | — | — | `packages/contract/src/rules/procurement.ts` |
| FR-RULE-PROCUREMENT-checkReceive | Receiving quantity ≤ ordered quantity (§5b). An over-receipt is never returned as `ok`: the caller must refuse it or route it to approval. | — | — | — | `packages/contract/src/rules/procurement.ts` |
| FR-RULE-WORKSHOP-checkBayFree | `checkBayFree` is enforced for workshop. | — | — | — | `packages/contract/src/rules/workshop.ts` |
| FR-RULE-WORKSHOP-checkEstimateFresh | An expired estimate cannot be approved. | — | — | — | `packages/contract/src/rules/workshop.ts` |
| FR-RULE-WORKSHOP-checkInvoiceable | A completed job card is required before invoicing. | — | — | — | `packages/contract/src/rules/workshop.ts` |
| FR-RULE-WORKSHOP-checkStageTransition | A stage gate cannot be skipped. | — | — | — | `packages/contract/src/rules/workshop.ts` |

## Non-functional requirements

Each one names what measures it. An NFR with nothing measuring it would be an aspiration, and is marked `UNMEASURED` rather than listed as verified.

| ID | Statement | Measured by | Evidence class |
| --- | --- | --- | --- |
| NFR-SEC-001 | Every authenticated endpoint re-checks the permission grant server-side; the frontend matrix hides and disables only. | server/tests/authz-matrix.test.ts, server/tests/rbac-parity.test.ts | CONTRACT_TEST |
| NFR-SEC-002 | A tenant can read no row belonging to another tenant, and a connection with no request context set reads nothing. | server/tests/isolation.test.ts + Postgres RLS with FORCE | CONTRACT_TEST |
| NFR-SEC-003 | The audit log is append-only for every role including the table owner. | server/drizzle/0011_audit_log_statement_immutability.sql | DATABASE_CONSTRAINT |
| NFR-SEC-004 | Segregation of duties is enforced, not advisory: the submitter of a document cannot approve it, and a technician cannot pass QC on their own repair. | server/tests/authz-sod.test.ts | CONTRACT_TEST |
| NFR-FIN-001 | Money is an integer count of halalas end to end; no floating-point or numeric money value reaches a ledger. | schema convention (*_halalas bigint) + server/tests/estimate-money.test.ts | SCHEMA_AND_TEST |
| NFR-FIN-002 | Totals are computed server-side; a client-supplied total is never trusted. | packages/contract/src/rules/money.ts called from the handlers | CODE |
| NFR-REL-001 | A replayed Idempotency-Key returns the stored response and creates no second business effect; the same key with a different body is refused. | server/src/http/idempotency.ts + idempotency_keys unique index | CODE_AND_SCHEMA |
| NFR-REL-002 | Concurrent updates are resolved optimistically on a database-maintained version column; a stale write is refused, not silently applied. | bump_version trigger on every tenant table | DATABASE_CONSTRAINT |
| NFR-A11Y-001 | Colour-contrast violations do not increase. The axe sweep is ratcheted per route and per viewport. | project-control/BASELINE.json axeColourContrastNodes + app/e2e/a11y.spec.ts | RATCHETED_BASELINE |
| NFR-I18N-001 | Arabic and RTL are verified per screen, and RTL hazards are held at zero. | project-control/STATUS.json — arabicVerified 82 of 425, rtlHazards 0 | MEASURED_REGISTRY |
| NFR-UX-001 | Every registered capability renders and has an end-to-end assertion on its content, not merely on its route. | project-control/STATUS.json — contentAsserted 425 of 425 | MEASURED_REGISTRY |
| NFR-PERF-001 | Bundle size and golden-path timings stay within the recorded ratchet. | app/scripts/check-bundle.mjs, app/scripts/golden-paths.mjs | RATCHETED_BASELINE |
| NFR-OPS-001 | The service exposes liveness and readiness probes that are reachable without a token. | GET /health, GET /ready (server/src/routes/health.ts) | CODE |

## Data requirements

| ID | Statement |
| --- | --- |
| DR-ORGANIZATIONS | `organizations` holds 12 columns, is not tenant-scoped and is protected by row-level security. |
| DR-BRANCHES | `branches` holds 13 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-USERS | `users` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-USER-SESSIONS | `user_sessions` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-FLEETS | `fleets` holds 21 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-CUSTOMERS | `customers` holds 19 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-VEHICLES | `vehicles` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-SERVICES | `services` holds 11 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-JOB-CARDS | `job_cards` holds 21 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-APPOINTMENTS | `appointments` holds 23 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-ESTIMATES | `estimates` holds 25 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-ESTIMATE-LINES | `estimate_lines` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-INVOICES | `invoices` holds 28 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-INVOICE-LINES | `invoice_lines` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PAYMENTS | `payments` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-RECEIPTS | `receipts` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PARTS | `parts` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-INVENTORY-MOVEMENTS | `inventory_movements` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-SUPPLIERS | `suppliers` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-REQUISITIONS | `requisitions` holds 20 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-REQUISITION-LINES | `requisition_lines` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PURCHASE-ORDERS | `purchase_orders` holds 23 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PURCHASE-ORDER-LINES | `purchase_order_lines` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-TECHNICIANS | `technicians` holds 14 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DEPARTMENTS | `departments` holds 15 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-LEADS | `leads` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-OPPORTUNITIES | `opportunities` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-CAMPAIGNS | `campaigns` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-SEGMENTS | `segments` holds 13 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-CRM-TASKS | `crm_tasks` holds 15 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PUBLIC-LEADS | `public_leads` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-CUSTOMER-FEEDBACK | `customer_feedback` holds 14 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-CHART-OF-ACCOUNTS | `chart_of_accounts` holds 15 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-JOURNAL-ENTRIES | `journal_entries` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-JOURNAL-LINES | `journal_lines` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-EXPENSES | `expenses` holds 15 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-BANK-STATEMENTS | `bank_statements` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-SAVED-REPORTS | `saved_reports` holds 13 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-INSURANCE-POLICIES | `insurance_policies` holds 21 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-INSURANCE-CLAIMS | `insurance_claims` holds 24 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-LOAN-CONTRACTS | `loan_contracts` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-LOAN-REPAYMENTS | `loan_repayments` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-EMPLOYEES | `employees` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PAYROLL-RUNS | `payroll_runs` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-PAYROLL-LINES | `payroll_lines` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-TIMESHEETS | `timesheets` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-LEAVE-REQUESTS | `leave_requests` holds 19 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-OBD-DEVICES | `obd_devices` holds 20 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-OBD-DTC-READINGS | `obd_dtc_readings` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DTC-CODES | `dtc_codes` holds 15 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-OEM-TOOLS | `oem_tools` holds 17 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-INTEGRATIONS | `integrations` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-KB-PROCEDURES | `kb_procedures` holds 21 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-APPROVAL-LINES | `approval_lines` holds 18 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DIAG-STAGES | `diag_stages` holds 20 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DIAG-FINDINGS | `diag_findings` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DIAG-PARTS | `diag_parts` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DIAG-LABOUR | `diag_labour` holds 13 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-DIAG-COPIES | `diag_copies` holds 14 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-AI-AGENTS | `ai_agents` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-CONVERSATIONS | `conversations` holds 14 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-GARAGE-APPLICATIONS | `garage_applications` holds 15 columns, is not tenant-scoped and has **no row-level-security policy**. |
| DR-SUPPLIER-APPLICATIONS | `supplier_applications` holds 13 columns, is not tenant-scoped and has **no row-level-security policy**. |
| DR-SUBSCRIPTION-REQUESTS | `subscription_requests` holds 12 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-SUPPORT-TICKETS | `support_tickets` holds 15 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-SYSTEM-HEALTH | `system_health` holds 8 columns, is not tenant-scoped and has **no row-level-security policy**. |
| DR-OTP-CHALLENGES | `otp_challenges` holds 8 columns, is not tenant-scoped and has **no row-level-security policy**. |
| DR-AUDIT-LOG | `audit_log` holds 16 columns, is tenant-scoped on `org_id` and is protected by row-level security. |
| DR-IDEMPOTENCY-KEYS | `idempotency_keys` holds 8 columns, is tenant-scoped on `org_id` and is protected by row-level security. |

## Security requirements

| ID | Statement |
| --- | --- |
| SR-RBAC-DASHBOARD | Access to `dashboard` is granted to 13 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-JOBCARDS | Access to `jobcards` is granted to 12 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-APPOINTMENTS | Access to `appointments` is granted to 9 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-ESTIMATES | Access to `estimates` is granted to 11 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-CUSTOMERS | Access to `customers` is granted to 9 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-VEHICLES | Access to `vehicles` is granted to 11 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-INVENTORY | Access to `inventory` is granted to 9 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-PROCUREMENT | Access to `procurement` is granted to 8 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-INVOICES | Access to `invoices` is granted to 9 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-PAYMENTS | Access to `payments` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-ACCOUNTING | Access to `accounting` is granted to 5 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-HR | Access to `hr` is granted to 6 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-TECHNICIANS | Access to `technicians` is granted to 9 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-CRM | Access to `crm` is granted to 6 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-CALLCENTER | Access to `callcenter` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-REPORTS | Access to `reports` is granted to 10 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-APPROVALS | Access to `approvals` is granted to 9 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-KIOSK | Access to `kiosk` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-EXECREPORTS | Access to `execreports` is granted to 5 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-PORTALTECH | Access to `portaltech` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-PORTALCUSTOMER | Access to `portalcustomer` is granted to 8 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-PORTALSUPPLIER | Access to `portalsupplier` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-PORTALPROCURE | Access to `portalprocure` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-AI | Access to `ai` is granted to 6 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-ADMIN | Access to `admin` is granted to 4 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-SETTINGS | Access to `settings` is granted to 4 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-AUDIT | Access to `audit` is granted to 5 of 15 roles, with the grants in the RBAC matrix. |
| SR-RBAC-NETWORK | Access to `network` is granted to 7 of 15 roles, with the grants in the RBAC matrix. |
| SR-SOD-001 | "Raise purchase order" and "Approve purchase order" must not be performed by the same person (risk: high). |
| SR-SOD-002 | "Create supplier" and "Approve supplier payment" must not be performed by the same person (risk: high). |
| SR-SOD-003 | "Post journal entry" and "Approve journal entry" must not be performed by the same person (risk: high). |
| SR-SOD-004 | "Perform repair" and "Pass quality check" must not be performed by the same person (risk: high). |
| SR-SOD-005 | "Issue stock" and "Adjust stock count" must not be performed by the same person (risk: medium). |
| SR-SOD-006 | "Create employee" and "Approve payroll run" must not be performed by the same person (risk: medium). |
