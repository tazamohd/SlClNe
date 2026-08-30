import { describe, expect, it } from 'vitest'
import {
  mockRepository,
  RepositoryError,
  isVersionConflict,
  ENDPOINTS,
  type CollectionKey,
} from '@/data/repository'
import { VEHICLES, INVOICES, PARTS, CUSTOMERS } from '@/data/generated/tables'

/** The mock fixture — the in-memory repository that every screen runs against
 *  when no API is set. These tests exercise the collection interface (list, get,
 *  create, update, delete, bulk ops) and the controls it enforces: version
 *  conflicts, idempotency replay, not-found, and search/filter/sort/pagination.
 *
 *  The mock is session-scoped and mutating, so each test that writes uses its own
 *  collection or works on records it created, to avoid inter-test pollution. */

describe('fixture list', () => {
  it('returns all seeded rows for a populated collection', async () => {
    const result = await mockRepository.vehicles.list()
    expect(result.rows).toHaveLength(VEHICLES.length)
    expect(result.page.total).toBe(VEHICLES.length)
    expect(result.page.page).toBe(1)
  })

  it('returns an empty list for a collection with no seed data', async () => {
    const result = await mockRepository.branches.list()
    expect(result.rows).toHaveLength(0)
    expect(result.page.total).toBe(0)
  })

  it('paginates: page 1 of 2 when pageSize splits the data', async () => {
    const result = await mockRepository.vehicles.list({ page: 1, pageSize: 2 })
    expect(result.rows).toHaveLength(2)
    expect(result.page.totalPages).toBe(Math.ceil(VEHICLES.length / 2))
  })

  it('returns the remainder on the last page', async () => {
    const totalPages = Math.ceil(VEHICLES.length / 2)
    const result = await mockRepository.vehicles.list({ page: totalPages, pageSize: 2 })
    expect(result.rows.length).toBeLessThanOrEqual(2)
    expect(result.rows.length).toBeGreaterThan(0)
  })

  it('filters by a field value', async () => {
    const result = await mockRepository.vehicles.list({ filter: { status: 'active' } })
    const activeCount = VEHICLES.filter((v) => v.status === 'active').length
    expect(result.rows).toHaveLength(activeCount)
    for (const row of result.rows) {
      expect(row.status).toBe('active')
    }
  })

  it('searches across string fields', async () => {
    const result = await mockRepository.vehicles.list({ q: 'Toyota' })
    expect(result.rows.length).toBeGreaterThan(0)
    for (const row of result.rows) {
      const values = Object.values(row as Record<string, unknown>)
      expect(values.some((v) => typeof v === 'string' && v.toLowerCase().includes('toyota'))).toBe(true)
    }
  })

  it('sorts by a field ascending', async () => {
    const result = await mockRepository.invoices.list({ sort: 'cust:asc' })
    const names = result.rows.map((r) => r.cust)
    expect(names).toEqual([...names].sort())
  })

  it('sorts by a field descending', async () => {
    const result = await mockRepository.invoices.list({ sort: 'cust:desc' })
    const names = result.rows.map((r) => r.cust)
    expect(names).toEqual([...names].sort().reverse())
  })
})

describe('fixture get', () => {
  it('finds a seeded row by its id field', async () => {
    const row = await mockRepository.invoices.get('INV-2026-0142')
    expect(row.cust).toBe('Ahmed Al-Rashid')
  })

  it('throws not_found for a missing id', async () => {
    await expect(mockRepository.invoices.get('INV-9999-9999')).rejects.toThrow(RepositoryError)
    try {
      await mockRepository.invoices.get('INV-9999-9999')
    } catch (error) {
      expect(error).toBeInstanceOf(RepositoryError)
      expect((error as RepositoryError).code).toBe('not_found')
    }
  })
})

describe('fixture create', () => {
  it('adds a row and returns it with entity metadata', async () => {
    const input = { name: 'Test Part', sku: 'TEST-001', stock: 10, reorder: 5, price: 'SAR 50' }
    const created = await mockRepository.parts.create(input)
    expect(created.name).toBe('Test Part')
    expect(created._id).toBeTruthy()
    expect(created._version).toBe(1)
    expect(created._createdAt).toBeTruthy()
  })

  it('makes the row findable in a subsequent list', async () => {
    const input = { name: 'Findable Part', sku: 'FIND-001', stock: 1, reorder: 0, price: 'SAR 10' }
    const created = await mockRepository.parts.create(input)
    const result = await mockRepository.parts.list({ q: 'Findable Part' })
    expect(result.rows.some((r) => r._id === created._id)).toBe(true)
  })

  it('replays an idempotent create — returns the same row, does not duplicate', async () => {
    const key = 'idem-test-' + Date.now()
    const input = { name: 'Idempotent Part', sku: 'IDEM-001', stock: 0, reorder: 0, price: 'SAR 5' }
    const first = await mockRepository.parts.create(input, { idempotencyKey: key })
    const second = await mockRepository.parts.create(input, { idempotencyKey: key })
    expect(second._id).toBe(first._id)

    const result = await mockRepository.parts.list({ q: 'Idempotent Part' })
    const matches = result.rows.filter((r) => r._id === first._id)
    expect(matches).toHaveLength(1)
  })
})

