import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { WorkshopInspection } from '@/screens/workshop/WorkshopInspection'
import { renderWithProviders } from '../helpers/render'

/** Digital Vehicle Health Check (Sprint 2, P0).
 *
 *  `WorkshopInspection.tsx` used to hold every verdict in local React state
 *  only — nothing persisted, and reloading the tab lost the whole checklist.
 *  This runs against the real fixture repository (`isLive` is false, same as
 *  `workshop-declined-jobs.test.tsx`): the proof here is that the screen reads
 *  the real seeded job rather than an invented one, offers every checklist
 *  item on all six systems, and — because there is no live API in this build —
 *  is honestly read-only rather than accepting a click it cannot save. */
describe('WorkshopInspection (fixture build)', () => {
  it('renders the real seeded job, not a fabricated one', async () => {
    renderWithProviders(<WorkshopInspection />, { role: 'technician' })
    expect(await screen.findByRole('heading', { name: 'Vehicle Inspection' })).toBeInTheDocument()
    expect(await screen.findByText(/A3F8B2C1/)).toBeInTheDocument()
    expect(screen.getByText(/Toyota Camry 2022/)).toBeInTheDocument()
  })

  it('lists every checklist item across all six systems', async () => {
    renderWithProviders(<WorkshopInspection />, { role: 'technician' })
    await screen.findByRole('heading', { name: 'Vehicle Inspection' })
    expect(screen.getByText('Engine & Transmission')).toBeInTheDocument()
    expect(screen.getByText('Brakes & Suspension')).toBeInTheDocument()
    expect(screen.getByText('Tires & Wheels')).toBeInTheDocument()
    expect(screen.getByText('Electrical & Lighting')).toBeInTheDocument()
    expect(screen.getByText('Fluids & Filters')).toBeInTheDocument()
    expect(screen.getByText('Body & Interior')).toBeInTheDocument()
    expect(screen.getByText('Brake Pads')).toBeInTheDocument()
    expect(screen.getByText('0/22 checks recorded')).toBeInTheDocument()
  })

  it('is honestly read-only without a live API, not a click that silently does nothing', async () => {
    renderWithProviders(<WorkshopInspection />, { role: 'technician' })
    await screen.findByRole('heading', { name: 'Vehicle Inspection' })
    expect(
      await screen.findByText(/your role does not hold edit on job cards, or no API is configured/)
    ).toBeInTheDocument()
    const [firstPass] = screen.getAllByRole('radio', { name: 'Pass' })
    expect(firstPass).toBeDisabled()
  })
})
