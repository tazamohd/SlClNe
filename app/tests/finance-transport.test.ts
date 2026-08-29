import { afterEach, describe, expect, it, vi } from 'vitest'

/** The invoice write path: exactly what goes on the wire.
 *
 *  Creating an invoice, editing it, issuing it and taking a payment against it
 *  are the four requests that move money in this domain. Everything the
 *  server's guarantees rest on is asserted here — the path, the method, the
 *  bearer token, the idempotency key that makes a retried payment safe, the
 *  body (which must never carry a total the client computed), and the mapping
 *  from an error envelope back to a `RepositoryError` a form can attach to a
 *  field.
 *
 *  `VITE_API_URL` is read once at import time by `data/repository.ts`, which is
 *  what makes a fixture build genuinely serverless rather than conditionally
 *  so — so the module is substituted rather than the variable stubbed, keeping
 *  every other export (including `RepositoryError`, whose identity the
 *  assertions depend on) exactly as it really is.
 */

interface Captured {
  url: string
  init: RequestInit
}

async function loadWithApi(apiUrl = 'https://api.test') {
  vi.resetModules()
  vi.doMock('@/data/repository', async () => {
    const actual = await vi.importActual<typeof import('@/data/repository')>('@/data/repository')
    return {
      ...actual,
      API_URL: apiUrl,
      isLive: apiUrl !== '',
      repository: apiUrl ? actual.createHttpRepository(apiUrl) : actual.mockRepository,
    }
  })
  const data = await import('@/data/repository')
  const api = await import('@/screens/finance/api')
  return { api, data }
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

function header(call: Captured, name: string): string | null {
  return new Headers(call.init.headers).get(name)
}

function body(call: Captured): Record<string, unknown> {
  return JSON.parse(String(call.init.body ?? '{}')) as Record<string, unknown>
}

const INVOICE = {
  _id: '01JX0000000000000000000001',
  id: 'INV-2026-0143',
  cust: 'Ahmed Al-Rashid',
  amount: 'SAR 2,116',
  due: 'Aug 21, 2026',
  status: 'draft',
  subtotalHalalas: 184_000,
  taxHalalas: 27_600,
  discountHalalas: 0,
  totalHalalas: 211_600,
  paidHalalas: 0,
  balanceHalalas: 211_600,
}

afterEach(() => {
  vi.doUnmock('@/data/repository')
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('creating a draft', () => {
  it('posts the lines and never a total, with an idempotency key', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json(INVOICE, 201))

    const created = await api.createInvoice(
      {
        customerName: 'Ahmed Al-Rashid',
        dueDate: '2026-08-21',
        lines: [{ description: 'Brake pads', kind: 'part', qty: 2, unitPriceHalalas: 31_000 }],
        discountHalalas: 1_000,
      },
      { idempotencyKey: 'inv-attempt-0001' }
    )

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://api.test/invoices')
    expect(calls[0].init.method).toBe('POST')
    expect(header(calls[0], 'authorization')).toBe('Bearer token-abc')
    expect(header(calls[0], 'idempotency-key')).toBe('inv-attempt-0001')

    const sent = body(calls[0])
    expect(sent.lines).toEqual([
      { description: 'Brake pads', kind: 'part', qty: 2, unitPriceHalalas: 31_000 },
    ])
    expect(sent.discountHalalas).toBe(1_000)
    // The three fields the server owns are absent from the request entirely.
    expect(sent).not.toHaveProperty('subtotalHalalas')
    expect(sent).not.toHaveProperty('taxHalalas')
    expect(sent).not.toHaveProperty('totalHalalas')

    expect(created.totalHalalas).toBe(211_600)
  })

  it('replays the same key on a retry of the same attempt', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json(INVOICE, 201))
    const draft = {
      customerName: 'Ahmed Al-Rashid',
      dueDate: '2026-08-21',
      lines: [{ description: 'Brake pads', kind: 'part' as const, qty: 1, unitPriceHalalas: 100 }],
    }

    await api.createInvoice(draft, { idempotencyKey: 'inv-attempt-0001' })
    await api.createInvoice(draft, { idempotencyKey: 'inv-attempt-0001' })

    expect(calls).toHaveLength(2)
    expect(header(calls[0], 'idempotency-key')).toBe(header(calls[1], 'idempotency-key'))
  })

  it('mints a key that satisfies the contract’s 8–128 characters', async () => {
    const { api } = await loadWithApi()
    const key = api.newIdempotencyKey('pay')
    expect(key.length).toBeGreaterThanOrEqual(8)
    expect(key.length).toBeLessThanOrEqual(128)
    expect(key.startsWith('pay-')).toBe(true)
    expect(api.newIdempotencyKey('pay')).not.toBe(key)
  })
})

