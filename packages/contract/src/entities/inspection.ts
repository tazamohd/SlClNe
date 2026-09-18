/** Digital Vehicle Health Check — inspection findings and their photo/video
 *  evidence (`DATA_MODEL.md` §DVHC, Sprint 2, P0).
 *
 *  `WorkshopInspection.tsx` used to hold verdicts in local React state only —
 *  no table backed them, so a technician's pass/fail/na walk of the vehicle
 *  evaporated the moment the tab closed, and nothing could link a finding to
 *  an estimate line or show a customer what was actually found. Each row here
 *  is one checklist point on one job card: a category and item, a severity on
 *  the DVHC ladder, evidence attached separately (`inspectionMedia`), and two
 *  notes kept apart on purpose — `internalNote` is shop-only (what the
 *  technician tells the advisor), `customerNote` is what the customer-facing
 *  report shows. RLS lets a customer read the *row* — their own vehicle's
 *  findings, narrowed the same way `job_cards` narrows for them
 *  (`server/drizzle/0018_inspection_findings.sql`) — but `internalNote` is a
 *  *column* that row carries, which RLS cannot deny on its own. The
 *  `FIELD_RULES` entry "Inspection internal notes" hides it from
 *  `customer`/`supplier`, and `server/src/registry.ts`'s `REDACTIONS` nulls it
 *  on the way out of the generic collection route.
 *  `GET /jobs/:id/health-check-report` goes further still: its own SQL select
 *  never names the column at all, so the customer's dedicated report route
 *  never pulls it into memory in the first place.
 */
import { z } from 'zod'
import { nonEmpty, ulid } from '../primitives'
import { appRow } from './common'

/** OK → unsafe. Mirrors `declinedJobSeverity` plus the "nothing wrong" rung a
 *  health check needs that a declined job, by definition, never is. */
export const inspectionSeverity = z.enum(['ok', 'monitor', 'attention', 'urgent', 'unsafe'])
export type InspectionSeverity = z.infer<typeof inspectionSeverity>

export const inspectionMediaKind = z.enum(['photo', 'video'])
export type InspectionMediaKind = z.infer<typeof inspectionMediaKind>

export const inspectionMediaStage = z.enum(['before', 'after'])
export type InspectionMediaStage = z.infer<typeof inspectionMediaStage>

/** One overlay drawn on a photo or a frame of a video — an arrow, a box or a
 *  text label, positioned in the 0–1 fraction of the media's own width/height
 *  so it survives being displayed at any size. */
export const inspectionAnnotation = z.object({
  type: z.enum(['arrow', 'box', 'text']),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  /** End point for an arrow, or the box's opposite corner. Unused by `text`. */
  x2: z.number().min(0).max(1).optional(),
  y2: z.number().min(0).max(1).optional(),
  text: z.string().max(200).optional(),
  /** One of the two brand tones — annotations are drawn in the product's own
   *  palette, not an arbitrary attacker-supplied colour. */
  color: z.enum(['blue', 'orange']).default('orange'),
})
export type InspectionAnnotation = z.infer<typeof inspectionAnnotation>

/** Body of `POST /job-cards/:id/inspection-findings`. Not a generic
 *  collection create (see `inspectionFindingCreate` below) — this is the
 *  bespoke route technician's `jobcards:e` grant reaches, because the matrix
 *  gives technician view-and-edit on job cards, never create. */
export const inspectionFindingCreateBody = z.object({
  category: nonEmpty.max(64),
  categoryAr: z.string().max(64).optional(),
  item: nonEmpty.max(120),
  itemAr: z.string().max(120).optional(),
  severity: inspectionSeverity.default('ok'),
  internalNote: z.string().max(2000).optional(),
  customerNote: z.string().max(2000).optional(),
  estimateLineId: ulid.optional(),
})
export type InspectionFindingCreateBody = z.infer<typeof inspectionFindingCreateBody>

