/** Per-request context: who is asking, from where, and what they asked for. */
import type { FastifyRequest } from 'fastify'
import { listQuery, type ListQuery } from '@salis/contract'
import { badRequest } from './errors'
import type { Principal } from '../db/tenant'

declare module 'fastify' {
  interface FastifyRequest {
    principal?: Principal
  }
}

export function principalOf(request: FastifyRequest): Principal {
  const principal = request.principal
  if (!principal) {
    /* Reaching here means a route was registered outside the authentication
     * hook. That is a wiring mistake, not a client error, and it must fail
     * loudly rather than default to an anonymous principal. */
    throw new Error(`route ${request.method} ${request.url} ran without an authenticated principal`)
  }
  return principal
}

export interface RequestMeta {
  requestId: string
  ip?: string
  userAgent?: string
}

export function metaOf(request: FastifyRequest): RequestMeta {
  return {
    requestId: request.id,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  }
}

/** Fastify's default parser leaves `filter[status]=paid` as a flat key. The
 *  contract's schema wants it nested, so it is folded here — one place, rather
 *  than every list route reinventing it slightly differently. */
export function parseListQuery(raw: unknown): ListQuery {
  const flat = (raw ?? {}) as Record<string, unknown>
  const nested: Record<string, unknown> = {}
  const filter: Record<string, unknown> = { ...((flat.filter as Record<string, unknown>) ?? {}) }

  for (const [key, value] of Object.entries(flat)) {
    const match = /^filter\[(.+)\]$/.exec(key)
    if (match?.[1]) filter[match[1]] = value
    else if (key !== 'filter') nested[key] = value
  }
  if (Object.keys(filter).length > 0) nested.filter = filter

  const parsed = listQuery.safeParse(nested)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    throw badRequest(issue?.message ?? 'Invalid list query.', issue?.path.join('.'))
  }
  return parsed.data
}
