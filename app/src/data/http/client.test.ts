import { describe, it, expect } from 'vitest'
import { ApiClient, ApiError, buildQuery } from './client'

/** A fetch stub that records the call and returns a scripted response. */
function stubFetch(response: Partial<Response> & { jsonBody?: unknown }) {
  const calls: Array<{ url: string; init: RequestInit }> = []
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      json: async () => {
        if ('jsonBody' in response) return response.jsonBody
        throw new SyntaxError('not json')
      },
    } as unknown as Response
  }) as unknown as typeof fetch
  return { impl, calls }
}


/** Asserts the request rejects, and hands back the typed error. Using
 *  `.catch()` inline widens the result to `unknown`, which then needs a cast at
 *  every assertion. */
async function rejection(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    return error as ApiError
  }
  throw new Error('expected the request to reject, but it resolved')
}

describe('buildQuery — the contract’s list parameters', () => {
  it('is empty when nothing is asked for, so URLs stay clean', () => {
    expect(buildQuery()).toBe('')
    expect(buildQuery({})).toBe('')
  })

  it('serialises paging, sort and search', () => {
    expect(buildQuery({ page: 2, pageSize: 25, sort: 'due:desc', q: 'brake' }))
      .toBe('?page=2&pageSize=25&sort=due%3Adesc&q=brake')
  })

  it('nests filters as filter[field], per API_ENDPOINTS.md', () => {
    expect(buildQuery({ filter: { status: 'unpaid' } })).toBe('?filter%5Bstatus%5D=unpaid')
  })

  it('drops undefined and null filters so optional filters need no branching', () => {
    expect(buildQuery({ filter: { status: undefined, branchId: null, q: 'x' } }))
      .toBe('?filter%5Bq%5D=x')
  })

  it('keeps page 0 and false, which are values rather than absences', () => {
    expect(buildQuery({ page: 0 })).toBe('?page=0')
    expect(buildQuery({ filter: { archived: false } })).toBe('?filter%5Barchived%5D=false')
  })
})

describe('ApiClient — requests', () => {
  it('joins base and path without doubling the slash', async () => {
    const { impl, calls } = stubFetch({ jsonBody: [] })
    await new ApiClient({ baseUrl: 'https://api.example.com/v1/', fetchImpl: impl }).get('/jobs')
    expect(calls[0].url).toBe('https://api.example.com/v1/jobs')
  })

  it('sends the bearer token, re-reading it per request', async () => {
    let token = 'first'
    const { impl, calls } = stubFetch({ jsonBody: [] })
    const client = new ApiClient({ baseUrl: 'https://x', getToken: () => token, fetchImpl: impl })
    await client.get('/jobs')
    token = 'second'
    await client.get('/jobs')
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer first')
    expect((calls[1].init.headers as Record<string, string>).Authorization).toBe('Bearer second')
  })

  it('omits Authorization entirely when there is no token', async () => {
    const { impl, calls } = stubFetch({ jsonBody: [] })
    await new ApiClient({ baseUrl: 'https://x', fetchImpl: impl }).get('/jobs')
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('only sets Content-Type when there is a body to describe', async () => {
    const { impl, calls } = stubFetch({ jsonBody: {} })
    const client = new ApiClient({ baseUrl: 'https://x', fetchImpl: impl })
    await client.get('/jobs')
    await client.post('/jobs', { cust: 'A' })
    expect((calls[0].init.headers as Record<string, string>)['Content-Type']).toBeUndefined()
    expect((calls[1].init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    expect(calls[1].init.body).toBe('{"cust":"A"}')
  })

  it('returns undefined for 204 rather than trying to parse an empty body', async () => {
    const { impl } = stubFetch({ status: 204 })
    await expect(new ApiClient({ baseUrl: 'https://x', fetchImpl: impl }).delete('/jobs/1'))
      .resolves.toBeUndefined()
  })
})

describe('ApiClient — errors', () => {
  it('maps the documented envelope onto ApiError', async () => {
    const { impl } = stubFetch({
      ok: false,
      status: 422,
      jsonBody: { error: { code: 'validation_failed', message: 'Plate is required', field: 'plate' } },
    })
    const error = await rejection(new ApiClient({ baseUrl: 'https://x', fetchImpl: impl }).post('/vehicles', {}))

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.code).toBe('validation_failed')
    expect(error.message).toBe('Plate is required')
    expect(error.field).toBe('plate')
  })

  it('still reports the status when the body is not the envelope (a gateway HTML page)', async () => {
    const { impl } = stubFetch({ ok: false, status: 502, statusText: 'Bad Gateway' })
    const error = await rejection(new ApiClient({ baseUrl: 'https://x', fetchImpl: impl }).get('/jobs'))

    expect(error.status).toBe(502)
    expect(error.message).toBe('Bad Gateway')
  })

  it('flags auth failures so the UI can tell them from a server fault', async () => {
    for (const status of [401, 403]) {
      const { impl } = stubFetch({ ok: false, status })
      const error = await rejection(new ApiClient({ baseUrl: 'https://x', fetchImpl: impl }).get('/hr/employees'))
      expect(error.isAuthFailure).toBe(true)
    }
    const { impl } = stubFetch({ ok: false, status: 500 })
    const serverError = await rejection(new ApiClient({ baseUrl: 'https://x', fetchImpl: impl }).get('/jobs'))
    expect(serverError.isAuthFailure).toBe(false)
  })
})