/** What the generic collection router accepts on `PATCH` — everything about a
 *  finding may be revised as the inspection continues (a technician upgrades
 *  "monitor" to "attention" after a second look, or links it to the estimate
 *  line once one exists) except which job card it belongs to. */
export const inspectionFindingUpdate = z.object({
  severity: inspectionSeverity.optional(),
  internalNote: z.string().max(2000).nullable().optional(),
  customerNote: z.string().max(2000).nullable().optional(),
  estimateLineId: ulid.nullable().optional(),
})
export type InspectionFindingUpdate = z.infer<typeof inspectionFindingUpdate>

/* No generic create — every row is born from the bespoke route above, which
 * derives `jobCardId` from the URL and `recordedBy` from the caller rather
 * than trusting either in a body. */
export const inspectionFindingCreate = z.never()

export const inspectionFindingRow = appRow({
  jobCardId: ulid,
  category: nonEmpty,
  categoryAr: z.string().nullable(),
  item: nonEmpty,
  itemAr: z.string().nullable(),
  severity: inspectionSeverity,
  internalNote: z.string().nullable(),
  customerNote: z.string().nullable(),
  estimateLineId: ulid.nullable(),
  recordedBy: ulid.nullable(),
})
export type InspectionFindingRow = z.infer<typeof inspectionFindingRow>

/** What the generic collection accepts on `PATCH /inspection-media/:id` — the
 *  annotation overlay only. Everything else about a media row (the file, its
 *  kind, which finding it evidences) is fixed at upload time. */
export const inspectionMediaUpdate = z.object({
  annotations: z.array(inspectionAnnotation).max(50).optional(),
})
export type InspectionMediaUpdate = z.infer<typeof inspectionMediaUpdate>

/* No generic create — every row is born from the multipart upload route,
 * which is the only place a file's bytes can arrive. */
export const inspectionMediaCreate = z.never()

export const inspectionMediaRow = appRow({
  findingId: ulid,
  jobCardId: ulid,
  kind: inspectionMediaKind,
  stage: inspectionMediaStage,
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  annotations: z.array(inspectionAnnotation),
  uploadedBy: ulid.nullable(),
  /** `GET /inspection-media/:id/file` — never the storage path itself. */
  url: z.string(),
})
export type InspectionMediaRow = z.infer<typeof inspectionMediaRow>

/** The allowed upload shapes, checked against the multipart part's declared
 *  content type before a byte is written to disk. Anything else is refused —
 *  this is evidence storage for a vehicle inspection, not a general file
 *  drop. */
export const INSPECTION_MEDIA_MIME_TYPES: Readonly<Record<InspectionMediaKind, readonly string[]>> = {
  photo: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
}

export const INSPECTION_MEDIA_MAX_BYTES: Readonly<Record<InspectionMediaKind, number>> = {
  photo: 15 * 1024 * 1024,
  video: 150 * 1024 * 1024,
}

/** `GET /jobs/:id/health-check-report` — the customer-facing read.
 *
 *  Deliberately a narrower shape than `inspectionFindingRow`: no
 *  `internalNote`, no `recordedBy`. The report is built by a hand-picked SQL
 *  select (`server/src/routes/inspection.ts`), not by redacting the internal
 *  row on the way out, so there is no code path on which the internal note
 *  is fetched into the same process as a customer's request at all. */
export const healthCheckFinding = z.object({
  id: ulid,
  category: nonEmpty,
  categoryAr: z.string().nullable(),
  item: nonEmpty,
  itemAr: z.string().nullable(),
  severity: inspectionSeverity,
  customerNote: z.string().nullable(),
  media: z.array(
    z.object({
      id: ulid,
      kind: inspectionMediaKind,
      stage: inspectionMediaStage,
      annotations: z.array(inspectionAnnotation),
      url: z.string(),
    }),
  ),
})
export type HealthCheckFinding = z.infer<typeof healthCheckFinding>

export const healthCheckReport = z.object({
  jobCardId: ulid,
  vehicle: z.string(),
  findings: z.array(healthCheckFinding),
})
export type HealthCheckReport = z.infer<typeof healthCheckReport>
