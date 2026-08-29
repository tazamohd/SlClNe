import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CustomerPortalBooking } from '@/screens/portals/CustomerPortalBooking'
import { VEHICLES } from '@/data/generated/tables'
import { renderWithProviders } from './helpers/render'

/** The booking flow with an API behind it: validation before the request, the
 *  server's row as the success state, and a bay conflict landing on the time
 *  field. `isLive` is flipped and `appointments.create` intercepted; everything
 *  else — the form machine, the pickers, the mutation hook — is the real code. */

const created = vi.fn()

vi.mock('@/data/repository', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/data/repository')>()
  return {
    ...mod,
    isLive: true,
    repository: {
      ...mod.repository,
      appointments: {
        ...mod.repository.appointments,
        create: (input: Record<string, unknown>) => created(input) as Promise<never>,
      },
    },
  }
})

async function fillAndSubmit() {
  const user = userEvent.setup()
  renderWithProviders(<CustomerPortalBooking />, {
    route: '/customer-portal/booking',
    role: 'customer',
  })
  await user.click(await screen.findByRole('radio', { name: new RegExp(VEHICLES[0].plate) }))
  await user.click(screen.getByRole('radio', { name: 'Maintenance' }))
  await user.click(screen.getByRole('radio', { name: '8:00 AM' }))
  await user.click(screen.getByRole('button', { name: /Confirm Booking/ }))
  return user
}

describe('CustomerPortalBooking (live build)', () => {
  it('refuses to submit an incomplete form, and says which choices are missing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CustomerPortalBooking />, {
      route: '/customer-portal/booking',
      role: 'customer',
    })
    await screen.findByRole('radio', { name: new RegExp(VEHICLES[0].plate) })
    await user.click(screen.getByRole('button', { name: /Confirm Booking/ }))

    expect(await screen.findByText('Choose a vehicle')).toBeInTheDocument()
    expect(screen.getByText('Choose a service')).toBeInTheDocument()
    expect(screen.getByText('Choose a time')).toBeInTheDocument()
    expect(created).not.toHaveBeenCalled()
  })

  it('sends the create schema’s shape and shows the row the server persisted', async () => {
    created.mockResolvedValueOnce({
      _id: '01TESTULID',
      time: '8:00 AM',
      cust: 'Khalid Al-Amri',
      veh: VEHICLES[0].make,
      plate: VEHICLES[0].plate,
      svc: 'Maintenance',
      status: 'awaiting',
      bay: 'Bay 1',
      tech: '',
      mins: 60,
      scheduledDate: '2026-08-12',
      startMinute: 480,
    })
    await fillAndSubmit()

    expect(await screen.findByText('Booking confirmed')).toBeInTheDocument()
    // The panel shows the server's row, not the form's guess.
    expect(screen.getByText('2026-08-12 · 8:00 AM')).toBeInTheDocument()
    expect(screen.getByText(VEHICLES[0].make)).toBeInTheDocument()

    const sent = created.mock.calls[0][0] as Record<string, unknown>
    expect(sent.timeLabel).toBe('8:00 AM')
    expect(sent.startMinute).toBe(480)
    expect(sent.serviceLabel).toBe('Maintenance')
    expect(sent.plate).toBe(VEHICLES[0].plate)
    expect(sent.durationMins).toBe(60)
    expect(sent.status).toBe('awaiting')
    expect(typeof sent.scheduledDate).toBe('string')
  })

  it('lands a bay conflict on the time field, in the server’s words', async () => {
    const { RepositoryError } = await import('@/data/repository')
    created.mockRejectedValueOnce(
      new RepositoryError('rule_violated', 'Bay 1 is already booked from 8:00 AM.', {
        field: 'startMinute',
      })
    )
    await fillAndSubmit()

    expect(await screen.findByText('Bay 1 is already booked from 8:00 AM.')).toBeInTheDocument()
    expect(screen.queryByText('Booking confirmed')).toBeNull()
  })
})
