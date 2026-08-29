import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** The CRM / fleet action transport (F-027).
 *
 *  `convertLead` and `renewFleet` are the two writes that are not plain
 *  collection mutations — actions on a document, posted directly with the
 *  bearer token. `isLive` and `API_URL` are read when the repository module
 *  first loads, so the live path is supplied by mocking the module; everything
 *  else here is the real code, including the real `RepositoryError`. */
vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, API_URL: 'https://api.test/api/v1', isLive: true }
})

const {
  convertLead,
  renewFleet,
  setCrmAccessTokenProvider,
  actionFailureMessage,
  isRefusal,
  RepositoryError,
} = await import('@/screens/crm/api')

function respond(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

beforeEach(() => {
  setCrmAccessTokenProvider(() => 'token-crm')
})

afterEach(() => {
  setCrmAccessTokenProvider(() => null)
})

describe('convertLead', () => {
  it('posts to the lead’s own convert endpoint, authenticated, with the refinements', async () => {
    const fetchMock = vi.fn(() => respond(201, { id: 'OPP1', name: 'Fleet Contract' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await convertLead('01LEAD', { ownerName: 'Khalid Al-Amri', probabilityPct: 60 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/crm/leads/01LEAD/convert')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({ ownerName: 'Khalid Al-Amri', probabilityPct: 60 })
    expect(new Headers(init.headers).get('authorization')).toBe('Bearer token-crm')
    // The action returns the created opportunity, which the success state links to.
    expect(result).toMatchObject({ id: 'OPP1' })
  })

  it('surfaces a role refusal in the server’s own words', async () => {
    const message = 'You do not have permission to convert leads.'
    vi.stubGlobal('fetch', vi.fn(() => respond(403, { error: { code: 'forbidden', message } })))

    const failure = await convertLead('01LEAD').catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(RepositoryError)
    expect(isRefusal(failure)).toBe(true)
    expect(actionFailureMessage(failure, 'fallback')).toBe(message)
  })

  it('escapes the reference so a crafted id cannot reshape the path', async () => {
    const fetchMock = vi.fn(() => respond(201, {}))
    vi.stubGlobal('fetch', fetchMock)
    await convertLead('../fleets/F1/renew')
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/api/v1/crm/leads/..%2Ffleets%2FF1%2Frenew/convert')
  })
})

describe('renewFleet', () => {
  it('posts the new term to the fleet’s renew endpoint', async () => {
    const fetchMock = vi.fn(() => respond(200, { id: 'F1', contract: 'active' }))
    vi.stubGlobal('fetch', fetchMock)

    await renewFleet('01FLEET', { contractEndDate: '2027-08-16', contractValueHalalas: 24000000 })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/fleets/01FLEET/renew')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({
      contractEndDate: '2027-08-16',
      contractValueHalalas: 24000000,
    })
  })

  it('reports a version conflict as itself, not a network problem', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        respond(409, {
          error: { code: 'conflict', message: 'This fleet changed since you loaded it.' },
        }),
      ),
    )
    const failure = await renewFleet('01FLEET', { contractEndDate: '2027-08-16' }).catch(
      (error: unknown) => error,
    )
    expect(failure).toBeInstanceOf(RepositoryError)
    expect(actionFailureMessage(failure, 'fallback')).toMatch(/changed since you loaded it/)
  })

  it('turns an unreachable server into a failure that names itself', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('failed to fetch'))))
    const failure = await renewFleet('01FLEET', { contractEndDate: '2027-08-16' }).catch(
      (error: unknown) => error,
    )
    expect((failure as InstanceType<typeof RepositoryError>).code).toBe('network')
    expect(actionFailureMessage(failure, 'fallback')).toMatch(/could not be reached/)
  })
})
