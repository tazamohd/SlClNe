import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerAppBooking } from '@/screens/customer-app/CustomerAppBooking'
import { CustomerAppPayments } from '@/screens/customer-app/CustomerAppPayments'
import { INVOICES, VEHICLES } from '@/data/generated/tables'
import { renderWithProviders } from '../helpers/render'

/** Booking is three decisions with one Continue; Payments is the invoice
 *  collection with one "Pay now" that is primary only while something is owed. */
describe('CustomerAppBooking', () => {
  it('walks service → vehicle → time and books through the appointments seam', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerAppBooking />, { route: '/customer-app-booking', role: 'customer' })

    const steps = screen.getByRole('list', { name: 'Booking steps' })
    expect(within(steps).getAllByRole('listitem')).toHaveLength(3)
    expect(within(steps).getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')

    // Nothing chosen: Continue is disabled, not missing.
    const next = screen.getByRole('button', { name: /Continue/ })
    expect(next).toBeDisabled()
    await user.click(screen.getByRole('radio', { name: /Oil Change/ }))
    await user.click(next)

    // Step 2 is the vehicle collection.
    expect(within(steps).getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step')
    await user.click(await screen.findByRole('radio', { name: new RegExp(VEHICLES[0].plate) }))
    await user.click(screen.getByRole('button', { name: /Continue/ }))

    // Step 3: a slot, then confirm.
    expect(within(steps).getAllByRole('listitem')[2]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('button', { name: /Back/ })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '09:00 AM' }))
    await user.click(screen.getByRole('button', { name: /Confirm booking/ }))

    expect(await screen.findByText('Booking confirmed')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View bookings/ })).toHaveAttribute('href', '/customer-app/appointments')
  })
})

describe('CustomerAppPayments', () => {
  it('lists the invoice collection through Money and makes Pay now primary while a balance is owed', async () => {
    renderWithProviders(<CustomerAppPayments />, { route: '/customer-app-payments', role: 'customer' })
    expect(await screen.findByText(INVOICES[0].id)).toBeInTheDocument()
    // Fixture invoices are unpaid, so something is owed.
    const pay = screen.getAllByRole('button', { name: /Pay now/ })
    expect(pay.length).toBeGreaterThan(0)
    expect(screen.getByText('You have a balance to pay')).toBeInTheDocument()
    expect(screen.getAllByText(/SAR 1,840\.00/).length).toBeGreaterThan(0)
    // The invented saved cards are gone.
    expect(screen.queryByText('****4821')).toBeNull()
    expect(screen.getByText('No saved payment methods')).toBeInTheDocument()
  })
})
