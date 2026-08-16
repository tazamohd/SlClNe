/** Financial-product aggregates — the source the Insurance and Loan reports read.
 *
 *  The same discipline as the accounting aggregates (`routes/finance-reports.ts`):
 *  every total is computed in SQL over the whole tenant scope inside the request's
 *  RLS transaction, never over a page the client holds, and money stays integer
 *  halalas — nothing here divides by 100.
 *
 *  Gated on `accounting:v` — the RBAC matrix has no `insurance`/`loans` module,
 *  and `accounting` is the module the Insurance/Loan report consumers (accountant,
 *  owner, manager, superadmin) hold view on. These endpoints exist so the report
 *  screens (agent 13) have a real source; this slice does not build those screens.
 */
import { sql, type SQL } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { insuranceClaims, loanContracts, loanRepayments } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import type { RouteDeps } from './collections'

async function rows<T>(tx: Tx, query: SQL): Promise<T[]> {
  return (await tx.execute(query)) as unknown as T[]
}

/** The driver returns bigint sums as strings and counts as numbers; both come
 *  back here as a plain number of halalas. A null (no rows) reads as zero. */
function num(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

export function registerProductReportRoutes(app: FastifyInstance, deps: RouteDeps): void {
  /* ------------------------------------------- GET /insurance/claims/summary
   * Claim totals by status — count, amount claimed and amount approved — over
   * every claim in the tenant scope. What the Insurance report shows. */
  app.get('/insurance/claims/summary', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'accounting', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const [totals] = await rows<{
        count: number
        claimed: number
        approved: number
        paid: number
      }>(tx, sql`
        select
          count(*)::int                                                          as count,
          coalesce(sum(${insuranceClaims.amountClaimedHalalas}), 0)::bigint      as claimed,
          coalesce(sum(${insuranceClaims.amountApprovedHalalas}), 0)::bigint     as approved,
          coalesce(sum(${insuranceClaims.amountApprovedHalalas})
            filter (where ${insuranceClaims.status} = 'paid'), 0)::bigint        as paid
        from ${insuranceClaims}
        where ${insuranceClaims.deletedAt} is null
      `)

      const byStatus = await rows<{
        status: string
        count: number
        claimed: number
        approved: number
      }>(tx, sql`
        select
          ${insuranceClaims.status}                                             as status,
          count(*)::int                                                         as count,
          coalesce(sum(${insuranceClaims.amountClaimedHalalas}), 0)::bigint     as claimed,
          coalesce(sum(${insuranceClaims.amountApprovedHalalas}), 0)::bigint    as approved
        from ${insuranceClaims}
        where ${insuranceClaims.deletedAt} is null
        group by ${insuranceClaims.status}
        order by ${insuranceClaims.status}
      `)

      return {
        count: num(totals?.count),
        claimedHalalas: num(totals?.claimed),
        approvedHalalas: num(totals?.approved),
        paidHalalas: num(totals?.paid),
        byStatus: byStatus.map((r) => ({
          status: r.status,
          count: num(r.count),
          claimedHalalas: num(r.claimed),
          approvedHalalas: num(r.approved),
        })),
      }
    })
  })

  /* --------------------------------------------------------- GET /loans/summary
   * Loan outstanding across the portfolio: financed principal, the amortised
   * instalment total, amount collected and amount still owed — the outstanding
   * being the sum of the unpaid portion of every scheduled repayment, computed in
   * SQL so the client never adds up a page. What the Loan report shows. */
  app.get('/loans/summary', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'accounting', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const [contracts] = await rows<{
        count: number
        principal: number
        instalment: number
      }>(tx, sql`
        select
          count(*)::int                                                          as count,
          coalesce(sum(${loanContracts.principalHalalas}), 0)::bigint            as principal,
          coalesce(sum(${loanContracts.monthlyInstalmentHalalas}), 0)::bigint    as instalment
        from ${loanContracts}
        where ${loanContracts.deletedAt} is null
      `)

      const [repayments] = await rows<{
        due: number
        paid: number
        outstanding: number
        overdue: number
      }>(tx, sql`
        select
          coalesce(sum(${loanRepayments.amountDueHalalas}), 0)::bigint           as due,
          coalesce(sum(${loanRepayments.amountPaidHalalas}), 0)::bigint          as paid,
          coalesce(sum(${loanRepayments.amountDueHalalas} - ${loanRepayments.amountPaidHalalas}), 0)::bigint as outstanding,
          coalesce(sum(${loanRepayments.amountDueHalalas} - ${loanRepayments.amountPaidHalalas})
            filter (where ${loanRepayments.status} = 'overdue'), 0)::bigint      as overdue
        from ${loanRepayments}
        where ${loanRepayments.deletedAt} is null
      `)

      const byStatus = await rows<{ status: string; count: number; principal: number }>(tx, sql`
        select
          ${loanContracts.status}                                               as status,
          count(*)::int                                                         as count,
          coalesce(sum(${loanContracts.principalHalalas}), 0)::bigint           as principal
        from ${loanContracts}
        where ${loanContracts.deletedAt} is null
        group by ${loanContracts.status}
        order by ${loanContracts.status}
      `)

      return {
        contractCount: num(contracts?.count),
        principalHalalas: num(contracts?.principal),
        monthlyInstalmentHalalas: num(contracts?.instalment),
        scheduledHalalas: num(repayments?.due),
        collectedHalalas: num(repayments?.paid),
        outstandingHalalas: num(repayments?.outstanding),
        overdueHalalas: num(repayments?.overdue),
        byStatus: byStatus.map((r) => ({
          status: r.status,
          count: num(r.count),
          principalHalalas: num(r.principal),
        })),
      }
    })
  })
}
