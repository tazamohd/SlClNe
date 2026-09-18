<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/capability.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - packages/contract/src/rbac.ts
       - project-control/MASTER_REGISTRY.json
       - server/src/registry.ts
-->

# Business capability map

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 18 capabilities

## How capabilities are defined here

A capability is a grouping of **permission modules** and **screen domains** — the two taxonomies the implementation already agrees on. Inventing a third taxonomy for the documentation would give a map that looks tidy and drifts from the product within a release.

All 430 registered screens and all 425 endpoints map to exactly one capability. That is a property this generator checks, not a claim: an unmapped screen or endpoint is a failure in `docs:check`.

## Objectives to capabilities

```mermaid
flowchart LR
  OBJ_THROUGHPUT["Increase workshop throughput"]
  OBJ_MARGIN["Protect parts and labour margin"]
  OBJ_CASH["Shorten the cash cycle"]
  OBJ_RETENTION["Retain customers"]
  OBJ_CAPACITY["Use technician capacity well"]
  OBJ_VISIBILITY["Give owners operational visibility"]
  OBJ_CONTROL["Keep financial control auditable"]
  CAP_WORKSHOP["Workshop operations<br/>19 screens · 128 endpoints"]
  OBJ_THROUGHPUT --> CAP_WORKSHOP
  CAP_CUSTOMERS["Customer management<br/>3 screens · 19 endpoints"]
  OBJ_RETENTION --> CAP_CUSTOMERS
  CAP_VEHICLES["Vehicle management<br/>4 screens · 9 endpoints"]
  OBJ_THROUGHPUT --> CAP_VEHICLES
  CAP_INVENTORY["Parts and inventory<br/>7 screens · 13 endpoints"]
  OBJ_MARGIN --> CAP_INVENTORY
  CAP_PROCUREMENT["Procurement<br/>1 screens · 28 endpoints"]
  OBJ_MARGIN --> CAP_PROCUREMENT
  CAP_BILLING["Invoicing and payments<br/>6 screens · 25 endpoints"]
  OBJ_CASH --> CAP_BILLING
  CAP_ACCOUNTING["Accounting and finance<br/>7 screens · 50 endpoints"]
  OBJ_CASH --> CAP_ACCOUNTING
  CAP_HR["HR and payroll<br/>5 screens · 52 endpoints"]
  OBJ_CAPACITY --> CAP_HR
  CAP_CRM["CRM and sales<br/>12 screens · 45 endpoints"]
  OBJ_RETENTION --> CAP_CRM
  CAP_REPORTING["Reporting and analytics<br/>11 screens · 0 endpoints"]
  OBJ_VISIBILITY --> CAP_REPORTING
  CAP_GOVERNANCE["Approvals and governance<br/>2 screens · 5 endpoints"]
  OBJ_CONTROL --> CAP_GOVERNANCE
  CAP_PORTALS["Portals and channels<br/>11 screens · 0 endpoints"]
  OBJ_RETENTION --> CAP_PORTALS
  CAP_AI["AI and automation<br/>10 screens · 8 endpoints"]
  OBJ_THROUGHPUT --> CAP_AI
  CAP_PLATFORM["Administration and platform<br/>36 screens · 19 endpoints"]
  OBJ_CONTROL --> CAP_PLATFORM
  CAP_IDENTITY["Identity and access<br/>18 screens · 24 endpoints"]
  OBJ_CONTROL --> CAP_IDENTITY
  CAP_WEBSITE["Public website and acquisition<br/>34 screens · 0 endpoints"]
  OBJ_RETENTION --> CAP_WEBSITE
  CAP_CUSTOMERAPP["Customer mobile application<br/>11 screens · 0 endpoints"]
  OBJ_RETENTION --> CAP_CUSTOMERAPP
  CAP_DESIGNSYSTEM["Design system and reference surfaces<br/>233 screens · 0 endpoints"]
  OBJ_VISIBILITY --> CAP_DESIGNSYSTEM
```

## Capabilities

