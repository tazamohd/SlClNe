/** `Idempotency-Key` handling for the endpoints that move money or stock.
 *
 *  A replay returns the original response and creates no second business
 *  effect. The same key with a *different* body is a caller bug, and is
 *  refused with 409 rather than replayed — otherwise a client that reuses a
 *  key by accident silently loses the second payment.
 */
import { createHash } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { ulid } from 'ulid'
import { idempotencyKeys } from '../db/schema'
import type { Tx } from '../db/tenant'
import { ApiError } from './errors'

export function hashBody(body: unknown): string {
  return createHash('sha256').update(JSON.stringify(body ?? null)).digest('hex')
}

export interface Replay {
  status: number
  body: unknown
}

export async function findReplay(
  tx: Tx,
  args: { orgId: string; key: string; endpoint: string; requestHash: string },
): Promise<Replay | null> {
  const [existing] = await tx
    .select()
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.orgId, args.orgId),
        eq(idempotencyKeys.key, args.key),
        eq(idempotencyKeys.endpoint, args.endpoint),
      ),
    )
    .limit(1)

  if (!existing) return null
  if (existing.requestHash !== args.requestHash) {
    throw new ApiError(
      'idempotency_conflict',
      'This Idempotency-Key was already used with a different request body.',
    )
  }
  return { status: existing.responseStatus, body: existing.responseBody }
}

export async function recordResult(
  tx: Tx,
  args: {
    orgId: string
    key: string
    endpoint: string
    requestHash: string
    status: number
    body: unknown
  },
): Promise<void> {
  await tx.insert(idempotencyKeys).values({
    id: ulid(),
    orgId: args.orgId,
    key: args.key,
    endpoint: args.endpoint,
    requestHash: args.requestHash,
    responseStatus: args.status,
    responseBody: args.body as never,
  })
}
