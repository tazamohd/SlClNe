# Authorization Matrix

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Document ID | SYS-SEC-003                                |
| Version     | 1.0                                        |
| Date        | 2026-08-30                                 |
| Status      | Approved                                   |

## 1. Overview

SALIS AUTO enforces role-based access control (RBAC) through a matrix of 14 roles, 28 modules, and 6 grant actions. This matrix is the single source of truth shared between the frontend (`app/src/data/rbac.ts`) and the backend (`@salis/contract`), with a test (`tests/authz-matrix.test.ts`) asserting they are identical.

## 2. Roles

### 2.1 Role Definitions

| Role         | Scope      | Approval Ceiling (SAR) | Data Visibility              |
|--------------|------------|------------------------|------------------------------|
| owner        | all        | Unlimited              | All data, all branches        |
| superadmin   | platform   | Unlimited              | Platform administration       |
| manager      | branch     | 50,000                 | Branch data                   |
| advisor      | branch     | 5,000                  | Branch data                   |
| technician   | own        | 0                      | Assigned jobs only            |
| qc           | branch     | 0 (non-monetary)       | Branch data                   |
| parts        | branch     | 10,000                 | Branch data                   |
| accountant   | all        | 25,000                 | All financial data            |
| hr           | all        | 15,000                 | All HR data                   |
| frontdesk    | branch     | 0                      | Branch data                   |
| callcenter   | all        | 0                      | All data (read-focused)       |
| procurement  | all        | 20,000                 | All procurement data          |
| supplier     | external   | 0                      | Supplier portal only          |
| customer     | self       | 0                      | Customer portal only          |

### 2.2 Data Scopes

| Scope      | Meaning                                            |
|------------|-----------------------------------------------------|
| `all`      | All rows across all branches within the tenant       |
| `platform` | Platform-level administration (above tenancy)        |
| `branch`   | Rows within the user's assigned branch               |
| `own`      | Only rows where the ownership column matches the user|
| `external` | External portal data (supplier-facing)               |
| `self`     | Only the user's own data (customer-facing)           |

The `own` scope uses the `OWNED_TABLES` mapping:

| Table          | Ownership Column    |
|----------------|---------------------|
| `job_cards`    | `assigned_tech_id`  |
| `appointments` | `technician_id`     |
| `crm_tasks`    | `created_by`        |
| `user_sessions`| `user_id`           |

## 3. Grant Actions

| Letter | Action  | Meaning                              |
|--------|---------|--------------------------------------|
| `v`    | View    | Read records and list views          |
| `c`    | Create  | Insert new records                   |
| `e`    | Edit    | Update existing records              |
| `d`    | Delete  | Soft-delete records                  |
| `a`    | Approve | Approve documents (with ceiling)     |
| `x`    | Export  | Download CSV exports                 |

Note: `x` is **export**, not delete. This corrects the handoff documentation which listed only five actions and called `x` delete. The data settles it: `vx` on dashboard means "view and export", not "view and delete a dashboard."

## 4. Permission Matrix

The full PERMS matrix (28 modules x 14 roles). Each cell contains the grant letters the role holds on that module. Empty cells mean no access.

### 4.1 Core Operations

| Module       | owner    | manager  | advisor  | technician | qc     | parts   | frontdesk |
|-------------|----------|----------|----------|------------|--------|---------|-----------|
| dashboard   | vx       | vx       | v        | v          | v      | v       | v         |
| jobcards    | vcedax   | vcedax   | vced     | ve         | vea    | v       | vc        |
| appointments| vcedax   | vcedax   | vced     | v          | v      | v       | vced      |
| estimates   | vcedax   | vcedax   | vcea     | v          | v      | v       | v         |
| customers   | vcedax   | vcedax   | vced     | v          |        | v       | vce       |
| vehicles    | vcedax   | vcedax   | vced     | v          |        | v       | vce       |
| inventory   | vcedax   | vcedax   | v        |            | v      | vcedax  | v         |

### 4.2 Finance and Procurement

| Module       | owner    | accountant| procurement| parts   | manager  | advisor  |
|-------------|----------|-----------|------------|---------|----------|----------|
| invoices    | vcedax   | vcedax    |            |         | vcedax   | vce      |
| payments    | vcedax   | vcedax    |            |         | vcedax   | vce      |
| accounting  | vcedax   | vcedax    |            |         | vx       |          |
| procurement | vcedax   | v         | vcedax     | v       | vcedax   |          |

### 4.3 People and HR

| Module       | owner    | hr       | manager  | advisor  | technician |
|-------------|----------|----------|----------|----------|------------|
| hr          | vcedax   | vcedax   | vx       |          |            |
| technicians | vcedax   | vcedax   | vcedax   | v        | v          |

### 4.4 CRM and Reports

| Module       | owner    | manager  | callcenter | advisor  | frontdesk |
|-------------|----------|----------|------------|----------|-----------|
| crm         | vcedax   | vcedax   | vcedax     | v        | v         |
| callcenter  | vcedax   | vcedax   | vcedax     |          |           |
| reports     | vcedax   | vcedax   | vx         |          |           |
| execreports | vx       |          |            |          |           |

### 4.5 Administration

| Module       | owner    | superadmin| manager  |
|-------------|----------|-----------|----------|
| admin       | vcedax   | vcedax    |          |
| settings    | vcedax   | vcedax    | ve       |
| audit       | vx       | vx        |          |
| network     | vcedax   | vcedax    |          |