| Capability | Name | Objective | Permission modules | Screens | Data-backed | Endpoints | Entities | Roles with access |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAP-WORKSHOP | Workshop operations | OBJ-THROUGHPUT | `jobcards`, `appointments`, `estimates` | 19 | 18 | 128 | 18 | 12 |
| CAP-CUSTOMERS | Customer management | OBJ-RETENTION | `customers` | 3 | 3 | 19 | 2 | 9 |
| CAP-VEHICLES | Vehicle management | OBJ-THROUGHPUT | `vehicles` | 4 | 4 | 9 | 1 | 11 |
| CAP-INVENTORY | Parts and inventory | OBJ-MARGIN | `inventory` | 7 | 1 | 13 | 1 | 9 |
| CAP-PROCUREMENT | Procurement | OBJ-MARGIN | `procurement` | 1 | 1 | 28 | 3 | 8 |
| CAP-BILLING | Invoicing and payments | OBJ-CASH | `invoices`, `payments` | 6 | 6 | 25 | 4 | 9 |
| CAP-ACCOUNTING | Accounting and finance | OBJ-CASH | `accounting` | 7 | 5 | 50 | 9 | 5 |
| CAP-HR | HR and payroll | OBJ-CAPACITY | `hr`, `technicians` | 5 | 5 | 52 | 6 | 10 |
| CAP-CRM | CRM and sales | OBJ-RETENTION | `crm`, `callcenter` | 12 | 10 | 45 | 6 | 7 |
| CAP-REPORTING | Reporting and analytics | OBJ-VISIBILITY | `reports`, `execreports` | 11 | 9 | 0 | 0 | 10 |
| CAP-GOVERNANCE | Approvals and governance | OBJ-CONTROL | `approvals`, `audit` | 2 | 1 | 5 | 1 | 9 |
| CAP-PORTALS | Portals and channels | OBJ-RETENTION | `portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`, `kiosk` | 11 | 8 | 0 | 0 | 14 |
| CAP-AI | AI and automation | OBJ-THROUGHPUT | `ai`, `aiadmin` | 10 | 4 | 8 | 2 | 6 |
| CAP-PLATFORM | Administration and platform | OBJ-CONTROL | `admin`, `settings`, `superadmin`, `dashboard`, `network`, `ungated`, `platform` | 36 | 5 | 19 | 4 | 14 |
| CAP-IDENTITY | Identity and access | OBJ-CONTROL | `auth` | 18 | 0 | 24 | 0 | 0 |
| CAP-WEBSITE | Public website and acquisition | OBJ-RETENTION | _(screen domain: website)_ | 34 | 0 | 0 | 0 | 0 |
| CAP-CUSTOMERAPP | Customer mobile application | OBJ-RETENTION | _(screen domain: customerapp)_ | 11 | 6 | 0 | 0 | 0 |
| CAP-DESIGNSYSTEM | Design system and reference surfaces | OBJ-VISIBILITY | _(screen domain: ui, featuremap)_ | 233 | 33 | 0 | 0 | 0 |

## Objectives and the benefit each is for

| Objective | Name | Benefit |
| --- | --- | --- |
| OBJ-THROUGHPUT | Increase workshop throughput | More jobs completed per bay per day |
| OBJ-MARGIN | Protect parts and labour margin | Cost visibility and controlled procurement |
| OBJ-CASH | Shorten the cash cycle | Faster invoicing, fewer unpaid balances |
| OBJ-RETENTION | Retain customers | Repeat service revenue |
| OBJ-CAPACITY | Use technician capacity well | Utilisation and scheduling |
| OBJ-VISIBILITY | Give owners operational visibility | Decisions on current numbers |
| OBJ-CONTROL | Keep financial control auditable | Approvals, segregation of duties, audit trail |

## Reading the "data-backed" column

119 of 430 screens are wired to the live API; the remainder render from the ported design fixtures. That is the single largest fact about the product's current state, and it is measured in `project-control/STATUS.json` rather than asserted here.

## Per-capability detail

### CAP-WORKSHOP — Workshop operations

**Objective:** OBJ-THROUGHPUT (Increase workshop throughput)

| Aspect | Value |
| --- | --- |
| Permission modules | `jobcards`, `appointments`, `estimates` |
| Screen domains | `workshop` |
| Screens | 19 (18 data-backed) |
| Endpoints | 128 |
| Entities | `appointments`, `cannedJobs`, `declinedJobs`, `deliverySignoffs`, `diagCopies`, `obdDevices`, `diagFindings`, `diagLabour`, `diagParts`, `obdDtcReadings`, `diagStages`, `estimates`, `inspectionFindings`, `inspectionMedia`, `jobCards`, `dtcCodes`, `kbProcedures`, `services` |
| Roles with any grant | owner, superadmin, manager, advisor, technician, qc, parts, accountant, frontdesk, callcenter, customer, test |
| Rule guards | — |

### CAP-CUSTOMERS — Customer management

**Objective:** OBJ-RETENTION (Retain customers)

