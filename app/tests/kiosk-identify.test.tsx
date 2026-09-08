import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KioskCheckIn } from '@/screens/portals/KioskCheckIn'
import { renderWithProviders } from './helpers/render'

/** The kiosk's identify step, which for a long time identified nobody.
 *
 *  It asks for a phone number or a licence plate, and then showed the same two
 *  hardcoded cars — a Toyota Camry on ABC 1234 and a Hyundai Sonata on XYZ 5678
 *  — to every walk-in, whatever they typed. The constant was commented "in live
 *  mode these come from the API"; they did not. `isLive` only enabled the
 *  buttons, so on a real terminal anyone could pick a stranger's vehicle and
 *  check in against it.
 *
 *  These tests drive the real component over a stubbed repository. What they
 *  are really pinning is the negative: that a car nobody matched never reaches
 *  the screen. The `q` a collection takes is a free-text search across several
 *  columns, so "1234" legitimately comes back with a VIN and an owner's phone
 *  number attached to other people's vehicles — hence the decoy row below, and
 *  the exact re-check the component does after searching.
 */

const CAMRY = {
  _id: 'veh-ahmed', plate: 'ABC 1234', make: 'Toyota Camry 2023',
  owner: 'Ahmed Al-Rashid', customerId: 'cus-ahmed',
}
const SONATA = {
  _id: 'veh-fatima', plate: 'XYZ 5678', make: 'Hyundai Sonata 2022',
  owner: 'Fatima Al-Zahrani', customerId: 'cus-fatima',
}
/** Comes back from a free-text search for "1234" — its VIN contains it — and
 *  belongs to a third party. Nothing about it may reach the screen. */
const DECOY = {
  _id: 'veh-decoy', plate: 'QRS 4400', make: 'Nissan Patrol 2021',
  owner: 'Omar Al-Ghamdi', customerId: 'cus-omar', vin: 'JN1234567890ABCDE',
}

const AHMED = { _id: 'cus-ahmed', name: 'Ahmed Al-Rashid', phone: '+966 55 210 4471' }
const FATIMA = { _id: 'cus-fatima', name: 'Fatima Al-Zahrani', phone: '+966 50 887 2201' }

const created = vi.fn()

/** Stands in for the API's free-text search: a substring sweep over the values,
 *  which is exactly the over-matching the component has to correct for. */
function search<T extends Record<string, unknown>>(rows: readonly T[], q: string) {
  const needle = q.trim().toLowerCase()
  return rows.filter((row) =>
    Object.values(row).some((v) => String(v).toLowerCase().includes(needle)),
  )
}

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    isLive: true,
    repository: {
      ...mod.repository,
      vehicles: {
        ...mod.repository.vehicles,
        async list(query: { q?: string; filter?: Record<string, string> } = {}) {
          const all = [CAMRY, SONATA, DECOY]
          const rows = query.filter?.customerId
            ? all.filter((v) => v.customerId === query.filter?.customerId)
            : query.q
              ? search(all, query.q)
              : all
          return { rows, page: { page: 1, pageSize: 20, total: rows.length, totalPages: 1 } }
        },
      },
      customers: {
        ...mod.repository.customers,
        async list(query: { q?: string } = {}) {
          const rows = query.q ? search([AHMED, FATIMA], query.q) : [AHMED, FATIMA]
          return { rows, page: { page: 1, pageSize: 20, total: rows.length, totalPages: 1 } }
        },
      },
      appointments: {
        ...mod.repository.appointments,
        create: (input: Record<string, unknown>) => {
          created(input)
          return Promise.resolve({ ...input, _id: 'apt-1' }) as Promise<never>
        },
      },
    },
  }
})

beforeEach(() => created.mockClear())

async function identifyBy(field: 'License Plate' | 'Phone Number', value: string) {
  const user = userEvent.setup()
  renderWithProviders(<KioskCheckIn />, { role: 'frontdesk' })
  await user.type(screen.getByLabelText(field), value)
  await user.click(screen.getByRole('button', { name: /Find My Vehicle/i }))
  return user
}

