# HR & Team — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-HRT-006                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | Team & HR                                |
| Modules     | hr, technicians                          |

## 1. Overview

The HR and Team domain manages the workforce of SALIS AUTO workshops. It covers technician profiles and assignment, department structure, employee records with salary management, payroll processing, timesheets, leave requests, and related HR functions. Salary data is protected by field-level redaction, and payroll posting enforces segregation of duties.

## 2. Technicians

### 2.1 Data Model

The `technicians` table:

| Field       | Type           | Description                              |
|-------------|----------------|------------------------------------------|
| id          | varchar(26)    | ULID primary key                         |
| org_id      | varchar(26)    | Tenant isolation                         |
| name        | varchar(200)   | Technician name (required)               |
| specialty   | varchar(160)   | Area of expertise (e.g., Engine, Electrical) |
| active_jobs | integer        | Current active job count                 |
| rating      | double         | Performance rating (derived from feedback) |
| user_id     | varchar(26)    | FK to users table (for auth/scope link)  |

### 2.2 User Linking

The `user_id` field links a technician record to a platform user account. This link is critical for:

- **QC Independence**: The workshop route resolves `assigned_tech_id` through `technicians.user_id` to compare against the QC inspector's user ID
- **Data Scoping**: Technician role users see only jobs assigned to their technician record (via `OWNED_TABLES: { job_cards: 'assigned_tech_id' }`)

### 2.3 Workload Tracking

`active_jobs` tracks the number of currently assigned open job cards, enabling workload balancing during assignment.

### 2.4 Performance Rating

The `rating` field (double precision) is derived from customer feedback scores linked to completed job cards. Displayed as a numeric rating in the technician profile.

### 2.5 Permissions

| Role         | Grants | Notes                                   |
|--------------|--------|-----------------------------------------|
| Owner        | vcedax | Full access                             |
| Manager      | vcedax | Full access                             |
| Advisor      | v      | View only                               |
| Technician   | v      | View only (own profile)                 |
| QC           | v      | View only                               |
| HR Manager   | vcedx  | View, create, edit, delete              |
| Receptionist | v      | View only                               |
| Super Admin  | v      | View only                               |

### 2.6 Screens

- `Technicians` — Technician directory with specialty, active jobs, and rating
- `TechnicianSchedule` — Scheduling and availability view
- `TechnicianKB` — Knowledge base access for technicians (gated on `technicians` module)

## 3. Departments

### 3.1 Data Model

The `departments` table:

| Field        | Type          | Description                           |
|--------------|---------------|---------------------------------------|
| id           | varchar(26)   | ULID primary key                      |
| org_id       | varchar(26)   | Tenant isolation                      |
| name         | varchar(200)  | Department name (required)            |
| head         | varchar(200)  | Department head name                  |
| headcount    | integer       | Number of employees                   |
| cost_center  | varchar(40)   | Cost center code                      |
| branch_label | varchar(160)  | Branch display name                   |
| icon         | varchar(64)   | Department icon identifier            |

### 3.2 Usage

Departments organize employees and map to cost centers for accounting. The `Departments` screen is gated on the `hr` module.

## 4. Employees

### 4.1 Data Model

The `employees` table:

| Field            | Type          | Description                            |
|------------------|---------------|----------------------------------------|
| id               | varchar(26)   | ULID primary key                       |
| org_id           | varchar(26)   | Tenant isolation                       |
| employee_number  | varchar(40)   | Employee number, unique per org        |
| name             | varchar(200)  | Employee name (required)               |
| name_ar          | varchar(200)  | Arabic name                            |
| title            | varchar(160)  | Job title                              |
| department_id    | varchar(26)   | FK to departments                      |
| hire_date        | date          | Date of hire                           |
| status           | varchar(16)   | active (default), inactive, terminated |
| salary_halalas   | bigint        | Monthly salary in halalas (SENSITIVE)  |

### 4.2 Salary Redaction

The `salary_halalas` field is protected by the "Employee salary" field rule. It is hidden from:

- Advisor, Technician, QC, Storekeeper, Receptionist, Call Center, Procurement, Supplier, Customer

Only Owner, Manager, Accountant, HR Manager, and Super Admin can see salary data. The server-side `GLOBAL_REDACTIONS` ensure this field is nulled in API responses regardless of which collection emits it. The following related keys are also redacted: `salary`, `basicSalaryHalalas`, `grossPayHalalas`, `netPayHalalas`, `allowancesHalalas`, `deductionsHalalas`.

### 4.3 Segregation of Duties

The SOD pair "Create employee / Approve payroll run" is declared but currently unobservable — the HR employee creation uses the generic collection route, and the payroll approval route is under development.

## 5. Payroll

### 5.1 Payroll Runs

The `payroll_runs` table:

