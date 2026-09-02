# Workshop Operations — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-WKS-001                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | Workshop                                 |
| Modules     | jobcards, appointments, estimates        |

## 1. Overview

The Workshop Operations domain manages the entire vehicle repair lifecycle in SALIS AUTO, from customer check-in through quality control to final delivery. It encompasses job card management, multi-stage inspections, estimate creation with approval flows, quality control gates, delivery handover, appointment scheduling, and service templates.

## 2. Job Cards

### 2.1 Job Card Data Model

Job cards are stored in the `job_cards` table with the following key fields:

| Field              | Type           | Description                                         |
|--------------------|----------------|-----------------------------------------------------|
| id                 | varchar(26)    | ULID primary key                                    |
| org_id             | varchar(26)    | Tenant isolation (FK to organizations)              |
| code               | varchar(32)    | Human-readable code (e.g., `A3F8B2C1`), unique per org |
| customer_id        | varchar(26)    | FK to customers                                     |
| customer_name      | varchar(200)   | Denormalized for display                            |
| vehicle_id         | varchar(26)    | FK to vehicles                                      |
| vehicle_label      | varchar(160)   | Denormalized make/model display                     |
| service            | varchar(32)    | Service type identifier                             |
| status             | varchar(24)    | Board status: pending, in_progress, completed, delivered |
| stage              | varchar(24)    | Lifecycle stage (see state machine below)           |
| priority           | varchar(16)    | low, medium, high, urgent                           |
| assigned_tech_id   | varchar(26)    | FK to technicians; drives `own`/`assigned` scope    |
| complaint          | text           | Customer complaint description                      |
| qc_passed_by       | varchar(26)    | User ID of the QC inspector who passed              |
| version            | integer        | Optimistic concurrency control                      |

### 2.2 CRUD Operations

- **Create**: Roles with `jobcards:c` — Owner, Manager, Advisor, Receptionist
- **Read/View**: Roles with `jobcards:v` — additionally Technician (own), QC, Storekeeper, Accountant, Call Center, Super Admin
- **Edit**: Roles with `jobcards:e` — Owner, Manager, Advisor, Technician (own jobs)
- **Delete**: Roles with `jobcards:d` — Owner, Manager only (soft delete via `deleted_at`)
- **Approve**: Roles with `jobcards:a` — Owner, Manager, Advisor, QC
- **Export**: Roles with `jobcards:x` — Owner, Manager, Accountant, Super Admin

### 2.3 Indexes

- `job_cards_org_code_idx` — unique on `(org_id, code)` for fast code lookups
- `job_cards_org_idx` — on `(org_id, branch_id, status)` for board queries
- `job_cards_tech_idx` — on `(org_id, assigned_tech_id)` for technician workload

## 3. Workshop State Machine

### 3.1 Stage Transitions

```
checkin → inspection → estimate → repair → qc → delivery → invoiced → closed
```

Each transition is enforced server-side via `POST /jobs/:id/transition` with the body `{ to: JobStage, reason?: string }`. The `checkStageTransition()` function in `@salis/contract/rules` validates that only adjacent transitions are permitted.

### 3.2 Stage-to-Status Mapping

| Stage      | Board Status  | Description                            |
|------------|---------------|----------------------------------------|
| checkin    | pending       | Vehicle received, initial data entry   |
| inspection | in_progress   | Multi-point inspection underway        |
| estimate   | in_progress   | Cost estimate being prepared           |
| repair     | in_progress   | Active repair work                     |
| qc         | in_progress   | Quality control inspection             |
| delivery   | completed     | Ready for customer handover            |
| invoiced   | completed     | Invoice generated                      |
| closed     | delivered     | Customer has taken delivery            |

### 3.3 Transition Rules

- Transitions are validated by `checkStageTransition()` — only forward-adjacent moves allowed
- The QC-to-delivery transition requires `jobcards:a` permission (approval, not edit)
- Every transition is audited with `action: 'transition'`, recording `before` and `after` stage/status
- Optimistic concurrency: the update uses `WHERE version = :current_version`; a conflict returns HTTP 409

### 3.4 Technician Assignment

`POST /jobs/:id/assign` with body `{ techId: string }`:

- Requires `jobcards:e` permission
- The technician must exist within the caller's tenant (RLS enforced)
- Assignment is audited with `action: 'assign'`
- The `assigned_tech_id` column drives data scope: technicians see only their own jobs

## 4. Check-In Process

### 4.1 Steps

1. **Customer Lookup** — Search by phone number (`customers_org_phone_idx` unique index) or create new customer inline
2. **Vehicle Information** — Plate number lookup (`vehicles_org_plate_idx`), VIN validation (17-char, unique per org via `vehicles_org_vin_idx`), mileage entry in km
3. **Service Selection** — Choose from the `services` table (icon + label pairs); determines initial routing
4. **Complaint Entry** — Free-text customer complaint stored on the job card
5. **Photo Upload** — Digital walkaround photos attached via media gallery component

### 4.2 Permitted Roles

Check-in creates a job card, so it requires `jobcards:c`: Owner, Manager, Advisor, Receptionist.

## 5. Inspection

### 5.1 Multi-Section Checklist

The inspection stage uses the `Checklist` UI component with multiple sections:

- Each section contains items with **pass/fail/not-applicable** states
- Items support free-text findings entry
- Photo grid for documenting conditions found (via `MediaGallery` component)

### 5.2 Findings Entry

