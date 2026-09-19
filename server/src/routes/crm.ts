/** CRM actions that are more than a plain collection write.
 *
 *  The writable CRM collections (leads, opportunities, campaigns, tasks,
 *  feedback) go through the generic router. What lives here are the actions
 *  that need more than a column update: converting a lead into an
 *  opportunity, and dispatching an sms/whatsapp campaign to its provider.
 */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ulid } from 'ulid'
import { leadConvertBody } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { campaigns, leads, opportunities } from '../db/schema'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { requirePermission } from '../security/permissions'
import { MessagingUnavailable, type MessagingChannel, type MessagingTransport } from '../integrations/messaging'
import { presentRow, type RouteDeps } from './collections'

export interface CrmRouteDeps extends RouteDeps {
  messaging: MessagingTransport
}

function opportunityDef() {
  const def = collectionByKey('opportunities')
  if (!def) throw new Error('collection "opportunities" is not registered')
  return def
}

function campaignDef() {
  const def = collectionByKey('campaigns')
  if (!def) throw new Error('collection "campaigns" is not registered')
  return def
}

const SENDABLE_CHANNELS: readonly MessagingChannel[] = ['sms', 'whatsapp']

/** 503 with the messaging dependency named, matching the OTP/OBD envelopes. */
function unavailable(reply: FastifyReply, request: FastifyRequest, error: MessagingUnavailable) {
  request.log.warn({ path: request.url }, error.message)
  return reply.code(503).send({
    error: {
      code: 'external_dependency_unavailable',
      message: `${error.message} ${error.detail}`,
      requestId: request.id,
    },
  })
}

export function registerCrmRoutes(app: FastifyInstance, deps: CrmRouteDeps): void {
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

  /* -------------------------------------------------------- campaign send */
  /* Dispatch is a campaign action distinct from editing its fields, so it is
   * gated the same as the fields it changes: `crm:e`. */
  app.post('/crm/campaigns/:id/send', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'crm', 'e')
    const { id } = request.params as { id: string }

    try {
      const result = await withTenant(deps.db, principal, async (tx) => {
        const campaign = await loadCampaign(tx, id, { forUpdate: true })
        if (!SENDABLE_CHANNELS.includes(campaign.type as MessagingChannel)) {
          throw badRequest(
            `Only ${SENDABLE_CHANNELS.join('/')} campaigns can be sent from here — an "${campaign.type}" campaign has no provider to dispatch to.`,
            'type',
          )
        }
        if (campaign.status === 'completed') {
          throw badRequest('This campaign is already completed.', 'status')
        }

        /* A single dispatch request, not one per recipient: this deployment
         * resolves no audience for a campaign, so the provider is asked to
         * send the campaign, and `reach`/`opens`/`clicks`/`conversions` are
         * left exactly as they were — nothing here invents a count. */
        const dispatch = await deps.messaging.dispatch({
          campaignId: campaign.id,
          campaignName: campaign.name,
          channel: campaign.type as MessagingChannel,
        })

        const [updated] = await tx
          .update(campaigns)
          .set({
            status: campaign.status === 'draft' || campaign.status === 'scheduled' ? 'running' : campaign.status,
            lastDispatchedAt: new Date(dispatch.dispatchedAt),
            lastDispatchMock: dispatch.mock,
            updatedBy: principal.userId,
          })
          .where(eq(campaigns.id, campaign.id))
          .returning()
        if (!updated) throw notFound('Campaign')

        await writeAudit(tx, {
          actor: principal,
          action: 'command',
          entity: 'campaign',
          entityId: campaign.id,
          after: { command: 'send', channel: campaign.type, mock: dispatch.mock },
          ...metaOf(request),
        })

        return presentRow(campaignDef(), principal, updated as Record<string, unknown>)
      })
      return result
    } catch (error) {
      if (error instanceof MessagingUnavailable) return unavailable(reply, request, error)
      throw error
    }
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

type CampaignRow = typeof campaigns.$inferSelect

async function loadCampaign(tx: Tx, id: string, options: { forUpdate?: boolean } = {}): Promise<CampaignRow> {
  const base = tx
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt)))
    .limit(1)
  const rows = options.forUpdate ? await base.for('update') : await base
  const row = rows[0]
  if (!row) throw notFound('Campaign')
  return row
}
