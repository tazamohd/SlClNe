import type { Collection, CollectionKey, Repository } from '../repository'
import { ApiClient, type ListQuery } from './client'
import { ENDPOINTS } from './endpoints'

/** Thrown when a screen reads a collection the REST contract has no endpoint
 *  for. Deliberately loud: silently falling back to the design fixtures would
 *  put demo data on a production screen, and nobody would notice until a
 *  customer saw someone else's invoice total. */
export class MissingEndpointError extends Error {
  constructor(readonly collection: CollectionKey) {
    super(
      `No API endpoint for "${collection}". API_ENDPOINTS.md does not define a ` +
        `list route for it — it is either an expansion of a parent resource or ` +
        `not yet in the contract. See src/data/http/endpoints.ts.`,
    )
    this.name = 'MissingEndpointError'
  }
}

/** A list response. The contract paginates, so the rows may arrive wrapped;
 *  both shapes are accepted because an unwrapped array is what most of these
 *  endpoints return today. */
type ListResponse<TRow> = readonly TRow[] | { data: readonly TRow[]; total?: number }

function rowsOf<TRow>(payload: ListResponse<TRow>): readonly TRow[] {
  // `Array.isArray` does not narrow a `readonly T[]` union, so test the wrapper.
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? []
  }
  return (payload as readonly TRow[]) ?? []
}

function collectionFor<TRow>(client: ApiClient, key: CollectionKey, query?: ListQuery): Collection<TRow> {
  const path = ENDPOINTS[key]
  if (path === null) {
    return {
      list: () => Promise.reject(new MissingEndpointError(key)),
    }
  }
  return {
    list: async () => rowsOf(await client.get<ListResponse<TRow>>(path, query)),
  }
}

/**
 * The repository backed by the real API.
 *
 * Shape-identical to `mockRepository`, so swapping them is the one-line change
 * the architecture promised — no screen imports this directly.
 */
export function createHttpRepository(client: ApiClient): Repository {
  const keys = Object.keys(ENDPOINTS) as CollectionKey[]
  const repository = {} as Record<CollectionKey, Collection<unknown>>
  for (const key of keys) repository[key] = collectionFor(client, key)
  return repository as unknown as Repository
}