describe('identifying a walk-in by plate', () => {
  it('shows the vehicle on that plate and no other', async () => {
    await identifyBy('License Plate', 'ABC 1234')
    expect(await screen.findByText('Toyota Camry 2023')).toBeInTheDocument()
    expect(screen.queryByText('Hyundai Sonata 2022')).not.toBeInTheDocument()
    expect(screen.queryByText('Nissan Patrol 2021')).not.toBeInTheDocument()
  })

  it('ignores the spacing and case a touch keyboard produces', async () => {
    await identifyBy('License Plate', 'abc-1234')
    expect(await screen.findByText('Toyota Camry 2023')).toBeInTheDocument()
  })

  it('discards a free-text hit that is not that plate', async () => {
    /* "1234" matches the decoy's VIN. The search returns it; the exact re-check
     * is what keeps it off the screen. Without that check this test sees a
     * stranger's Nissan. */
    await identifyBy('License Plate', '1234')
    expect(await screen.findByText(/No vehicle on file/i)).toBeInTheDocument()
    expect(screen.queryByText('Nissan Patrol 2021')).not.toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry 2023')).not.toBeInTheDocument()
  })

  it('offers a walk-in path rather than somebody else’s car when nothing matches', async () => {
    await identifyBy('License Plate', 'ZZZ 9999')
    expect(await screen.findByText(/No vehicle on file/i)).toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry 2023')).not.toBeInTheDocument()
    expect(screen.queryByText('Hyundai Sonata 2022')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue with this plate/i })).toBeInTheDocument()
  })
})

describe('identifying a walk-in by phone', () => {
  it('resolves the customer and lists their vehicles', async () => {
    await identifyBy('Phone Number', '+966 55 210 4471')
    expect(await screen.findByText('Toyota Camry 2023')).toBeInTheDocument()
    expect(screen.queryByText('Hyundai Sonata 2022')).not.toBeInTheDocument()
    expect(screen.getByText(/Ahmed Al-Rashid/)).toBeInTheDocument()
  })

  it('matches a local number against a stored international one', async () => {
    /* Stored as "+966 55 210 4471", typed as "0552104471". The last nine digits
     * are the subscriber; anything shorter is not enough to be sure. */
    await identifyBy('Phone Number', '0552104471')
    expect(await screen.findByText('Toyota Camry 2023')).toBeInTheDocument()
  })

  it('refuses to guess from a fragment', async () => {
    await identifyBy('Phone Number', '4471')
    expect(await screen.findByText(/No vehicle on file/i)).toBeInTheDocument()
  })
})

describe('the appointment the kiosk files', () => {
  it('carries the customer it resolved, not the number that was typed', async () => {
    const user = await identifyBy('Phone Number', '+966 55 210 4471')
    await user.click(await screen.findByRole('button', { name: /Toyota Camry 2023/i }))
    await user.click(await screen.findByRole('button', { name: /Oil Change/i }))
    await user.click(screen.getByRole('button', { name: /Confirm Check-In/i }))

    expect(created).toHaveBeenCalledTimes(1)
    const input = created.mock.calls[0][0] as Record<string, unknown>
    /* The old payload sent `customerName: phone.trim()`, so a phone number
     * landed in the appointment's customer-name column. */
    expect(input.customerName).toBe('Ahmed Al-Rashid')
    expect(input.customerId).toBe('cus-ahmed')
    expect(input.plate).toBe('ABC 1234')
  })

  it('files a walk-in with no customer rather than attaching a stranger', async () => {
    const user = await identifyBy('License Plate', 'ZZZ 9999')
    await user.click(await screen.findByRole('button', { name: /Continue with this plate/i }))
    await user.click(await screen.findByRole('button', { name: /Oil Change/i }))
    await user.click(screen.getByRole('button', { name: /Confirm Check-In/i }))

    const input = created.mock.calls[0][0] as Record<string, unknown>
    expect(input.customerId).toBeUndefined()
    expect(input.customerName).toBe('Walk-in')
    expect(input.plate).toBe('ZZZ 9999')
  })
})

describe('between one walk-in and the next', () => {
  it('leaves nothing of the last person on the terminal', async () => {
    /* A public terminal that keeps the previous customer's name and vehicles on
     * screen is the same disclosure by another route. */
    const user = await identifyBy('Phone Number', '+966 55 210 4471')
    await user.click(await screen.findByRole('button', { name: /Toyota Camry 2023/i }))
    await user.click(await screen.findByRole('button', { name: /Oil Change/i }))
    await user.click(screen.getByRole('button', { name: /Confirm Check-In/i }))

    await user.click(await screen.findByRole('button', { name: /Check In Another|New Check-In|Start Over|Done/i }))
    expect(screen.queryByText('Ahmed Al-Rashid')).not.toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry 2023')).not.toBeInTheDocument()
    expect((screen.getByLabelText('Phone Number') as HTMLInputElement).value).toBe('')
  })
})
