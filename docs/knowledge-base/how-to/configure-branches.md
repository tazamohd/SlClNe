# How To: Configure Branches

Step-by-step guide for creating and managing branch locations in SALIS AUTO. Branches are the fundamental unit of multi-location operations — every tenant-owned record carries a `branch_id` that determines data visibility for branch-scoped users.

---

## Prerequisites

- Sign in as **Owner/CEO** or **Super Admin**. Only those roles can create or edit branches.
- **Branch Manager** can view branches but not change them.

---

## Understanding Branches

Branches represent physical workshop locations within an organization. Key points:

- Every organization has at least one branch, marked as the **main branch**.
- Branch-scoped roles (manager, advisor, technician, QC, parts, front desk, call centre) see only their assigned branch.
- Organization-scoped roles (accountant, HR, procurement) see every branch.

---

## Viewing the Branch List

1. Navigate to **Administration > Branches** in the sidebar, or go directly to `/branches`.
2. The branch list shows:

| Column | Description |
|--------|-------------|
| Name | Branch name in English |
| Name (Arabic) | Branch name in Arabic |
| City | City where the branch is located |
| Is Main | Whether this is the primary/headquarters branch |
| Status | Active or inactive |

3. Use the search bar to filter branches by name or city.

---

## Creating a New Branch

1. Click the **Add Branch** button.
2. Fill in the fields:

| Field | Required | Type | Max Length | Description |
|-------|----------|------|-----------|-------------|
| Name | Yes | `varchar` | 200 | English name of the branch |
| Name (Arabic) | No | `varchar` | 200 | Arabic name for bilingual display |
| City | No | `varchar` | 120 | City location |
| Is Main | No | `boolean` | — | Defaults to `false`. Only one branch should be main. |

3. Click **Save**.
4. The system generates a ULID as the branch `id` and sets `org_id` to the current user's organization.
5. The branch is immediately available for user assignment and data scoping.

### Main Branch Designation

- Setting `isMain: true` designates this as the headquarters or primary location.
- Only one branch per organization should be marked as main.
- The main branch is typically the default selection for new records.

---

## Editing Branch Details

1. Navigate to `/branches`.
2. Click on the branch row to open it.
3. Update the desired fields (name, Arabic name, city, isMain status).
4. Click **Save**.
5. Changes take effect immediately. Records already linked to the branch keep their link.

---

## Assigning Users to Branches

Users are assigned to branches through the user management screen:

1. Navigate to `/admin/users`.
2. Open the user you want to assign.
3. Select the target branch from the **Branch** dropdown.
4. Click **Save**.

### Branch Assignment Rules

| Role | Branch Assignment | Effect |
|------|-------------------|--------|
| Owner / CEO | Not required | Sees all branches (`platform` scope) |
| Super Admin | Not required | Sees all branches (`all` scope) |
| Branch Manager | Required | Manages one branch |
| Service Advisor | Required | Works within one branch |
| Technician | Required | Assigned jobs within one branch |
| QC Inspector | Required | Inspects within one branch |
| Storekeeper | Required | Manages inventory at one branch |
| Accountant | Not required | Sees all branches (`org` scope) |
| HR Manager | Not required | Sees all branches (`org` scope) |
| Receptionist | Required | Front desk at one branch |
| Call Center Agent | Required | May handle calls for one branch |
| Procurement Agent | Not required | Procures across branches (`org` scope) |

---

## Branch-Scoped Data

When a branch-scoped user creates a record, the `branch_id` is automatically set to their assigned branch. This affects:

### Which records are visible

- **Job cards**: Only jobs at the user's branch (`job_cards.branch_id`)
- **Appointments**: Only appointments at the user's branch (`appointments.branch_id`)
- **Customers**: Customers registered at the branch (`customers.branch_id`)
- **Vehicles**: Vehicles associated with the branch (`vehicles.branch_id`)
- **Parts inventory**: Parts stocked at the branch (`parts.branch_id`)
- **Invoices**: Invoices issued by the branch (`invoices.branch_id`)

### Cross-branch visibility

- **Accountant, HR Manager, Procurement Agent**: These org-scoped roles see records across all branches. They can filter by branch but are not restricted.
- **Owner / CEO, Super Admin**: See all data across all branches (and, for Owner, across organizations).

---

## Multi-Location Setup

### Recommended Structure

For a typical multi-location automotive workshop:

1. **Main branch** (headquarters):
   - Set `isMain: true`
   - Houses the Owner/CEO, Accountant, HR Manager, Procurement Agent
   - Central administration and reporting
2. **Satellite branches** (additional locations):
   - Each has its own Branch Manager, Service Advisors, Technicians, Storekeeper, Receptionist
   - Operates independently for day-to-day workshop activities
   - Stock can be transferred between branches (via `inventory_movements` with `transfer_id`)

### Example Setup

| Branch | City | Is Main | Key Staff |
|--------|------|---------|-----------|
| SALIS Central | Riyadh | Yes | Owner, Accountant, HR Manager |
| SALIS Jeddah | Jeddah | No | Branch Manager, 2 Advisors, 4 Technicians, QC |
| SALIS Dammam | Dammam | No | Branch Manager, 1 Advisor, 3 Technicians, QC |

---

## Branch-Level Settings

Certain settings can be configured per branch:

- **Service templates**: Which services are offered at this location
- **Bay assignments**: Which bays are available for appointments
- **Working hours**: Appointment scheduling availability
- **Inventory levels**: Reorder points may differ by branch volume

---

## Reporting by Branch

Reports can be filtered by branch to compare performance:

1. Navigate to the Reports section.
2. Use the branch filter (available on most report screens via `ScopeSelect`).
3. Available branch-level metrics:
   - Revenue per branch
   - Job card volume and completion rate
   - Technician utilization
   - Inventory turnover
   - Customer satisfaction scores

For cross-branch comparison, use Executive Dashboard or Business Intelligence screens (requires `execreports:v` or `reports:v`).

---

## Transferring Inventory Between Branches

Stock transfers between branches create paired records in `inventory_movements`:

1. A **debit row** (negative delta) at the source branch.
2. A **credit row** (positive delta) at the destination branch.
3. Both rows share the same `transfer_id` to link the pair for audit.

The `to_branch_id` field on the movement record identifies the destination. A transfer to a branch outside the organization is rejected with `422 rule_violated`.

---

## Deactivating a Branch

Before deactivating a branch:

1. Reassign all active users to other branches.
2. Complete or transfer all open job cards.
3. Transfer remaining inventory to other branches.
4. Set the branch status to inactive.

**Note:** Deactivation does not delete historical records. All past job cards, invoices, and other data remain linked to the branch for reporting and audit purposes.

---

## See Also

- [Manage Users & Roles](./manage-users-roles.md) — User assignment to branches
- [Manage Inventory](./manage-inventory.md) — Stock transfers between branches
- [RBAC Matrix](../reference/rbac-matrix.md) — Data scope by role
