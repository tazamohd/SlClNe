/** TanStack Query bindings for the repository seam.
 *
 *  Persistence logic lives here and nowhere else — a visual component should
 *  never know about cache keys, rollback or version conflicts. The mutation
 *  hooks all follow the same shape required by the optimistic-update rule:
 *  apply, then on success reconcile, on failure roll back **and** surface the
 *  error, then invalidate. The UI is never left showing a state the server
 *  rejected.
 */
import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useToast } from '@/components/ui/Toast'
import { usePreferences } from '@/providers/PreferencesProvider'
import {
  repository,
  RepositoryError,
  type Collection,
  type CollectionKey,
  type MutationOptions,
  type PageMeta,
  type Paged,
  type Query,
  type Repository,
} from './repository'

/** The row type a collection yields. */
export type RowOf<K extends CollectionKey> =
  Repository[K] extends Collection<infer TRow> ? TRow : never

type WritableRow<K extends CollectionKey> = RowOf<K> & {
  _id?: string
  _version?: number
}

/** Cache keys. A list is `[key]` or `[key, query]`, a single row is
 *  `[key, 'entity', id]` — all under the `[key]` prefix, so invalidating a
 *  collection reaches every view of it. */
export const queryKeys = {
  list: (key: CollectionKey, query?: Query) =>
    query && Object.keys(query).length > 0 ? ([key, query] as const) : ([key] as const),
  entity: (key: CollectionKey, id: string) => [key, 'entity', id] as const,
  all: (key: CollectionKey) => [key] as const,
}

/** Reads a collection through the repository seam.
 *
 *  `const { data: jobs = [] } = useCollection('jobs')`
 *
 *  Returns the rows, not the pagination envelope, because that is what every
 *  call site wants and what they were written against. `usePagedCollection`
 *  exposes the envelope for a screen that paginates. */
export function useCollection<K extends CollectionKey>(key: K, query?: Query) {
  return useQuery<Paged<RowOf<K>>, RepositoryError, readonly RowOf<K>[]>({
    queryKey: queryKeys.list(key, query),
    queryFn: () =>
      (repository[key] as Collection<RowOf<K>>).list(query) as Promise<Paged<RowOf<K>>>,
    select: (paged) => paged.rows,
  })
}

/** The same read, keeping the `{ rows, page }` envelope. */
export function usePagedCollection<K extends CollectionKey>(key: K, query?: Query) {
  return useQuery<Paged<RowOf<K>>, RepositoryError>({
    queryKey: queryKeys.list(key, query),
    queryFn: () =>
      (repository[key] as Collection<RowOf<K>>).list(query) as Promise<Paged<RowOf<K>>>,
  })
}

/** One record by id — the ULID, or the business code the design shows. */
export function useEntity<K extends CollectionKey>(key: K, id: string | undefined) {
  return useQuery<RowOf<K>, RepositoryError>({
    queryKey: queryKeys.entity(key, id ?? ''),
    queryFn: () => (repository[key] as Collection<RowOf<K>>).get(id as string),
    enabled: Boolean(id),
  })
}

/** Every cached list for a collection, captured before an optimistic write so
 *  a rejection can put all of them back exactly as they were. */
type ListSnapshot<K extends CollectionKey> = [readonly unknown[], Paged<RowOf<K>> | undefined][]

function snapshotLists<K extends CollectionKey>(
  client: QueryClient,
  key: K,
): ListSnapshot<K> {
  return client
    .getQueriesData<Paged<RowOf<K>>>({ queryKey: queryKeys.all(key) })
    .map(([queryKey, data]) => [queryKey, data])
}

function restoreLists<K extends CollectionKey>(client: QueryClient, snapshot: ListSnapshot<K>) {
  for (const [queryKey, data] of snapshot) {
    client.setQueryData(queryKey, data)
  }
}

function patchLists<K extends CollectionKey>(
  client: QueryClient,
  key: K,
  apply: (rows: readonly RowOf<K>[]) => readonly RowOf<K>[],
  pageDelta = 0,
) {
  for (const [queryKey, data] of client.getQueriesData<Paged<RowOf<K>>>({
    queryKey: queryKeys.all(key),
  })) {
    if (!data || !Array.isArray(data.rows)) continue
    const page: PageMeta = {
      ...data.page,
      total: Math.max(0, data.page.total + pageDelta),
    }
    client.setQueryData(queryKey, { rows: apply(data.rows), page })
  }
}

/** Applies a patch to a row without assuming the row is a plain object — the
 *  `services` collection is a tuple, and spreading one would silently produce
 *  an object that no longer renders. */
