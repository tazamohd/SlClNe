import { useQuery } from '@tanstack/react-query'
import {
  mockRepository,
  type Collection,
  type CollectionKey,
  type Repository,
} from './repository'

/** The row type a collection yields. */
export type RowOf<K extends CollectionKey> =
  Repository[K] extends Collection<infer TRow> ? TRow : never

/** Reads a collection through the repository seam.
 *
 *  `const { data: jobs = [] } = useCollection('jobs')`
 *
 *  When the REST layer lands, `mockRepository` becomes an HTTP repository and
 *  every call site keeps working — including the loading and error states,
 *  which are already real here rather than bolted on later. */
export function useCollection<K extends CollectionKey>(key: K) {
  return useQuery<readonly RowOf<K>[]>({
    queryKey: [key],
    queryFn: () => mockRepository[key].list() as Promise<readonly RowOf<K>[]>,
  })
}
