import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { CannedJobs } from '@/screens/workshop/CannedJobs'
import { renderWithProviders } from '../helpers/render'

/** Canned Jobs — predefined, priced service packages (build-order item 5).
 *
 *  An estimate used to be priced line by line with no way to reuse a
 *  standard bundle. This runs against the real fixture repository (`isLive`
 *  is false, same as `workshop-declined-jobs.test.tsx`): the catalog is
 *  genuinely empty — nothing here is seeded, every package is born from
 *  `POST /canned-jobs` — and, because there is no live API in this build,
 *  the "New Package" action is honestly absent rather than a button that
 *  would fail the moment it was pressed. */
describe('CannedJobs (fixture build)', () => {
  it('renders the real, empty catalog rather than a fabricated one', async () => {
    renderWithProviders(<CannedJobs />, { role: 'advisor' })
    expect(await screen.findByRole('heading', { name: 'Canned Jobs' })).toBeInTheDocument()
    expect(await screen.findByText('No canned jobs yet')).toBeInTheDocument()
  })

  it('states honestly that the catalog cannot be saved without a live API', async () => {
    renderWithProviders(<CannedJobs />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Canned Jobs' })
    expect(
      await screen.findByText(/This build has no API configured, so the catalog cannot be saved/)
    ).toBeInTheDocument()
  })

  it('offers no "New Package" action with no live API to save one to', async () => {
    renderWithProviders(<CannedJobs />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Canned Jobs' })
    expect(screen.queryByRole('button', { name: /New Package/ })).toBeNull()
  })
})
