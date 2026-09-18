/** The unified approval queue — one read the ApprovalInbox operates on (F-029).
 *
 *  Before this, the inbox operated on estimates alone, by listing them and
 *  filtering client-side. That does not scale to the queue the design shows,
 *  which mixes estimates, requisitions, purchase orders and insurance claims.
 *  This endpoint aggregates them into one uniform shape.
 *
 *  Three design commitments make the later sources additive rather than
 *  breaking:
 *
 *  1. **Every row is the same `ApprovalItem`.** A `kind` discriminates the
 *     source, but the fields a screen renders — reference, title, amount,
 *     submitter, and the caller's approval standing — are the same for all of
 *     them. Adding a source is adding rows, not a new response shape. The two
 *     descriptive fields are deliberately generic: `party` is whoever the
 *     document is with (a customer, a supplier, a requester, an insurer) and
 *     `subject` is what it is about (a vehicle, a department, a policy). An
 *     estimate's customer does not become a purchase order's "customerName".
 *  2. **The approval standing is computed per caller.** Each row carries
 *     `amountHalalas` and `module`, which is exactly what the client's own
 *     `canApprove` needs, plus the server's honest answer (`canApprove`,
 *     `withinCeiling`, `isSubmitter`) so the two cannot disagree (F-002). The
 *     submitter of a document may not approve it (F-004 submitter half), so
 *     `isSubmitter` forces `canApprove` false even for an owner.
 *  3. **Each row names its own action.** `approvePath` and `rejectPath` are the
 *     endpoints that actually decide *this* row. Without them a mixed queue
 *     forces the client to re-derive the route from `kind`, and the first thing
 *     it got wrong was posting every decision to `/estimates/:id/approve`.
 *     `rejectPath` is null where the source has no reject endpoint.
 *
 *  Gated on `approvals:v` — the module the ApprovalInbox declares. A source is
 *  only folded in when the caller also holds view on that source's own module,
 *  so an approver who may see the queue but not estimates sees no estimate rows
 *  rather than a leak.
 *
 *  ### What is deliberately not here
 *
 *  **Payroll runs.** A draft run moves to `posted` through
 *  `POST /payroll/runs/:id/post`, which `routes/payroll.ts` gates on `hr:e` and
 *  documents as "an edit of the run, not an approval against a ceiling". There
 *  is no approve endpoint, no ceiling and no submitter check to report, so a
 *  payroll row in this queue would carry an approval standing the server does
 *  not enforce and an action the client could not take. It is left out until
 *  payroll posting is modelled as an approval, rather than shown as one.
 *
 *  **Journal entries.** Postings are written by `accounting/posting.ts` as part
 *  of the business event that caused them; nothing holds them pending a human.
 */
