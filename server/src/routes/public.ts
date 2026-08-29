/** The public, unauthenticated marketing lead form (F-025, Part 7).
 *
 *  Everything here is a security decision:
 *
 *  - **No auth, no tenant escalation.** The route has no principal. The lead is
 *    written to one server-configured organization (`PUBLIC_LEAD_ORG_ID`),
 *    never one the caller names — the request body has no `orgId` field to
 *    name one, and the `.strict()` contract rejects the key if it tries. A
 *    public POST therefore cannot reach, read or write any other tenant.
 *  - **Strict validation.** The body is parsed by `publicLeadCreate`, a narrow
 *    `.strict()` schema: exactly the contact-form fields, each bounded, unknown
 *    keys refused.
 *  - **Rate limited.** A tight per-IP ceiling, separate from the authenticated
 *    API's, because a contact form does not legitimately fire hundreds of times
 *    a minute from one address.
 *  - **No data out, no PII in logs.** The response is a bare accepted
 *    acknowledgement — it exposes nothing about the org or any existing record
 *    — and the handler never logs the name, email, phone or message (§52).
 */
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { publicLeadCreate } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { publicLeads } from '../db/schema'
import { withTenant, type Principal } from '../db/tenant'
import { badRequest } from '../http/errors'
import { metaOf } from '../http/context'
import type { Database } from '../db/client'
import type { Env } from '../env'

export interface PublicRouteDeps {
  db: Database
  env: Env
}

export function registerPublicRoutes(app: FastifyInstance, deps: PublicRouteDeps): void {
  app.post(
    '/public/leads',
    {
      config: {
        rateLimit: {
          max: deps.env.PUBLIC_LEAD_RATE_LIMIT,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parsed = publicLeadCreate.safeParse(request.body ?? {})
      if (!parsed.success) {
        const issue = parsed.error.issues[0]
        /* The message is schema text ("Provide an email…"), never an echo of
         * what the visitor typed, so nothing they submitted reaches a log. */
        throw badRequest(issue?.message ?? 'Invalid submission.', issue?.path.join('.'))
      }
      const input = parsed.data

      /* The synthetic principal carries the *configured* org and nothing the
       * caller supplied. Its scope lets the insert satisfy the tenant RLS
       * WITH CHECK for that one org; it grants no cross-tenant reach. */
      const actor: Principal = {
        userId: 'public',
        orgId: deps.env.PUBLIC_LEAD_ORG_ID,
        branchId: null,
        role: 'callcenter',
        scope: 'all',
        name: 'public intake',
      }

      await withTenant(deps.db, actor, async (tx) => {
        const id = ulid()
        await tx.insert(publicLeads).values({
          id,
          orgId: actor.orgId,
          branchId: null,
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          company: input.company ?? null,
          message: input.message ?? null,
          source: input.source ?? 'Website',
          status: 'new',
          createdBy: null,
          updatedBy: null,
        })

        await writeAudit(tx, {
          actor,
          action: 'create',
          entity: 'public_lead',
          entityId: id,
          /* The audit record is the business record, not a log line. It carries
           * the contact so the intake can be triaged into the CRM later;
           * credentials (of which a contact form has none) are scrubbed by
           * writeAudit. This is the ledger, not the request log — §52 forbids
           * PII in *logs*, and nothing here is logged. */
          after: {
            name: input.name,
            email: input.email ?? null,
            phone: input.phone ?? null,
            company: input.company ?? null,
            source: input.source ?? 'Website',
          },
          source: 'api',
          ...metaOf(request),
        })
      })

      /* 202 Accepted with a bare acknowledgement. No id, no org, no echo of the
       * submission — a public caller learns only that it was queued. */
      reply.code(202)
      return { status: 'accepted' }
    },
  )
}