function merge<TRow>(row: TRow, patch: Partial<TRow>): TRow {
  if (Array.isArray(row)) return row
  return { ...(row as object), ...(patch as object) } as TRow
}

function identify(row: unknown): string | undefined {
  const candidate = row as { _id?: string; id?: string } | null
  return candidate?._id ?? (typeof candidate?.id === 'string' ? candidate.id : undefined)
}

export interface MutationContext<K extends CollectionKey> {
  snapshot: ListSnapshot<K>
}

export interface UseCreateInput<K extends CollectionKey> {
  input: Partial<RowOf<K>>
  options?: MutationOptions
}

/** Creates a row, showing it immediately and removing it again if the server
 *  refuses. The optimistic row is marked with a temporary id so the success
 *  handler can replace exactly the row it added. */
export function useCreate<K extends CollectionKey>(
  key: K,
): UseMutationResult<RowOf<K>, RepositoryError, UseCreateInput<K>, MutationContext<K>> {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ input, options }: UseCreateInput<K>) =>
      (repository[key] as Collection<RowOf<K>>).create(input, options),

    async onMutate({ input }) {
      await client.cancelQueries({ queryKey: queryKeys.all(key) })
      const snapshot = snapshotLists<K>(client, key)
      const optimistic = { ...(input as object), _optimistic: true } as RowOf<K>
      patchLists<K>(client, key, (rows) => [...rows, optimistic], 1)
      return { snapshot }
    },

    onError(_error, _variables, context) {
      if (context) restoreLists<K>(client, context.snapshot)
    },

    onSuccess(created) {
      patchLists<K>(client, key, (rows) =>
        rows.map((row) =>
          (row as { _optimistic?: boolean })._optimistic ? created : row,
        ),
      )
      const id = identify(created)
      if (id) client.setQueryData(queryKeys.entity(key, id), created)
    },

    onSettled() {
      /* The server is the authority on derived fields — totals, counts, codes —
       * so the optimistic row is always replaced by a real read. */
      void client.invalidateQueries({ queryKey: queryKeys.all(key) })
    },
  })
}

export interface UseUpdateInput<K extends CollectionKey> {
  id: string
  patch: Partial<RowOf<K>>
  options?: MutationOptions
}

/** Updates a row optimistically.
 *
 *  If the caller does not pass a version, the version of the cached row is
 *  claimed — so two people editing the same record still produce a 409 for the
 *  second rather than a silent overwrite. */
export function useUpdate<K extends CollectionKey>(
  key: K,
): UseMutationResult<RowOf<K>, RepositoryError, UseUpdateInput<K>, MutationContext<K>> {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch, options }: UseUpdateInput<K>) => {
      const cached = findCached<K>(client, key, id)
      const version = options?.version ?? (cached as WritableRow<K> | undefined)?._version
      return (repository[key] as Collection<RowOf<K>>).update(id, patch, {
        ...options,
        ...(version === undefined ? {} : { version }),
      })
    },

    async onMutate({ id, patch }) {
      await client.cancelQueries({ queryKey: queryKeys.all(key) })
      const snapshot = snapshotLists<K>(client, key)
      patchLists<K>(client, key, (rows) =>
        rows.map((row) => (identify(row) === id ? merge(row, patch) : row)),
      )
      const cached = client.getQueryData<RowOf<K>>(queryKeys.entity(key, id))
      if (cached) client.setQueryData(queryKeys.entity(key, id), merge(cached, patch))
      return { snapshot }
    },

    onError(_error, variables, context) {
      if (context) restoreLists<K>(client, context.snapshot)
      void client.invalidateQueries({ queryKey: queryKeys.entity(key, variables.id) })
    },

    onSuccess(updated, variables) {
      patchLists<K>(client, key, (rows) =>
        rows.map((row) => (identify(row) === variables.id ? updated : row)),
      )
      client.setQueryData(queryKeys.entity(key, variables.id), updated)
    },

    onSettled() {
      void client.invalidateQueries({ queryKey: queryKeys.all(key) })
    },
  })
}

export interface UseDeleteInput {
  id: string
}

export function useDelete<K extends CollectionKey>(
  key: K,
): UseMutationResult<void, RepositoryError, UseDeleteInput, MutationContext<K>> {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: UseDeleteInput) => (repository[key] as Collection<RowOf<K>>).delete(id),

    async onMutate({ id }) {
      await client.cancelQueries({ queryKey: queryKeys.all(key) })
      const snapshot = snapshotLists<K>(client, key)
      patchLists<K>(client, key, (rows) => rows.filter((row) => identify(row) !== id), -1)
      return { snapshot }
    },

    onError(_error, _variables, context) {
      if (context) restoreLists<K>(client, context.snapshot)
    },

    onSuccess(_result, variables) {
      client.removeQueries({ queryKey: queryKeys.entity(key, variables.id) })
    },

    onSettled() {
      void client.invalidateQueries({ queryKey: queryKeys.all(key) })
    },
  })
}

