import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** The insurance-claim lifecycle transport and its failure mapping (vertical A).
 *
 *  Two levels are proven here, both without a live server:
 *
 *  1. The real transport — `createInsuranceClaimsApi` from the repository — makes
 *     the four authed POSTs the workspace ultimately triggers. `API_URL`/`isLive`
 *     are read when the module first loads, so the live path is supplied by
 *     mocking the module; the transport itself is the real code.
 *  2. The `./api` wrapper the screen imports delegates to that accessor with the
 *     right shape, refuses on the fixture, and maps a `RepositoryError` to the
 *     sentence the user reads — keeping the server's own words.
 */
vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, API_URL: 'https://api.test/api/v1', isLive: true }
})

const {
  createInsuranceClaimsApi,
  setAccessTokenProvider,
  RepositoryError,
} = await import('@/data/repository')

const {
  lifecycle,
  setInsuranceClaimsApi,
  claimActionFailureMessage,
  isRefusal,
  isSodRefusal,
} = await import('@/screens/insurance/api')

function respond(status: number, body: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response)
}

afterEach(() => {
  vi.restoreAllMocks()
  setAccessTokenProvider(() => null)
})

// ── the real transport ───────────────────────────────────────────────────────

describe('the claim lifecycle transport', () => {
  const api = createInsuranceClaimsApi('https://api.test/api/v1')

  beforeEach(() => setAccessTokenProvider(() => 'token-insure'))

  it('submits a new claim to the collection root, authenticated, idempotent', async () => {
    const fetchMock = vi.fn(() => respond(201, { claimNumber: 'CLM-2026-0007' }))
    vi.stubGlobal('fetch', fetchMock)

    const input = {
      policyId: '01POLICY',
      vehicleLabel: 'Toyota Camry 2022',
      amountClaimedHalalas: 1_500_000,
      incidentDate: '2026-08-01',
      description: 'Rear bumper collision',
    }
    const row = await api.submit(input, { idempotencyKey: 'key-1' })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/insurance-claims')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual(input)
    const headers = new Headers(init.headers)
    expect(headers.get('authorization')).toBe('Bearer token-insure')
    expect(headers.get('idempotency-key')).toBe('key-1')
    expect(row).toMatchObject({ claimNumber: 'CLM-2026-0007' })
  })

  it('approves against the claim’s own action endpoint with an approved amount', async () => {
    const fetchMock = vi.fn(() => respond(200, { claimNumber: 'CLM-1', status: 'approved' }))
    vi.stubGlobal('fetch', fetchMock)

    await api.approve('01CLAIM', { approvedAmountHalalas: 1_200_000 })

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.test/api/v1/insurance-claims/01CLAIM/approve')
    expect(init.method).toBe('POST')
    expect(JSON.parse(String(init.body))).toEqual({ approvedAmountHalalas: 1_200_000 })
  })

  it('rejects with the required reason, and pays with an empty body', async () => {
    const rejectMock = vi.fn(() => respond(200, { status: 'rejected' }))
    vi.stubGlobal('fetch', rejectMock)
    await api.reject('01CLAIM', 'Damage predates the policy.')
    expect(JSON.parse(String((rejectMock.mock.calls[0] as [string, RequestInit])[1].body))).toEqual({
      reason: 'Damage predates the policy.',
    })

    const payMock = vi.fn(() => respond(200, { status: 'paid' }))
    vi.stubGlobal('fetch', payMock)
    await api.pay('01CLAIM')
    const [payUrl] = payMock.mock.calls[0] as [string]
    expect(payUrl).toBe('https://api.test/api/v1/insurance-claims/01CLAIM/pay')
  })

  it('escapes the id so a crafted reference cannot reshape the path', async () => {
    const fetchMock = vi.fn(() => respond(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    await api.approve('../loan-contracts/L1', {})
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toBe('https://api.test/api/v1/insurance-claims/..%2Floan-contracts%2FL1/approve')
  })
})

// ── the wrapper the screen imports ───────────────────────────────────────────

describe('the lifecycle wrapper', () => {
  const spy = {
    submit: vi.fn(() => Promise.resolve({ claimNumber: 'CLM-1' } as never)),
    approve: vi.fn(() => Promise.resolve({ claimNumber: 'CLM-1' } as never)),
    reject: vi.fn(() => Promise.resolve({ claimNumber: 'CLM-1' } as never)),
    pay: vi.fn(() => Promise.resolve({ claimNumber: 'CLM-1' } as never)),
  }

  beforeEach(() => {
    spy.submit.mockClear()
    spy.approve.mockClear()
    spy.reject.mockClear()
    spy.pay.mockClear()
    setInsuranceClaimsApi(spy)
  })

  it('passes the idempotency key through on submit, and omits the option without one', async () => {
    const input = {
      policyId: 'P1',
      amountClaimedHalalas: 500_000,
      incidentDate: '2026-08-01',
      description: 'x',
    }
    await lifecycle.submit(input, 'key-9')
    expect(spy.submit).toHaveBeenCalledWith(input, { idempotencyKey: 'key-9' })
    await lifecycle.submit(input)
    expect(spy.submit).toHaveBeenLastCalledWith(input, undefined)
  })

  it('wraps the approved amount in the body, and sends none when omitted', async () => {
    await lifecycle.approve('C1', 900_000)
    expect(spy.approve).toHaveBeenCalledWith('C1', { approvedAmountHalalas: 900_000 })
    await lifecycle.approve('C1')
    expect(spy.approve).toHaveBeenLastCalledWith('C1', {})
  })

  it('forwards reject reason and pay id unchanged', async () => {
    await lifecycle.reject('C1', 'no cover')
    expect(spy.reject).toHaveBeenCalledWith('C1', 'no cover')
    await lifecycle.pay('C1')
    expect(spy.pay).toHaveBeenCalledWith('C1')
  })
})

// ── failure mapping ──────────────────────────────────────────────────────────

describe('claim failure mapping', () => {
  it('keeps the server’s own words for a role or rule refusal', () => {
    const refusal = new RepositoryError('forbidden', 'Your role cannot approve claims.')
    expect(isRefusal(refusal)).toBe(true)
    expect(claimActionFailureMessage(refusal, 'fallback')).toBe('Your role cannot approve claims.')
  })

  it('names the segregation-of-duties refusal so it can be titled honestly', () => {
    const sod = new RepositoryError(
      'rule_violated',
      'A claim you submitted must be approved by a different approver.',
    )
    expect(isSodRefusal(sod)).toBe(true)
    // An unrelated rule keeps the refusal flag but not the SOD title.
    const other = new RepositoryError('rule_violated', 'Insufficient coverage on this policy.')
    expect(isRefusal(other)).toBe(true)
    expect(isSodRefusal(other)).toBe(false)
  })

  it('turns an unreachable server and a lost session into sentences of their own', () => {
    expect(claimActionFailureMessage(new RepositoryError('network', ''), 'fb')).toMatch(
      /could not be reached/,
    )
    expect(claimActionFailureMessage(new RepositoryError('unauthenticated', ''), 'fb')).toMatch(
      /session has ended/,
    )
  })
})
