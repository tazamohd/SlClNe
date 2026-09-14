<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/api.mjs
     Regenerate: npm run docs:generate
     Derived from:
       - server/src/registry.ts
       - server/src/routes/*.ts
       - server/src/auth/routes.ts
       - server/src/app.ts
-->

# API — hr

**Status:** GENERATED · **Sources as of:** 2026-09-13 · 48 endpoints

| Method | Path | Permission | Auth | Entity | Idempotent | Tests | Declared in |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/employees` | hr:v | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/employees` | hr:c | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/employees/:id` | hr:d | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/employees/:id` | hr:v | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/employees/:id` | hr:e | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/employees/:id/history` | hr:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/employees/bulk-delete` | hr:d | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/employees/bulk-update` | hr:e | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/employees/export` | hr:x | token | `employees` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/leave-requests` | hr:v | token | `leaveRequests` | — | 3 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/leave-requests` | hr:c | token | `leaveRequests` | — | 3 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/leave-requests/:id` | hr:d | token | `leaveRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/leave-requests/:id` | hr:v | token | `leaveRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/leave-requests/:id` | hr:e | token | `leaveRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/leave-requests/:id/approve` | hr:a | token | — | — | — | `server/src/routes/leave.ts` |
| GET | `/api/v1/leave-requests/:id/history` | hr:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/leave-requests/:id/reject` | hr:a | token | — | — | — | `server/src/routes/leave.ts` |
| POST | `/api/v1/leave-requests/bulk-delete` | hr:d | token | `leaveRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/leave-requests/bulk-update` | hr:e | token | `leaveRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/leave-requests/export` | hr:x | token | `leaveRequests` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/lines` | hr:v | token | `payrollLines` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/payroll/lines` | hr:c | token | `payrollLines` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/payroll/lines/:id` | hr:d | token | `payrollLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/lines/:id` | hr:v | token | `payrollLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/payroll/lines/:id` | hr:e | token | `payrollLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/lines/:id/history` | hr:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/payroll/lines/bulk-delete` | hr:d | token | `payrollLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/payroll/lines/bulk-update` | hr:e | token | `payrollLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/lines/export` | hr:x | token | `payrollLines` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/runs` | hr:v | token | `payrollRuns` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/payroll/runs` | hr:c | token | `payrollRuns` | — | 1 | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/payroll/runs/:id` | hr:d | token | `payrollRuns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/runs/:id` | hr:v | token | `payrollRuns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/payroll/runs/:id` | hr:e | token | `payrollRuns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/runs/:id/history` | hr:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/payroll/runs/:id/post` | hr:e | token | — | — | — | `server/src/routes/payroll.ts` |
| POST | `/api/v1/payroll/runs/bulk-delete` | hr:d | token | `payrollRuns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/payroll/runs/bulk-update` | hr:e | token | `payrollRuns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/payroll/runs/export` | hr:x | token | `payrollRuns` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/timesheets` | hr:v | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/timesheets` | hr:c | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| DELETE | `/api/v1/timesheets/:id` | hr:d | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/timesheets/:id` | hr:v | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| PATCH | `/api/v1/timesheets/:id` | hr:e | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/timesheets/:id/history` | hr:v | token | — | — | — | `server/src/routes/history.ts` |
| POST | `/api/v1/timesheets/bulk-delete` | hr:d | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| POST | `/api/v1/timesheets/bulk-update` | hr:e | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |
| GET | `/api/v1/timesheets/export` | hr:x | token | `timesheets` | — | — | `server/src/routes/collections.ts (generated from server/src/registry.ts)` |

## Query contract for generated collection routes

| Collection | Path | Searchable (`?q=`) | Sortable (`?sort=`) | Filterable (`?filter[x]=`) | Default sort | Writable |
| --- | --- | --- | --- | --- | --- | --- |
| employees | `/employees` | `employeeNumber`, `name`, `nameAr`, `title` | `employeeNumber`, `name`, `status`, `hireDate`, `createdAt` | `status`, `departmentId` | createdAt asc | yes |
| payrollRuns | `/payroll/runs` | `period`, `status` | `period`, `status`, `netHalalas`, `createdAt` | `status`, `period` | period desc | yes |
| payrollLines | `/payroll/lines` | `employeeName` | `employeeName`, `netHalalas`, `createdAt` | `payrollRunId`, `employeeId` | createdAt asc | yes |
| timesheets | `/timesheets` | `employeeName` | `workDate`, `employeeName`, `minutes`, `createdAt` | `employeeId`, `status` | workDate desc | yes |
| leaveRequests | `/leave-requests` | `employeeName`, `type` | `startDate`, `employeeName`, `status`, `createdAt` | `employeeId`, `status`, `type` | startDate desc | yes |

An unknown `?sort=` key is a 400, not a silent fallback, so a typo is visible instead of ignored.
