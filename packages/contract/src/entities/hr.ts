/** HR: employees, payroll (runs + lines), timesheets and leave requests.
 *
 *  An employee belongs to a department (the existing `departments` collection)
 *  and a branch, and carries a base salary. **Salary is sensitive** — the
 *  `Employee salary` field rule hides `salaryHalalas` and every pay figure from
 *  the roles that rule names, and the server nulls them on the way out
 *  (`GLOBAL_REDACTIONS`), so the key names here match those the redaction sweeps.
 *
 *  Payroll is a run (one month) with lines (one per employee). A line's net is
 *  `gross + allowances − deductions`, computed on the server; a run's totals are
 *  the sums of its lines, frozen when the run is posted. Money is an integer
 *  count of halalas; no total is ever computed on the client.
 *
 *  A leave request moves through submit → approve/reject by a named action, like
 *  the estimate; the approver is recorded for segregation of duties.
 */
import { z } from 'zod'
import { halalas, isoDate, nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

/* ------------------------------------------------------------- enumerations */

export const employmentStatus = z.enum(['active', 'on_leave', 'terminated'])
export type EmploymentStatus = z.infer<typeof employmentStatus>

export const payrollRunStatus = z.enum(['draft', 'posted'])
export type PayrollRunStatus = z.infer<typeof payrollRunStatus>

export const timesheetStatus = z.enum(['submitted', 'approved', 'rejected'])
export type TimesheetStatus = z.infer<typeof timesheetStatus>

export const leaveType = z.enum(['annual', 'sick', 'unpaid', 'other'])
export type LeaveType = z.infer<typeof leaveType>

export const leaveStatus = z.enum(['submitted', 'approved', 'rejected'])
export type LeaveStatus = z.infer<typeof leaveStatus>

/** `YYYY-MM` — a payroll period is a calendar month. */
export const payrollPeriod = z.string().regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM')

/* --------------------------------------------------------------- employees */

export const employeeCreate = z.object({
  /** Optional: the server assigns `EMP-0001` when omitted. */
  employeeNumber: z.string().max(40).optional(),
  name: nonEmpty.max(200),
  nameAr: z.string().max(200).optional(),
  title: z.string().max(160).optional(),
  departmentId: ulid.optional(),
  hireDate: isoDate.optional(),
  status: employmentStatus.optional(),
  salaryHalalas: halalas,
})
export type EmployeeCreate = z.infer<typeof employeeCreate>

export const employeeUpdate = employeeCreate.partial().omit({ employeeNumber: true })
export type EmployeeUpdate = z.infer<typeof employeeUpdate>

export const employeeRow = appRow({
  /** `EMP-0001` — the human employee number the design shows. */
  employeeNumber: z.string(),
  name: z.string(),
  nameAr: z.string(),
  title: z.string(),
  departmentId: ulid.nullable(),
  hireDate: z.string(),
  status: employmentStatus,
  /** `"SAR 8,500"` — formatted from `salaryHalalas` at the boundary. */
  salary: z.string().nullable(),
  /** Sensitive: nulled on the wire for a role the `Employee salary` rule hides
   *  it from. Nullable so a redacted payload still validates. */
  salaryHalalas: z.number().int().min(0).nullable(),
})
export type EmployeeRow = z.infer<typeof employeeRow>

/* ----------------------------------------------------------- payroll runs */

/** Creating a run names only its period; the totals start at zero and are
 *  frozen from the lines when the run is posted. A run is created `draft`. */
export const payrollRunCreate = z.object({
  period: payrollPeriod,
})
export type PayrollRunCreate = z.infer<typeof payrollRunCreate>

/** The only thing editable on a draft run is its period — the status moves by
 *  the `/post` action, never by a generic patch, and a posted run is frozen. */
export const payrollRunUpdate = z.object({
  period: payrollPeriod.optional(),
})
export type PayrollRunUpdate = z.infer<typeof payrollRunUpdate>

export const payrollRunRow = appRow({
  period: z.string(),
  status: payrollRunStatus,
  grossPay: z.string().nullable(),
  grossPayHalalas: z.number().int().min(0).nullable(),
  allowances: z.string().nullable(),
  allowancesHalalas: z.number().int().min(0).nullable(),
  deductions: z.string().nullable(),
  deductionsHalalas: z.number().int().min(0).nullable(),
  netPay: z.string().nullable(),
  netPayHalalas: z.number().int().min(0).nullable(),
  lineCount: z.number().int().min(0),
  postedAt: z.string().nullable(),
})
export type PayrollRunRow = z.infer<typeof payrollRunRow>

/* ---------------------------------------------------------- payroll lines */

/** A line names its run, its employee and the three inputs; the net is computed
 *  on the server as `gross + allowances − deductions`, never sent. */
export const payrollLineCreate = z.object({
  payrollRunId: ulid,
  employeeId: ulid,
  grossHalalas: halalas,
  allowancesHalalas: halalas.optional(),
  deductionsHalalas: halalas.optional(),
})
export type PayrollLineCreate = z.infer<typeof payrollLineCreate>

export const payrollLineUpdate = z
  .object({
    grossHalalas: halalas.optional(),
    allowancesHalalas: halalas.optional(),
    deductionsHalalas: halalas.optional(),
  })
export type PayrollLineUpdate = z.infer<typeof payrollLineUpdate>

export const payrollLineRow = appRow({
  payrollRunId: ulid,
  employeeId: ulid,
  employeeName: z.string(),
  grossPay: z.string().nullable(),
  grossPayHalalas: z.number().int().min(0).nullable(),
  allowances: z.string().nullable(),
  allowancesHalalas: z.number().int().min(0).nullable(),
  deductions: z.string().nullable(),
  deductionsHalalas: z.number().int().min(0).nullable(),
  netPay: z.string().nullable(),
  netPayHalalas: z.number().int().min(0).nullable(),
})
export type PayrollLineRow = z.infer<typeof payrollLineRow>

/* ------------------------------------------------------------- timesheets */

export const timesheetCreate = z.object({
  employeeId: ulid,
  workDate: isoDate,
  /** `HH:MM`, optional when hours are recorded directly. */
  clockIn: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  clockOut: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  /** Whole worked minutes — integer, so no fractional-hour float. */
  minutes: z.number().int().min(0).max(24 * 60),
  status: timesheetStatus.optional(),
})
export type TimesheetCreate = z.infer<typeof timesheetCreate>

export const timesheetUpdate = timesheetCreate.partial().omit({ employeeId: true })
export type TimesheetUpdate = z.infer<typeof timesheetUpdate>

export const timesheetRow = appRow({
  employeeId: ulid,
  employeeName: z.string(),
  workDate: z.string(),
  clockIn: z.string().nullable(),
  clockOut: z.string().nullable(),
  minutes: z.number().int().min(0),
  /** Worked minutes as decimal hours, for display only. */
  hours: z.number(),
  status: timesheetStatus,
})
export type TimesheetRow = z.infer<typeof timesheetRow>

/* --------------------------------------------------------- leave requests */

export const leaveRequestCreate = z.object({
  employeeId: ulid,
  type: leaveType,
  startDate: isoDate,
  endDate: isoDate,
  days: z.number().int().min(1).max(366),
  reason: z.string().max(500).optional(),
})
export type LeaveRequestCreate = z.infer<typeof leaveRequestCreate>

export const leaveRequestUpdate = leaveRequestCreate.partial().omit({ employeeId: true })
export type LeaveRequestUpdate = z.infer<typeof leaveRequestUpdate>

/** Approving or rejecting a leave request. A rejection must say why; the reason
 *  is optional on approval. */
export const leaveDecisionBody = z.object({
  reason: z.string().max(500).optional(),
})
export type LeaveDecisionBody = z.infer<typeof leaveDecisionBody>

export const leaveRequestRow = appRow({
  employeeId: ulid,
  employeeName: z.string(),
  type: leaveType,
  startDate: z.string(),
  endDate: z.string(),
  days: z.number().int().min(0),
  status: leaveStatus,
  reason: z.string().nullable(),
  /** Who decided — the segregation-of-duties record, like the estimate. */
  approverId: ulid.nullable(),
})
export type LeaveRequestRow = z.infer<typeof leaveRequestRow>
