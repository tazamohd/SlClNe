import { describe, it, expect } from 'vitest'
import { ApiClient } from './client'
import { createHttpRepository, MissingEndpointError } from './repository'
import { ENDPOINTS, servedByApi } from './endpoints'
import { mockRepository, type CollectionKey } from '../repository'

function clientReturning(body: unknown, seen?: { url?: string }) {
  const impl = (async (url: string) => {
    if (seen) seen.url = url
    return { ok: true, status: 200, json: async () => body } as unknown as Response
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