### 4.6 Portals

| Module         | owner    | technician | customer | supplier |
|---------------|----------|------------|----------|----------|
| portaltech    | vcedax   | vx         |          |          |
| portalcustomer| vcedax   |            | vx       |          |
| portalsupplier| vcedax   |            |          | vx       |
| portalprocure | vcedax   |            |          | vx       |

### 4.7 Cross-Cutting

| Module       | owner    | superadmin| manager  | accountant |
|-------------|----------|-----------|----------|------------|
| approvals   | vcedax   | vx        | vcea     | vcea       |
| kiosk       | vcedax   | vcedax    | vcedax   |            |
| ai          | vcedax   | vcedax    | v        |            |

## 5. Screen-to-Module Mapping

The `SCREEN_MODULE` object maps 95+ screen identifiers to their governing module. The `RequireAccess` route guard checks whether the user's role holds `v` (view) on the screen's module before rendering.

### 5.1 Ungated Screens

16 screens bypass the RBAC guard entirely (available to all authenticated users):

`Index`, `RBACSpec`, `FlowSpec`, `UI.EmptyStates`, `UI.LoadingStates`, `UI.FormValidation`, `Login`, `Splash`, `Welcome`, `Error404`, `Maintenance`, `SessionExpired`, `AccountLocked`, `Unauthorized`, `PrivacyPolicy`, `TermsConditions`

## 6. Approval Authority

Approval requires two conditions, both of which must pass:

1. **Authority**: The role must hold `a` on the relevant module
2. **Ceiling**: The amount (in halalas) must not exceed the role's limit

| Failure Type | HTTP Status | API Code            | Message Intent               |
|-------------|-------------|---------------------|------------------------------|
| No authority | 403         | `forbidden`         | "Your role may not approve"  |
| Over ceiling | 422         | `approval_required` | "Escalate to a senior role"  |

The distinction matters: a 403 means "ask an admin for a permission", while a 422 means "find someone with a higher ceiling". Conflating them sends users to the wrong solution.

### 6.1 Ceiling Conversion

Ceilings in `ROLE_META` are in SAR. The server converts to halalas (multiply by 100) for comparison with monetary columns, which are always stored in halalas.

## 7. Field-Level Redaction

### 7.1 Field Visibility Rules

| Rule Name                  | Hidden From                            | Protected Keys            |
|----------------------------|----------------------------------------|---------------------------|
| Part cost/margin           | Roles without inventory edit           | `costHalalas`             |
| Labour cost rate           | Roles without HR edit                  | `rateHalalas`             |
| Employee salary            | Most roles (defense in depth)          | salary, basicSalary, grossPay, netPay, allowances, deductions (7 keys) |
| Supplier purchase price    | Roles without procurement view         | `unitPriceHalalas`        |
| Customer contact details   | Roles without customer edit            | `phone`, `email`          |
| Bank account details       | Roles without accounting edit          | `bankAccount`             |
| Branch P&L                 | Most roles (defense in depth)          | branchPnl, branchProfit, grossProfit, netProfit, operatingProfit, ebitda (6 keys) |

### 7.2 Defense-in-Depth Fields

Two rules -- "Employee salary" and "Branch P&L" -- guard fields that do not yet exist in any API response. They are applied as `GLOBAL_REDACTIONS` so they fire automatically when any collection starts emitting those keys. A test (`tests/authz-fields.test.ts`) fails if a collection emits a globally-redacted key, preventing silent rot.

### 7.3 Redaction Mechanism

The `redact()` function operates on the response path, before serialization. A redacted field is set to `null`, so it never appears on the wire. This is server-side enforcement -- hiding a field in CSS would still put it on the wire.

## 8. Segregation of Duties

### 8.1 Column-Based SOD

The `requireDifferentApprover(principal, submittedByUserId)` check ensures the person who created a document cannot also approve it. This applies to any record with a `submitted_by` column.

### 8.2 Audit-Based SOD

Six activity pairs are checked against the audit trail for a specific record:

| Activity A                | Activity B                  | Risk   |
|---------------------------|-----------------------------|--------|
| Perform repair            | Pass quality check           | High   |
| Issue stock               | Adjust stock count           | Medium |
| Raise purchase order      | Approve purchase order       | High   |
| Create supplier           | Approve supplier payment     | High   |
| Post journal entry        | Approve journal entry        | High   |
| Create employee           | Approve payroll run          | Medium |

The audit signatures that make each activity observable are defined in `SIGNATURES`. Three pairs are currently enforced; three await server routes for their counterpart activities.

## 9. Enforcement Parity

The authorization matrix exists in one place (`@salis/contract`) and is read by both:

- **Frontend**: `app/src/data/rbac.ts` -- hides UI controls, disables buttons
- **Backend**: `server/src/security/actions.ts` -- denies requests, enforces at the boundary

The `tests/authz-matrix.test.ts` test asserts these two readings are identical, not merely similar. Any drift between them is a test failure.

## Related Documents

- [Security Architecture](./security-architecture.md)
- [Auth Architecture](../architecture/auth-architecture.md)
- [Authentication Guide](./authentication-guide.md)
- [Backend Architecture](../architecture/backend-architecture.md)