Diagnostic findings are stored in the `diag_findings` table:

| Field      | Type          | Description                                |
|------------|---------------|--------------------------------------------|
| dtc        | varchar(16)   | Diagnostic trouble code (if applicable)    |
| finding    | varchar(300)  | Finding description (EN)                   |
| finding_ar | varchar(300)  | Finding description (AR)                   |
| system     | varchar(64)   | Vehicle system (e.g., Engine, Brakes)      |
| severity   | varchar(16)   | Severity level                             |
| evidence   | varchar(32)   | Evidence reference (photo/document)        |

## 6. Estimates

### 6.1 Estimate Data Model

Estimates use a header/line pattern across two tables:

**Header** (`estimates`): code, customer/vehicle refs, subtotal/tax/discount/total (all in halalas as bigint), status, validity period, submittedBy/approvedBy for segregation of duties.

**Lines** (`estimate_lines`): description (EN/AR), kind (part/labour), qty, unit price in halalas, optional part SKU, sort order.

### 6.2 Amount Calculation

All monetary amounts are stored as integer halalas (1 SAR = 100 halalas):

```
line_total = qty * unit_price_halalas
subtotal = SUM(line_totals)
tax = subtotal * 0.15  (VAT 15%)
total = subtotal + tax - discount
```

### 6.3 Approval Flow

Estimates follow the amount-based approval routing:

| Role        | Approval Ceiling (SAR) | Ceiling (Halalas) |
|-------------|------------------------|---------------------|
| Owner       | Unlimited              | null                |
| Super Admin | Unlimited              | null                |
| Manager     | 50,000                 | 5,000,000           |
| Advisor     | 5,000                  | 500,000             |

- **Segregation of duties**: `submitted_by != approved_by` is enforced by `requireDifferentApprover()`
- Above-ceiling amounts require escalation; the error message distinguishes "no authority" from "above ceiling"
- Approval requires both `estimates:a` grant AND amount within ceiling

### 6.4 Estimate Statuses

draft → submitted → approved → rejected

## 7. Quality Control Gate

### 7.1 QC Independence

The QC gate enforces two levels of independence:

1. **Record check**: The actor's user ID must differ from the assigned technician's user ID (resolved via `technicians.user_id`, not raw `technicians.id`)
2. **Audit trail check**: `requireSodClear()` queries the audit log to verify the actor did not perform the repair stage transition — the SOD pair "Perform repair / Pass quality check" is enforced

### 7.2 Permission Model

- The QC-to-delivery transition requires `jobcards:a` (approve), not `jobcards:e` (edit)
- The QC Inspector role holds `va` on jobcards — view and approve, no create/edit/delete
- QC approval ceiling is SAR 0 (may decide, may not approve monetary amounts)

### 7.3 QC Checklist

The `WorkshopQC` screen presents a checklist with:

- Section-based inspection items
- Technician notes review
- Pass/fail decision with mandatory reason on failure
- The `qc_passed_by` field records who passed QC

## 8. Delivery

### 8.1 Delivery Process

The `WorkshopDelivery` and `WorkshopSignature` screens handle:

1. **Delivery Checklist** — Final items verification before handover
2. **Customer Signature** — Digital signature capture for handover acknowledgment
3. **Vehicle Handover** — Updates vehicle's `last_service_at` timestamp

### 8.2 Stage Transition

Delivery is the `delivery` stage. Moving to `invoiced` triggers invoice generation. Moving to `closed` marks the job as `delivered` status.

## 9. Appointments

### 9.1 Appointment Data Model

| Field           | Type         | Description                                   |
|-----------------|--------------|-----------------------------------------------|
| scheduled_date  | date         | Appointment date                              |
| time_label      | varchar(16)  | Display time (e.g., "9:00 AM")                |
| start_minute    | integer      | Minutes past midnight (for overlap checks)    |
| duration_mins   | integer      | Duration in minutes                           |
| bay             | varchar(32)  | Service bay identifier                        |
| technician_id   | varchar(26)  | Assigned technician                           |
| status          | varchar(16)  | awaiting, confirmed, in_progress, completed, cancelled |

### 9.2 Bay Allocation

- Index `appointments_bay_idx` on `(org_id, scheduled_date, bay)` enables fast overlap detection
- Bay-overlap check uses `start_minute` and `duration_mins` to prevent double-booking

### 9.3 Technician Assignment

Appointments reference technicians by ID; the `technician_name` is denormalized for display.

### 9.4 Permissions

Roles with `appointments` module access: Owner (full), Manager (full), Advisor (vced), Receptionist (vced), Call Center (vced).

## 10. Service Templates

The `services` table stores reusable service definitions:

| Field | Type         | Description               |
|-------|--------------|---------------------------|
| icon  | varchar(64)  | Icon identifier           |
| label | varchar(120) | Service name              |

Templates are referenced during check-in for service selection and presented as a two-element tuple `[icon, label]` by the API.

## 11. Cross-References

- [Finance & Accounting](./finance-accounting.md) — Invoice generation from completed jobs
- [Inventory & Procurement](./inventory-procurement.md) — Parts consumption during repair
- [Registry](./registry.md) — Customer and vehicle data referenced by job cards
- [HR & Team](./hr-team.md) — Technician management and scheduling
- [Security Requirements](../non-functional/security.md) — RBAC enforcement and SoD rules
- [Reliability](../non-functional/reliability.md) — Optimistic concurrency on job card transitions
