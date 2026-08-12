import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** The stage-change transport.
 *
 *  `isLive` and `API_URL` are read from `import.meta.env` when the repository
 *  module first loads, so a test that wants the live path has to supply the
 *  module rather than the variable. Everything else here is the real code,
 *  including the real `RepositoryError`. */
vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, API_URL: 'https://api.test/api/v1', isLive: true }
})

const {
  transitionJob,
  assignJob,
  setWorkshopAccessTokenProvider,
  transitionFailureMessage,
  isRefusal,
  RepositoryError,
} = await import('@/screens/workshop/api')

function respond(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

beforeEach(() => {
  setWorkshopAccessTokenProvider(() => 'token-abc')
})

afterEach(() => {
  setWorkshopAccessTokenProvider(() => null)
})

describe('transitionJob', () => {
  it('posts the stage to the job’s own transition endpoint, authenticated', async () => {
    const fetchMock = vi.fn(() => respond(200, { id: 'A3F8B2C1', stage: 'inspection' }))
    vi.stubGlobal('fetch', fetchMock)

    await transitionJob('A3F8B2C1', 'inspection', 'odometer 42,180')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/jobs/A3F8B2C1/transition')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({ to: 'inspection', reason: 'odometer 42,180' })
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token-abc')
  })

  it('omits an absent reason rather than sending an empty one', async () => {
    const fetchMock = vi.fn(() => respond(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    await transitionJob('A3F8B2C1', 'qc')
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(String(init.body))).toEqual({ to: 'qc' })
  })

  it('surfaces a segregation-of-duties refusal in the server’s own words', async () => {
    const message =
      'Segregation of duties: you performed "Perform repair" on this job card, ' +
      'so you may not also "Pass quality check". Someone else must.'
    vi.stubGlobal('fetch', vi.fn(() => respond(403, { error: { code: 'forbidden', message } })))

    const failure = await transitionJob('A3F8B2C1', 'delivery').catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(RepositoryError)
    expect((failure as InstanceType<typeof RepositoryError>).code).toBe('forbidden')
    expect(isRefusal(failure)).toBe(true)
    // The API is the only party that knows which rule refused. Replacing its
    // sentence with a generic one is a downgrade, not a polish.
    expect(transitionFailureMessage(failure, 'fallback')).toBe(message)
  })

  it('reports a skipped gate as a rule violation, not a network problem', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        respond(422, {
          error: { code: 'rule_violated', message: 'A job at checkin cannot move to delivery.' },
        })
      )
    )
    const failure = await transitionJob('A3F8B2C1', 'delivery').catch((error: unknown) => error)
    expect(isRefusal(failure)).toBe(true)
    expect(transitionFailureMessage(failure, 'fallback')).toMatch(/cannot move to delivery/)
  })

  it('turns an unreachable server into a failure that names itself', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('failed to fetch'))))
    const failure = await transitionJob('A3F8B2C1', 'qc').catch((error: unknown) => error)
    expect((failure as InstanceType<typeof RepositoryError>).code).toBe('network')
    expect(isRefusal(failure)).toBe(false)
    expect(transitionFailureMessage(failure, 'fallback')).toMatch(/could not be reached/)
  })

  it('escapes the reference so a crafted id cannot reshape the path', async () => {
    const fetchMock = vi.fn(() => respond(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    await transitionJob('../estimates/EST-1/approve', 'qc')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe(
      'https://api.test/api/v1/jobs/..%2Festimates%2FEST-1%2Fapprove/transition'
    )
  })
})

describe('assignJob', () => {
  it('uses the dedicated route, which checks the technician is in this tenant', async () => {
    const fetchMock = vi.fn(() => respond(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    await assignJob('A3F8B2C1', '01JTECH')
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/jobs/A3F8B2C1/assign')
    expect(JSON.parse(String(init.body))).toEqual({ techId: '01JTECH' })
  })
})