| Aspect | Value |
| --- | --- |
| Permission modules | `customers` |
| Screen domains | — |
| Screens | 3 (3 data-backed) |
| Endpoints | 19 |
| Entities | `customers`, `fleets` |
| Roles with any grant | owner, superadmin, manager, advisor, technician, accountant, frontdesk, callcenter, test |
| Rule guards | — |

### CAP-VEHICLES — Vehicle management

**Objective:** OBJ-THROUGHPUT (Increase workshop throughput)

| Aspect | Value |
| --- | --- |
| Permission modules | `vehicles` |
| Screen domains | — |
| Screens | 4 (4 data-backed) |
| Endpoints | 9 |
| Entities | `vehicles` |
| Roles with any grant | owner, superadmin, manager, advisor, technician, qc, accountant, frontdesk, callcenter, customer, test |
| Rule guards | — |

### CAP-INVENTORY — Parts and inventory

**Objective:** OBJ-MARGIN (Protect parts and labour margin)

| Aspect | Value |
| --- | --- |
| Permission modules | `inventory` |
| Screen domains | `parts` |
| Screens | 7 (1 data-backed) |
| Endpoints | 13 |
| Entities | `parts` |
| Roles with any grant | owner, superadmin, manager, advisor, technician, parts, accountant, procurement, test |
| Rule guards | BR-INVENTORY-checkMovement, BR-INVENTORY-checkReceipt, BR-INVENTORY-checkReservation, BR-INVENTORY-checkReservationRelease, BR-INVENTORY-movementDelta |

### CAP-PROCUREMENT — Procurement

**Objective:** OBJ-MARGIN (Protect parts and labour margin)

| Aspect | Value |
| --- | --- |
| Permission modules | `procurement` |
| Screen domains | — |
| Screens | 1 (1 data-backed) |
| Endpoints | 28 |
| Entities | `purchaseOrders`, `requisitions`, `suppliers` |
| Roles with any grant | owner, superadmin, manager, parts, accountant, procurement, supplier, test |
| Rule guards | BR-PROCUREMENT-checkPurchaseOrderApprovable, BR-PROCUREMENT-checkReceive, BR-PROCUREMENT-purchaseOrderTotals, BR-PROCUREMENT-requisitionEstimatedTotalHalalas |

### CAP-BILLING — Invoicing and payments

**Objective:** OBJ-CASH (Shorten the cash cycle)

| Aspect | Value |
| --- | --- |
| Permission modules | `invoices`, `payments` |
| Screen domains | — |
| Screens | 6 (6 data-backed) |
| Endpoints | 25 |
| Entities | `invoiceLines`, `invoices`, `payments`, `receipts` |
| Roles with any grant | owner, superadmin, manager, advisor, accountant, frontdesk, callcenter, customer, test |
| Rule guards | — |

### CAP-ACCOUNTING — Accounting and finance

**Objective:** OBJ-CASH (Shorten the cash cycle)

| Aspect | Value |
| --- | --- |
| Permission modules | `accounting` |
| Screen domains | — |
| Screens | 7 (5 data-backed) |
| Endpoints | 50 |
| Entities | `chartOfAccounts`, `expenses`, `journalEntries`, `bankStatements`, `insuranceClaims`, `insurancePolicies`, `loanContracts`, `loanRepayments`, `savedReports` |
| Roles with any grant | owner, superadmin, manager, accountant, test |
| Rule guards | — |

### CAP-HR — HR and payroll

**Objective:** OBJ-CAPACITY (Use technician capacity well)

| Aspect | Value |
| --- | --- |
| Permission modules | `hr`, `technicians` |
| Screen domains | — |
| Screens | 5 (5 data-backed) |
| Endpoints | 52 |
| Entities | `employees`, `leaveRequests`, `payrollLines`, `payrollRuns`, `technicians`, `timesheets` |
| Roles with any grant | owner, superadmin, manager, advisor, technician, qc, accountant, hr, frontdesk, test |
| Rule guards | BR-HR-payrollLineNetHalalas, BR-HR-sumPayrollLines |

### CAP-CRM — CRM and sales

**Objective:** OBJ-RETENTION (Retain customers)

| Aspect | Value |
| --- | --- |
| Permission modules | `crm`, `callcenter` |
| Screen domains | — |
| Screens | 12 (10 data-backed) |
| Endpoints | 45 |
| Entities | `campaigns`, `leads`, `opportunities`, `segments`, `crmTasks`, `customerFeedback` |
| Roles with any grant | owner, superadmin, manager, advisor, frontdesk, callcenter, test |
| Rule guards | — |

