import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkshopSignature } from '@/screens/workshop/WorkshopSignature'
import { renderWithProviders } from '../helpers/render'

/** Customer sign-off at delivery (Sprint 2, P0 backlog item 4).
 *
 *  `WorkshopSignature.tsx` used to only navigate on "Confirm Signature" —
 *  nothing was ever sent anywhere. It now uploads the canvas as a real PNG
 *  through `POST /job-cards/:id/delivery-signoff`
 *  (`server/tests/delivery-signoff.test.ts` covers that route end to end).
 *  jsdom has no real `<canvas>` 2D context, so a stroke can never actually be
 *  drawn here — the proof this file can honestly make is that the job
 *  summary is real, and that "Confirm Signature" stays disabled until both a
 *  signature and the authorization checkbox are present, never a click that
 *  silently no-ops. */
describe('WorkshopSignature (fixture build)', () => {
  it('renders the real seeded job, not a fabricated one', async () => {
    renderWithProviders(<WorkshopSignature />, { role: 'advisor' })
    expect(await screen.findByRole('heading', { name: 'Customer Signature' })).toBeInTheDocument()
    expect((await screen.findAllByText(/A3F8B2C1/)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Ahmed Al-Rashid/).length).toBeGreaterThan(0)
  })

  it('keeps "Confirm Signature" disabled with no signature drawn', async () => {
    renderWithProviders(<WorkshopSignature />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Customer Signature' })
    expect(screen.getByRole('button', { name: /Confirm Signature/ })).toBeDisabled()
  })

  it('still refuses to submit after only checking the authorization box', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkshopSignature />, { role: 'advisor' })
    await screen.findByRole('heading', { name: 'Customer Signature' })
    await user.click(screen.getByText(/I authorize the work described above/))
    expect(screen.getByRole('button', { name: /Confirm Signature/ })).toBeDisabled()
  })
})
