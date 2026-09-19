import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerAppAppointments } from '@/screens/customer-app/CustomerApp'
import { renderWithProviders } from '../helpers/render'

/** The customer-app surface's booking entry point.
 *
 *  `CustomerAppAppointments` renders a "Book Service" button that navigated to
 *  `/customer-app/appointments` — the route it is already on. So the one
 *  customer-facing surface that offers booking had **no way to book**: the
 *  button re-rendered the list the customer was already looking at, and
 *  nothing said so. A no-op control is not a smaller bug than a fabricated
 *  value; it is the same lie told with a handler instead of a constant.
 *
 *  It now goes to `/customer-portal/booking`, the one screen that actually
 *  writes an appointment. The test asserts the destination *renders*, rather
 *  than spying on `navigate`, because what matters is that the customer
 *  arrives somewhere that can book — a spy would pass just as happily on a
 *  route that does not exist. */
describe('Customer-app booking entry point', () => {
  const mountAppointments = () =>
    renderWithProviders(
      <Routes>
        <Route path="/customer-app/appointments" element={<CustomerAppAppointments />} />
        <Route
          path="/customer-portal/booking"
          element={<div>the booking form that writes an appointment</div>}
        />
      </Routes>,
      { role: 'customer', route: '/customer-app/appointments' },
    )

  it('sends "Book Service" to a screen that can actually book, not back to itself', async () => {
    mountAppointments()
    const book = await screen.findByRole('button', { name: /Book Service/i })

    await userEvent.click(book)

    await waitFor(() =>
      expect(
        screen.getByText('the booking form that writes an appointment'),
      ).toBeInTheDocument(),
    )
    /* The list it started on is gone, which is what "navigated away" means
     * here — the old behaviour left this heading on screen untouched. */
    expect(screen.queryByText('My Bookings')).not.toBeInTheDocument()
  })

  it('does not route the customer to the appointments list it is already showing', async () => {
    mountAppointments()
    expect(await screen.findByText('My Bookings')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: /Book Service/i }))

    /* Pins the regression by value: a re-render of this same route is the bug,
     * so the destination probe must be what is on screen instead. */
    await waitFor(() =>
      expect(
        screen.getByText('the booking form that writes an appointment'),
      ).toBeInTheDocument(),
    )
  })
})
