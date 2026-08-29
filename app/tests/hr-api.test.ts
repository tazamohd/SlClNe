import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** The HR action transport and its failure mapping (vertical B).
 *
 *  The payroll post and the leave decisions are *actions*, not collections, so —
 *  like `screens/workshop/api.ts` and `screens/crm/api.ts` — the module makes the
 *  authed POST itself and reads the bearer token from the one source
 *  `repository.ts` owns. `API_URL`/`isLive` are read when the module first loads,
 *  so the live path is supplied by mocking the repository module; the transport
 *  itself is the real code, exercised without a server.
 */
vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, API_URL: 'https://api.test/api/v1', isLive: true }
})

const { RepositoryError } = await import('@/data/repository')
const {
  postPayrollRun,
  approveLeave,
  rejectLeave,
  setHrAccessTokenProvider,
  actionFailureMessage,
  isRefusal,
} = await import('@/screens/hr/api')

function respond(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

beforeEach(() => setHrAccessTokenProvider(() => 'token-hr'))
afterEach(() => {
  vi.restoreAllMocks()
  setHrAccessTokenProvider(() => null)
})

describe('the payroll post transport', () => {
  it('posts to the run’s own action endpoint, authenticated, with an empty body', async () => {
    const fetchMock = vi.fn(() => respond(200, { period: '2026-07', status: 'posted' }))
    vi.stubGlobal('fetch', fetchMock)

    const row = await postPayrollRun('01RUN')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/payroll/runs/01RUN/post')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({})
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token-hr')
    expect(row).toMatchObject({ status: 'posted' })
  })

  it('surfaces the posting invariant’s 409 as a refusal, keeping the server’s words', async () => {
    vi.stubGlobal('fetch', () =>
      respond(409, {
        error: { code: 'conflict', message: 'This payroll run is already posted and cannot be reopened.' },
      }),
    )
    const error = await postPayrollRun('01RUN').catch((e: unknown) => e)
    expect(isRefusal(error)).toBe(true)
    expect(actionFailureMessage(error, 'fallback')).toBe(
      'This payroll run is already posted and cannot be reopened.',
    )
  })
})

describe('the leave decision transport', () => {
  it('approves with an empty body, and with a reason when one is given', async () => {
    const noReason = vi.fn(() => respond(200, { status: 'approved' }))
    vi.stubGlobal('fetch', noReason)
    await approveLeave('01LV')
    const [url, init] = noReason.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/leave-requests/01LV/approve')
    expect(JSON.parse(String(init.body))).toEqual({})

    const withReason = vi.fn(() => respond(200, { status: 'approved' }))
    vi.stubGlobal('fetch', withReason)
    await approveLeave('01LV', 'Covered by annual balance.')
    expect(JSON.parse(String((withReason.mock.calls[0] as [string, RequestInit])[1].body))).toEqual({
      reason: 'Covered by annual balance.',
    })
  })

  it('rejects with the required reason', async () => {
    const fetchMock = vi.fn(() => respond(200, { status: 'rejected' }))
    vi.stubGlobal('fetch', fetchMock)
    await rejectLeave('01LV', 'Insufficient balance.')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/leave-requests/01LV/reject')
    expect(JSON.parse(String(init.body))).toEqual({ reason: 'Insufficient balance.' })
  })

  it('escapes the id so a crafted reference cannot reshape the path', async () => {
    const fetchMock = vi.fn(() => respond(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    await approveLeave('../payroll/runs/R1/post')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/api/v1/leave-requests/..%2Fpayroll%2Fruns%2FR1%2Fpost/approve')
  })
})

describe('failure mapping', () => {
  it('keeps the server’s own words for a role or rule refusal', () => {
    const refusal = new RepositoryError('forbidden', 'Your role cannot post payroll.')
    expect(isRefusal(refusal)).toBe(true)
    expect(actionFailureMessage(refusal, 'fallback')).toBe('Your role cannot post payroll.')
  })

  it('turns an unreachable server and a lost session into sentences of their own', () => {
    expect(actionFailureMessage(new RepositoryError('network', ''), 'fb')).toMatch(/could not be reached/)
    expect(actionFailureMessage(new RepositoryError('unauthenticated', ''), 'fb')).toMatch(/session has ended/)
  })
})
