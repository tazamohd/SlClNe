# How To: Customize Workflows

Guide for configuring job card workflows, approval thresholds, notification rules, service templates, and inspection checklists in SALIS AUTO.

---

## Job Card Workflow Stages

Every job card progresses through six sequential stages. The stages cannot be skipped, and each has specific gate conditions.

### Stage Sequence

```
Check-In --> Inspection --> Estimate --> Repair --> Quality Check --> Delivery
```

### Stage Definitions

| Stage | Key | Who Acts | Gate Condition |
|-------|-----|----------|----------------|
| Check-In | `checkin` | Receptionist, Service Advisor | Customer and vehicle info captured; service selected |
| Inspection | `inspection` | Technician, Service Advisor | All checklist items completed; findings recorded |
| Estimate | `estimate` | Service Advisor, Manager | Estimate created and approved (by someone other than the submitter) |
| Repair | `repair` | Technician | All repair tasks completed; parts consumed |
| Quality Check | `qc` | QC Inspector | All QC checklist items passed. Inspector must differ from the technician (segregation of duties) |
| Delivery | `delivery` | Service Advisor, Receptionist | QC passed; invoice generated; customer signature collected |

### Valid Stage Transitions

The `stage` field on `job_cards` can only move forward:

| From | To | Condition |
|------|----|-----------|
| `checkin` | `inspection` | Check-in form submitted |
| `inspection` | `estimate` | All inspection items completed |
| `estimate` | `repair` | Estimate approved |
| `repair` | `qc` | Repair marked as complete |
| `qc` | `delivery` | QC passed by an inspector who is not the repairing technician |

Backward transitions (e.g., `repair` back to `estimate`) are not permitted in the standard flow. If rework is needed, it should be handled within the current stage.

### WorkflowStepper Component

The `WorkflowStepper` component renders the stage progress visually:

- **Done stages**: Blue circle with a check mark
- **Current stage**: Gradient circle with shadow and `aria-current="step"`
- **Future stages**: Outlined circle with step number

---

## Approval Threshold Configuration

Approvals are governed by two mechanisms: role-based ceilings and the `canApprove()` function.

### Per-Role Approval Limits

| Role | Approval Ceiling (SAR) |
|------|----------------------|
| Owner / CEO | Unlimited |
| Super Admin | Unlimited |
| Branch Manager | 50,000 |
| Accountant | 25,000 |
| Procurement Agent | 20,000 |
| HR Manager | 15,000 |
| Storekeeper | 10,000 |
| Service Advisor | 5,000 |
| Technician | 0 |
| QC Inspector | 0 |
| Receptionist | 0 |
| Call Center Agent | 0 |
| Supplier | 0 |
| Customer | 0 |

### How Approval Works

1. When an item is submitted for approval (estimate, purchase order, expense), the system checks the approver's ceiling.
2. The `canApprove()` function compares the item's total amount (converted from halalas to SAR) against the ceiling.
3. If the amount exceeds the ceiling, the approval is blocked and must escalate to a user with a higher ceiling.
4. The estimate detail screen displays the ceiling in advance so the user knows before attempting to approve.
5. All money is stored as integer halalas. The ceiling comparison divides by 100 to get SAR.

### Modules That Require Approval

| Module | Action Code | What Gets Approved |
|--------|------------|-------------------|
| `estimates` | `a` | Cost estimates for customer approval |
| `approvals` | `a` | General approval workflow items |
| `procurement` | `a` | Purchase requisitions and purchase orders |
| `invoices` | `a` | Invoice issuance (for certain amounts) |
| `payments` | `a` | Payment release |
| `jobcards` | `a` | Job card actions (advisor/QC level) |
| `hr` | `a` | HR actions (leave approval, payroll posting) |

### Segregation of Duties for Approvals

The submitter of an item cannot also approve it. This is enforced by tracking:

- `submitted_by` — Who submitted the item for approval
- `approved_by` — Who approved it

If `submitted_by === approved_by`, the approval is rejected. This applies to:
- Estimates
- Purchase requisitions
- Purchase orders
- Insurance claims

---

## Notification Rule Setup

Notifications inform users when events occur that require their attention.

### Notification Events

