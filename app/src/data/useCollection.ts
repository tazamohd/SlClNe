import { useQuery } from '@tanstack/react-query'
import { useRepository } from '@/providers/RepositoryProvider'
import type { Collection, CollectionKey, Repository } from './repository'

/** The row type a collection yields. */
export type RowOf<K extends CollectionKey> =
  Repository[K] extends Collection<infer TRow> ? TRow : never

/** Reads a collection through the repository seam.
 *
 *  `const { data: jobs = [] } = useCollection('jobs')`
 *
 *  The repository comes from `RepositoryProvider` — mock by default, HTTP when
 *  `VITE_API_BASE_URL` is set. `queryKey` includes a repository identity so
 *  the cache invalidates on the mock→HTTP swap, otherwise the pre-swap mock
 *  rows would linger. */
export function useCollection<K extends CollectionKey>(key: K) {
  const repo = useRepository()
  return useQuery<readonly RowOf<K>[]>({
    queryKey: [key, repoId(repo)],
    queryFn: () => repo[key].list() as Promise<readonly RowOf<K>[]>,
  })
}

/** A cheap identity for the repository: the same object always gives the same
 *  key, so the cache stays stable while the repo is stable, and invalidates
 *  on swap. Uses a WeakMap so we don't pin repositories in memory. */
const repoIds = new WeakMap<Repository, number>()
let nextRepoId = 0
function repoId(repo: Repository): number {
  const existing = repoIds.get(repo)
  if (existing !== undefined) return existing
  const id = ++nextRepoId
  repoIds.set(repo, id)
  return id
}