export type BulkAction<K extends CollectionKey> =
  | { kind: 'update'; ids: readonly string[]; patch: Partial<RowOf<K>> }
  | { kind: 'delete'; ids: readonly string[] }

/** Bulk update and bulk delete over a selection.
 *
 *  Both are optimistic and both roll back as one: a partial rollback would
 *  leave the table showing some rows changed and some not, which is worse than
 *  either outcome. */
export function useBulk<K extends CollectionKey>(
  key: K,
): UseMutationResult<RowOf<K>[] | void, RepositoryError, BulkAction<K>, MutationContext<K>> {
  const client = useQueryClient()
  return useMutation({
    async mutationFn(action: BulkAction<K>): Promise<RowOf<K>[] | void> {
      const collection = repository[key] as Collection<RowOf<K>>
      if (action.kind === 'update') return collection.bulkUpdate(action.ids, action.patch)
      await collection.bulkDelete(action.ids)
    },

    async onMutate(action) {
      await client.cancelQueries({ queryKey: queryKeys.all(key) })
      const snapshot = snapshotLists<K>(client, key)
      const selected = new Set(action.ids)
      if (action.kind === 'update') {
        patchLists<K>(client, key, (rows) =>
          rows.map((row) => {
            const id = identify(row)
            return id && selected.has(id) ? merge(row, action.patch) : row
          }),
        )
      } else {
        patchLists<K>(
          client,
          key,
          (rows) =>
            rows.filter((row) => {
              const id = identify(row)
              return !id || !selected.has(id)
            }),
          -action.ids.length,
        )
      }
      return { snapshot }
    },

    onError(_error, _action, context) {
      if (context) restoreLists<K>(client, context.snapshot)
    },

    onSettled(_result, _error, action) {
      for (const id of action.ids) {
        void client.invalidateQueries({ queryKey: queryKeys.entity(key, id) })
      }
      void client.invalidateQueries({ queryKey: queryKeys.all(key) })
    },
  })
}

/** Delete with a way back.
 *
 *  Snapshots the row before the optimistic delete and shows an "Undo" toast;
 *  undo re-creates the row from the snapshot minus its server metadata. On the
 *  fixtures the row simply returns; against the API it comes back with a new
 *  id, which is the honest outcome of a delete that was carried out and then
 *  reversed. `label` names the thing for the toast ("Job card"). */
export function useUndoableDelete<K extends CollectionKey>(key: K, label = 'Record') {
  const client = useQueryClient()
  const toast = useToast()
  const { t } = usePreferences()
  const remove = useDelete<K>(key)
  const create = useCreate<K>(key)

  const run = useCallback(
    async (id: string) => {
      const snapshot = findCached<K>(client, key, id)
      await remove.mutateAsync({ id })
      toast.show({
        title: `${t(label)} ${t('deleted')}`,
        tone: 'success',
        undo: snapshot
          ? () => {
              const restore = { ...(snapshot as object) } as Record<string, unknown>
              delete restore._id
              delete restore._version
              delete restore._createdAt
              delete restore._updatedAt
              delete restore._optimistic
              void create.mutateAsync({ input: restore as Partial<RowOf<K>> })
            }
          : undefined,
      }, 6000)
    },
    [client, key, remove, create, toast, t, label],
  )

  return { remove: run, pending: remove.isPending || create.isPending }
}

function findCached<K extends CollectionKey>(
  client: QueryClient,
  key: K,
  id: string,
): RowOf<K> | undefined {
  const single = client.getQueryData<RowOf<K>>(queryKeys.entity(key, id))
  if (single) return single
  for (const [, data] of client.getQueriesData<Paged<RowOf<K>>>({ queryKey: queryKeys.all(key) })) {
    const found = data?.rows?.find((row) => identify(row) === id)
    if (found) return found
  }
  return undefined
}

/** A version conflict is the one mutation failure a screen must handle rather
 *  than merely report: the user's edit is intact, but it was written against a
 *  row that has moved. */
export function isConflict(error: unknown): error is RepositoryError {
  return error instanceof RepositoryError && error.code === 'version_conflict'
}

export { RepositoryError }
export type { Query, Paged, PageMeta, MutationOptions }
