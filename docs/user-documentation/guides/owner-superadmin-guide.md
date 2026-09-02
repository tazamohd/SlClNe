# Owner & Super Admin Guide

This guide covers platform administration for the **Owner/CEO** and **Super Admin** roles. These are the two most privileged roles in SALIS AUTO with unlimited approval ceilings and access to all system configuration.

> **Prerequisites**: Complete the [Getting Started](getting-started.md) guide first.

---

## Role Comparison

| Capability | Owner / CEO | Super Admin |
|---|---|---|
| Scope | All (entire organization) | Platform (multi-tenant) |
| Approval ceiling | Unlimited | Unlimited |
| Landing page | Dashboard | Super Admin |
| User management | Full CRUD + assign roles | Full CRUD + assign roles |
| System settings | Full access | Full access |
| Financial reports | Full access | View + export |
| Audit log | View + export | View + export |

The Owner is the business owner who manages their organization. The Super Admin is the platform administrator who manages the overall SALIS AUTO platform, including multiple tenant organizations.

---

## Super Admin Dashboard

After logging in as Super Admin, you land on the **Super Admin** screen (`/super-admin`). This provides:

- Total organizations on the platform
- Active subscriptions summary
- Recent garage applications awaiting approval
- System health indicators

### Approving Garage Applications

When a new garage applies to join the platform:

1. Navigate to **Super Admin** from the sidebar.
2. Review pending applications in the applications queue.
3. Click on an application to review the garage details, owner information, and submitted documents.
4. Click **Approve** to create the organization, or **Reject** with a reason.
5. On approval, the system creates the organization, owner user account, and seed branches. The owner receives credentials by email.

See [Onboarding Flows](../workflows/onboarding-flows.md) for the full path.

---

## User Management

Navigate to **Admin > Users & Teams** (`/users-teams`).

### Creating a New User

1. Click the **Add User** button.
2. Fill in the required fields:
   - **Full Name** (English and Arabic)
   - **Email** (used for login)
   - **Phone Number**
   - **Role** (select from 14 available roles)
   - **Branch** (for branch-scoped roles)
   - **Status** (Active / Inactive)
3. Click **Save**.
4. The user receives an email with login credentials.

### Editing a User

1. Find the user in the DataTable. Use the search bar to filter by name or email.
2. Click on the user row to open their profile.
3. Modify fields as needed.
4. Click **Save**.

### Deactivating a User

1. Open the user's profile.
2. Change **Status** to Inactive.
3. Click **Save**. The user can no longer sign in but their historical records remain intact.

> **Tip**: Never delete a user who has performed actions in the system. Deactivate instead to preserve audit trail integrity.

---

## Role & Permission Management

Navigate to **Admin > Roles & Permissions** (`/roles-permissions`).

The permission matrix editor shows **28 modules** across **14 roles**. Each cell displays the granted actions:

| Code | Meaning |
|---|---|
| v | View |
| c | Create |
| e | Edit |
| d | Delete |
| a | Approve |
| x | Export |

### Reading the Matrix

- A cell showing `vcedax` means the role has full access to that module.
- A cell showing `v` means view-only access.
- An empty cell (dot) means the role cannot access that module at all -- the sidebar hides that section entirely.

### Approval Ceilings

Each role has a SAR ceiling for approvals:

| Role | Ceiling (SAR) |
|---|---|
| Owner / CEO | Unlimited |
| Super Admin | Unlimited |
| Branch Manager | 50,000 |
| Accountant | 25,000 |
| Procurement Agent | 20,000 |
| HR Manager | 15,000 |
| Storekeeper | 10,000 |
| Service Advisor | 5,000 |
| All others | 0 (cannot approve financial items) |

An estimate exceeding a role's ceiling is automatically routed to the **Approval Inbox** of a higher-authority role.

---

## Branch Management

Navigate to **Admin > Branches** (`/branches`).

### Adding a Branch

1. Click **Add Branch**.
2. Enter the branch name (EN/AR), address, phone, and operating hours.
3. Assign a Branch Manager.
4. Set the branch's service bays and capacity.
5. Click **Save**.

### Managing Branch Details

Each branch card shows active jobs, staff count, and revenue metrics. Click a branch to edit its details, view its staff, or access branch-level reports.

---

## System Settings

Navigate to **Settings** (`/settings`).

