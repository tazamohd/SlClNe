import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WarrantyManagement } from '@/screens/accounting/WarrantyManagement'
import { renderWithProviders } from '../helpers/render'

/** Equipment warranties (BLK-004) — the screen no longer reads the fabricated
 *  `MOCK_WARRANTIES` array; it reads and writes `equipmentWarranties`
 *  (`GET/POST/PATCH/DELETE /equipment-warranties`), a plain generic
 *  collection with no bespoke router behind it. Unlike `CampaignFormModal`'s
 *  Send action — which needs a live messaging provider the fixture build
 *  cannot supply — create, edit and the claim transition here are all a
 *  field write the fixture repository genuinely performs, so this suite
 *  proves real behaviour rather than a documented refusal.
 *
 *  The fixture is session-scoped and mutating across tests in this file
 *  (`tests/unit/repository-fixture.test.ts`'s own discipline), so each case
 *  below works on a uniquely-named record of its own rather than asserting
 *  an absolute row count. */
describe('WarrantyManagement (fixture build)', () => {
  it('creates a warranty through the form, and it appears in the list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WarrantyManagement />, { role: 'accountant' })

    await user.click(await screen.findByRole('button', { name: /New Warranty/ }))
    await user.type(screen.getByLabelText(/Item/), 'Frame Straightener Rig')
    await user.type(screen.getByLabelText(/Provider/), 'ChassisPro SA')
    await user.type(screen.getByLabelText(/Start Date/), '2026-01-01')
    await user.type(screen.getByLabelText(/End Date/), '2028-01-01')
    await user.click(screen.getByRole('button', { name: /Create Warranty/ }))

    expect(await screen.findByText('Frame Straightener Rig')).toBeInTheDocument()
    expect(await screen.findByText('ChassisPro SA')).toBeInTheDocument()
  })

  it('marks an active warranty claimed, a real status write rather than an optimistic label', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WarrantyManagement />, { role: 'accountant' })

    await user.click(await screen.findByRole('button', { name: /New Warranty/ }))
    await user.type(screen.getByLabelText(/Item/), 'Undercarriage Hoist')
    await user.type(screen.getByLabelText(/Provider/), 'HoistWorks Inc')
    await user.type(screen.getByLabelText(/Start Date/), '2025-06-01')
    await user.type(screen.getByLabelText(/End Date/), '2027-06-01')
    await user.click(screen.getByRole('button', { name: /Create Warranty/ }))
    await screen.findByText('Undercarriage Hoist')

    const row = screen.getByText('Undercarriage Hoist').closest('tr')
    if (!row) throw new Error('expected a table row for the created warranty')
    await user.click(within(row).getByRole('button', { name: /Mark as Claimed/ }))

    await waitFor(() => {
      const refreshedRow = screen.getByText('Undercarriage Hoist').closest('tr')
      if (!refreshedRow) throw new Error('row disappeared after claiming')
      expect(within(refreshedRow).getByText('Claimed')).toBeInTheDocument()
    })
    // The lifecycle move is real: the Claim action is gone once claimed.
    const claimedRow = screen.getByText('Undercarriage Hoist').closest('tr')
    if (!claimedRow) throw new Error('expected a table row after claiming')
    expect(within(claimedRow).queryByRole('button', { name: /Mark as Claimed/ })).toBeNull()
  })

  it('hides New Warranty, Edit and Mark as Claimed from a role with no accounting edit grant', async () => {
    renderWithProviders(<WarrantyManagement />, { role: 'technician' })
    expect(await screen.findByRole('heading', { name: 'Warranty Management' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /New Warranty/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Edit$/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Mark as Claimed/ })).toBeNull()
  })
})
