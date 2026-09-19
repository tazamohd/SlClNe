import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkshopDelivery } from '@/screens/workshop/WorkshopDelivery'
import { renderWithProviders } from '../helpers/render'

/** Customer sign-off at delivery (Sprint 2, P0 backlog item 4).
 *
 *  The checklist and the odometer reading used to be pure local state with a
 *  fabricated "Check-In 42,180 km / Delivery 42,195 km" pair; both are now
 *  meant to persist onto the `deliverySignoffs` row `WorkshopSignature.tsx`
 *  creates (`server/tests/delivery-signoff.test.ts` covers the write path
 *  end to end). This runs against the fixture repository (`isLive` is
 *  false, same as every other stage screen's component test), where
 *  `deliverySignoffs` genuinely has no rows — the honest state is "no
 *  signature captured yet" with a real link back to go capture one, not an
 *  invented signature. */
describe('WorkshopDelivery (fixture build)', () => {
  it('renders the real seeded job and every checklist item', async () => {
    renderWithProviders(<WorkshopDelivery />, { role: 'advisor' })
    expect(await screen.findByRole('heading', { name: 'Vehicle Delivery' })).toBeInTheDocument()
    expect((await screen.findAllByText(/A3F8B2C1/)).length).toBeGreaterThan(0)
    for (const label of ['Customer Notified', 'Keys Returned', 'Documents Ready', 'Invoice Attached', 'Cleaned', 'Quality Check']) {
      expect(screen.getByRole('checkbox', { name: label })).toBeInTheDocument()
    }
  })

  it('states honestly that no signature has been captured yet, with a real link to go capture one', async () => {
    renderWithProviders(<WorkshopDelivery />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Vehicle Delivery' })
    expect(await screen.findByText('No signature captured yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Capture Signature' })).toBeInTheDocument()
  })

  it('takes a real odometer reading', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkshopDelivery />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Vehicle Delivery' })
    const input = screen.getByLabelText('Reading (km)')
    await user.type(input, '42195')
    expect(input).toHaveValue('42195')
  })

  it('will not claim a delivery it cannot persist', async () => {
    renderWithProviders(<WorkshopDelivery />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Vehicle Delivery' })
    expect(
      await screen.findByText(/does not hold edit on job cards, or no API is configured/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Complete Delivery/ })).toBeDisabled()
  })
})
