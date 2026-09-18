/** Digital Vehicle Health Check — inspection findings and their photo/video
 *  evidence (Sprint 2, P0).
 *
 *  Three things live here that the generic collection router cannot do:
 *
 *  - **Creating a finding.** The matrix gives technician `jobcards: 've'` —
 *    view and edit, never create — because creating a *job card* is an
 *    advisor/frontdesk act. Recording a finding while walking an inspection is
 *    the technician's own act, so it is gated on `e` rather than `c` here,
 *    the same reasoning `POST /jobs/:id/transition` already uses.
 *  - **Uploading a file's bytes.** Multipart, not JSON — the generic writer
 *    never sees this shape, which is also why
 *    `WRITERS.inspectionMedia.create` is `z.never()`.
 *  - **The customer-facing report.** A hand-picked aggregate across two
 *    tables, shaped for reading rather than editing, and built with a SQL
 *    select that never names `internal_note` at all (see
 *    `packages/contract/src/entities/inspection.ts`).
 */
import { and, asc, eq, isNull } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { ulid } from 'ulid'
import {
  inspectionFindingCreateBody,
  type HealthCheckReport,
  type InspectionAnnotation,
  type InspectionMediaKind,
  type InspectionMediaStage,
  type InspectionSeverity,
} from '@salis/contract'
import { writeAudit } from '../audit/audit'
import { inspectionFindings, inspectionMedia } from '../db/schema'
import { withTenant } from '../db/tenant'
import { badRequest, notFound } from '../http/errors'
import { metaOf, principalOf } from '../http/context'
import { collectionByKey } from '../registry'
import { findOne } from '../query'
import { requirePermission } from '../security/permissions'
import { maxBytesFor, mediaKindForMimeType, type MediaStore } from '../storage/media'
import { presentRow, type RouteDeps } from './collections'

export interface InspectionRouteDeps extends RouteDeps {
  mediaStore: MediaStore
}

function findingsDef() {
  const found = collectionByKey('inspectionFindings')
  if (!found) throw new Error('collection "inspectionFindings" is not registered')
  return found
}

function mediaDef() {
  const found = collectionByKey('inspectionMedia')
  if (!found) throw new Error('collection "inspectionMedia" is not registered')
  return found
}

function jobsDef() {
  const found = collectionByKey('jobs')
  if (!found) throw new Error('collection "jobs" is not registered')
  return found
}

