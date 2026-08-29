/** The unified approval queue — one read the ApprovalInbox operates on (F-029).
 *
 *  Before this, the inbox operated on estimates alone, by listing them and
 *  filtering client-side. That does not scale to the queue the design shows,
 *  which mixes estimates, purchase orders, journal postings and payroll runs.
 *  This endpoint aggregates them into one uniform shape.
 *
 *  Two design commitments make the later sources additive rather than breaking:
 *
 *  1. **Every row is the same `ApprovalItem`.** A `kind` discriminates the
 *     source, but the fields a screen renders — reference, title, amount,
 *     submitter, and the caller's approval standing — are the same for all of
 *     them. Adding purchase orders is adding rows, not a new response shape.
 *  2. **The approval standing is computed per caller.** Each row carries
 *     `amountHalalas` and `module`, which is exactly what the client's own
 *     `canApprove` needs, plus the server's honest answer (`canApprove`,
 *     `withinCeiling`, `isSubmitter`) so the two cannot disagree (F-002). The
 *     submitter of a document may not approve it (F-004 submitter half), so
 *     `isSubmitter` forces `canApprove` false even for an owner.
 *
 *  Gated on `approvals:v` — the module the ApprovalInbox declares. A source is
 *  only folded in when the caller also holds view on that source's own module,
 *  so an approver who may see the queue but not estimates sees no estimate rows
 *  rather than a leak.
 */
import { and, desc, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ModuleId } from '@salis/contract'
import { estimates } from '../db/schema'
import { withTenant, type Principal, type Tx } from '../db/tenant'
import { principalOf } from '../http/context'
import { sarString } from '../present'
import {
  ceilingHalalas,
  hasPermission,
  mayApprove,
  requirePermission,
} from '../security/permissions'
import type { RouteDeps } from './collections'

/** One pending decision, whatever it is a decision about. */
interface ApprovalItem {
  _id: string
  _version: number
  _createdAt: string
  _updatedAt: string
  /** The source discriminator. Estimates today; `purchase_order`, `journal` and
   *  `payroll` slot in beside it without changing the shape. */
  kind: 'estimate'
  /** The RBAC module the decision is gated on — what the client's `canApprove`
   *  reads, so the gate on the row is the gate the server would enforce. */
  module: ModuleId
  /** The record's ULID, for the approve/reject action. */
  entityId: string
  /** The human code the queue shows (`EST-0230`). */
  reference: string
  title: string
  customerName: string
  vehicleLabel: string
  amountHalalas: number
  amount: string
  submittedBy: string | null
  status: string
  submittedAt: string
  /** The caller's standing on this row. `canApprove` already folds in the
   *  ceiling and the submitter-may-not-approve rule, so a screen can enable the
   *  button from one boolean while still holding `amountHalalas`/`module` to
   *  explain a refusal. */
  approval: {
    canApprove: boolean
    ceilingHalalas: number | null
    withinCeiling: boolean
    isSubmitter: boolean
  }
}

/** Pending estimates for the caller's org, newest first. "Pending approval" is
 *  the `sent` state — raised and awaiting a decision; `draft` has not been put
 *  forward and `approved`/`rejected`/`expired` are settled. */
async function estimateItems(tx: Tx, principal: Principal): Promise<ApprovalItem[]> {
  const rows = await tx
    .select()
    .from(estimates)
    .where(and(isNull(estimates.deletedAt), eq(estimates.status, 'sent')))
    .orderBy(desc(estimates.createdAt))

  const module: ModuleId = 'estimates'
  const ceiling = ceilingHalalas(principal.role)
  return rows.map((row) => {
    const isSubmitter = row.submittedBy != null && row.submittedBy === principal.userId
    const withinCeiling = ceiling === null || ceiling >= row.totalHalalas
    /* `mayApprove` is the F-002-corrected canApprove: authority AND ceiling. The
     * submitter check is the F-004 submitter half — a raiser never approves. */
    const canApprove = !isSubmitter && mayApprove(principal, row.totalHalalas, module)
    return {
      _id: row.id,
      _version: row.version,
      _createdAt: new Date(row.createdAt).toISOString(),
      _updatedAt: new Date(row.updatedAt).toISOString(),
      kind: 'estimate' as const,
      module,
      entityId: row.id,
      reference: row.code,
      title: `${row.customerName} — ${row.vehicleLabel}`,
      customerName: row.customerName,
      vehicleLabel: row.vehicleLabel,
      amountHalalas: row.totalHalalas,
      amount: sarString(row.totalHalalas),
      submittedBy: row.submittedBy ?? null,
      status: row.status,
      submittedAt: new Date(row.createdAt).toISOString(),
      approval: { canApprove, ceilingHalalas: ceiling, withinCeiling, isSubmitter },
    }
  })
}

export function registerApprovalRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.get('/approvals', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'approvals', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const rows: ApprovalItem[] = []
      /* Estimates fold in only when the caller may also view estimates — an
       * approver without estimate view sees the queue, but no estimate rows. */
      if (hasPermission(principal, 'estimates', 'v')) {
        rows.push(...(await estimateItems(tx, principal)))
      }

      /* A per-module roll-up so the inbox can show badge counts and the pending
       * total without re-summing rows it may only hold a page of. Computed here
       * over the same scope the rows came from. */
      const byModule = rows.reduce<Record<string, { count: number; totalHalalas: number }>>(
        (acc, row) => {
          const bucket = (acc[row.module] ??= { count: 0, totalHalalas: 0 })
          bucket.count += 1
          bucket.totalHalalas += row.amountHalalas
          return acc
        },
        {},
      )

      return {
        rows,
        summary: {
          count: rows.length,
          pendingHalalas: rows.reduce((sum, row) => sum + row.amountHalalas, 0),
          byModule,
        },
      }
    })
  })
}
