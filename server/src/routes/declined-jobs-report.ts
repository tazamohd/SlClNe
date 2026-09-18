/** Server-computed declined-job analytics — GET /reports/declined-jobs.
 *
 *  Same §A10 discipline the workshop and finance reports hold: lost revenue,
 *  recovered revenue, decline-reason mix and advisor conversion are summed in
 *  SQL over the whole tenant scope, inside the RLS transaction — never handed
 *  to a client to total from a page of rows.
 *
 *  "Lost" is every job still in an active decline state (`declined`,
 *  `follow_up_scheduled`, `contacted`, `reconsidering`) — money the shop has
 *  not collected and has not given up on either. "Recovered" is
 *  `approved_later`: a customer who said no and then said yes. The two are
 *  never summed together; a shop wants to know both, not their difference.
 */
import { sql, type SQL } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { declinedJobs } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { Database } from '../db/client'
import type { Env } from '../env'

export interface DeclinedJobsReportDeps {
  db: Database
  env: Env
}

const ACTIVE_STATUSES = sql`('declined','follow_up_scheduled','contacted','reconsidering')`
const RESOLVED_STATUSES = sql`('approved_later','permanently_declined','expired')`

async function rows<T>(tx: Tx, query: SQL): Promise<T[]> {
  return (await tx.execute(query)) as unknown as T[]
}

/** The driver returns bigint/numeric sums as strings and counts as numbers. */
function num(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

export function registerDeclinedJobsReportRoutes(app: FastifyInstance, deps: DeclinedJobsReportDeps): void {
  /* Gated on `estimates:v` — the module declined jobs are tracked under
   * (`registry.ts`). Every role that reads estimates reads their conversion
   * outcome. */
  app.get('/reports/declined-jobs', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const [lost] = await rows<{ total: string | null }>(
        tx,
        sql`select coalesce(sum(${declinedJobs.valueHalalas}), 0) as total from ${declinedJobs}
            where ${declinedJobs.deletedAt} is null and ${declinedJobs.status} in ${ACTIVE_STATUSES}`,
      )
      const [recovered] = await rows<{ total: string | null }>(
        tx,
        sql`select coalesce(sum(${declinedJobs.valueHalalas}), 0) as total from ${declinedJobs}
            where ${declinedJobs.deletedAt} is null and ${declinedJobs.status} = 'approved_later'`,
      )
      const [openCount] = await rows<{ count: number }>(
        tx,
        sql`select count(*)::int as count from ${declinedJobs}
            where ${declinedJobs.deletedAt} is null and ${declinedJobs.status} in ${ACTIVE_STATUSES}`,
      )
      const [resolvedCount] = await rows<{ count: number }>(
        tx,
        sql`select count(*)::int as count from ${declinedJobs}
            where ${declinedJobs.deletedAt} is null and ${declinedJobs.status} in ${RESOLVED_STATUSES}`,
      )
      const byReason = await rows<{ reason: string; count: number; total: string | null }>(
        tx,
        sql`select ${declinedJobs.reasonCategory} as reason, count(*)::int as count,
              coalesce(sum(${declinedJobs.valueHalalas}), 0) as total
            from ${declinedJobs}
            where ${declinedJobs.deletedAt} is null
            group by ${declinedJobs.reasonCategory} order by ${declinedJobs.reasonCategory}`,
      )
      const byAdvisor = await rows<{
        advisorId: string | null
        declinedCount: number
        recoveredCount: number
        recoveredTotal: string | null
      }>(
        tx,
        sql`select ${declinedJobs.advisorId} as "advisorId", count(*)::int as "declinedCount",
              count(*) filter (where ${declinedJobs.status} = 'approved_later')::int as "recoveredCount",
              coalesce(sum(${declinedJobs.valueHalalas}) filter (where ${declinedJobs.status} = 'approved_later'), 0) as "recoveredTotal"
            from ${declinedJobs}
            where ${declinedJobs.deletedAt} is null
            group by ${declinedJobs.advisorId} order by "declinedCount" desc`,
      )

      return {
        lostRevenueHalalas: num(lost?.total),
        recoveredRevenueHalalas: num(recovered?.total),
        openCount: num(openCount?.count),
        resolvedCount: num(resolvedCount?.count),
        byReason: byReason.map((r) => ({ reason: r.reason, count: num(r.count), valueHalalas: num(r.total) })),
        byAdvisor: byAdvisor.map((a) => ({
          advisorId: a.advisorId,
          declinedCount: num(a.declinedCount),
          recoveredCount: num(a.recoveredCount),
          recoveredHalalas: num(a.recoveredTotal),
        })),
      }
    })
  })
}
