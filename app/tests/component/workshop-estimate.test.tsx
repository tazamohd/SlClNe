import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { WorkshopEstimate } from '@/screens/workshop/WorkshopEstimate'
import { renderWithProviders } from '../helpers/render'

/** Applying a canned job to an estimate (build-order item 5).
 *
 *  `WorkshopEstimate.tsx` gained an "Apply a Canned Job" picker that copies
 *  a package's lines onto the estimate through the same full-replace
 *  `PATCH /estimates/:id` editing an estimate already runs
 *  (`server/tests/canned-jobs.test.ts` covers the write path end to end).
 *  This runs against the fixture repository (`isLive` is false, same as
 *  every other stage screen), where the seeded job carries no linked
 *  estimate — the honest state is that the picker does not appear at all,
 *  never one offered against a record that is not there. */
describe('WorkshopEstimate — applying a canned job (fixture build)', () => {
  it('renders the real seeded job', async () => {
    renderWithProviders(<WorkshopEstimate />, { role: 'advisor' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Cost Estimate' })).toBeInTheDocument()
  })

  it('offers no canned-job picker without a linked estimate to apply one to', async () => {
    renderWithProviders(<WorkshopEstimate />, { role: 'advisor' })
    await screen.findByRole('heading', { level: 1, name: 'Cost Estimate' })
    expect(screen.queryByText('Apply a Canned Job')).toBeNull()
  })
})
