/** The three envelopes every endpoint in `API_ENDPOINTS.md` shares: the list
 *  query, the paged result and the error body. Defined once so the client's
 *  parser and the server's serialiser cannot drift apart. */
import { z } from 'zod'

/** `?page=1&pageSize=25&sort=field:desc&q=search&filter[field]=value`
 *
 *  `filter` arrives from Fastify's query parser as a nested object; the schema
 *  accepts the flattened `filter[field]` form too so a hand-built URL works. */
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  /** `field` or `field:asc` / `field:desc`. */
  sort: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*(:(asc|desc))?$/, 'expected field or field:asc|desc')
    .optional(),
  q: z.string().trim().max(200).optional(),
  filter: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  /** Include soft-deleted rows. Refused unless the caller may delete. */
  includeDeleted: z.coerce.boolean().optional(),
})

export type ListQuery = z.infer<typeof listQuery>
export type ListQueryInput = z.input<typeof listQuery>

export const pageMeta = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
})

export type PageMeta = z.infer<typeof pageMeta>

/** `{ rows, page }` — the pagination envelope every list endpoint returns. */
export function paged<TSchema extends z.ZodTypeAny>(row: TSchema) {
  return z.object({ rows: z.array(row), page: pageMeta })
}

export interface Paged<TRow> {
  rows: readonly TRow[]
  page: PageMeta
}

/** The failure taxonomy. Every non-2xx body is `{error:{code,message,field?}}`.
 *
 *  `not_found` covers cross-tenant reads deliberately: a 403 would confirm the
 *  record exists, which is itself a disclosure. */
export const errorCode = z.enum([
  'bad_request',
  'validation_failed',
  'unauthenticated',
  'forbidden',
  'not_found',
  'conflict',
  'version_conflict',
  'idempotency_conflict',
  'rule_violated',
  'approval_required',
  'rate_limited',
  'internal',
])

export type ErrorCode = z.infer<typeof errorCode>

export const errorEnvelope = z.object({
  error: z.object({
    code: errorCode,
    message: z.string(),
    field: z.string().optional(),
    /** Correlates a client report with a server log line. */
    requestId: z.string().optional(),
  }),
})

export type ErrorEnvelope = z.infer<typeof errorEnvelope>

export const HTTP_STATUS_FOR_CODE: Record<ErrorCode, number> = {
  bad_request: 400,
  validation_failed: 422,
  unauthenticated: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  version_conflict: 409,
  idempotency_conflict: 409,
  rule_violated: 422,
  approval_required: 403,
  rate_limited: 429,
  internal: 500,
}

/** Mutations that create a business effect carry this header. A replay returns
 *  the first response and creates no second effect. */
export const IDEMPOTENCY_HEADER = 'idempotency-key'
export const idempotencyKey = z.string().min(8).max(128)

/** Sent by the client on an update to claim the row version it read. */
export const IF_MATCH_VERSION_HEADER = 'if-match-version'