export function registerInspectionRoutes(app: FastifyInstance, deps: InspectionRouteDeps): void {
  app.post('/job-cards/:id/inspection-findings', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'e')
    const parsed = inspectionFindingCreateBody.safeParse(request.body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      throw badRequest(issue?.message ?? 'Invalid finding.', issue?.path.join('.'))
    }
    const { id: jobCardIdParam } = request.params as { id: string }

    const created = await withTenant(deps.db, principal, async (tx) => {
      /* Under the caller's own RLS: a job card not visible to them (wrong
       * tenant, wrong branch, or — for a technician — not assigned to them)
       * 404s here rather than at the insert's foreign key. */
      const job = await findOne(tx, jobsDef(), jobCardIdParam)

      const [row] = await tx
        .insert(inspectionFindings)
        .values({
          id: ulid(),
          orgId: principal.orgId,
          branchId: principal.branchId,
          jobCardId: String(job.id),
          category: parsed.data.category,
          categoryAr: parsed.data.categoryAr ?? null,
          item: parsed.data.item,
          itemAr: parsed.data.itemAr ?? null,
          severity: parsed.data.severity,
          internalNote: parsed.data.internalNote ?? null,
          customerNote: parsed.data.customerNote ?? null,
          estimateLineId: parsed.data.estimateLineId ?? null,
          recordedBy: principal.userId,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        } as never)
        .returning()
      if (!row) throw notFound('Inspection finding')

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'inspection_finding',
        entityId: String((row as { id: string }).id),
        after: row as Record<string, unknown>,
        ...metaOf(request),
      })
      return presentRow(findingsDef(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  /** `POST /inspection-findings/:id/media` — the only place a file's bytes
   *  can enter the system. `?stage=before|after` on the query string rather
   *  than a second multipart field: `request.file()` only reliably sees
   *  fields that arrived *before* the file part in the stream, which would
   *  make correctness depend on client form-field ordering. */
  app.post('/inspection-findings/:id/media', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'e')
    const { id: findingIdParam } = request.params as { id: string }
    const stageQuery = (request.query as { stage?: string }).stage
    const stage: InspectionMediaStage = stageQuery === 'after' ? 'after' : 'before'

    const file = await request.file()
    if (!file) throw badRequest('Expected a multipart file upload in field "file".', 'file')

    const kind: InspectionMediaKind = mediaKindForMimeType(file.mimetype)
    const bytes = await file.toBuffer()
    if (bytes.byteLength === 0) throw badRequest('The uploaded file is empty.', 'file')
    const ceiling = maxBytesFor(kind)
    if (bytes.byteLength > ceiling) {
      throw badRequest(`A ${kind} may not exceed ${Math.round(ceiling / (1024 * 1024))} MB.`, 'file')
    }

    const created = await withTenant(deps.db, principal, async (tx) => {
      const finding = await findOne(tx, findingsDef(), findingIdParam)
      const { storageKey, sizeBytes } = await deps.mediaStore.save({
        orgId: principal.orgId,
        mimeType: file.mimetype,
        bytes,
      })

      const [row] = await tx
        .insert(inspectionMedia)
        .values({
          id: ulid(),
          orgId: principal.orgId,
          branchId: principal.branchId,
          findingId: String(finding.id),
          jobCardId: String(finding.jobCardId),
          kind,
          stage,
          storageKey,
          mimeType: file.mimetype,
          sizeBytes,
          annotations: [],
          uploadedBy: principal.userId,
          createdBy: principal.userId,
          updatedBy: principal.userId,
        } as never)
        .returning()
      if (!row) throw notFound('Inspection media')

      await writeAudit(tx, {
        actor: principal,
        action: 'create',
        entity: 'inspection_media',
        entityId: String((row as { id: string }).id),
        after: row as Record<string, unknown>,
        ...metaOf(request),
      })
      return presentRow(mediaDef(), principal, row as Record<string, unknown>)
    })

    reply.code(201)
    return created
  })

  /** `GET /inspection-media/:id/file` — the only path to the bytes. `url` in
   *  the presented row always points here rather than at a storage path, so
   *  every read is gated the same way the row is (RLS + `jobcards:v`). */
  app.get('/inspection-media/:id/file', async (request, reply) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'v')
    const { id } = request.params as { id: string }

    const row = await withTenant(deps.db, principal, (tx) => findOne(tx, mediaDef(), id))
    const stream = await deps.mediaStore.read(String(row.storageKey))
    reply.header('content-type', String(row.mimeType))
    reply.header('content-disposition', 'inline')
    reply.header('cache-control', 'private, max-age=3600')
    return reply.send(stream)
  })

  /** `GET /jobs/:id/health-check-report` — the customer-facing read.
   *
   *  Not a redaction of `inspectionFindingRow`: the `select()` below never
   *  names `internal_note` or `recorded_by`, so there is no code path on
   *  which either reaches this process's memory for a request to this route,
   *  whoever the caller is. RLS (`job_cards`' own `r_self`, and the matching
   *  narrowing on the two DVHC tables) is what keeps the *rows* to the
   *  caller's own vehicle; staff roles read the identical shape when
   *  previewing what the customer sees. */
  app.get('/jobs/:id/health-check-report', async (request) => {
    const principal = principalOf(request)
    requirePermission(principal, 'jobcards', 'v')
    const { id } = request.params as { id: string }

    return withTenant(deps.db, principal, async (tx) => {
      const job = await findOne(tx, jobsDef(), id)
      const jobCardId = String(job.id)

      const findingRows = await tx
        .select({
          id: inspectionFindings.id,
          category: inspectionFindings.category,
          categoryAr: inspectionFindings.categoryAr,
          item: inspectionFindings.item,
          itemAr: inspectionFindings.itemAr,
          severity: inspectionFindings.severity,
          customerNote: inspectionFindings.customerNote,
        })
        .from(inspectionFindings)
        .where(and(eq(inspectionFindings.jobCardId, jobCardId), isNull(inspectionFindings.deletedAt)))
        .orderBy(asc(inspectionFindings.createdAt))

      const mediaRows = await tx
        .select({
          id: inspectionMedia.id,
          findingId: inspectionMedia.findingId,
          kind: inspectionMedia.kind,
          stage: inspectionMedia.stage,
          annotations: inspectionMedia.annotations,
        })
        .from(inspectionMedia)
        .where(and(eq(inspectionMedia.jobCardId, jobCardId), isNull(inspectionMedia.deletedAt)))
        .orderBy(asc(inspectionMedia.createdAt))

      const mediaByFinding = new Map<string, typeof mediaRows>()
      for (const m of mediaRows) {
        const list = mediaByFinding.get(m.findingId) ?? []
        list.push(m)
        mediaByFinding.set(m.findingId, list)
      }

      const report: HealthCheckReport = {
        jobCardId,
        vehicle: String(job.vehicleLabel ?? ''),
        findings: findingRows.map((f) => ({
          id: f.id,
          category: f.category,
          categoryAr: f.categoryAr ?? null,
          item: f.item,
          itemAr: f.itemAr ?? null,
          severity: f.severity as InspectionSeverity,
          customerNote: f.customerNote ?? null,
          media: (mediaByFinding.get(f.id) ?? []).map((m) => ({
            id: m.id,
            kind: m.kind as InspectionMediaKind,
            stage: m.stage as InspectionMediaStage,
            annotations: (m.annotations ?? []) as InspectionAnnotation[],
            /* Relative to the API root — see the identical comment in
             * `registry.ts`'s `inspectionMedia` collection. */
            url: `inspection-media/${m.id}/file`,
          })),
        })),
      }
      return report
    })
  })
}
