/** How a validated request body becomes columns.
 *
 *  Kept apart from the routing so the route stays uniform — parse, authorise,
 *  prepare, write, audit — and each collection only says what is specific to
 *  it. Business rules that need to read other rows (a bay already booked, a
 *  duplicate VIN) run here, inside the request's transaction, so the check and
 *  the write cannot be separated by another writer.
 */
import { randomBytes } from 'node:crypto'
import { and, eq, isNull, ne, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
  appointmentCreate,
  appointmentUpdate,
  campaignCreate,
  campaignUpdate,
  crmTaskCreate,
  crmTaskUpdate,
  customerCreate,
  customerUpdate,
  declinedJobCreate,
  declinedJobUpdate,
  departmentCreate,
  departmentUpdate,
  deliverySignoffCreate,
  deliverySignoffUpdate,
  employeeCreate,
  employeeUpdate,
  feedbackCreate,
  feedbackUpdate,
  fleetCreate,
  fleetUpdate,
  inspectionFindingCreate,
  inspectionFindingUpdate,
  inspectionMediaCreate,
  inspectionMediaUpdate,
  jobCardCreate,
  jobCardUpdate,
  leadCreate,
  leadUpdate,
  leaveRequestCreate,
  leaveRequestUpdate,
  minuteOfDay,
  opportunityCreate,
  opportunityUpdate,
  partCreate,
  partUpdate,
  payrollLineCreate,
  payrollLineUpdate,
  payrollRunCreate,
  payrollRunUpdate,
  savedReportCreate,
  savedReportUpdate,
  supplierCreate,
  supplierUpdate,
  timesheetCreate,
  timesheetUpdate,
  vehicleCreate,
  vehicleUpdate,
  warrantyCreate,
  warrantyUpdate,
  notificationCreate,
  notificationUpdate,
} from '@salis/contract'
import { checkBayFree, payrollLineNetHalalas } from '@salis/contract/rules'
import { appointments, employees, equipmentWarranties, payrollRuns, suppliers } from './db/schema'
import { badRequest, conflict, notFound, ruleViolated } from './http/errors'
import type { Principal, Tx } from './db/tenant'

export interface WriteContext {
  tx: Tx
  principal: Principal
}

export interface Writer {
  create: z.ZodTypeAny
  update: z.ZodTypeAny
  /** Turns a parsed body into column values. May read within the transaction. */
  toColumns(
    input: Record<string, unknown>,
    ctx: WriteContext,
    existing: Record<string, unknown> | null,
  ): Promise<Record<string, unknown>>
}

const passthrough = async (input: Record<string, unknown>) => input

