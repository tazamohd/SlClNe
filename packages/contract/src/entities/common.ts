/** Fields every entity carries across the wire.
 *
 *  Rows are returned in the shape the screens already render (the design
 *  bundle's shape), with these underscore-prefixed fields added. Adding keys is
 *  invisible to a screen; renaming one is not — which is why the presenters
 *  keep `id` meaning the human business code wherever the design showed one,
 *  and put the ULID in `_id`. */
import { z } from 'zod'
import { isoDateTime, ulid, version } from '../primitives'

export const entityMeta = z.object({
  /** ULID primary key — the identifier every mutating route takes. */
  _id: ulid,
  /** Optimistic-concurrency token. Send it back on update to claim the row. */
  _version: version,
  _createdAt: isoDateTime,
  _updatedAt: isoDateTime,
})

export type EntityMeta = z.infer<typeof entityMeta>

/** A row as a screen receives it: the design shape plus the entity metadata. */
export function appRow<TShape extends z.ZodRawShape>(shape: TShape) {
  return z.object(shape).merge(entityMeta)
}

/** Tenancy, echoed on detail reads so a client can show which branch owns a
 *  record. Never accepted as input — it comes from the access token. */
export const tenancy = z.object({
  orgId: ulid,
  branchId: ulid.nullable(),
})

/** Every write route rejects these keys outright: they are server-owned. A
 *  request that tries to set its own `orgId` is not a validation slip, it is an
 *  attempt to cross a tenant boundary, and is refused rather than stripped. */
export const SERVER_OWNED_KEYS = [
  'id',
  '_id',
  '_version',
  '_createdAt',
  '_updatedAt',
  'orgId',
  'org_id',
  'branchId',
  'branch_id',
  'createdBy',
  'created_by',
  'updatedBy',
  'updated_by',
  'deletedAt',
  'deleted_at',
  'version',
] as const

/** Bulk operations, shared by every collection. */
export const bulkUpdateBody = z.object({
  ids: z.array(ulid).min(1).max(200),
  patch: z.record(z.string(), z.unknown()),
})

export const bulkDeleteBody = z.object({
  ids: z.array(ulid).min(1).max(200),
})

export type BulkUpdateBody = z.infer<typeof bulkUpdateBody>
export type BulkDeleteBody = z.infer<typeof bulkDeleteBody>
