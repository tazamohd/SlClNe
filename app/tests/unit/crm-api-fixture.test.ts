import { describe, expect, it, vi } from 'vitest'

/** The fixture half of the CRM / fleet action transport (F-027).
 *
 *  With no `VITE_API_URL`, `isLive` is false and the action refuses honestly —
 *  it never fabricates a conversion or a renewal the next reload would
 *  contradict. This file supplies the fixture module (isLive false); the sibling
 *  `crm-api.test.ts` supplies the live one. */
vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, API_URL: '', isLive: false }
})

const { convertLead, renewFleet, RepositoryError } = await import('@/screens/crm/api')

describe('CRM actions against the fixtures', () => {
  it('convertLead refuses with the "set VITE_API_URL" state rather than faking it', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const failure = await convertLead('01LEAD').catch((error: unknown) => error)

    expect(failure).toBeInstanceOf(RepositoryError)
    expect((failure as InstanceType<typeof RepositoryError>).code).toBe('unsupported')
    expect((failure as Error).message).toMatch(/VITE_API_URL/)
    // Nothing was even attempted over the wire.
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renewFleet refuses the same way', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const failure = await renewFleet('01FLEET', { contractEndDate: '2027-08-16' }).catch(
      (error: unknown) => error,
    )

    expect((failure as InstanceType<typeof RepositoryError>).code).toBe('unsupported')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
