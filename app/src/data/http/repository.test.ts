import { describe, it, expect } from 'vitest'
import { ApiClient } from './client'
import { createHttpRepository, MissingEndpointError } from './repository'
import { ENDPOINTS, servedByApi } from './endpoints'
import { mockRepository, MockWriteError, type CollectionKey } from '../repository'

function clientReturning(body: unknown, seen?: { url?: string }) {
  const impl = (async (url: string) => {
    if (seen) seen.url = url
    return { ok: true, status: 200, json: async () => body } as unknown as Response
  }) as unknown as typeof fetch
  return new ApiClient({ baseUrl: 'https://api.test', fetchImpl: impl })
}

/** A fetch stub that records the method, URL and parsed JSON body of the last
 *  request, so a write test can assert the exact call the seam made. */
interface Seen {
  method?: string
  url?: string
  body?: unknown
}
function recordingClient(responseBody: unknown, seen: Seen, status = 200) {
  const impl = (async (url: string, init: RequestInit = {}) => {
    seen.method = init.method
    seen.url = url
    seen.body = init.body ? JSON.parse(init.body as string) : undefined
    return {
      ok: status < 400,
      status,
      json: async () => responseBody,
    } as unknown as Response
  }) as unknown as typeof fetch
  return new ApiClient({ baseUrl: 'https://api.test', fetchImpl: impl })
}

describe('http repository — shape parity with the mock', () => {
  it('exposes exactly the collections the Repository interface declares', () => {
    const http = createHttpRepository(clientReturning([]))
    expect(Object.keys(http).sort()).toEqual(Object.keys(mockRepository).sort())
  })

  it('every collection is a decision, not an omission', () => {
    for (const key of Object.keys(mockRepository) as CollectionKey[]) {
      expect(ENDPOINTS[key], `${key} must map to a path or an explicit null`).toBeDefined()
    }
  })
})

describe('http repository — reading', () => {
  it('calls the documented path for the collection', async () => {
    const seen: { url?: string } = {}
    const repo = createHttpRepository(clientReturning([], seen))
    await repo.jobs.list()
    expect(seen.url).toBe('https://api.test/jobs')
  })

  it('reads CRM collections from their namespaced routes', async () => {
    const seen: { url?: string } = {}
    const repo = createHttpRepository(clientReturning([], seen))
    await repo.leads.list()
    expect(seen.url).toBe('https://api.test/crm/leads')
  })

  it('accepts a bare array', async () => {
    const repo = createHttpRepository(clientReturning([{ id: 'A1' }]))
    expect(await repo.jobs.list()).toEqual([{ id: 'A1' }])
  })

  it('unwraps a paginated {data} envelope', async () => {
    const repo = createHttpRepository(clientReturning({ data: [{ id: 'A1' }], total: 1 }))
    expect(await repo.jobs.list()).toEqual([{ id: 'A1' }])
  })

  it('yields an empty list rather than undefined when the payload is empty', async () => {
    const repo = createHttpRepository(clientReturning({ data: null }))
    expect(await repo.jobs.list()).toEqual([])
  })
})

describe('http repository — collections the contract does not cover', () => {
  it('rejects loudly instead of quietly serving design fixtures', async () => {
    const repo = createHttpRepository(clientReturning([]))
    await expect(repo.invoiceLines.list()).rejects.toBeInstanceOf(MissingEndpointError)
  })

  it('names the collection and where to look', async () => {
    const repo = createHttpRepository(clientReturning([]))
    let message = ''
    try {
      await repo.diagStages.list()
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).toContain('diagStages')
    expect(message).toContain('API_ENDPOINTS.md')
  })

  it('agrees with servedByApi about which collections are live', () => {
    expect(servedByApi('jobs')).toBe(true)
    expect(servedByApi('invoiceLines')).toBe(false)
  })
})

describe('http repository — writing', () => {
  it('create POSTs the body to the collection path and returns the row', async () => {
    const seen: Seen = {}
    const created = { id: 'INV-9', cust: 'X', amount: 'SAR 1', due: 'now', status: 'unpaid' }
    const repo = createHttpRepository(recordingClient(created, seen, 201))
    const row = await repo.invoices.create!(created)
    expect(seen.method).toBe('POST')
    expect(seen.url).toBe('https://api.test/invoices')
    expect(seen.body).toEqual(created)
    expect(row).toEqual(created)
  })

  it('update PATCHes the id path with the partial body', async () => {
    const seen: Seen = {}
    const repo = createHttpRepository(recordingClient({ id: 'INV-9', status: 'paid' }, seen))
    await repo.invoices.update!('INV-9', { status: 'paid' })
    expect(seen.method).toBe('PATCH')
    expect(seen.url).toBe('https://api.test/invoices/INV-9')
    expect(seen.body).toEqual({ status: 'paid' })
  })

  it('remove DELETEs the id path', async () => {
    const seen: Seen = {}
    const repo = createHttpRepository(recordingClient(undefined, seen, 204))
    await repo.invoices.remove!('INV-9')
    expect(seen.method).toBe('DELETE')
    expect(seen.url).toBe('https://api.test/invoices/INV-9')
  })

  it('url-encodes an id so a slash or space cannot escape its path segment', async () => {
    const seen: Seen = {}
    const repo = createHttpRepository(recordingClient({}, seen))
    await repo.invoices.update!('INV 1/2', { status: 'paid' })
    expect(seen.url).toBe('https://api.test/invoices/INV%201%2F2')
  })

  it('writes to a namespaced collection use its namespaced path', async () => {
    const seen: Seen = {}
    const repo = createHttpRepository(recordingClient({}, seen, 201))
    await repo.leads.create!({ name: 'A' } as never)
    expect(seen.url).toBe('https://api.test/crm/leads')
  })

  it('writing a collection with no contract route rejects loudly', async () => {
    const repo = createHttpRepository(clientReturning([]))
    await expect(repo.invoiceLines.create!({} as never)).rejects.toBeInstanceOf(MissingEndpointError)
  })
})

describe('mock repository — refuses to fake persistence', () => {
  it('create/update/remove all throw MockWriteError instead of pretending to save', async () => {
    await expect(mockRepository.invoices.create!({} as never)).rejects.toBeInstanceOf(MockWriteError)
    await expect(mockRepository.invoices.update!('INV-1', {} as never)).rejects.toBeInstanceOf(MockWriteError)
    await expect(mockRepository.invoices.remove!('INV-1')).rejects.toBeInstanceOf(MockWriteError)
  })

  it('the error names the collection and the operation', async () => {
    try {
      await mockRepository.customers.create!({} as never)
      throw new Error('expected a throw')
    } catch (error) {
      expect(error).toBeInstanceOf(MockWriteError)
      expect((error as MockWriteError).collection).toBe('customers')
      expect((error as MockWriteError).op).toBe('create')
      expect((error as Error).message).toContain('VITE_API_BASE_URL')
    }
  })

  it('reads still work on the mock', async () => {
    expect((await mockRepository.invoices.list()).length).toBeGreaterThan(0)
  })
})
