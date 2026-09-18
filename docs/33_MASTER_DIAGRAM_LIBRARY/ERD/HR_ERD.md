<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/data.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - server/src/db/schema.ts
       - server/drizzle/*.sql
-->

# HR ERD

**Status:** GENERATED · **Sources as of:** 2026-09-18 · 5 tables

### HR

```mermaid
erDiagram
  employees {
    varchar id PK
    varchar employee_number
    varchar name
    varchar name_ar
    varchar title
    varchar department_id FK
    date hire_date
    varchar status
    bigint salary_halalas
  }
  payroll_runs {
    varchar id PK
    varchar period
    varchar status
    bigint gross_halalas
    bigint allowances_halalas
    bigint deductions_halalas
    bigint net_halalas
    timestamptz posted_at
    varchar posted_by
  }
  payroll_lines {
    varchar id PK
    varchar payroll_run_id FK
    varchar employee_id FK
    varchar employee_name
    bigint gross_halalas
    bigint allowances_halalas
    bigint deductions_halalas
    bigint net_halalas
  }
  timesheets {
    varchar id PK
    varchar employee_id FK
    varchar employee_name
    date work_date
    varchar clock_in
    varchar clock_out
    integer minutes
    varchar status
  }
  leave_requests {
    varchar id PK
    varchar employee_id FK
    varchar employee_name
    varchar type
    date start_date
    date end_date
    integer days
    varchar status
    text reason
    varchar approver_id FK
    timestamptz decided_at
  }
  payroll_runs ||--o{ payroll_lines : "payroll_run_id"
  employees ||--o{ payroll_lines : "employee_id"
  employees ||--o{ timesheets : "employee_id"
  employees ||--o{ leave_requests : "employee_id"
```


| Table | Purpose |
| --- | --- |
| `employees` | Employees — a member of staff who belongs to a department (the existing `departments` collection) and a branch. **Salary is sensitive**: the `Employee salary` f |
| `payroll_runs` | Payroll runs — one calendar month. The totals (gross, allowances, deductions, net) are the column sums of the run's lines, computed by the server and **frozen w |
| `payroll_lines` | Payroll lines — one employee's pay within a run. The net is computed by the server as `gross + allowances − deductions`, never sent by the client. Money is inte |
| `timesheets` | Timesheets — a day's clock-in/out or worked minutes for one employee. Worked minutes are stored as an integer, so no fractional-hour float. Gated on `hr`. |
| `leave_requests` | Leave requests — a range of days an employee asks off. The approval (approve / reject) is the bespoke router, gated on the `hr` `a` grant and audited; the appro |