| Event | Triggered When | Default Recipients |
|-------|---------------|-------------------|
| New job card | Job card created at check-in | Branch Manager, assigned Technician |
| Estimate ready | Estimate submitted for approval | Users with `estimates:a` at the branch |
| Estimate approved | Estimate approved | Service Advisor who created it |
| QC passed | Quality check completed successfully | Service Advisor, Receptionist |
| Payment received | Payment recorded against an invoice | Accountant |
| Stock low | Part `on_hand` drops to or below `reorder_level` | Storekeeper, Procurement Agent |
| Appointment upcoming | Appointment scheduled within 24 hours | Customer (via SMS/WhatsApp), assigned Technician |
| Approval pending | Item waiting for approval | Users with approval authority |

### Delivery Channels

| Channel | Storage Key | Configuration |
|---------|------------|---------------|
| In-app notification | `salis-notif` (localStorage) | Bell icon in Topbar shows orange unread dot |
| SMS | — | Requires SMS provider setup (see [Setup Integrations](./setup-integrations.md)) |
| WhatsApp | — | Requires WhatsApp Business API |
| Email | — | Requires email service configuration |

### Configuring Notification Preferences

1. Navigate to `/settings` or the user's profile.
2. Select which event types to receive notifications for.
3. Choose delivery channels per event type.
4. Notification preferences are stored per user.

---

## Service Template Management

Service templates define reusable service definitions that streamline job card creation and estimate building.

### Creating a Service Template

1. Navigate to the service management section.
2. Define the template:

| Field | Description |
|-------|-------------|
| Label | Service name (e.g., "Oil Change", "Brake Inspection") |
| Icon | Icon identifier from the 260 lucide-react icons |
| Standard duration | Expected time in minutes |
| Parts required | List of part SKUs typically needed |
| Labor steps | Standard labor tasks with estimated hours |
| Price | Standard price in SAR (stored as halalas) |

3. Save the template. It becomes available during job card creation and estimate building.

### Using Templates

- When creating a job card, select a service from the available templates.
- The `services` table stores templates: `icon`, `label`, plus tenant columns.
- Templates can be customized per organization — each org maintains its own set.

---

## Estimate Template Setup

Estimate templates pre-populate line items for common service scenarios.

### Estimate Line Structure

Each estimate contains lines stored in `estimate_lines`:

| Field | Type | Description |
|-------|------|-------------|
| `description` | varchar(300) | Line item description |
| `descriptionAr` | varchar(300) | Arabic description |
| `kind` | varchar(16) | `labor` or `part` |
| `qty` | double | Quantity |
| `unitPriceHalalas` | bigint | Unit price in halalas |
| `partSku` | varchar(64) | Part SKU reference (for part lines) |
| `sort` | integer | Display order |

### Template Usage

1. Create a template with pre-defined line items.
2. When building an estimate, select the template to auto-populate lines.
3. Modify quantities, prices, or add/remove lines as needed.
4. The estimate totals are computed: `total = subtotal + tax - discount`.

---

## Inspection Checklist Customization

The inspection stage uses the `Checklist` component with configurable items.

### Checklist Structure

Each inspection checklist consists of items that are toggled pass/fail:

- Items are rendered as real `<input type="checkbox">` elements (visually styled).
- Checked items show a gradient fill.
- The `countChecked(items, checked)` utility tracks completion progress.
- All checklist items must be completed before advancing to the estimate stage.

### Customizing Checklists

1. Define inspection categories (e.g., Exterior, Engine Bay, Under Vehicle, Interior).
2. Within each category, list specific items to check.
3. Each item has:
   - Label (translatable via `t()`)
   - Required/optional flag
   - Pass/fail with optional notes
   - Photo attachment area

### QC Gate Checklist

The QC Gate at `/qc-gate` uses a similar checklist for final quality verification:

- All items must pass before marking QC as complete.
- The QC inspector is recorded in `job_cards.qc_passed_by`.
- The inspector must be different from the assigned technician (`assigned_tech_id`) — this is the "Perform Repair / Pass QC" segregation of duties rule.

---

## Workflow Customization Summary

| What to Customize | Where | Who Can Do It |
|-------------------|-------|---------------|
| Stage transitions | Built-in (not configurable) | N/A — fixed sequence |
| Approval ceilings | Role definitions | Platform configuration |
| Notification events | Settings | Owner, Super Admin |
| Service templates | Services management | Owner, Manager |
| Inspection checklists | Settings / Templates | Owner, Manager |
| Estimate templates | Estimate configuration | Owner, Manager, Advisor |

---

## See Also

- [Generate Reports](./generate-reports.md) — Reporting on workflow metrics
- [RBAC Matrix](../reference/rbac-matrix.md) — Approval permissions by role
- [Glossary](../reference/glossary.md) — Definitions of workflow terms
