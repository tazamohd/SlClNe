import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  CustomerAppAppointments,
  CustomerAppGarage,
  CustomerAppInsurance,
  CustomerAppLoans,
} from '@/screens/customer-app/CustomerApp'
import { repository } from '@/data/repository'
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

/** The other three no-op controls on this surface.
 *
 *  "Add Vehicle", "Apply for Finance", "Policy Documents" and "File a Claim"
 *  all navigated to the route they were already on. Unlike "Book Service" they
 *  could not be re-pointed: `vehicles` grants `customer` `v` with no create,
 *  `insurance` grants it nothing at all, and no `loans` module exists in the
 *  matrix — so every candidate destination would answer 403. They are gone,
 *  replaced by a statement of who performs the action instead.
 *
 *  Asserted by *role*, not by text: the failure being pinned is a control that
 *  invites a click and does nothing, so what must not come back is a button or
 *  a clickable row — regardless of its label. */
describe('Customer-app controls for actions a customer cannot perform', () => {
  it('offers no "Add Vehicle" control, and says who registers a vehicle', async () => {
    renderWithProviders(<CustomerAppGarage />, { role: 'customer', route: '/customer-app/garage' })

    await waitFor(() =>
      expect(
        screen.getByText(/Vehicles are registered by the workshop/i),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /Add Vehicle/i })).not.toBeInTheDocument()
  })

  it('offers no finance application, and says where finance is arranged', async () => {
    renderWithProviders(<CustomerAppLoans />, { role: 'customer', route: '/customer-app/loans' })

    await waitFor(() =>
      expect(screen.getByText(/Finance is arranged with the workshop/i)).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /Apply for Finance/i })).not.toBeInTheDocument()
  })

  it('offers no claim filing or document download, and says who files a claim', async () => {
    /* The two rows lived in the has-policy branch, so the policy has to exist
     * for this to assert anything — on an empty collection the screen returns
     * its empty state and never reaches the code under test. */
    await repository.insurancePolicies.create({
      policyNumber: 'POL-TEST-0001',
      insurer: 'Test Insurer',
      type: 'comprehensive',
      holder: 'Test Holder',
      customerId: null,
      vehicleId: null,
      vehicleLabel: 'Test Vehicle',
      premium: '1,000',
      premiumHalalas: 100_000,
      coverage: '50,000',
      coverageHalalas: 5_000_000,
      start: '2026-01-01',
      end: '2026-12-31',
      status: 'active',
    } as Parameters<typeof repository.insurancePolicies.create>[0])

    renderWithProviders(<CustomerAppInsurance />, {
      role: 'customer',
      route: '/customer-app/insurance',
    })

    await waitFor(() =>
      expect(screen.getByText(/Claims are filed by the workshop/i)).toBeInTheDocument(),
    )
    /* The old rows were clickable `AppListRow`s, so their absence is asserted as
     * the absence of anything carrying those labels at all. */
    expect(screen.queryByText('File a Claim')).not.toBeInTheDocument()
    expect(screen.queryByText('Policy Documents')).not.toBeInTheDocument()
  })
})
