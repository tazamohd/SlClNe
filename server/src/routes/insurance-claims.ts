/** Insurance claims: submitted against a policy, approved against a ceiling.
 *
 *  The `insuranceClaims` collection is read-only through the generic router
 *  (registry.ts). A claim moves through its lifecycle by the named actions here,
 *  modelled on `routes/estimates.ts`:
 *
 *   - submit  — POST /insurance-claims           records a claim against a policy
 *   - approve — POST /insurance-claims/:id/approve  approve (≤ claimed), gated
 *   - reject  — POST /insurance-claims/:id/reject   refuse, with a reason
 *   - pay     — POST /insurance-claims/:id/pay       settle an approved claim
 *
 *  Approval checks the same three things the estimate does, in order: the
 *  permission, the SAR ceiling for the role (against the *approved* amount), and
 *  segregation of duties (the submitter may not approve). Every transition is
 *  audited. Money is integer halalas; the claimed and approved figures are the
 *  only money values, and neither is a client-computed total.
 *
 *  Gated on `accounting` — the RBAC matrix has no `insurance` module, so the
 *  nearest existing one is used; its accountant role carries the `a` grant the
 *  approval needs. See registry.ts for the full rationale.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { insuranceClaimApproveBody, insuranceClaimCreate } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { insuranceClaims, insurancePolicies } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, conflict, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import {
  requireApproval,
  requireDifferentApprover,
  requirePermission,
} from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

const CLAIM_MODULE = 'accounting'

function def() {
  const found = collectionByKey('insuranceClaims')
  if (!found) throw new Error('collection "insuranceClaims" is not registered')
  return found
}

export function registerInsuranceClaimRoutes(app: FastifyInstance, deps: RouteDeps): void {
  /* --------------------------------------------------------- submit a claim */
  app.post('/insurance-claims', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, CLAIM_MODULE, 'c')
    const parsed = insuranceClaimCreate.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid claim.', issue?.path.join('.'))
    }
    const input = parsed.data

    const created = await withTenant(deps.db, principal, async (tx) => {
      /* The policy must exist in the caller's tenant — RLS makes a cross-tenant
       * policy invisible, so this is a 404 rather than a leak. The claim copies
       * the policy's number and, absent an explicit vehicle, its vehicle. */
      const policy = await loadPolicy(tx, input.policyId)

      const id = ulid()
      const [row] = await tx
        .insert(insuranceClaims)
        .values({
          id,
          orgId: principal.orgId,
          branchId: principal.branchId,
          claimNumber: await nextClaimNumber(tx),
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          vehicleId: input.vehicleId ?? policy.vehicleId ?? null,
          vehicleLabel: input.vehicleLabel ?? policy.vehicleLabel,
          jobCardId: input.jobCardId ?? null,
          amountClaimedHalalas: input.amountClaimedHalalas,
          amountApprovedHalalas: null,
          status: 'submitted',
          incidentDate: input.incidentDate,
          description: input.description,
          submittedBy: principal.userId,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })
        .returning()
      if (!row) throw notFound('Insurance claim')

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'insurance_claim',
        entityId: id,
        after: row,
        ...metaOf(request),
      })
      return presentRow(def(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  /* -------------------------------------------------------- approve a claim */
  app.post('/insurance-claims/:id/approve', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, CLAIM_MODULE, 'a')
    const parsed = insuranceClaimApproveBody.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid approval body.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadClaim(tx, id, { forUpdate: true })
      if (before.status === 'approved') throw conflict('This claim is already approved.')
      if (before.status === 'paid') throw conflict('This claim has already been paid.')
      if (before.status === 'rejected') throw conflict('This claim was rejected.')

      /* The adjuster may approve less than was claimed; omitting the figure
       * approves the claimed amount in full. Never more than was claimed. */
      const approved = parsed.data.approvedAmountHalalas ?? before.amountClaimedHalalas
      if (approved > before.amountClaimedHalalas) {
        throw badRequest(
          'The approved amount cannot exceed the amount claimed.',
          'approvedAmountHalalas',
        )
      }

      /* Ceiling first (against the approved amount), then segregation of duties —
       * the same order as the estimate approval. */
      requireApproval(principal, approved, CLAIM_MODULE)
      requireDifferentApprover(principal, before.submittedBy)

      const [after] = await tx
        .update(insuranceClaims)
        .set({
          status: 'approved',
          amountApprovedHalalas: approved,
          approvedBy: principal.userId,
          approvedAt: sql`now()`,
          updatedBy: principal.userId,
        })
        .where(and(eq(insuranceClaims.id, before.id), eq(insuranceClaims.version, before.version)))
        .returning()
      if (!after) throw conflict('This claim changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'approve',
        entity: 'insurance_claim',
        entityId: after.id,
        before: { status: before.status, amountApprovedHalalas: before.amountApprovedHalalas },
        after: { status: after.status, amountApprovedHalalas: after.amountApprovedHalalas },
        reason: parsed.data.reason ?? null,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  /* --------------------------------------------------------- reject a claim */
  app.post('/insurance-claims/:id/reject', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, CLAIM_MODULE, 'a')
    const { id } = request.params as { id: string }
    const reason = (request.body as { reason?: string } | undefined)?.reason
    if (!reason) throw badRequest('A rejection must say why.', 'reason')

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadClaim(tx, id, { forUpdate: true })
      if (before.status === 'approved') throw conflict('An approved claim cannot be rejected.')
      if (before.status === 'paid') throw conflict('A paid claim cannot be rejected.')
      if (before.status === 'rejected') throw conflict('This claim is already rejected.')

      const [after] = await tx
        .update(insuranceClaims)
        .set({ status: 'rejected', updatedBy: principal.userId })
        .where(and(eq(insuranceClaims.id, before.id), eq(insuranceClaims.version, before.version)))
        .returning()
      if (!after) throw conflict('This claim changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'reject',
        entity: 'insurance_claim',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status },
        reason,
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })

  /* ------------------------------------------------------------ pay a claim */
  app.post('/insurance-claims/:id/pay', async (request) => {
    const principal = principalOf(request)
    /* Paying an approved claim is an edit, not an approval — the approval was
     * the control; settlement follows it. `accounting:e`, which the accountant
     * holds. */
    requirePermission(principal, CLAIM_MODULE, 'e')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const before = await loadClaim(tx, id, { forUpdate: true })
      if (before.status === 'paid') throw conflict('This claim has already been paid.')
      if (before.status !== 'approved') {
        throw conflict('A claim must be approved before it can be paid.')
      }

      const [after] = await tx
        .update(insuranceClaims)
        .set({ status: 'paid', paidAt: sql`now()`, updatedBy: principal.userId })
        .where(and(eq(insuranceClaims.id, before.id), eq(insuranceClaims.version, before.version)))
        .returning()
      if (!after) throw conflict('This claim changed since you loaded it.')

      await writeAudit(tx, {
        actor: principal,
        action: 'transition',
        entity: 'insurance_claim',
        entityId: after.id,
        before: { status: before.status },
        after: { status: after.status },
        reason: 'claim settled',
        ...metaOf(request),
      })
      return presentRow(def(), principal, after as Record<string, unknown>)
    })
  })
}

