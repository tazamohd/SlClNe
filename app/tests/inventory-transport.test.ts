import { afterEach, describe, expect, it, vi } from 'vitest'

/** The stock-movement transport: exactly what goes on the wire.
 *
 *  `POST /inventory/:id/movement` and `GET /inventory/:id/movements` are actions
 *  on a part rather than collection CRUD, so they do not go through
 *  `data/repository.ts`'s HTTP client and their request shape is not covered by
 *  any other suite. Everything the server's guarantees depend on is asserted
 *  here: the path, the bearer token, the idempotency key that makes a retried
 *  receipt safe, and the mapping from an error envelope back to a
 *  `RepositoryError` the form can attach to a field.
 *
 *  `VITE_API_URL` is stubbed before the module graph loads, because
 *  `repository.ts` reads it once at import time — which is also what makes the
 *  fixture build genuinely serverless rather than conditionally so. */

interface Captured {
  url: string
  init: RequestInit
}

/** Loads the screen against an API base URL.
 *
 *  `API_URL` is resolved from `import.meta.env` at transform time, so it cannot
 *  be stubbed at runtime — the repository module itself is substituted instead,
 *  keeping every other export (including `RepositoryError`, whose identity the
 *  assertions depend on) exactly as it really is. */
async function loadWithApi(apiUrl = 'https://api.test') {
  vi.resetModules()
  vi.doMock('@/data/repository', async () => {
    const actual = await vi.importActual<typeof import('@/data/repository')>('@/data/repository')
    return { ...actual, API_URL: apiUrl, isLive: apiUrl !== '' }
  })
  return import('@/screens/feature/Inventory')
}

function stubFetch(responder: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: Captured[] = []
  vi.stubGlobal('fetch', async (input: RequestInfo | URL, init: RequestInit = {}) => {
    calls.push({ url: String(input), init })
    return responder(String(input), init)
  })
  return calls
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const MOVEMENT = {
  id: 'MV1',
  type: 'in',
  qty: 5,
  delta: 5,
  ref: 'PO-1',
  reason: null,
  toBranchId: null,
  createdAt: '2026-08-12T09:00:00.000Z',
  createdBy: 'u1',
}

afterEach(() => {
  vi.doUnmock('@/data/repository')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('the movement transport', () => {
  it('posts to the part movement endpoint with the token and the idempotency key', async () => {
    const screen = await loadWithApi()
    screen.setInventoryAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch((url) =>
      url.endsWith('/movements') ? json({ rows: [MOVEMENT] }) : json(MOVEMENT),
    )

    const api = screen.httpMovementApi()
    expect(api).not.toBeNull()

    const rows = await api!.record(
      'OF-TY-118',
      { type: 'in', qty: 5, ref: 'PO-1', reason: 'Delivery 88' },
      'idem-key-0001',
    )

    const post = calls[0]!
    expect(post.url).toBe('https://api.test/inventory/OF-TY-118/movement')
    expect(post.init.method).toBe('POST')
    const headers = new Headers(post.init.headers)
    expect(headers.get('authorization')).toBe('Bearer token-abc')
    expect(headers.get('idempotency-key')).toBe('idem-key-0001')
    expect(headers.get('content-type')).toBe('application/json')
    expect(JSON.parse(String(post.init.body))).toEqual({
      type: 'in',
      qty: 5,
      ref: 'PO-1',
      reason: 'Delivery 88',
    })

    // The ledger is re-read from the server rather than patched locally: the
    // server owns the resulting quantity, so the client asks rather than guesses.
    expect(calls[1]!.url).toBe('https://api.test/inventory/OF-TY-118/movements')
    expect(rows).toEqual([MOVEMENT])
  })

  it('escapes a part reference that would otherwise change the path', async () => {
    const screen = await loadWithApi()
    const calls = stubFetch(() => json({ rows: [] }))
    await screen.httpMovementApi()!.list('OF/../admin')
    expect(calls[0]!.url).toBe('https://api.test/inventory/OF%2F..%2Fadmin/movements')
  })

  it('maps a field-level rejection back onto the field', async () => {
    const screen = await loadWithApi()
    const { RepositoryError } = await import('@/data/repository')
    stubFetch(() =>
      json(
        {
          error: {
            code: 'rule_violated',
            message: 'Only unreserved stock can be consumed or transferred.',
            field: 'qty',
          },
        },
        422,
      ),
    )

    await expect(
      screen.httpMovementApi()!.record('SKU', { type: 'out', qty: 99 }, 'k'),
    ).rejects.toMatchObject({
      code: 'rule_violated',
      field: 'qty',
      message: 'Only unreserved stock can be consumed or transferred.',
    })
    await expect(
      screen.httpMovementApi()!.record('SKU', { type: 'out', qty: 99 }, 'k'),
    ).rejects.toBeInstanceOf(RepositoryError)
  })

  it('keeps a permission refusal in the server’s own words', async () => {
    const screen = await loadWithApi()
    stubFetch(() =>
      json(
        {
          error: {
            code: 'forbidden',
            message:
              'Segregation of duties: you performed "Issue stock" on this part, so you may not also "Adjust stock count".',
          },
        },
        403,
      ),
    )

    await expect(
      screen.httpMovementApi()!.record('SKU', { type: 'adjust', qty: 1 }, 'k'),
    ).rejects.toMatchObject({ code: 'forbidden', status: 403 })
  })

  it('reports an unreachable server as a network failure rather than a rejection', async () => {
    const screen = await loadWithApi()
    stubFetch(() => {
      throw new TypeError('Failed to fetch')
    })
    await expect(screen.httpMovementApi()!.list('SKU')).rejects.toMatchObject({
      code: 'network',
      status: 0,
    })
  })

  it('sends no authorization header while the token seam is unwired', async () => {
    // The honest failure mode: the request goes out, the server answers 401 and
    // the screen shows that refusal. It does not invent a session it lacks.
    const screen = await loadWithApi()
    screen.setInventoryAccessTokenProvider(() => null)
    const calls = stubFetch(() => json({ rows: [] }))
    await screen.httpMovementApi()!.list('SKU')
    expect(new Headers(calls[0]!.init.headers).get('authorization')).toBeNull()
  })

  it('has no transport at all when there is no API, and says why', async () => {
    // No mock: this is the real fixture build, where `VITE_API_URL` is unset.
    vi.resetModules()
    const screen = await import('@/screens/feature/Inventory')
    expect(screen.httpMovementApi()).toBeNull()
    expect(screen.movementUnavailableReason()).toMatch(/design fixtures/i)
  })
})