describe('fixture update', () => {
  it('patches a row and increments the version', async () => {
    const created = await mockRepository.parts.create(
      { name: 'Update Test', sku: 'UPD-001', stock: 5, reorder: 2, price: 'SAR 100' },
    )
    const updated = await mockRepository.parts.update(created._id!, { name: 'Updated Name' })
    expect(updated.name).toBe('Updated Name')
    expect(updated._version).toBe(2)
    expect(updated.sku).toBe('UPD-001') // unchanged field preserved
  })

  it('detects a version conflict when the claimed version is stale', async () => {
    const created = await mockRepository.parts.create(
      { name: 'Conflict Test', sku: 'CONF-001', stock: 1, reorder: 0, price: 'SAR 10' },
    )
    // First update succeeds
    await mockRepository.parts.update(created._id!, { stock: 2 }, { version: 1 })
    // Second update with the old version fails
    await expect(
      mockRepository.parts.update(created._id!, { stock: 3 }, { version: 1 }),
    ).rejects.toThrow(RepositoryError)

    try {
      await mockRepository.parts.update(created._id!, { stock: 3 }, { version: 1 })
    } catch (error) {
      expect(isVersionConflict(error)).toBe(true)
      expect((error as RepositoryError).code).toBe('version_conflict')
    }
  })

  it('throws not_found for a missing id', async () => {
    await expect(
      mockRepository.parts.update('nonexistent-id', { name: 'X' }),
    ).rejects.toThrow(RepositoryError)
  })
})

describe('fixture delete', () => {
  it('removes a row from the collection', async () => {
    const created = await mockRepository.parts.create(
      { name: 'Delete Me', sku: 'DEL-001', stock: 0, reorder: 0, price: 'SAR 0' },
    )
    await mockRepository.parts.delete(created._id!)
    await expect(mockRepository.parts.get(created._id!)).rejects.toThrow(RepositoryError)
  })

  it('throws not_found for a missing id', async () => {
    await expect(mockRepository.parts.delete('nonexistent-id')).rejects.toThrow(RepositoryError)
  })
})

describe('fixture bulk operations', () => {
  it('bulkCreate adds multiple rows at once', async () => {
    const inputs = [
      { name: 'Bulk A', sku: 'BULK-A', stock: 0, reorder: 0, price: 'SAR 10' },
      { name: 'Bulk B', sku: 'BULK-B', stock: 0, reorder: 0, price: 'SAR 20' },
    ]
    const created = await mockRepository.parts.bulkCreate(inputs)
    expect(created).toHaveLength(2)
    expect(created[0].name).toBe('Bulk A')
    expect(created[1].name).toBe('Bulk B')
  })

  it('bulkUpdate patches multiple rows', async () => {
    const a = await mockRepository.parts.create({ name: 'BU-A', sku: 'BU-A', stock: 0, reorder: 0, price: 'SAR 1' })
    const b = await mockRepository.parts.create({ name: 'BU-B', sku: 'BU-B', stock: 0, reorder: 0, price: 'SAR 2' })
    const updated = await mockRepository.parts.bulkUpdate([a._id!, b._id!], { stock: 99 })
    expect(updated).toHaveLength(2)
    for (const row of updated) {
      expect(row.stock).toBe(99)
    }
  })

  it('bulkDelete removes multiple rows', async () => {
    const a = await mockRepository.parts.create({ name: 'BD-A', sku: 'BD-A', stock: 0, reorder: 0, price: 'SAR 1' })
    const b = await mockRepository.parts.create({ name: 'BD-B', sku: 'BD-B', stock: 0, reorder: 0, price: 'SAR 2' })
    await mockRepository.parts.bulkDelete([a._id!, b._id!])
    await expect(mockRepository.parts.get(a._id!)).rejects.toThrow()
    await expect(mockRepository.parts.get(b._id!)).rejects.toThrow()
  })

  it('bulkDelete throws not_found if any id is missing', async () => {
    const a = await mockRepository.parts.create({ name: 'BD-C', sku: 'BD-C', stock: 0, reorder: 0, price: 'SAR 1' })
    await expect(mockRepository.parts.bulkDelete([a._id!, 'nonexistent'])).rejects.toThrow(RepositoryError)
  })
})

describe('RepositoryError', () => {
  it('carries a code, message, and optional fields', () => {
    const error = new RepositoryError('version_conflict', 'Stale version', {
      field: 'name',
      status: 409,
      requestId: 'req-123',
    })
    expect(error.code).toBe('version_conflict')
    expect(error.message).toBe('Stale version')
    expect(error.field).toBe('name')
    expect(error.status).toBe(409)
    expect(error.requestId).toBe('req-123')
    expect(error.name).toBe('RepositoryError')
    expect(error).toBeInstanceOf(Error)
  })

  it('isVersionConflict returns true only for version_conflict', () => {
    expect(isVersionConflict(new RepositoryError('version_conflict', 'x'))).toBe(true)
    expect(isVersionConflict(new RepositoryError('not_found', 'x'))).toBe(false)
    expect(isVersionConflict(new Error('not a repo error'))).toBe(false)
    expect(isVersionConflict(null)).toBe(false)
    expect(isVersionConflict(undefined)).toBe(false)
  })
})

describe('ENDPOINTS', () => {
  it('has an endpoint path for every collection key in the repository', () => {
    const repoKeys = Object.keys(mockRepository).sort()
    const endpointKeys = Object.keys(ENDPOINTS).sort()
    expect(endpointKeys).toEqual(repoKeys)
  })

  it('every endpoint path is a non-empty string', () => {
    for (const [key, path] of Object.entries(ENDPOINTS)) {
      expect(typeof path).toBe('string')
      expect(path.length, `ENDPOINTS["${key}"] is empty`).toBeGreaterThan(0)
    }
  })

  it('no two collections share an endpoint path', () => {
    const paths = Object.values(ENDPOINTS)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
