import { useQueryClient } from '@tanstack/react-query'
import { useRepository } from '@/providers/RepositoryProvider'
import type { CollectionKey } from './repository'
import type { RowOf } from './useCollection'

/** Write side of the repository seam.
 *
 *  `useCollection` reads; this writes and then invalidates that read so the
 *  list refetches in place. The read's query key is `[key, repoId]`
 *  (see `useCollection`); invalidating on the `[key]` prefix matches it
 *  regardless of the repo-identity suffix.
 *
 *  `create`/`update`/`remove` reject with `MockWriteError` under the mock repo
 *  (no `VITE_API_BASE_URL`) — that error propagates unchanged so a screen can
 *  degrade gracefully, exactly as `InvoiceCreate` does. Invalidation only runs
 *  after a write actually resolves, so a rejected mock write leaves the cache
 *  untouched.
 *
 *      const { create } = useCollectionWrite('customers')
 *      await create({ name, phone, email })   // list at /customers refreshes
 */
export function useCollectionWrite<K extends CollectionKey>(key: K) {
  const repo = useRepository()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [key] })

  return {
    async create(body: Partial<RowOf<K>>): Promise<RowOf<K>> {
      const created = await repo[key].create!(body as never)
      await invalidate()
      return created as RowOf<K>
    },
    async update(id: string | number, body: Partial<RowOf<K>>): Promise<RowOf<K>> {
      const updated = await repo[key].update!(id, body as never)
      await invalidate()
      return updated as RowOf<K>
    },
    async remove(id: string | number): Promise<void> {
      await repo[key].remove!(id)
      await invalidate()
    },
  }
}