describe('editing and cancelling', () => {
  it('patches the draft by its id', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json(INVOICE))

    await api.updateInvoice('01JX0000000000000000000001', { dueDate: '2026-09-01' })

    expect(calls[0].url).toBe('https://api.test/invoices/01JX0000000000000000000001')
    expect(calls[0].init.method).toBe('PATCH')
    expect(body(calls[0])).toEqual({ dueDate: '2026-09-01' })
  })

  it('cancels by patching the status, which is what the API accepts', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json({ ...INVOICE, status: 'cancelled' }))

    const after = await api.cancelInvoice('INV-2026-0143')

    expect(calls[0].init.method).toBe('PATCH')
    expect(body(calls[0])).toEqual({ status: 'cancelled' })
    expect(after.status).toBe('cancelled')
  })
})

describe('issuing', () => {
  it('posts to the invoice’s issue action with the bearer token', async () => {
    const { api } = await loadWithApi()
    api.setFinanceAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json({ ...INVOICE, status: 'unpaid', issuedAt: '2026-08-12T09:00:00.000Z' }))

    const issued = await api.issueInvoice('01JX0000000000000000000001')

    expect(calls[0].url).toBe('https://api.test/invoices/01JX0000000000000000000001/issue')
    expect(calls[0].init.method).toBe('POST')
    expect(header(calls[0], 'authorization')).toBe('Bearer token-abc')
    expect(issued.status).toBe('unpaid')
  })

  it('surfaces the approval ceiling refusal in the server’s own words', async () => {
    const { api, data } = await loadWithApi()
    api.setFinanceAccessTokenProvider(() => 'token-abc')
    stubFetch(() =>
      json(
        {
          error: {
            code: 'approval_required',
            message: 'This amount is above your approval ceiling of SAR 25,000.',
            requestId: 'req-9',
          },
        },
        403
      )
    )

    await expect(api.issueInvoice('INV-1')).rejects.toMatchObject({
      code: 'approval_required',
      message: 'This amount is above your approval ceiling of SAR 25,000.',
      requestId: 'req-9',
    })
    await expect(api.issueInvoice('INV-1')).rejects.toBeInstanceOf(data.RepositoryError)
  })

  it('reports an unreachable server as a network failure, not as a save', async () => {
    const { api } = await loadWithApi()
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(api.issueInvoice('INV-1')).rejects.toMatchObject({ code: 'network' })
  })
})

