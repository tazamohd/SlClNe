/** Customer-approval OTP for an estimate — an e-signature over SMS (§40, F-029).
 *
 *  When a customer approves an estimate remotely, a one-time code sent to their
 *  phone is the signature. This rides the *same* OTP module the auth codes do
 *  (`auth/otp.ts`): the code is hashed at rest, throttled, attempt-capped, and —
 *  the point of §40 — never pretended. SMS is an external dependency. The
 *  default transport refuses with a 503 naming what is missing; it does not
 *  return a cheerful 202 for a message that was never sent. The verified
 *  challenge (`otp_challenges.verified_at`) plus an `approve` audit row is the
 *  persisted e-signature.
 */
import { and, eq, isNull, sql } from 'drizzle-orm'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { customers, estimates } from '../db/schema'
import { writeAudit } from '../audit/audit'
import { withTenant, type Tx } from '../db/tenant'
import { badRequest, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { requirePermission } from '../security/permissions'
import { issueChallenge, verifyChallenge, ResendTooSoon, TransportUnavailable } from '../auth/otp'
import type { RouteDeps } from './collections'

const verifyBody = z.object({ code: z.string().min(4).max(12) })

/** 503 with the SMS dependency named, matching the auth and OBD envelopes. */
function unavailable(reply: FastifyReply, request: FastifyRequest, error: TransportUnavailable) {
  request.log.warn({ path: request.url }, error.message)
  return reply.code(503).send({
    error: {
      code: 'external_dependency_unavailable',
      message: `${error.message} ${error.detail}`,
      requestId: request.id,
    },
  })
}

function tooSoon(reply: FastifyReply, request: FastifyRequest, error: ResendTooSoon) {
  reply.header('retry-after', String(error.retryAfterSeconds))
  return reply.code(429).send({
    error: { code: 'rate_limited', message: error.message, requestId: request.id },
  })
}

/** Last three digits only — enough for the customer to recognise their number,
 *  not enough to be the number. */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\s+/g, '')
  return digits.length <= 3 ? '***' : `${'*'.repeat(Math.max(0, digits.length - 3))}${digits.slice(-3)}`
}

async function loadEstimate(tx: Tx, ref: string) {
  const [row] = await tx
    .select()
    .from(estimates)
    .where(and(isNull(estimates.deletedAt), sql`(${estimates.id} = ${ref} or ${estimates.code} = ${ref})`))
    .limit(1)
  if (!row) throw notFound('Estimate')
  return row
}

/** The customer's phone for this estimate, resolved under RLS. The OTP goes to
 *  the customer on record, never a number the caller types, so the endpoint
 *  cannot be turned into an SMS cannon. */
async function customerPhone(tx: Tx, customerId: string | null): Promise<string | null> {
  if (!customerId) return null
  const [row] = await tx
    .select({ phone: customers.phone })
    .from(customers)
    .where(and(eq(customers.id, customerId), isNull(customers.deletedAt)))
    .limit(1)
  return row?.phone ?? null
}

export function registerEstimateOtpRoutes(app: FastifyInstance, deps: RouteDeps): void {
  /* Triggering a customer signature is an estimate action, so gated on
   * `estimates:e` — advisor, manager, owner. */
  app.post('/estimates/:id/request-approval-otp', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'e')
    const { id } = request.params as { id: string }

    try {
      const result = await withTenant(deps.db, principal, async (tx) => {
        const estimate = await loadEstimate(tx, id)
        const phone = await customerPhone(tx, estimate.customerId)
        if (!phone) {
          throw badRequest('This estimate has no customer phone on record to send a code to.', 'customerId')
        }
        const challenge = await issueChallenge(tx, { channel: 'sms', destination: phone }, app.auth.config)
        /* Deliver via the auth module's transport — unconfigured by default, and
         * it throws rather than returning quietly. The code is never in the
         * response or the audit row. */
        await app.auth.transport.send({ channel: 'sms', destination: phone, code: challenge.code })

        await writeAudit(tx, {
          actor: principal,
          action: 'command',
          entity: 'estimate',
          entityId: estimate.id,
          after: { command: 'request_approval_otp', channel: 'sms', destination: maskPhone(phone) },
          ...metaOf(request),
        })
        return { challengeId: challenge.id, expiresAt: challenge.expiresAt.toISOString(), destination: maskPhone(phone) }
      })
      reply.code(202)
      return result
    } catch (error) {
      if (error instanceof TransportUnavailable) return unavailable(reply, request, error)
      if (error instanceof ResendTooSoon) return tooSoon(reply, request, error)
      throw error
    }
  })

  app.post('/estimates/:id/verify-approval-otp', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'estimates', 'e')
    const parsed = verifyBody.safeParse(request.body ?? {})
    if (!parsed.success) throw badRequest('Expected { code }.', 'code')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const estimate = await loadEstimate(tx, id)
      const phone = await customerPhone(tx, estimate.customerId)
      if (!phone) throw badRequest('This estimate has no customer phone on record.', 'customerId')

      const verdict = await verifyChallenge(tx, { destination: phone, code: parsed.data.code, channel: 'sms' }, app.auth.config)
      if (verdict.kind !== 'verified') {
        /* Honest failure states — the same taxonomy the auth OTP uses. */
        reply.code(verdict.kind === 'wrong_code' ? 401 : 410)
        return {
          verified: false,
          reason: verdict.kind,
          ...(verdict.kind === 'wrong_code' ? { attemptsLeft: verdict.attemptsLeft } : {}),
        }
      }

      /* The e-signature: the customer's acceptance is recorded on the trail. The
       * internal ceiling/SOD approval remains the separate `/approve` route —
       * this is the customer saying yes, not the shop authorising the spend. */
      await writeAudit(tx, {
        actor: principal,
        action: 'approve',
        entity: 'estimate',
        entityId: estimate.id,
        reason: 'customer_otp_signature',
        after: { signature: 'otp', channel: 'sms', challengeId: verdict.challengeId, destination: maskPhone(phone) },
        ...metaOf(request),
      })
      return { verified: true, challengeId: verdict.challengeId }
    })
  })
}