| Field              | Type          | Description                          |
|--------------------|---------------|--------------------------------------|
| id                 | varchar(26)   | ULID primary key                     |
| org_id             | varchar(26)   | Tenant isolation                     |
| period             | varchar(7)    | Period in `YYYY-MM` format, unique per org |
| status             | varchar(16)   | draft, posted                        |
| gross_halalas      | bigint        | Total gross pay                      |
| allowances_halalas | bigint        | Total allowances                     |
| deductions_halalas | bigint        | Total deductions                     |
| net_halalas        | bigint        | Total net pay                        |
| posted_at          | timestamptz   | When the run was posted              |
| posted_by          | varchar(26)   | Who posted the run                   |

### 5.2 Payroll Lines

The `payroll_lines` table:

| Field              | Type          | Description                          |
|--------------------|---------------|--------------------------------------|
| payroll_run_id     | varchar(26)   | FK to payroll run                    |
| employee_id        | varchar(26)   | FK to employee                       |
| employee_name      | varchar(200)  | Denormalized employee name           |
| gross_halalas      | bigint        | Employee gross pay                   |
| allowances_halalas | bigint        | Employee allowances                  |
| deductions_halalas | bigint        | Employee deductions                  |
| net_halalas        | bigint        | Employee net pay (server-computed)   |

### 5.3 Calculation Rule

Net pay is computed by the server: `net = gross + allowances - deductions`. The run's totals are the column sums of its lines.

### 5.4 Posting Invariant

A posted payroll run cannot be reopened or edited. The transition is handled by a dedicated `/payroll/runs/:id/post` route. This is an irreversible state change, enforced at the server level.

## 6. Timesheets

### 6.1 Data Model

The `timesheets` table:

| Field          | Type          | Description                          |
|----------------|---------------|--------------------------------------|
| employee_id    | varchar(26)   | FK to employee                       |
| employee_name  | varchar(200)  | Denormalized name                    |
| work_date      | date          | Date of work                         |
| clock_in       | varchar(5)    | Clock-in time (HH:MM format)        |
| clock_out      | varchar(5)    | Clock-out time (HH:MM format)       |
| minutes        | integer       | Worked minutes (integer, no floats)  |
| status         | varchar(16)   | submitted (default), approved, rejected |

### 6.2 Index

`timesheets_employee_idx` on `(org_id, employee_id, work_date)` enables efficient per-employee daily lookups.

## 7. Leave Requests

### 7.1 Data Model

The `leave_requests` table:

| Field          | Type          | Description                          |
|----------------|---------------|--------------------------------------|
| employee_id    | varchar(26)   | FK to employee                       |
| employee_name  | varchar(200)  | Denormalized name                    |
| type           | varchar(24)   | annual (default), sick, emergency, unpaid |
| start_date     | date          | Leave start date                     |
| end_date       | date          | Leave end date                       |
| days           | integer       | Number of days (default 1)           |
| status         | varchar(16)   | submitted, approved, rejected        |
| reason         | text          | Leave reason                         |
| approver_id    | varchar(26)   | Who decided on the request           |
| decided_at     | timestamptz   | When the decision was made           |

### 7.2 Approval

Leave approval/rejection is handled by a dedicated route, gated on the `hr` module with the `a` (approve) grant. The approver is recorded for audit and segregation-of-duties purposes.

## 8. HR Permissions

| Role         | Grants | Notes                                      |
|--------------|--------|--------------------------------------------|
| Owner        | vcedax | Full access                                |
| Manager      | vx     | View and export                            |
| HR Manager   | vcedax | Full access (primary HR role)              |
| Accountant   | vx     | View and export (for payroll integration)  |
| Super Admin  | v      | View only                                  |

All other roles have no `hr` module access.

## 9. HR Feature Screens

| Screen             | Module | Description                              |
|--------------------|--------|------------------------------------------|
| HRPayroll          | hr     | Payroll run management and processing    |
| Departments        | hr     | Department structure and headcounts      |
| Employees          | hr     | Staff directory and profiles             |
| Timesheets         | hr     | Clock-in/out and worked minutes          |
| LeaveRequests      | hr     | Leave request submission and approval    |
| Attendance         | hr     | Attendance tracking                      |
| PerformanceReviews | hr     | Employee performance evaluation          |
| Training           | hr     | Training and LMS management              |
| Scheduling         | hr     | Shift and schedule management            |
| Benefits           | hr     | Employee benefits administration         |
| Onboarding         | hr     | New employee onboarding                  |
| Offboarding        | hr     | Employee exit process                    |
| OrgChart           | hr     | Organizational structure visualization   |

## 10. Cross-References

- [Workshop Operations](./workshop-operations.md) — Technician assignment to job cards
- [Finance & Accounting](./finance-accounting.md) — Payroll costs flow into journal entries
- [Admin & Portals](./admin-portals.md) — User accounts linked to employees
- [Security](../non-functional/security.md) — Salary redaction rules
- [Compliance](../non-functional/compliance.md) — Saudi labor law considerations
