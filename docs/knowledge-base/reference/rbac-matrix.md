# RBAC Matrix

Complete Role-Based Access Control reference for SALIS AUTO. 14 roles, 28 modules, 5 permission actions, 8 data scopes.

---

## Permission Action Codes

| Code | Action | Description |
|------|--------|-------------|
| `v` | View | Read access to list and detail screens |
| `c` | Create | Create new records |
| `e` | Edit | Modify existing records |
| `x` | Delete | Soft-delete records (set `deleted_at`) |
| `a` | Approve | Approve items (estimates, POs, expenses, leave requests) |

A dot (.) in the matrix means no access to that module.

---

## Full Permission Matrix

| Module | owner | superadmin | manager | advisor | technician | qc | parts | accountant | hr | frontdesk | callcenter | procurement | supplier | customer |
|--------|-------|------------|---------|---------|------------|-----|-------|------------|-----|-----------|------------|-------------|----------|----------|
| accounting | vax | v | vx | . | . | . | . | vcedax | . | . | . | . | . | . |
| admin | vcedax | vcedax | v | . | . | . | . | . | . | . | . | . | . | . |
| ai | vcedax | vcedax | vce | v | . | . | . | v | . | . | . | . | . | . |
| appointments | vcedax | v | vcedax | vced | v | . | . | . | . | vced | vced | . | . | . |
| approvals | vax | vx | vax | va | . | . | va | vax | va | . | . | vax | . | . |
| audit | vx | vx | vx | . | . | . | . | vx | . | . | . | . | . | . |
| callcenter | vx | v | vx | v | . | . | . | . | . | v | vcedx | . | . | . |
| crm | vcedax | v | vcedx | vce | . | . | . | . | . | . | vced | . | . | . |
| customers | vcedax | v | vcedx | vce | v | . | . | vx | . | vce | vce | . | . | . |
| dashboard | vx | vx | vx | v | v | v | v | vx | v | v | v | v | . | . |
| estimates | vcedax | v | vceax | vce | v | . | v | vx | . | v | v | . | . | . |
| execreports | vx | vx | vx | . | . | . | . | vx | . | . | . | . | . | . |
| hr | vcedax | v | vx | . | . | . | . | vx | vcedax | . | . | . | . | . |
| inventory | vcedax | v | vcedax | v | v | . | vcedax | vx | . | . | . | vcex | . | . |
| invoices | vcedax | v | vceax | vc | . | . | . | vcedax | . | vc | v | . | . | . |
| jobcards | vcedax | v | vcedax | vcea | ve | va | v | vx | . | vc | v | . | . | . |
| kiosk | v | v | v | v | . | . | . | . | . | vcex | v | . | . | . |
| network | vcedax | v | vcedx | . | . | . | vced | . | . | . | . | vcedax | vce | . |
| payments | vcedax | v | vcax | vc | . | . | . | vcedax | . | vc | . | . | . | . |
| portalcustomer | v | v | v | v | . | . | . | . | . | v | v | . | . | vx |
| portalprocure | v | v | v | . | . | . | v | v | . | . | . | vx | . | . |
| portalsupplier | v | v | v | . | . | . | v | . | . | . | . | v | vx | . |
| portaltech | v | v | v | v | vx | vx | . | . | . | . | . | . | . | . |
| procurement | vcedax | v | vcax | . | . | . | vc | vax | . | . | . | vcedax | v | . |
| reports | vx | vx | vx | v | . | v | vx | vx | vx | . | . | vx | . | . |
| settings | vcedax | vcedax | ve | . | . | . | . | . | . | . | . | . | . | . |
| technicians | vcedax | v | vcedax | v | v | v | . | . | vcedx | v | . | . | . | . |
| vehicles | vcedax | v | vcedx | vce | v | v | . | v | . | vce | v | . | . | . |

---

## Data Scopes by Role

| Role | ID | Default Scope | Data Visibility |
|------|----|---------------|-----------------|
| Owner / CEO | `owner` | `platform` | All organizations and all branches |
| Super Admin | `superadmin` | `all` | All branches within the organization |
| Branch Manager | `manager` | `branch` | Only records at the assigned branch |
| Service Advisor | `advisor` | `branch` | Only records at the assigned branch |
| Technician | `technician` | `assigned` | Only records assigned to them |
| QC Inspector | `qc` | `branch` | Only records at the assigned branch |
| Storekeeper | `parts` | `branch` | Only records at the assigned branch |
| Accountant | `accountant` | `org` | All branches within the organization |
| HR Manager | `hr` | `org` | All branches within the organization |
| Receptionist | `frontdesk` | `branch` | Only records at the assigned branch |
| Call Center Agent | `callcenter` | `branch` | Only records at the assigned branch |
| Procurement Agent | `procurement` | `org` | All branches within the organization |
| Supplier | `supplier` | `external` | Supplier portal only |
| Customer | `customer` | `self` | Own profile and associated records only |

---

## Approval Ceilings

| Role | Scope | Ceiling (SAR) | Ceiling (Halalas) |
|------|-------|---------------|-------------------|
| Owner / CEO | all | Unlimited | Unlimited |
| Super Admin | platform | Unlimited | Unlimited |
| Branch Manager | branch | 50,000 | 5,000,000 |
| Accountant | all | 25,000 | 2,500,000 |
| Procurement Agent | all | 20,000 | 2,000,000 |
| HR Manager | all | 15,000 | 1,500,000 |
| Storekeeper | branch | 10,000 | 1,000,000 |
| Service Advisor | branch | 5,000 | 500,000 |
| Technician | own | 0 | 0 |
| QC Inspector | branch | 0 | 0 |
| Receptionist | branch | 0 | 0 |
| Call Center Agent | all | 0 | 0 |
| Supplier | external | 0 | 0 |
| Customer | self | 0 | 0 |

