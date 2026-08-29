/** CRM actions that are more than a plain collection write.
 *
 *  The writable CRM collections (leads, opportunities, tasks, feedback) go
 *  through the generic router. What lives here is the one action that spans two
 *  tables under a single transaction: converting a lead into an opportunity.
 */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { leadConvertBody } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { leads, opportunities } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { presentRow, type RouteDeps } from './collections'

function opportunityDef() {
  const def = collectionByKey('opportunities')
  if (!def) throw new Error('collection "opportunities" is not registered')
  return def
}

export function registerCrmRoutes(app: FastifyInstance, deps: RouteDeps): void {
  /* --------------------------------------------- lead → opportunity convert */
  app.post('/crm/leads/:id/convert', async (request, reply) => {
    const principal = principalOf(request)
    /* Conversion creates an opportunity and edits the lead, so it needs both
     * grants — checked before the body is read, so an under-privileged caller
     * learns nothing about the shape. */
    requirePermission(principal, 'crm', 'c')
    requirePermission(principal, 'crm', 'e')

    const parsed = leadConvertBody.safeParse(request.body ?? {})
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid conversion.', issue?.path.join('.'))
    }
    const { id } = request.params as { id: string }

    const result = await withTenant(deps.db, principal, async (tx) => {
      /* Lock the lead for the length of the transaction so two concurrent
       * conversions cannot both pass the "not yet converted" check. */
      const lead = await loadLead(tx, id, { forUpdate: true })

      /* Idempotent: a lead already converted returns its existing opportunity
       * rather than creating a second one — a replay is a no-op, not a 409. */
      if (lead.convertedOpportunityId) {
        const [existing] = await tx
          .select()
          .from(opportunities)
          .where(and(eq(opportunities.id, lead.convertedOpportunityId), isNull(opportunities.deletedAt)))
          .limit(1)
        if (existing) {
          return {
            status: 200,
            body: presentRow(opportunityDef(), principal, existing as Record<string, unknown>),
          }
        }
      }

      const opportunityId = ulid()
      const [opportunity] = await tx
        .insert(opportunities)
        .values({
          id: opportunityId,
          orgId: principal.orgId,
          branchId: principal.branchId,
          name: lead.name,
          company: lead.company,
          valueHalalas: lead.valueHalalas,
          stage: parsed.data.stage ?? 'Discovery',
          probabilityPct: parsed.data.probabilityPct ?? lead.score ?? null,
          closeDate: parsed.data.closeDate ?? null,
          ownerName: parsed.data.ownerName ?? null,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        })
        .returning()
      if (!opportunity) throw notFound('Opportunity')

      const [updatedLead] = await tx
        .update(leads)
        .set({
          stage: 'converted',
          convertedOpportunityId: opportunityId,
          updatedBy: principal.userId,
        })
        .where(and(eq(leads.id, lead.id), eq(leads.version, lead.version)))
        .returning()

      await writeAudit(tx, {
        actor: principal,
        action: 'transition',
        entity: 'lead',
        entityId: lead.id,
        before: { stage: lead.stage, convertedOpportunityId: lead.convertedOpportunityId },
        after: { stage: updatedLead?.stage ?? 'converted', convertedOpportunityId: opportunityId },
        reason: 'converted to opportunity',
        ...metaOf(request),
      })

      return {
        status: 201,
        body: presentRow(opportunityDef(), principal, opportunity as Record<string, unknown>),
      }
    })

    reply.code(result.status)
    return result.body
  })
}

type LeadRow = typeof leads.$inferSelect

async function loadLead(tx: Tx, id: string, options: { forUpdate?: boolean } = {}): Promise<LeadRow> {
  const base = tx
    .select()
    .from(leads)
    .where(and(eq(leads.id, id), isNull(leads.deletedAt)))
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Lead')
  return row
}
