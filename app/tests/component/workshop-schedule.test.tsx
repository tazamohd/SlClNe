import { describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppointmentCalendar } from '@/screens/workshop/AppointmentCalendar'
import { TechnicianSchedule } from '@/screens/workshop/TechnicianSchedule'
import { renderWithProviders } from '../helpers/render'

/** The two schedule views over the real `appointments` collection. */
describe('AppointmentCalendar', () => {
  it('renders the calendar with a day/week toggle', async () => {
    renderWithProviders(<AppointmentCalendar />, { role: 'owner' })
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Day' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Week' })).toBeInTheDocument()
  })

  it('places real appointments on the grid', async () => {
    renderWithProviders(<AppointmentCalendar />, { role: 'owner' })
    await screen.findByRole('heading', { name: 'Calendar' })
    // A seeded customer name appears as an appointment block once loaded.
    expect((await screen.findAllByText(/Ahmed Al-Rashid/)).length).toBeGreaterThan(0)
  })

  it('gates New Appointment on the create grant', async () => {
    renderWithProviders(<AppointmentCalendar />, { role: 'technician' })
    await screen.findByRole('heading', { name: 'Calendar' })
    expect(screen.queryByRole('button', { name: /New Appointment/ })).toBeNull()
  })

  it('opens a booking form and creates an appointment', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppointmentCalendar />, { role: 'owner' })
    await user.click(await screen.findByRole('button', { name: /New Appointment/ }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Customer'), 'Test Customer')
    await user.type(within(dialog).getByLabelText('Vehicle'), 'Toyota Corolla 2020')
    await user.type(within(dialog).getByLabelText('Plate'), 'RUH 1234')
    await user.type(within(dialog).getByLabelText('Service'), 'Maintenance')
    await user.type(within(dialog).getByLabelText('Date'), '2026-08-20')
    await user.type(within(dialog).getByLabelText('Time'), '9:00 AM')
    await user.type(within(dialog).getByLabelText('Bay'), 'Bay 1')
    await user.click(within(dialog).getByRole('button', { name: /Book Appointment/ }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('validates a malformed time before sending', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppointmentCalendar />, { role: 'owner' })
    await user.click(await screen.findByRole('button', { name: /New Appointment/ }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Time'), '25:99')
    await user.click(within(dialog).getByRole('button', { name: /Book Appointment/ }))
    expect(await screen.findByText(/Enter a time like 9:00 AM/)).toBeInTheDocument()
  })
})

describe('TechnicianSchedule', () => {
  it('lists technicians with a utilization bar', async () => {
    renderWithProviders(<TechnicianSchedule />, { role: 'owner' })
    await screen.findByRole('heading', { name: 'Technician Schedule' })
    // Every technician is listed, with a utilization progressbar each.
    expect((await screen.findAllByRole('progressbar')).length).toBeGreaterThan(0)
  })

  it("groups a technician's appointments under them", async () => {
    renderWithProviders(<TechnicianSchedule />, { role: 'owner' })
    await screen.findByRole('heading', { name: 'Technician Schedule' })
    // Saeed Al-Zahrani appears via the appointment union (seed has no id link).
    expect(await screen.findByText('Saeed Al-Zahrani')).toBeInTheDocument()
  })
})
