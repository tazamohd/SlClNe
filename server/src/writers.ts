/** How a validated request body becomes columns.
 *
 *  Kept apart from the routing so the route stays uniform — parse, authorise,
 *  prepare, write, audit — and each collection only says what is specific to
 *  it. Business rules that need to read other rows (a bay already booked, a
 *  duplicate VIN) run here, inside the request's transaction, so the check and
 *  the write cannot be separated by another writer.
 */
import { randomBytes } from 'node:crypto'
import { and, eq, isNull, ne } from 'drizzle-orm'
import { z } from 'zod'
import {
  appointmentCreate,
  appointmentUpdate,
  crmTaskCreate,
  crmTaskUpdate,
  customerCreate,
  customerUpdate,
  feedbackCreate,
  feedbackUpdate,
  fleetCreate,
  fleetUpdate,
  jobCardCreate,
  jobCardUpdate,
  leadCreate,
  leadUpdate,
  minuteOfDay,
  opportunityCreate,
  opportunityUpdate,
  partCreate,
  partUpdate,
  savedReportCreate,
  savedReportUpdate,
  vehicleCreate,
  vehicleUpdate,
} from '@salis/contract'
import { checkBayFree } from '@salis/contract/rules'
import { appointments } from './db/schema'
import { ruleViolated } from './http/errors'
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
}

/** The eight-character code the job board shows. Random rather than sequential
 *  so one tenant's volume is not readable from another's job numbers. */
function jobCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}