System settings are organized into sections:

| Section | What It Controls |
|---|---|
| General | Organization name, logo, contact details, timezone |
| Financial | Currency (SAR), VAT rate (15%), payment methods, invoice numbering |
| ZATCA | E-invoicing configuration, seller VAT number, compliance settings |
| Workshop | Default service types, bay configuration, SLA thresholds |
| Notifications | Email/SMS templates, notification triggers |
| Integrations | OEM connections, SMS providers, payment gateways |

### ZATCA E-Invoicing Settings

Saudi Arabia requires ZATCA-compliant electronic invoicing. Configure:

1. **Seller VAT Number**: Your organization's VAT registration number.
2. **QR Code Generation**: Enabled by default for all invoices.
3. **Hash Chain**: Each invoice's hash links to the previous one for tamper detection.

See [Invoice & Payment](../workflows/invoice-payment.md) for the invoicing workflow.

---

## Audit Log

Navigate to **Admin > Audit Log** (`/audit-log`).

The audit log records every significant action in the system:

- **Who** performed the action (user name and role)
- **What** they did (create, edit, delete, approve, transition)
- **When** it happened (timestamp)
- **Which record** was affected (entity type and ID)

### Filtering the Audit Log

Use the filters at the top of the DataTable:

- **Date range**: Start and end date.
- **User**: Filter by specific user.
- **Action type**: Create, edit, delete, approve, transition, login.
- **Module**: Filter by domain (workshop, finance, HR, etc.).

> **Note**: The audit log is immutable. Even roles with export permission cannot modify or delete entries. This is by design for compliance.

---

## Reports

As Owner, you have access to all report categories:

| Report Section | Route | Contents |
|---|---|---|
| Financial Reports | `/financial-reports` | Revenue, expenses, P&L, cash flow |
| Financial Statements | `/financial-statements` | Balance sheet, income statement, trial balance |
| Executive Reports | `/executive-reports` | KPIs, trend analysis, branch comparisons |
| Operational Reports | `/operational-reports` | Workshop throughput, technician productivity |
| Workshop Reports | `/workshop-reports` | Job card metrics, service type breakdowns |
| BI Dashboard | `/bi-dashboard` | Interactive business intelligence visualizations |

### Executive Reports

These reports are restricted by field-level redaction. Only roles with `execreports` module access can see Branch P&L figures. As Owner, you have full visibility.

---

## Subscription Management

Navigate to **Admin > Subscription** (`/subscription`).

View your current plan, usage metrics, billing history, and upgrade options. The subscription determines:

- Maximum number of users
- Number of branches
- Available feature modules
- Storage limits

---

## Multi-Tenant & Franchise Management

For organizations operating multiple locations or franchise networks:

- **Organizations**: View and manage all tenant organizations (Super Admin only) at `/organizations`.
- **Franchise Management**: Configure franchise rules, shared catalogs, and cross-location reporting at `/franchise-management`.
- **Multi-Location Dashboard**: Compare performance across all branches at `/multi-location-dashboard`.

---

## Daily Operations as Owner

A typical daily workflow:

1. **Review the Dashboard** for organization-wide KPIs.
2. **Check the Approval Inbox** (`/approval-inbox`) for estimates or purchase orders above your managers' ceilings.
3. **Review Audit Log** for any unusual activity.
4. **Check Reports** for revenue trends and operational metrics.
5. **Manage users** as needed for new hires or role changes.

---

## Common Tasks Quick Reference

| Task | Where to Go |
|---|---|
| Add a new employee | Admin > Users & Teams > Add User |
| Change someone's role | Admin > Users & Teams > select user > edit Role |
| Add a branch | Admin > Branches > Add Branch |
| Approve a large estimate | Approval Inbox |
| View revenue reports | Reports > Financial Reports |
| Check system audit trail | Admin > Audit Log |
| Configure ZATCA | Settings > ZATCA Settings |
| Manage integrations | Settings > Integrations |

---

## Related Guides

- [Branch Manager Guide](manager-guide.md) -- for delegating branch operations
- [Finance Staff Guide](finance-staff-guide.md) -- for understanding financial workflows
- [Onboarding Flows](../workflows/onboarding-flows.md) -- for new garage and user onboarding
- [Estimate Approval](../workflows/estimate-approval.md) -- for the approval chain details
