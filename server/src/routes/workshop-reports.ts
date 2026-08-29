/** Server-computed workshop analytics — GET /reports/workshop (F-029).
 *
 *  The operational mirror of the §A10 discipline the finance reports hold: an
 *  operational metric is summed in SQL over the whole tenant scope, inside the
 *  RLS transaction, never handed to the client to compute from a page of rows.
 *  A QC pass rate a browser derives from the jobs it happens to hold is the
 *  pass rate of one page, which is worse than no figure because it looks like
 *  one.
 *
 *  What it computes:
 *   - job counts by status, by stage, and the service mix, over `job_cards`;
 *   - the QC pass rate, read from the audit trail — a `qc → delivery` transition
 *     is a pass, any other move out of `qc` (sent back to repair) is a rework;
 *   - bay time, from the booked appointment durations;
 *   - technician hours, from the appointments grouped by technician;
 *   - the diagnostic-report total.
 *
 *  The diagnostic-report total lives HERE, not on the estimate, and deliberately.
 *  §5b forbids a client-side VAT / grand-total, so it must be server-computed —
 *  but the `diag_*` tables carry no estimate or report foreign key (they are the
 *  flat fixtures of the one report the design depicts), so there is no estimate
 *  to hang it on. It is a diagnostics aggregate, and it belongs with the other
 *  diagnostics analytics. The subtotal is summed in SQL; VAT is applied at the
 *  configured rate (§A37) in integer halalas, the same rate the invoice totals
 *  charge at, so the figure names the rate it was computed under.
 */
import { sql, type SQL } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { appointments, auditLog, diagLabour, diagParts, jobCards } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { Database } from '../db/client'
import type { Env } from '../env'

export interface WorkshopReportDeps {
  db: Database
  env: Env
}

async function rows<T>(tx: Tx, query: SQL): Promise<T[]> {
  return (await tx.execute(query)) as unknown as T[]
}

/** The driver returns bigint/numeric sums as strings and counts as numbers. */
function num(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

export function registerWorkshopReportRoutes(app: FastifyInstance, deps: WorkshopReportDeps): void {
  /* Gated on `jobcards:v` — the module the workshop board and its analytics live
   * under. Every operating role that sees the board sees its totals. */
  app.get('/reports/workshop', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const [jobTotals] = await rows<{ total: number }>(
        tx,
        sql`select count(*)::int as total from ${jobCards} where ${jobCards.deletedAt} is null`,
      )

      const byStatus = await rows<{ key: string; count: number }>(
        tx,
        sql`select ${jobCards.status} as key, count(*)::int as count from ${jobCards}
            where ${jobCards.deletedAt} is null group by ${jobCards.status} order by ${jobCards.status}`,
      )
      const byStage = await rows<{ key: string; count: number }>(
        tx,
        sql`select ${jobCards.stage} as key, count(*)::int as count from ${jobCards}
            where ${jobCards.deletedAt} is null group by ${jobCards.stage} order by ${jobCards.stage}`,
      )
      const serviceMix = await rows<{ key: string; count: number }>(
        tx,
        sql`select ${jobCards.service} as key, count(*)::int as count from ${jobCards}
            where ${jobCards.deletedAt} is null group by ${jobCards.service} order by count(*) desc`,
      )

      /* QC pass rate from the audit trail. A move out of the qc stage is a
       * decision; landing in delivery is a pass, anything else (back to repair)
       * is a rework. Read over the append-only log, so it is a real rate and not
       * a snapshot the current stages happen to imply. */
      const [qc] = await rows<{ decisions: number; passes: number; reworks: number }>(
        tx,
        sql`
          select
            count(*) filter (where ${auditLog.before}->>'stage' = 'qc')::int as decisions,
            count(*) filter (where ${auditLog.before}->>'stage' = 'qc' and ${auditLog.after}->>'stage' = 'delivery')::int as passes,
            count(*) filter (where ${auditLog.before}->>'stage' = 'qc' and ${auditLog.after}->>'stage' <> 'delivery')::int as reworks
          from ${auditLog}
          where ${auditLog.entity} = 'job_card' and ${auditLog.action} = 'transition'
        `,
      )
      const decisions = num(qc?.decisions)
      const passes = num(qc?.passes)

      /* Bay time from the booked appointment durations. */
      const [bay] = await rows<{ appointments: number; total_mins: number; avg_mins: number }>(
        tx,
        sql`
          select
            count(*)::int as appointments,
            coalesce(sum(${appointments.durationMins}), 0)::bigint as total_mins,
            coalesce(round(avg(${appointments.durationMins})), 0)::bigint as avg_mins
          from ${appointments}
          where ${appointments.deletedAt} is null
        `,
      )

      /* Technician hours, from the appointments grouped by the assigned
       * technician. Bay minutes → hours to one decimal, computed here so the
       * client renders a figure it never divided. */
      const techs = await rows<{ technician_id: string; name: string; appts: number; mins: number }>(
        tx,
        sql`
          select
            ${appointments.technicianId} as technician_id,
            max(${appointments.technicianName}) as name,
            count(*)::int as appts,
            coalesce(sum(${appointments.durationMins}), 0)::bigint as mins
          from ${appointments}
          where ${appointments.deletedAt} is null and ${appointments.technicianId} is not null
          group by ${appointments.technicianId}
          order by mins desc
        `,
      )

      /* The diagnostic-report subtotal, summed in SQL, then VAT at the
       * configured rate — integer halalas throughout (§5b, §A37). */
      const [parts] = await rows<{ subtotal: number }>(
        tx,
        sql`select coalesce(round(sum(${diagParts.qty} * ${diagParts.priceHalalas})), 0)::bigint as subtotal
            from ${diagParts} where ${diagParts.deletedAt} is null`,
      )
      const [labour] = await rows<{ subtotal: number }>(
        tx,
        sql`select coalesce(round(sum(${diagLabour.hours} * ${diagLabour.rateHalalas})), 0)::bigint as subtotal
            from ${diagLabour} where ${diagLabour.deletedAt} is null`,
      )
      const diagSubtotal = num(parts?.subtotal) + num(labour?.subtotal)
      const rateBps = deps.env.VAT_RATE_BPS
      const diagTax = Math.round((diagSubtotal * rateBps) / 10_000)

      return {
        jobs: {
          total: num(jobTotals?.total),
          byStatus: byStatus.map((r) => ({ status: r.key, count: num(r.count) })),
          byStage: byStage.map((r) => ({ stage: r.key, count: num(r.count) })),
          serviceMix: serviceMix.map((r) => ({ service: r.key, count: num(r.count) })),
        },
        qc: {
          decisions,
          passes,
          reworks: num(qc?.reworks),
          /* Null, not zero, when nothing has been through QC — a rate over no
           * decisions is undefined, and a fabricated 0% would read as failure. */
          passRatePct: decisions === 0 ? null : Math.round((passes / decisions) * 100),
        },
        bay: {
          appointments: num(bay?.appointments),
          totalBayMinutes: num(bay?.total_mins),
          averageBayMinutes: num(bay?.avg_mins),
        },
        technicians: techs.map((r) => ({
          technicianId: r.technician_id,
          name: r.name ?? '',
          appointments: num(r.appts),
          bayMinutes: num(r.mins),
          hours: Math.round((num(r.mins) / 60) * 10) / 10,
        })),
        diagnostics: {
          rateBps,
          subtotalHalalas: diagSubtotal,
          taxHalalas: diagTax,
          totalHalalas: diagSubtotal + diagTax,
        },
      }
    })
  })
}
