import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { CustomerPortal } from '@/screens/portals/CustomerPortal'
import { CustomerPortalBooking } from '@/screens/portals/CustomerPortalBooking'
import { ESTIMATES, INVOICES, JOBS, VEHICLES } from '@/data/generated/tables'
import { renderWithProviders } from './helpers/render'

/** The customer's home and the booking screen against the fixture repository.
 *  Own-scope (a customer sees their rows only) is the server's RLS; these pin
 *  that the screens render the API's answer and nothing invented. */

const ACTIVE = JOBS.find((job) => job.st === 'in_progress')!
const SENT = ESTIMATES.find((estimate) => estimate.status === 'sent')!

describe('CustomerPortal', () => {
  it('shows the active service from the jobs collection with its stage rail', async () => {
    renderWithProviders(<CustomerPortal />, { route: '/customer-portal', role: 'customer' })
    expect(await screen.findByText(ACTIVE.id)).toBeInTheDocument()
    expect(screen.getAllByText(ACTIVE.veh).length).toBeGreaterThan(0)
    // Six rail steps; fixture rows carry no stage, so Check-In is current.
    expect(screen.getByLabelText('Active Service')).toBeInTheDocument()
  })

  it('lists my vehicles from the collection', async () => {
    renderWithProviders(<CustomerPortal />, { route: '/customer-portal', role: 'customer' })
    expect((await screen.findAllByText(VEHICLES[0].make)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(VEHICLES[0].plate).length).toBeGreaterThan(0)
  })

  it('shows the sent estimate as pending, without an approve button it cannot honour', async () => {
    renderWithProviders(<CustomerPortal />, { route: '/customer-portal', role: 'customer' })
    expect(await screen.findByText('Pending Estimate')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(SENT.id))).toBeInTheDocument()
    // POST /estimates/:id/approve demands estimates:a, which the customer role
    // does not hold — a button here would 403 for its own audience.
    expect(screen.queryByRole('button', { name: /^Approve$/ })).toBeNull()
  })

  it('shows recent invoices with real amounts', async () => {
    renderWithProviders(<CustomerPortal />, { route: '/customer-portal', role: 'customer' })
    expect(await screen.findByText(INVOICES[0].id)).toBeInTheDocument()
    // "SAR 1,840" parses to the formatted SAR 1,840.00 — never NaN.
    expect(screen.getAllByText(/SAR 1,840\.00/).length).toBeGreaterThan(0)
  })

  it('quick actions lead somewhere real', async () => {
    renderWithProviders(<CustomerPortal />, { route: '/customer-portal', role: 'customer' })
    const book = await screen.findByRole('link', { name: /Book/ })
    expect(book).toHaveAttribute('href', '/customer-portal/booking')
  })
})

describe('CustomerPortalBooking (fixture build)', () => {
  it('will not pretend a booking saved when there is no API', async () => {
    renderWithProviders(<CustomerPortalBooking />, {
      route: '/customer-portal/booking',
      role: 'customer',
    })
    expect(
      await screen.findByText(/no API configured, so a booking cannot be saved/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Confirm Booking/ })).toBeDisabled()
  })

  it('offers the customer their vehicles and the service catalogue', async () => {
    renderWithProviders(<CustomerPortalBooking />, {
      route: '/customer-portal/booking',
      role: 'customer',
    })
    expect(await screen.findByRole('radio', { name: new RegExp(VEHICLES[0].plate) })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Maintenance' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '8:00 AM' })).toBeInTheDocument()
  })

  it('marks slots already taken in the reception bay as unavailable', async () => {
    renderWithProviders(<CustomerPortalBooking />, {
      route: '/customer-portal/booking',
      role: 'customer',
    })
    // Fixture board: 9:00 AM sits in Bay 1, so the hint disables it once the
    // appointments answer arrives.
    const nine = await screen.findByRole('radio', { name: '9:00 AM' })
    await waitFor(() => expect(nine).toBeDisabled())
    expect(screen.getByRole('radio', { name: '8:00 AM' })).toBeEnabled()
  })
})