### CAP-REPORTING — Reporting and analytics

**Objective:** OBJ-VISIBILITY (Give owners operational visibility)

| Aspect | Value |
| --- | --- |
| Permission modules | `reports`, `execreports` |
| Screen domains | — |
| Screens | 11 (9 data-backed) |
| Endpoints | 0 |
| Entities | — |
| Roles with any grant | owner, superadmin, manager, advisor, qc, parts, accountant, hr, procurement, test |
| Rule guards | — |

### CAP-GOVERNANCE — Approvals and governance

**Objective:** OBJ-CONTROL (Keep financial control auditable)

| Aspect | Value |
| --- | --- |
| Permission modules | `approvals`, `audit` |
| Screen domains | — |
| Screens | 2 (1 data-backed) |
| Endpoints | 5 |
| Entities | `approvalLines` |
| Roles with any grant | owner, superadmin, manager, advisor, parts, accountant, hr, procurement, test |
| Rule guards | BR-APPROVALS-checkApprovalCeiling, BR-APPROVALS-checkQcIndependence, BR-APPROVALS-checkSelfApproval, BR-APPROVALS-SOD_PAIRS |

### CAP-PORTALS — Portals and channels

**Objective:** OBJ-RETENTION (Retain customers)

| Aspect | Value |
| --- | --- |
| Permission modules | `portaltech`, `portalcustomer`, `portalsupplier`, `portalprocure`, `kiosk` |
| Screen domains | `portals` |
| Screens | 11 (8 data-backed) |
| Endpoints | 0 |
| Entities | — |
| Roles with any grant | owner, superadmin, manager, advisor, technician, qc, parts, accountant, frontdesk, callcenter, procurement, supplier, customer, test |
| Rule guards | — |

### CAP-AI — AI and automation

**Objective:** OBJ-THROUGHPUT (Increase workshop throughput)

| Aspect | Value |
| --- | --- |
| Permission modules | `ai`, `aiadmin` |
| Screen domains | — |
| Screens | 10 (4 data-backed) |
| Endpoints | 8 |
| Entities | `aiAgents`, `conversations` |
| Roles with any grant | owner, superadmin, manager, advisor, accountant, test |
| Rule guards | — |

### CAP-PLATFORM — Administration and platform

**Objective:** OBJ-CONTROL (Keep financial control auditable)

| Aspect | Value |
| --- | --- |
| Permission modules | `admin`, `settings`, `superadmin`, `dashboard`, `network`, `ungated`, `platform` |
| Screen domains | `admin` |
| Screens | 36 (5 data-backed) |
| Endpoints | 19 |
| Entities | `departments`, `branches`, `integrations`, `oemTools` |
| Roles with any grant | owner, superadmin, manager, advisor, technician, qc, parts, accountant, hr, frontdesk, callcenter, procurement, supplier, test |
| Rule guards | — |

### CAP-IDENTITY — Identity and access

**Objective:** OBJ-CONTROL (Keep financial control auditable)

| Aspect | Value |
| --- | --- |
| Permission modules | `auth` |
| Screen domains | `auth` |
| Screens | 18 (0 data-backed) |
| Endpoints | 24 |
| Entities | — |
| Roles with any grant | — |
| Rule guards | — |

### CAP-WEBSITE — Public website and acquisition

**Objective:** OBJ-RETENTION (Retain customers)

| Aspect | Value |
| --- | --- |
| Permission modules | — |
| Screen domains | `website` |
| Screens | 34 (0 data-backed) |
| Endpoints | 0 |
| Entities | — |
| Roles with any grant | — |
| Rule guards | — |

### CAP-CUSTOMERAPP — Customer mobile application

**Objective:** OBJ-RETENTION (Retain customers)

| Aspect | Value |
| --- | --- |
| Permission modules | — |
| Screen domains | `customerapp` |
| Screens | 11 (6 data-backed) |
| Endpoints | 0 |
| Entities | — |
| Roles with any grant | — |
| Rule guards | — |

### CAP-DESIGNSYSTEM — Design system and reference surfaces

**Objective:** OBJ-VISIBILITY (Give owners operational visibility)

| Aspect | Value |
| --- | --- |
| Permission modules | — |
| Screen domains | `ui`, `featuremap` |
| Screens | 233 (33 data-backed) |
| Endpoints | 0 |
| Entities | — |
| Roles with any grant | — |
| Rule guards | — |
