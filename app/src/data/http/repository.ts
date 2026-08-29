import type { Collection, CollectionKey, Paged, Repository } from '../repository'
import { ApiClient, type ListQuery } from './client'
import { ENDPOINTS } from './endpoints'

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

type ListResponse<TRow> = Paged<TRow> | { data: readonly TRow[]; total?: number }

function pagedOf<TRow>(payload: ListResponse<TRow>): Paged<TRow> {
  if ('rows' in payload && 'page' in payload) return payload
  const rows = 'data' in payload ? (payload.data ?? []) : []
  return {
    rows,
    page: { page: 1, pageSize: rows.length, total: rows.length, totalPages: 1 },
  }
}

function itemPath(path: string, id: string | number): string {
  return `${path}/${encodeURIComponent(String(id))}`
}

function collectionFor<TRow>(client: ApiClient, key: CollectionKey, _query?: ListQuery): Collection<TRow> {
  const path = ENDPOINTS[key]
  if (path === null) {
    const reject = () => Promise.reject(new MissingEndpointError(key))
    return {
      list: reject, get: reject, create: reject, update: reject, delete: reject,
      bulkCreate: reject, bulkUpdate: reject, bulkDelete: reject,
    }
  }
  return {
    list: async (q) => pagedOf(await client.get<ListResponse<TRow>>(path, q as ListQuery)),
    get: (id) => client.get<TRow>(itemPath(path, id)),
    create: (body) => client.post<TRow>(path, body),
    update: (id, body) => client.patch<TRow>(itemPath(path, id), body),
    delete: async (id) => { await client.delete<void>(itemPath(path, id)) },
    bulkCreate: (inputs) => client.post<TRow[]>(`${path}/bulk`, inputs),
    bulkUpdate: (ids, patch) => client.patch<TRow[]>(`${path}/bulk`, { ids, patch }),
    bulkDelete: async (ids) => { await client.post<void>(`${path}/bulk-delete`, { ids }) },
  }
}

export function createHttpRepository(client: ApiClient): Repository {
  const keys = Object.keys(ENDPOINTS) as CollectionKey[]
  const repository = {} as Record<CollectionKey, Collection<unknown>>
  for (const key of keys) repository[key] = collectionFor(client, key)
  return repository as unknown as Repository
}