---

## Separation of Duties (6 Pairs)

Two complementary actions that must be performed by different users:

| Actor A | Actor B | Enforcement Column |
|---------|---------|--------------------|
| Raise Purchase Order | Approve Purchase Order | `submitted_by` != `approved_by` on `purchase_orders` |
| Create Supplier | Approve Payment | Different users required |
| Post Journal Entry | Approve Journal Entry | `submitted_by` != `approved_by` on `journal_entries` |
| Perform Repair | Pass Quality Check | `assigned_tech_id` != `qc_passed_by` on `job_cards` |
| Issue Stock | Adjust Stock Count | Different users for issue vs. adjust movements |
| Create Employee | Approve Payroll | Different users for `employees` CRUD vs `payroll_runs` posting |

---

## Field Redaction Rules (7 Rules)

Fields hidden from specific roles. The `ReadField` component renders redacted values as an em-dash with "Hidden for your role" title text. The server nulls these values in API responses for the affected roles.

| # | Field | Hidden From | Module Context |
|---|-------|-------------|----------------|
| 1 | Employee salary (`salary_halalas`) | All roles except Owner, Super Admin, HR Manager | `hr` |
| 2 | Part cost price (`cost_halalas`) | Technician, QC Inspector, Receptionist, Call Center, Customer | `inventory` |
| 3 | Profit margin (derived from cost vs. price) | Same as cost price | `inventory` / `reports` |
| 4 | Branch P&L details | Roles without `execreports` access | `execreports` |
| 5 | Customer total spent | Technician, QC Inspector | `customers` |
| 6 | Payroll details (gross, net, deductions) | All roles except Owner, Super Admin, HR Manager, Accountant | `hr` |
| 7 | Approval amounts on pending items | External roles (Supplier, Customer) | `approvals` |

---

## RBAC_UNGATED Screens

These screens bypass RBAC checks entirely:

| Screen | Route | Reason |
|--------|-------|--------|
| Login | `/login` | Pre-authentication |
| Register | `/register` | Pre-authentication |
| Forgot Password | `/forgot-password` | Pre-authentication |
| Reset Password | `/reset-password` | Pre-authentication |
| OTP Verify | `/otp` | Pre-authentication |
| SSO Login | `/sso` | Pre-authentication |
| Landing Page | `/` | Public website |
| About | `/about` | Public website |
| Services | `/services` | Public website |
| Pricing | `/pricing` | Public website |
| Blog | `/blog` | Public website |
| Contact | `/contact` | Public website |
| Privacy Policy | `/privacy` | Public website |
| Terms of Service | `/terms` | Public website |
| Screen Index | `/spec-index` | Development reference |
| Flow Spec | `/flow-spec` | Development reference |
| UI Galleries | various | Development reference |

---

## Module-to-Screen Mapping

The `SCREEN_MODULE` mapping determines which RBAC module gates each screen:

| RBAC Module | Screens Gated |
|-------------|---------------|
| `dashboard` | Dashboard |
| `jobcards` | Job Cards, Job Detail, Check-In, Inspection, QC Gate, Delivery, Service Bay Dashboard |
| `appointments` | Appointments, Workshop Calendar |
| `estimates` | Estimates, Video Estimates |
| `customers` | Customers, Feedback |
| `vehicles` | Vehicles, Fleet Management, Vehicle History, Vehicle Tracking |
| `inventory` | Inventory, Parts Availability, Parts Auto-Reorder |
| `network` | Parts Supply Network |
| `procurement` | Purchase Agent Portal screens |
| `invoices` | Invoices, Invoice Create, Invoice Detail |
| `payments` | Payments, Receipts, Stripe Payment Processing |
| `accounting` | Chart of Accounts, Journal Entries, Expenses, General Ledger, Balance Sheet, etc. |
| `hr` | HR Management, Staff Directory, Payroll, Leave Requests, Timesheets |
| `technicians` | Technicians, Leaderboards |
| `crm` | Leads, Opportunities, Campaigns, Segments, Tasks, CRM Calendar |
| `callcenter` | Call Center Queue, Call Logs |
| `reports` | Operational Reports, Workshop Reports, Inventory Reports, Custom Reports |
| `execreports` | Executive Dashboard, BI Dashboard, Profit Analysis, KPI Dashboard |
| `admin` | Users & Teams, Roles, Branches, Compliance, Document Management |
| `settings` | Settings, Security Settings, ZATCA Settings |
| `audit` | Audit Log |
| `ai` | AI Assistant, Knowledge Base, AI Agents, AI Automation |
| `kiosk` | Kiosk |
| `portaltech` | Technician Portal |
| `portalcustomer` | Customer App, Client Portal |
| `portalsupplier` | Supplier Portal |
| `portalprocure` | Procurement Portal |
| `approvals` | Approval workflows |

---

## See Also

- [Screen Catalog](./screen-catalog.md) — Full screen listing with routes
- [Manage Users & Roles](../how-to/manage-users-roles.md) — Role assignment guide
- [Glossary](./glossary.md) — Term definitions