type ClaimRow = typeof insuranceClaims.$inferSelect
type PolicyRow = typeof insurancePolicies.$inferSelect

async function loadClaim(
  tx: Tx,
  ref: string,
  options: { forUpdate?: boolean } = {},
): Promise<ClaimRow> {
  const base = tx
    .select()
    .from(insuranceClaims)
    .where(
      and(
        isNull(insuranceClaims.deletedAt),
        sql`(${insuranceClaims.id} = ${ref} or ${insuranceClaims.claimNumber} = ${ref})`,
      ),
    )
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Insurance claim')
  return row
}

async function loadPolicy(tx: Tx, ref: string): Promise<PolicyRow> {
  const [row] = await tx
    .select()
    .from(insurancePolicies)
    .where(
      and(
        isNull(insurancePolicies.deletedAt),
        sql`(${insurancePolicies.id} = ${ref} or ${insurancePolicies.policyNumber} = ${ref})`,
      ),
    )
    .limit(1)
  if (!row) throw notFound('Insurance policy')
  return row
}

async function nextClaimNumber(tx: Tx): Promise<string> {
  const [row] = await tx.select({ value: sql<number>`count(*)::int` }).from(insuranceClaims)
  return `INS-CLM-${String((row?.value ?? 0) + 1).padStart(4, '0')}`
}