describe('taking a payment', () => {
  it('posts to the invoice’s payment sub-resource, with the key and the token', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() =>
      json(
        {
          payment: { _id: 'P1', ref: 'TXN-1', amountHalalas: 50_000 },
          invoice: { ...INVOICE, status: 'partial', paidHalalas: 50_000, balanceHalalas: 161_600 },
        },
        201
      )
    )

    const result = await api.recordPayment(
      '01JX0000000000000000000001',
      { amountHalalas: 50_000, method: 'Mada', reference: 'TXN-1', paidOn: '2026-08-12' },
      'pay-attempt-0001'
    )

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('https://api.test/invoices/01JX0000000000000000000001/payments')
    expect(calls[0].init.method).toBe('POST')
    expect(header(calls[0], 'idempotency-key')).toBe('pay-attempt-0001')
    expect(header(calls[0], 'authorization')).toBe('Bearer token-abc')
    expect(body(calls[0])).toEqual({
      amountHalalas: 50_000,
      method: 'Mada',
      reference: 'TXN-1',
      paidOn: '2026-08-12',
    })

    // The balance shown next is the one the server sent back, not a subtraction.
    expect(result.invoice?.balanceHalalas).toBe(161_600)
    expect(result.payment.amountHalalas).toBe(50_000)
  })

  it('escapes an invoice reference into the path rather than concatenating it', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json({ payment: {}, invoice: null }, 201))
    await api.recordPayment('INV/2026 0143', { amountHalalas: 1, method: 'Cash' }, 'pay-key-0001')
    expect(calls[0].url).toBe('https://api.test/invoices/INV%2F2026%200143/payments')
  })

  it('puts a rule refusal on the field the server blamed', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    stubFetch(() =>
      json(
        {
          error: {
            code: 'rule_violated',
            message: 'A payment cannot exceed the outstanding balance.',
            field: 'amountHalalas',
          },
        },
        422
      )
    )

    await expect(
      api.recordPayment('INV-1', { amountHalalas: 9_999_999, method: 'Cash' }, 'pay-key-0002')
    ).rejects.toMatchObject({ code: 'rule_violated', field: 'amountHalalas' })

    const error = await api
      .recordPayment('INV-1', { amountHalalas: 9_999_999, method: 'Cash' }, 'pay-key-0002')
      .catch((e: unknown) => e)
    expect(api.writeFailureMessage(error, 'fallback')).toBe(
      'A payment cannot exceed the outstanding balance.'
    )
    expect(error).toBeInstanceOf(data.RepositoryError)
  })

  it('reports a replayed key with a different body as the caller bug it is', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    stubFetch(() =>
      json(
        {
          error: {
            code: 'idempotency_conflict',
            message: 'That Idempotency-Key was used for a different request.',
          },
        },
        409
      )
    )
    const error = await api
      .recordPayment('INV-1', { amountHalalas: 100, method: 'Cash' }, 'pay-key-0003')
      .catch((e: unknown) => e)
    expect((error as InstanceType<typeof data.RepositoryError>).code).toBe('idempotency_conflict')
    expect(api.isStale(error)).toBe(false)
  })
})

describe('a receipt', () => {
  it('posts to the receipts collection, naming the invoice it settles', async () => {
    const { api, data } = await loadWithApi()
    data.setAccessTokenProvider(() => 'token-abc')
    const calls = stubFetch(() => json({ id: 'RCP-2026-0312' }, 201))

    await api.createReceipt({ invoiceId: '01JX0000000000000000000001', method: 'Cash' })

    expect(calls[0].url).toBe('https://api.test/receipts')
    expect(body(calls[0])).toEqual({
      invoiceId: '01JX0000000000000000000001',
      method: 'Cash',
    })
  })
})

describe('with no API configured', () => {
  it('refuses every write instead of pretending, and sends nothing', async () => {
    const { api } = await loadWithApi('')
    const calls = stubFetch(() => json({}))

    await expect(
      api.createInvoice({ customerName: 'A', dueDate: '2026-08-21', lines: [] })
    ).rejects.toMatchObject({ code: 'unsupported' })
    await expect(api.issueInvoice('INV-1')).rejects.toMatchObject({ code: 'unsupported' })
    await expect(
      api.recordPayment('INV-1', { amountHalalas: 1, method: 'Cash' }, 'pay-key-0004')
    ).rejects.toMatchObject({ code: 'unsupported' })
    await expect(api.cancelInvoice('INV-1')).rejects.toMatchObject({ code: 'unsupported' })

    expect(calls).toHaveLength(0)
  })

  it('says why, in words that name the fix', async () => {
    const { api } = await loadWithApi('')
    const error = await api.issueInvoice('INV-1').catch((e: unknown) => e)
    expect(api.writeFailureMessage(error, 'fallback')).toMatch(/VITE_API_URL/)
  })
})

describe('classifying a failure', () => {
  it('calls a version conflict stale, because it needs a reload rather than a retry', async () => {
    const { api, data } = await loadWithApi()
    const conflict = new data.RepositoryError('version_conflict', 'It moved.')
    expect(api.isStale(conflict)).toBe(true)
    expect(api.isStale(new data.RepositoryError('conflict', 'Already issued.'))).toBe(true)
    expect(api.isStale(new data.RepositoryError('rule_violated', 'No.'))).toBe(false)
  })

  it('does not dress a session expiry or an unreachable server as a rule failure', async () => {
    const { api, data } = await loadWithApi()
    expect(
      api.writeFailureMessage(new data.RepositoryError('unauthenticated', 'nope'), 'fallback')
    ).toMatch(/session has ended/)
    expect(api.writeFailureMessage(new data.RepositoryError('network', ''), 'fallback')).toMatch(
      /Nothing was saved/
    )
  })
})
