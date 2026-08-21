import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createRepository, mockRepository, type Repository } from '@/data/repository'

/**
 * The seam between screens and their data source, wired into the React tree.
 *
 * `createRepository()` returns the mock synchronously via a resolved Promise
 * when `VITE_API_BASE_URL` is unset, and the HTTP-backed one after a dynamic
 * import when set. The provider always starts with `mockRepository` so the
 * first render never shows an empty state — that would flash on every page
 * load. It then upgrades to whatever `createRepository()` returns.
 *
 * Under mock, the upgrade is a no-op — the returned value IS `mockRepository`,
 * a reference comparison, so React skips the re-render. Under HTTP the swap
 * happens once, and every subsequent `useCollection(key)` reads through the
 * new repo.
 *
 * A screen that mounts before the promise resolves reads through the mock for
 * one paint. That is only visible under HTTP, and it's the same treatment
 * `useQuery` uses for staleness — the mock rows are the placeholder, replaced
 * on refetch.
 */

const RepositoryContext = createContext<Repository>(mockRepository)

export function RepositoryProvider({
  children,
  initial,
}: {
  children: ReactNode
  /** Test seam: skip the async setup and provide a repository directly. */
  initial?: Repository
}) {
  const [repo, setRepo] = useState<Repository>(initial ?? mockRepository)

  useEffect(() => {
    if (initial) return
    let cancelled = false
    createRepository().then((next) => {
      if (!cancelled && next !== mockRepository) setRepo(next)
    })
    return () => {
      cancelled = true
    }
  }, [initial])

  return <RepositoryContext.Provider value={repo}>{children}</RepositoryContext.Provider>
}

/** Read the repository from context. */
export function useRepository(): Repository {
  return useContext(RepositoryContext)
}
