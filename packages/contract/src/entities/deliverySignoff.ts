/** Customer sign-off at delivery (Sprint 2, P0 backlog item 4).
 *
 *  `WorkshopSignature.tsx` captured a real canvas signature and
 *  `WorkshopDelivery.tsx` walked a real six-item checklist, but neither
 *  persisted anything: "Confirm Signature" only navigated to the next
 *  screen, and "Complete Delivery" only advanced the job's stage — the
 *  checklist and a fabricated odometer pair lived in local component state
 *  and vanished on reload. One row here is the hand-off record for one job
 *  card: the customer's signature image, when they agreed, the checklist the
 *  advisor actually completed, and the odometer reading taken at delivery.
 *
 *  Born from the multipart signature-upload route
 *  (`server/src/routes/delivery.ts`), the only place a signature image's
 *  bytes can arrive — the same reasoning `inspectionMediaCreate` uses.
 *  Everything else about the row (the checklist, the odometer) is filled in
 *  afterwards through the generic collection's `PATCH`. */
import { z } from 'zod'
import { ulid } from '../primitives'
import { appRow } from './common'

/** The six items `WorkshopDelivery.tsx`'s checklist already walks. A plain
 *  boolean map rather than an array of `{label, checked}` rows — there is
 *  exactly one of each, always, so the shape that can't represent a
 *  duplicate or a missing item is the honest one. */
export const deliverySignoffChecklist = z.object({
  customerNotified: z.boolean().default(false),
  keysReturned: z.boolean().default(false),
  documentsReady: z.boolean().default(false),
  invoiceAttached: z.boolean().default(false),
  cleaned: z.boolean().default(false),
  qualityCheck: z.boolean().default(false),
})
export type DeliverySignoffChecklist = z.infer<typeof deliverySignoffChecklist>

/* No generic create — every row is born from the multipart signature-upload
 * route, which derives `jobCardId` from the URL and `signedByName` from the
 * job card rather than trusting either in a JSON body. */
export const deliverySignoffCreate = z.never()

/** What the generic collection accepts on `PATCH /delivery-signoffs/:id` —
 *  the checklist and the odometer reading, the two fields that are only
 *  known once the advisor has actually walked the hand-off. The signature
 *  image, who signed and when are fixed at creation time. */
export const deliverySignoffUpdate = z.object({
  checklist: deliverySignoffChecklist.optional(),
  odometerOut: z.number().int().nonnegative().max(9_999_999).nullable().optional(),
})
export type DeliverySignoffUpdate = z.infer<typeof deliverySignoffUpdate>

export const deliverySignoffRow = appRow({
  jobCardId: ulid,
  signedByName: z.string(),
  agreedAt: z.string(),
  checklist: deliverySignoffChecklist,
  odometerOut: z.number().int().nullable(),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  /** `GET /delivery-signoffs/:id/signature` — never the storage path itself. */
  url: z.string(),
})
export type DeliverySignoffRow = z.infer<typeof deliverySignoffRow>

/** The only image type the signature pad ever exports (`canvas.toBlob('image/png')`)
 *  — this is a captured signature, not a general file drop. */
export const DELIVERY_SIGNATURE_MIME_TYPE = 'image/png'
export const DELIVERY_SIGNATURE_MAX_BYTES = 2 * 1024 * 1024