import { and, desc, eq, inArray, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { ModuleId } from '@salis/contract'
import { estimates, insuranceClaims, purchaseOrders, requisitions } from '../db/schema'
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

/** The sources the queue carries. Each one has a real approve endpoint that
 *  enforces a ceiling and segregation of duties. */
type ApprovalKind = 'estimate' | 'requisition' | 'purchase_order' | 'insurance_claim'

/** One pending decision, whatever it is a decision about. */
interface ApprovalItem {
  _id: string
  _version: number
  _createdAt: string
  _updatedAt: string
  /** The source discriminator. */
  kind: ApprovalKind
  /** The RBAC module the decision is gated on — what the client's `canApprove`
   *  reads, so the gate on the row is the gate the server would enforce. */
  module: ModuleId
  /** The record's ULID, for the approve/reject action. */
  entityId: string
  /** The human code the queue shows (`EST-0230`, `PO-0041`, `CLM-2201`). */
  reference: string
  title: string
  /** Whoever the document is with: the customer on an estimate, the supplier on
   *  a purchase order, the requester on a requisition, the insurer's policy on a
   *  claim. */
  party: string
  /** What the document is about: the vehicle, the department, the claimed
   *  vehicle. Empty when the source has nothing to put here. */
  subject: string
  amountHalalas: number
  amount: string
  submittedBy: string | null
  status: string
  submittedAt: string
  /** The endpoint that approves this row, relative to the API root. */
  approvePath: string
  /** The endpoint that rejects it, or null where the source has none — a
   *  purchase order is edited or left unapproved, never rejected. */
  rejectPath: string | null
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

/** The caller's standing on one amount in one module — the same three questions
 *  for every source, asked in one place so no source can answer them its own
 *  way. */
function standing(
  principal: Principal,
  amountHalalas: number,
  module: ModuleId,
  submittedBy: string | null,
): ApprovalItem['approval'] {
  const ceiling = ceilingHalalas(principal.role)
  const isSubmitter = submittedBy != null && submittedBy === principal.userId
  const withinCeiling = ceiling === null || ceiling >= amountHalalas
  /* `mayApprove` is the F-002-corrected canApprove: authority AND ceiling. The
   * submitter check is the F-004 submitter half — a raiser never approves. */
  const canApprove = !isSubmitter && mayApprove(principal, amountHalalas, module)
  return { canApprove, ceilingHalalas: ceiling, withinCeiling, isSubmitter }
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
  return rows.map((row) => ({
    _id: row.id,
    _version: row.version,
    _createdAt: new Date(row.createdAt).toISOString(),
    _updatedAt: new Date(row.updatedAt).toISOString(),
    kind: 'estimate' as const,
    module,
    entityId: row.id,
    reference: row.code,
    title: `${row.customerName} — ${row.vehicleLabel}`,
    party: row.customerName,
    subject: row.vehicleLabel,
    amountHalalas: row.totalHalalas,
    amount: sarString(row.totalHalalas),
    submittedBy: row.submittedBy ?? null,
    status: row.status,
    submittedAt: new Date(row.createdAt).toISOString(),
    approvePath: `estimates/${row.id}/approve`,
    rejectPath: `estimates/${row.id}/reject`,
    approval: standing(principal, row.totalHalalas, module, row.submittedBy ?? null),
  }))
}

/** Pending requisitions. `submitted` is the pending state — the approve route
 *  refuses anything else ("A requisition must be submitted before it can be
 *  approved"), and the ceiling it enforces is against `estimatedTotalHalalas`,
 *  so that is the amount this row reports. */
async function requisitionItems(tx: Tx, principal: Principal): Promise<ApprovalItem[]> {
  const rows = await tx
    .select()
    .from(requisitions)
    .where(and(isNull(requisitions.deletedAt), eq(requisitions.status, 'submitted')))
    .orderBy(desc(requisitions.createdAt))

  const module: ModuleId = 'procurement'
  return rows.map((row) => ({
    _id: row.id,
    _version: row.version,
    _createdAt: new Date(row.createdAt).toISOString(),
    _updatedAt: new Date(row.updatedAt).toISOString(),
    kind: 'requisition' as const,
    module,
    entityId: row.id,
    reference: row.code,
    title: row.department ? `${row.requesterName} — ${row.department}` : row.requesterName,
    party: row.requesterName,
    subject: row.department ?? '',
    amountHalalas: row.estimatedTotalHalalas,
    amount: sarString(row.estimatedTotalHalalas),
    submittedBy: row.submittedBy ?? null,
    status: row.status,
    submittedAt: new Date(row.createdAt).toISOString(),
    approvePath: `procurement/requisitions/${row.id}/approve`,
    rejectPath: `procurement/requisitions/${row.id}/reject`,
    approval: standing(principal, row.estimatedTotalHalalas, module, row.submittedBy ?? null),
  }))
}

/** Pending purchase orders. `draft` is the pending state and the only one
 *  `checkPurchaseOrderApprovable` lets through; there is no separate submit, so
 *  an order is awaiting a decision from the moment it is raised. The ceiling is
 *  enforced against the server-computed `totalHalalas`. */
async function purchaseOrderItems(tx: Tx, principal: Principal): Promise<ApprovalItem[]> {
  const rows = await tx
    .select()
    .from(purchaseOrders)
    .where(and(isNull(purchaseOrders.deletedAt), eq(purchaseOrders.status, 'draft')))
    .orderBy(desc(purchaseOrders.createdAt))

  const module: ModuleId = 'procurement'
  return rows.map((row) => ({
    _id: row.id,
    _version: row.version,
    _createdAt: new Date(row.createdAt).toISOString(),
    _updatedAt: new Date(row.updatedAt).toISOString(),
    kind: 'purchase_order' as const,
    module,
    entityId: row.id,
    reference: row.code,
    title: row.supplierName,
    party: row.supplierName,
    subject: '',
    amountHalalas: row.totalHalalas,
    amount: sarString(row.totalHalalas),
    submittedBy: row.submittedBy ?? null,
    status: row.status,
    submittedAt: new Date(row.createdAt).toISOString(),
    approvePath: `procurement/purchase-orders/${row.id}/approve`,
    /* No reject endpoint exists for a purchase order — it is edited or left
     * unapproved. Reporting null is the honest answer; inventing a path would
     * give the inbox a button that 404s. */
    rejectPath: null,
    approval: standing(principal, row.totalHalalas, module, row.submittedBy ?? null),
  }))
}

/** Pending insurance claims. The approve route refuses `approved`, `paid` and
 *  `rejected`, which leaves `submitted` and `under_review` as the states
 *  awaiting a decision. The ceiling is enforced against the amount being
 *  approved, which defaults to the amount claimed — so that is what this row
 *  reports, and an adjuster approving less is then further within it. */
async function insuranceClaimItems(tx: Tx, principal: Principal): Promise<ApprovalItem[]> {
  const rows = await tx
    .select()
    .from(insuranceClaims)
    .where(
      and(
        isNull(insuranceClaims.deletedAt),
        inArray(insuranceClaims.status, ['submitted', 'under_review']),
      ),
    )
    .orderBy(desc(insuranceClaims.createdAt))

  const module: ModuleId = 'insurance'
  return rows.map((row) => ({
    _id: row.id,
    _version: row.version,
    _createdAt: new Date(row.createdAt).toISOString(),
    _updatedAt: new Date(row.updatedAt).toISOString(),
    kind: 'insurance_claim' as const,
    module,
    entityId: row.id,
    reference: row.claimNumber,
    title: `${row.policyNumber} — ${row.vehicleLabel}`,
    party: row.policyNumber,
    subject: row.vehicleLabel,
    amountHalalas: row.amountClaimedHalalas,
    amount: sarString(row.amountClaimedHalalas),
    submittedBy: row.submittedBy ?? null,
    status: row.status,
    submittedAt: new Date(row.createdAt).toISOString(),
    approvePath: `insurance-claims/${row.id}/approve`,
    rejectPath: `insurance-claims/${row.id}/reject`,
    approval: standing(principal, row.amountClaimedHalalas, module, row.submittedBy ?? null),
  }))
}

/** The sources, each with the module the caller must be able to view before its
 *  rows are folded in. Adding a source is adding a line here. */
const SOURCES: { module: ModuleId; items: typeof estimateItems }[] = [
  { module: 'estimates', items: estimateItems },
  { module: 'procurement', items: requisitionItems },
  { module: 'procurement', items: purchaseOrderItems },
  { module: 'insurance', items: insuranceClaimItems },
]

export function registerApprovalRoutes(app: FastifyInstance, deps: RouteDeps): void {
  app.get('/approvals', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'approvals', 'v')

    return withTenant(deps.db, principal, async (tx) => {
      const rows: ApprovalItem[] = []
      /* A source folds in only when the caller may also view its own module — an
       * approver without estimate view sees the queue, but no estimate rows. */
      for (const source of SOURCES) {
        if (!hasPermission(principal, source.module, 'v')) continue
        rows.push(...(await source.items(tx, principal)))
      }
      /* Newest first across sources, so the mixed queue reads as one list rather
       * than as four concatenated ones. */
      rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))

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

      /* A per-kind roll-up beside it: `byModule` cannot separate requisitions
       * from purchase orders, because both are gated on `procurement`. */
      const byKind = rows.reduce<Record<string, { count: number; totalHalalas: number }>>(
        (acc, row) => {
          const bucket = (acc[row.kind] ??= { count: 0, totalHalalas: 0 })
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
          byKind,
        },
      }
    })
  })
}
