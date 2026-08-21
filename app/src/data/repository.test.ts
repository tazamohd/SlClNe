import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRepository, mockRepository, type Repository } from './repository'

afterEach(() => {
  vi.unstubAllEnvs()
})

/** The one-line swap the seam was written to enable. Both branches of
 *  `createRepository()` need to keep working, so each ends up asserted. */
describe('createRepository', () => {
  it('returns the same mockRepository reference when no base URL is set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    const repo = await createRepository()
    expect(repo).toBe(mockRepository)
  })

  it('returns an HTTP repository — different reference, same shape — when a base URL is set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.test')
    const repo = await createRepository()
    expect(repo).not.toBe(mockRepository)
    // Shape parity is what makes every screen keep working: adding a
    // collection to the interface fails the typecheck upstream, and the
    // http-repository test asserts every key resolves — this assertion just
    // records that the swap doesn't drop keys silently.
    expect(Object.keys(repo).sort()).toEqual(Object.keys(mockRepository).sort())
  })

  /** The mock branch is the "test and dev with no server" story. If someone
   *  changed it to return a new fixture object every call, screens would
   *  re-render on every provider swap and react-query's cache key wouldn't
   *  hold. Reference stability under repeated calls is the guarantee. */
  it('returns the same mockRepository across repeated no-op calls', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    const a = await createRepository()
    const b = await createRepository()
    expect(a).toBe(b)
    expect(a).toBe(mockRepository as Repository)
  })
})
