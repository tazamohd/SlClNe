/** Payroll posting: freeze a draft run's totals from its lines.
 *
 *  The `payrollRuns` and `payrollLines` collections are writable through the
 *  generic router while a run is a draft (registry.ts / writers.ts). The one
 *  transition that is not a plain edit lives here:
 *
 *   - post — POST /payroll/runs/:id/post   draft → posted
 *
 *  Posting sums the run's lines (gross, allowances, deductions, net — every
 *  figure integer halalas, the sums computed in SQL over the tenant), writes
 *  them onto the run, stamps `posted_at`/`posted_by`, and moves the status to
 *  `posted`. **A posted run cannot be reopened or edited** (§5b invariant):
 *  posting again is refused here, and the writers refuse edits to a posted run
 *  or its lines. The transition is audited.
 *
 *  Gated on `hr:e` — the edit grant owner and the HR manager hold; posting is
 *  the act of committing the month's payroll, an edit of the run, not an
 *  approval against a ceiling.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { writeAudit } from '../audit/audit'
import { payrollLines, payrollRuns } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { conflict, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

const PAYROLL_MODULE = 'hr'

function runDef() {
  const found = collectionByKey('payrollRuns')
  if (!found) throw new Error('collection "payrollRuns" is not registered')
  return found
}

export function registerPayrollRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.post('/payroll/runs/:id/post', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, PAYROLL_MODULE, 'e')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadRun(tx, id, { forUpdate: true })
      /* The invariant: a run posts exactly once. A second post — or any attempt
       * to reopen — is refused rather than silently recomputing frozen totals. */
      if (before.status === 'posted') {
        throw conflict('This payroll run is already posted and cannot be reopened.')
      }
      if (before.status !== 'draft') {
        throw conflict(`A ${before.status} payroll run cannot be posted.`)
      }

      /* Totals are the column sums of the run's live lines, in SQL over the
       * tenant — integer halalas throughout, no client-supplied figure. */
      const [totals] = await tx
        .select({
          gross: sql<string>`coalesce(sum(${payrollLines.grossHalalas}), 0)`,
          allowances: sql<string>`coalesce(sum(${payrollLines.allowancesHalalas}), 0)`,
          deductions: sql<string>`coalesce(sum(${payrollLines.deductionsHalalas}), 0)`,
          net: sql<string>`coalesce(sum(${payrollLines.netHalalas}), 0)`,
        })
        .from(payrollLines)
        .where(and(eq(payrollLines.payrollRunId, before.id), isNull(payrollLines.deletedAt)))

      const grossHalalas = Number(totals?.gross ?? 0)
      const allowancesHalalas = Number(totals?.allowances ?? 0)
      const deductionsHalalas = Number(totals?.deductions ?? 0)
      const netHalalas = Number(totals?.net ?? 0)

      const [after] = await tx
        .update(payrollRuns)
        .set({
          status: 'posted',
          grossHalalas,
          allowancesHalalas,
          deductionsHalalas,
          netHalalas,
          postedAt: sql`now()`,
          postedBy: principal.userId,
          updatedBy: principal.userId,
        })
        .where(and(eq(payrollRuns.id, before.id), eq(payrollRuns.version, before.version)))
        .returning()
      if (!after) throw conflict('This payroll run changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'post',
        entity: 'payroll_run',
        entityId: after.id,
        before: { status: before.status, netHalalas: before.netHalalas },
        after: { status: after.status, netHalalas: after.netHalalas },
        reason: `payroll ${after.period} posted`,
        ...metaOf(request),
      })
      return presentRow(runDef(), principal, after as Record<string, unknown>)
    })
  })
}

type RunRow = typeof payrollRuns.$inferSelect

async function loadRun(tx: Tx, ref: string, options: { forUpdate?: boolean } = {}): Promise<RunRow> {
  const base = tx
    .select()
    .from(payrollRuns)
    .where(
      and(
        isNull(payrollRuns.deletedAt),
        sql`(${payrollRuns.id} = ${ref} or ${payrollRuns.period} = ${ref})`,
      ),
    )
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Payroll run')
  return row
}
