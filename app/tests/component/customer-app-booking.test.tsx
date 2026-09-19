import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { CustomerAppBooking } from '@/screens/customer-app/CustomerAppBooking'
import { repository } from '@/data/repository'
import { renderWithProviders } from '../helpers/render'

/** F-118 `/customer-app-booking` (BLK-004).
 *
 *  The screen used to render three literal arrays and no event handler: an
 *  invented service catalogue with invented prices, invented time slots with
 *  an `available` flag no appointment decided, and a wizard whose first two
 *  steps were hardcoded as already completed. It now reads the real `services`
 *  collection and says plainly that booking happens on the form that actually
 *  writes an appointment (`/customer-portal/booking`).
 *
 *  Every fabricated value is asserted **absent by value**, so reintroducing one
 *  fails here rather than shipping. The catalogue is asserted to follow the
 *  collection — a row created through the repository has to appear — rather
 *  than matching a list this file also hardcodes. */

/** Labels that were in the old literal and are **not** in `services`. */
const INVENTED_SERVICES = [
  'Brake Inspection',
  'Full Service',
  'Tire Rotation',
  'Battery Check',
  'Engine Diagnostic',
  'Wheel Alignment',
]

/** The old literal's prices, and the duration strings beside them. */
const INVENTED_PRICES = ['149', '89', '899', '299', '120', '49', '199', '180']
const INVENTED_DURATIONS = ['30 min', '45 min', '3 hours', '1 hour', '20 min']

/** The old literal's availability grid. Not one of these was computed. */
const INVENTED_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
]

describe('CustomerAppBooking (fixture build)', () => {
  it('renders the service catalogue from the services collection', async () => {
    const { rows } = await repository.services.list()
    expect(rows.length).toBeGreaterThan(0)

    renderWithProviders(<CustomerAppBooking />, { role: 'customer' })

    /* Every label the collection carries is on the screen, and the screen
     * carries nothing else — the catalogue *follows* the collection rather
     * than being a literal that happens to overlap it. `services` is
     * read-only (`registry.ts` defines it without `writable`, and it presents
     * as an `[icon, label]` tuple with no entity metadata), so the check is
     * a correspondence against the live rows rather than a seeded write. */
    const labels = rows.map((row) => (row as unknown as readonly string[])[1])
    for (const label of labels) {
      expect(await screen.findByText(label)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('listitem')).toHaveLength(labels.length)
  })

  it('renders no invented service, price, duration or time slot', async () => {
    renderWithProviders(<CustomerAppBooking />, { role: 'customer' })
    await screen.findByText('Services offered by the workshop')

    for (const name of INVENTED_SERVICES) {
      expect(screen.queryByText(name)).not.toBeInTheDocument()
    }
    for (const slot of INVENTED_SLOTS) {
      expect(screen.queryByText(slot)).not.toBeInTheDocument()
    }
    for (const duration of INVENTED_DURATIONS) {
      expect(screen.queryByText(duration)).not.toBeInTheDocument()
    }
    /* Prices were rendered as `{price} SAR`, so no price text and no currency
     * label should survive anywhere on the screen. */
    for (const price of INVENTED_PRICES) {
      expect(screen.queryByText(new RegExp(`\\b${price}\\b`))).not.toBeInTheDocument()
    }
    expect(screen.queryByText(/SAR/)).not.toBeInTheDocument()
    expect(screen.queryByText('Popular')).not.toBeInTheDocument()
  })

  it('does not present itself as bookable, and routes to the form that books', async () => {
    renderWithProviders(<CustomerAppBooking />, { role: 'customer' })
    await screen.findByText('Services offered by the workshop')

    /* The wizard is gone: no Confirm step, no step labels claiming progress. */
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
    expect(screen.queryByText('Pick Time')).not.toBeInTheDocument()
    expect(screen.queryByText('Choose Vehicle')).not.toBeInTheDocument()
    expect(screen.queryByText('Available Time Slots')).not.toBeInTheDocument()

    /* And there is no control on the screen that could look like booking. */
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    const link = screen.getByRole('link', { name: /Go to booking/ })
    expect(link).toHaveAttribute('href', '/customer-portal/booking')
  })
})
