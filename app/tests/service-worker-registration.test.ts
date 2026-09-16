import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** When the app registers a worker at all, and what it cleans up when it does
 *  not.
 *
 *  Both halves matter. Registering in the wrong place is how a dev server ends
 *  up serving yesterday's modules through a worker that HMR cannot see; *not*
 *  unregistering is how a worker installed by an earlier build keeps serving
 *  its cached shell long after the app stopped shipping one — "turn the service
 *  worker off" has to be an instruction that can actually be carried out.
 */

const isNative = vi.fn(() => false)
vi.mock('@/lib/native', () => ({ isNative: () => isNative() }))

async function load() {
  vi.resetModules()
  return import('@/lib/service-worker')
}

const registrations = [{ unregister: vi.fn(async () => true) }]

beforeEach(() => {
  isNative.mockReturnValue(false)
  registrations[0].unregister.mockClear()
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      register: vi.fn(async () => ({ installing: null })),
      getRegistrations: vi.fn(async () => registrations),
      controller: null,
    },
  })
})

afterEach(() => {
  // @ts-expect-error — removing the stub between cases
  delete navigator.serviceWorker
})

describe('shouldRegister', () => {
  it('is false in a development build', async () => {
    /* `import.meta.env.PROD` is false under vitest, which is the same answer
     * `vite dev` gets — a worker in front of the dev server would serve stale
     * modules that HMR has no way to invalidate. */
    const { shouldRegister } = await load()
    expect(shouldRegister()).toBe(false)
  })

  it('is false under Capacitor even in a production build', async () => {
    isNative.mockReturnValue(true)
    const { shouldRegister } = await load()
    expect(shouldRegister()).toBe(false)
  })

  it('is false where the browser has no service worker support', async () => {
    // @ts-expect-error — the point of the check
    delete navigator.serviceWorker
    const { shouldRegister } = await load()
    expect(shouldRegister()).toBe(false)
  })
})

describe('initServiceWorker', () => {
  it('tears down an existing worker where one does not belong', async () => {
    const { initServiceWorker } = await load()
    initServiceWorker()
    await vi.waitFor(() => expect(registrations[0].unregister).toHaveBeenCalled())
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled()
  })
})

describe('clearCaches', () => {
  it('drops this app’s caches and nothing else on the origin', async () => {
    const names = ['salis-auto-abc', 'salis-auto-def', 'other-app-v2']
    const deleted: string[] = []
    vi.stubGlobal('caches', {
      keys: async () => names,
      delete: async (name: string) => {
        deleted.push(name)
        return true
      },
    })

    const { clearCaches } = await load()
    await clearCaches()

    expect(deleted).toEqual(['salis-auto-abc', 'salis-auto-def'])
    vi.unstubAllGlobals()
  })

  it('is survivable where storage is unavailable', async () => {
    /* Private mode and locked-down profiles throw on `caches` access. Nothing
     * depends on the cleanup succeeding, so it must not take a caller down. */
    vi.stubGlobal('caches', {
      keys: async () => {
        throw new Error('storage disabled')
      },
    })
    const { clearCaches } = await load()
    await expect(clearCaches()).resolves.toBeUndefined()
    vi.unstubAllGlobals()
  })
})