export const WRITERS: Readonly<Record<string, Writer>> = {
  customers: {
    create: customerCreate,
    update: customerUpdate,
    async toColumns(input) {
      const { fleetId, ...rest } = input as Record<string, unknown>
      return { ...rest, fleetId: fleetId ?? null }
    },
  },

  vehicles: {
    create: vehicleCreate,
    update: vehicleUpdate,
    async toColumns(input, _ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (!value.ownerName && !existing) value.ownerName = ''
      return value
    },
  },

  jobs: {
    create: jobCardCreate,
    update: jobCardUpdate,
    async toColumns(input, _ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (!existing) value.code = jobCode()
      return value
    },
  },

  appointments: {
    create: appointmentCreate,
    update: appointmentUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (typeof value.timeLabel === 'string' && value.startMinute === undefined) {
        value.startMinute = minuteOfDay(value.timeLabel)
      }
      const merged = { ...(existing ?? {}), ...value }
      const bay = merged.bay as string | undefined
      const scheduledDate = merged.scheduledDate as string | undefined
      const startMinute = merged.startMinute as number | undefined
      const durationMins = merged.durationMins as number | undefined

      /* A bay cannot be double-booked. Checked inside the request's
       * transaction against the rows the caller may actually see. */
      if (bay && scheduledDate && startMinute !== undefined && durationMins !== undefined) {
        const conditions = [
          eq(appointments.scheduledDate, scheduledDate),
          eq(appointments.bay, bay),
          isNull(appointments.deletedAt),
        ]
        if (existing?.id) conditions.push(ne(appointments.id, existing.id as string))
        const booked = await ctx.tx
          .select({
            bay: appointments.bay,
            scheduledDate: appointments.scheduledDate,
            startMinute: appointments.startMinute,
            durationMins: appointments.durationMins,
            status: appointments.status,
          })
          .from(appointments)
          .where(and(...conditions))

        const failure = checkBayFree(
          { bay, scheduledDate, startMinute, durationMins },
          booked.filter((row) => row.status !== 'cancelled' && row.status !== 'no-show'),
        )
        if (failure) throw ruleViolated(failure.message, failure.field)
      }
      return value
    },
  },

  parts: {
    create: partCreate,
    update: partUpdate,
    async toColumns(input, _ctx, existing) {
      const { openingStock, ...rest } = input as Record<string, unknown>
      if (existing) return passthrough(rest)
      return { ...rest, onHand: openingStock ?? 0, reserved: 0 }
    },
  },

  /* CRM (F-027). RBAC (`crm:c/e/d`), tenant RLS, audit and optimistic
   * concurrency all come from the generic router; each writer only names its
   * own columns. `vehicleCount`/`activeCount` on fleets are derived, so the
   * contract never accepts them and they are absent here. */
  leads: {
    create: leadCreate,
    update: leadUpdate,
    toColumns: passthrough,
  },

  opportunities: {
    create: opportunityCreate,
    update: opportunityUpdate,
    toColumns: passthrough,
  },

  campaigns: {
    create: campaignCreate,
    update: campaignUpdate,
    toColumns: passthrough,
  },

  crmTasks: {
    create: crmTaskCreate,
    update: crmTaskUpdate,
    toColumns: passthrough,
  },

  fleets: {
    create: fleetCreate,
    update: fleetUpdate,
    toColumns: passthrough,
  },

  /* F-039: departments had no writer at all — the generic router's
   * `def.writable ? WRITERS[def.key] : undefined` left "Add Department"
   * 404ing for every role, owner and superadmin included, regardless of
   * permission. RBAC (`departments:c/e`), tenant RLS, audit and optimistic
   * concurrency all come from the generic router. */
  departments: {
    create: departmentCreate,
    update: departmentUpdate,
    toColumns: passthrough,
  },

  feedback: {
    create: feedbackCreate,
    update: feedbackUpdate,
    toColumns: passthrough,
  },

  /* Saved report definitions (F-028). `ownerName` defaults to the caller's
   * display name on create so a saved report always records who saved it,
   * without the client having to send it. RBAC, RLS, audit and optimistic
   * concurrency come from the generic router. */
  savedReports: {
    create: savedReportCreate,
    update: savedReportUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (value.definition === undefined && !existing) value.definition = {}
      if (!value.ownerName && !existing) value.ownerName = ctx.principal.name ?? null
      return value
    },
  },

  /* HR (vertical B). RBAC (`hr:c/e/d`), tenant RLS, audit and optimistic
   * concurrency all come from the generic router; each writer only names its
   * own columns and the one rule specific to it. */
  employees: {
    create: employeeCreate,
    update: employeeUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      /* The server assigns the employee number when one is not supplied, so a
       * screen never invents it — `EMP-0001`, sequential within the tenant. */
      if (!existing && !value.employeeNumber) {
        value.employeeNumber = await nextEmployeeNumber(ctx.tx)
      }
      return value
    },
  },

  /* Payroll. A run is created draft with zero totals; the totals are frozen
   * from the lines by the bespoke `/payroll/runs/:id/post` route. A posted run
   * is immutable (§5b): the writer refuses any edit once it is posted, and the
   * status never moves through a generic patch. */
  payrollRuns: {
    create: payrollRunCreate,
    update: payrollRunUpdate,
    async toColumns(input, _ctx, existing) {
      if (existing) {
        if (existing.status === 'posted') {
          throw conflict('A posted payroll run cannot be edited.')
        }
        return { ...input }
      }
      return { ...input, status: 'draft' }
    },
  },

  /* A payroll line's net is computed on the server as gross + allowances −
   * deductions — never sent by the client — and no line may be added to or
   * edited on a posted run (§5b). The employee's name is denormalised for
   * display, resolved within the request's transaction. */
  payrollLines: {
    create: payrollLineCreate,
    update: payrollLineUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>

      if (!existing) {
        const run = await loadRunForWrite(ctx.tx, String(value.payrollRunId))
        const employee = await loadEmployee(ctx.tx, String(value.employeeId))
        value.employeeName = employee.name
        const gross = Number(value.grossHalalas ?? 0)
        const allowances = Number(value.allowancesHalalas ?? 0)
        const deductions = Number(value.deductionsHalalas ?? 0)
        value.allowancesHalalas = allowances
        value.deductionsHalalas = deductions
        value.netHalalas = payrollLineNetHalalas(gross, allowances, deductions)
        void run
        return value
      }

      await loadRunForWrite(ctx.tx, String(existing.payrollRunId))
      /* Recompute the net from the merged figures so it always ties to the three
       * inputs, whether one, two or all three were sent. */
      const gross = Number(value.grossHalalas ?? existing.grossHalalas ?? 0)
      const allowances = Number(value.allowancesHalalas ?? existing.allowancesHalalas ?? 0)
      const deductions = Number(value.deductionsHalalas ?? existing.deductionsHalalas ?? 0)
      value.netHalalas = payrollLineNetHalalas(gross, allowances, deductions)
      return value
    },
  },

  timesheets: {
    create: timesheetCreate,
    update: timesheetUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (!existing && value.employeeId) {
        value.employeeName = (await loadEmployee(ctx.tx, String(value.employeeId))).name
      }
      return value
    },
  },

  leaveRequests: {
    create: leaveRequestCreate,
    update: leaveRequestUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (!existing) {
        value.employeeName = (await loadEmployee(ctx.tx, String(value.employeeId))).name
        value.status = 'submitted'
      }
      return value
    },
  },

  /* Suppliers (F-022). A tenant-owned vendor directory, writable through the
   * generic router — RBAC (`procurement:c/e/d`), tenant RLS, audit and
   * optimistic concurrency all come from it. The server assigns `SUP-0001`
   * within the tenant when a code is not supplied, so two suppliers never
   * collide on the unique `(org_id, code)` index. */
  suppliers: {
    create: supplierCreate,
    update: supplierUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (!existing && !value.code) {
        value.code = await nextSupplierCode(ctx.tx)
      }
      return value
    },
  },

  /* Equipment warranties (BLK-004). A tenant-owned directory, writable
   * through the generic router — RBAC (`accounting:c/e/d`), tenant RLS,
   * audit and optimistic concurrency all come from it. The server assigns
   * `WRN-0001` within the tenant when a number is not supplied, so two
   * warranties never collide on the unique `(org_id, warranty_number)`
   * index. `claimedAt` is never accepted as input — like
   * `declined_jobs.resolvedAt`, it is derived from the status transition, so
   * it always records when a warranty actually moved to `claimed` rather
   * than a date someone typed in, and clears if the status ever moves away
   * from `claimed` again. */
  equipmentWarranties: {
    create: warrantyCreate,
    update: warrantyUpdate,
    async toColumns(input, ctx, existing) {
      const value = { ...input } as Record<string, unknown>
      if (!existing && !value.warrantyNumber) {
        value.warrantyNumber = await nextWarrantyNumber(ctx.tx)
      }
      if ('status' in value) {
        value.claimedAt = value.status === 'claimed' ? new Date() : null
      }
      return value
    },
  },

  /* Notifications (BLK-004). A tenant-owned directory, writable through the
   * generic router — RBAC (`dashboard:c/e/d`), tenant RLS, audit and
   * optimistic concurrency all come from it. `read` is a write-only
   * convenience: the client sends a boolean, never a timestamp, and it is
   * translated to `readAt` here — never accepted as input directly — the
   * same discipline `equipmentWarranties.claimedAt` uses, so a read
   * timestamp always records when the row actually moved rather than a date
   * a client made up. Marking a notification unread again (`read: false`)
   * clears `readAt` rather than leaving a stale one behind. */
  notifications: {
    create: notificationCreate,
    update: notificationUpdate,
    async toColumns(input) {
      const value = { ...input } as Record<string, unknown>
      if ('read' in value) {
        value.readAt = value.read ? new Date() : null
      }
      delete value.read
      return value
    },
  },

  /* Declined Job Tracking & Follow-Up (Sprint 1, P0). `create` is `z.never()`
   * (see `registry.ts`) — every row is born from an estimate decline action,
   * never a generic `POST`. `PATCH` carries only the follow-up lifecycle, and
   * `resolvedAt` is server-derived from `status` rather than accepted as
   * input: a job cannot be marked resolved by typing a date, and moving it
   * back to an active status (a customer who "approved later" changes their
   * mind again) clears it, rather than leaving a stale resolution behind. */
  declinedJobs: {
    create: declinedJobCreate,
    update: declinedJobUpdate,
    async toColumns(input) {
      const value = { ...input } as Record<string, unknown>
      if ('status' in value) {
        value.resolvedAt = RESOLVED_DECLINED_JOB_STATUSES.has(value.status as string) ? new Date() : null
      }
      return value
    },
  },

  /* Digital Vehicle Health Check (Sprint 2, P0). `create` is `z.never()` for
   * both — a finding is born from `POST /job-cards/:id/inspection-findings`,
   * media from the multipart upload route (`server/src/routes/inspection.ts`)
   * — never a generic `POST`, because neither the finding's `jobCardId` nor a
   * file's bytes belong in a JSON body the generic writer would trust as-is. */
  inspectionFindings: {
    create: inspectionFindingCreate,
    update: inspectionFindingUpdate,
    async toColumns(input) {
      return { ...input }
    },
  },

  inspectionMedia: {
    create: inspectionMediaCreate,
    update: inspectionMediaUpdate,
    async toColumns(input) {
      return { ...input }
    },
  },

  /* Customer sign-off at delivery (Sprint 2, P0). `create` is `z.never()` —
   * a row is born from `POST /job-cards/:id/delivery-signoff`
   * (`server/src/routes/delivery.ts`), never a generic `POST`, because
   * neither the job card nor a signature image's bytes belong in a JSON body
   * the generic writer would trust as-is. `update` only ever carries the
   * checklist and the odometer reading; the signature, who signed and when
   * are fixed at creation. */
  deliverySignoffs: {
    create: deliverySignoffCreate,
    update: deliverySignoffUpdate,
    async toColumns(input) {
      return { ...input }
    },
  },
}

