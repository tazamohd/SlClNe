/** Customer sign-off at delivery (Sprint 2, P0 backlog item 4).
 *
 *  One thing lives here that the generic collection router cannot do:
 *  uploading the signature image's bytes. Multipart, not JSON — the generic
 *  writer never sees this shape, which is also why
 *  `WRITERS.deliverySignoffs.create` is `z.never()`. Gated on `jobcards:e`,
 *  the same grant `POST /jobs/:id/transition` already requires — capturing a
 *  customer's sign-off while handing back their vehicle is the advisor's own
 *  edit to the job card, not the creation of a new one.
 *
 *  Everything else about the row (the checklist, the odometer reading) is
 *  filled in afterwards through the generic collection's `PATCH`, once the
 *  advisor has actually walked the hand-off. */
import { and, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import { DELIVERY_SIGNATURE_MAX_BYTES, DELIVERY_SIGNATURE_MIME_TYPE } from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { deliverySignoffs } from '../db/schema'
import { withTenant } from '../db/tenant'
import { badRequest, conflict, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { findOne } from '../query'
import { requirePermission } from '../security/permissions'
import type { MediaStore } from '../storage/media'
import { presentRow, type RouteDeps } from './collections'

export interface DeliveryRouteDeps extends RouteDeps {
  mediaStore: MediaStore
}

function signoffsDef() {
  const found = collectionByKey('deliverySignoffs')
  if (!found) throw new Error('collection "deliverySignoffs" is not registered')
  return found
}

function jobsDef() {
  const found = collectionByKey('jobs')
  if (!found) throw new Error('collection "jobs" is not registered')
  return found
}

export function registerDeliveryRoutes(app: FastifyInstance, deps: DeliveryRouteDeps): void {
  app.post('/job-cards/:id/delivery-signoff', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'e')
    const { id: jobCardIdParam } = request.params as { id: string }

    const file = await request.file()
    if (!file) throw badRequest('Expected a multipart file upload in field "file".', 'file')
    if (file.mimetype !== DELIVERY_SIGNATURE_MIME_TYPE) {
      throw badRequest(`"${file.mimetype}" is not an accepted signature type.`, 'file')
    }
    const bytes = await file.toBuffer()
    if (bytes.byteLength === 0) throw badRequest('The uploaded signature is empty.', 'file')
    if (bytes.byteLength > DELIVERY_SIGNATURE_MAX_BYTES) {
      throw badRequest(
        `A signature may not exceed ${Math.round(DELIVERY_SIGNATURE_MAX_BYTES / (1024 * 1024))} MB.`,
        'file',
      )
    }

    const created = await withTenant(deps.db, principal, async (tx) => {
      /* Under the caller's own RLS: a job card not visible to them (wrong
       * tenant, wrong branch) 404s here rather than at the insert's foreign
       * key. */
      const job = await findOne(tx, jobsDef(), jobCardIdParam)
      const jobCardId = String(job.id)

      const existing = await tx
        .select({ id: deliverySignoffs.id })
        .from(deliverySignoffs)
        .where(and(eq(deliverySignoffs.jobCardId, jobCardId), isNull(deliverySignoffs.deletedAt)))
        .limit(1)
      if (existing.length > 0) {
        throw conflict('A signature has already been captured for this job card.')
      }

      const { storageKey, sizeBytes } = await deps.mediaStore.save({
        orgId: principal.orgId,
        mimeType: file.mimetype,
        bytes,
      })

      const [row] = await tx
        .insert(deliverySignoffs)
        .values({
          id: ulid(),
          orgId: principal.orgId,
          branchId: principal.branchId,
          jobCardId,
          signedByName: String(job.customerName),
          agreedAt: new Date(),
          checklist: {},
          odometerOut: null,
          storageKey,
          mimeType: file.mimetype,
          sizeBytes,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        } as never)
        .returning()
      if (!row) throw notFound('Delivery sign-off')

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'delivery_signoff',
        entityId: String((row as { id: string }).id),
        after: row as Record<string, unknown>,
        ...metaOf(request),
      })
      return presentRow(signoffsDef(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  /** `GET /delivery-signoffs/:id/signature` — the only path to the bytes.
   *  `url` in the presented row always points here rather than at a storage
   *  path, so every read is gated the same way the row is (RLS +
   *  `jobcards:v`). */
  app.get('/delivery-signoffs/:id/signature', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'v')
    const { id } = request.params as { id: string }

    const row = await withTenant(deps.db, principal, (tx) => findOne(tx, signoffsDef(), id))
    const stream = await deps.mediaStore.read(String(row.storageKey))
    reply.header('content-type', String(row.mimeType))
    reply.header('content-disposition', 'inline')
    reply.header('cache-control', 'private, max-age=3600')
    return reply.send(stream)
  })
}
