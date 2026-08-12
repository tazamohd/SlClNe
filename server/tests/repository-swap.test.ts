/** The swap itself, end to end.
 *
 *  `seed-fidelity.test.ts` proves the API serves the same rows. This proves the
 *  *client's* repository — the real `app/src/data/repository.ts`, not a copy —
 *  reads them over HTTP and hands a screen exactly what the fixtures hand it
 *  today. The two together are what "no screen has to change" means in
 *  evidence rather than in intention.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import * as T from '../../app/src/data/generated/tables'
import {
  createHttpRepository,
  mockRepository,
  setAccessTokenProvider,
  type CollectionKey,
  type Repository,
} from '../../app/src/data/repository'
import { SEED_COHERENCE_EXTRAS } from '../scripts/seed'
import { startHarness, type Harness } from './harness'

let harness: Harness
let live: Repository
let baseUrl: string

beforeAll(async () => {
  harness = await startHarness()
  await harness.app.listen({ port: 0, host: '127.0.0.1' })
  const address = harness.app.server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  baseUrl = `http://127.0.0.1:${port}/api/v1`
  const token = await harness.token('owner')
  setAccessTokenProvider(() => token)
  live = createHttpRepository(baseUrl)
}, 120_000)

afterAll(async () => {
  setAccessTokenProvider(() => null)
  await harness?.close()
})

const KEYS = Object.keys(mockRepository) as CollectionKey[]

/** The server-assigned fields, which the fixture row types do not declare. */
const meta = (row: unknown) => row as { _id: string; _version: number }

describe('httpRepository serves what mockRepository serves', () => {
  for (const key of KEYS) {
    it(`${key}`, async () => {
      const fromApi = await live[key].list({ pageSize: 200 })
      const fromMock = await mockRepository[key].list()
      /* The fixture rows come first and unchanged; the seed then adds exactly
       * the declared coherence rows (F-015, F-016) and nothing else. */
      expect(fromApi.rows).toHaveLength(fromMock.rows.length + (SEED_COHERENCE_EXTRAS[key] ?? 0))

      fromMock.rows.forEach((expected: unknown, index) => {
        const row = fromApi.rows[index] as Record<string, unknown>
        if (Array.isArray(expected)) {
          expect(row).toEqual(expected)
          return
        }
        const subset: Record<string, unknown> = {}
        for (const field of Object.keys(expected as Record<string, unknown>)) {
          subset[field] = (row as Record<string, unknown>)[field]
        }
        expect(subset, `${key}[${index}]`).toEqual(expected)
      })
    })
  }
})

describe('the mutation surface the hooks are built on', () => {
  it('creates, reads back, updates with a version and deletes', async () => {
    const created = await live.customers.create({
      name: 'Repository Test Customer',
      phone: '+966 55 424 2424',
    } as never)
    const id = meta(created)._id
    expect(id).toBeTruthy()
    expect((created as { spent: string }).spent).toBe('SAR 0')

    const fetched = await live.customers.get(id)
    expect((fetched as { name: string }).name).toBe('Repository Test Customer')

    const version = meta(created)._version
    const updated = await live.customers.update(id, { name: 'Renamed' } as never, { version })
    expect((updated as { name: string }).name).toBe('Renamed')
    expect(meta(updated)._version).toBe(version + 1)

    await expect(
      live.customers.update(id, { name: 'Too late' } as never, { version }),
    ).rejects.toMatchObject({ code: 'version_conflict' })

    await live.customers.delete(id)
    await expect(live.customers.get(id)).rejects.toMatchObject({ code: 'not_found' })
  })

  it('bulk-updates and bulk-deletes a selection', async () => {
    const a = await live.vehicles.create({ plate: 'BLK 0001', makeModel: 'Kia Rio 2024' } as never)
    const b = await live.vehicles.create({ plate: 'BLK 0002', makeModel: 'Kia Rio 2024' } as never)
    const ids = [meta(a)._id, meta(b)._id]

    const updated = await live.vehicles.bulkUpdate(ids, { status: 'service' } as never)
    expect(updated).toHaveLength(2)
    expect(updated.every((row) => (row as { status: string }).status === 'service')).toBe(true)

    await live.vehicles.bulkDelete(ids)
    await expect(live.vehicles.get(ids[0] as string)).rejects.toMatchObject({ code: 'not_found' })
  })

  it('reports a refused write as a typed error rather than a silent failure', async () => {
    const technicianToken = await harness.token('technician')
    setAccessTokenProvider(() => technicianToken)
    try {
      await expect(
        live.customers.create({ name: 'Nope', phone: '+966 55 000 1111' } as never),
      ).rejects.toMatchObject({ code: 'forbidden' })
    } finally {
      const owner = await harness.token('owner')
      setAccessTokenProvider(() => owner)
    }
  })
})

describe('the fixture repository refuses writes instead of faking them', () => {
  it('throws a typed unsupported error', async () => {
    await expect(mockRepository.customers.create({} as never)).rejects.toMatchObject({
      code: 'unsupported',
    })
    await expect(mockRepository.customers.delete('anything')).rejects.toMatchObject({
      code: 'unsupported',
    })
  })

  it('still filters, sorts and paginates in memory', async () => {
    const filtered = await mockRepository.vehicles.list({ filter: { status: 'service' } })
    expect(filtered.rows.length).toBeGreaterThan(0)
    expect(filtered.rows.every((row) => row.status === 'service')).toBe(true)

    const searched = await mockRepository.vehicles.list({ q: 'Patrol' })
    expect(searched.rows).toHaveLength(1)

    const paged = await mockRepository.vehicles.list({ page: 2, pageSize: 2 })
    expect(paged.rows).toHaveLength(2)
    expect(paged.page.total).toBe(T.VEHICLES.length)
  })
})