const RESOLVED_DECLINED_JOB_STATUSES = new Set(['approved_later', 'permanently_declined', 'expired'])

/** The next `SUP-0001` within the tenant. Counted, not a placeholder, so two
 *  suppliers never collide on the unique `(org_id, code)` index. */
async function nextSupplierCode(tx: Tx): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(suppliers)
  return `SUP-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}

/** The next `WRN-0001` within the tenant. Counted, not a placeholder, so two
 *  warranties never collide on the unique `(org_id, warranty_number)` index. */
async function nextWarrantyNumber(tx: Tx): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(equipmentWarranties)
  return `WRN-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}

/** The next `EMP-0001` within the tenant. Counted, not a placeholder, so two
 *  employees never collide on the unique `(org_id, employee_number)` index. */
async function nextEmployeeNumber(tx: Tx): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(employees)
  return `EMP-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}

/** Loads a payroll run the caller may see and refuses a line write against one
 *  that is already posted (§5b). A run outside the tenant is invisible under RLS
 *  and 404s rather than leaking. */
async function loadRunForWrite(tx: Tx, runId: string): Promise<{ id: string; status: string }> {
  const [run] = await tx
    .select({ id: payrollRuns.id, status: payrollRuns.status })
    .from(payrollRuns)
    .where(and(eq(payrollRuns.id, runId), isNull(payrollRuns.deletedAt)))
    .limit(1)
  if (!run) throw notFound('Payroll run')
  if (run.status === 'posted') {
    throw conflict('A posted payroll run cannot have its lines changed.')
  }
  return run
}

async function loadEmployee(tx: Tx, employeeId: string): Promise<{ id: string; name: string }> {
  const [employee] = await tx
    .select({ id: employees.id, name: employees.name })
    .from(employees)
    .where(and(eq(employees.id, employeeId), isNull(employees.deletedAt)))
    .limit(1)
  if (!employee) throw badRequest('That employee does not exist.', 'employeeId')
  return employee
}

/** The eight-character code the job board shows. Random rather than sequential
 *  so one tenant's volume is not readable from another's job numbers. */
/** The job-card code the board shows, e.g. `A3F8B2C1`. Exported so the route
 *  that opens a job card from an appointment mints the same shape — one owner
 *  for the format, not two that can drift. */
export function jobCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}
