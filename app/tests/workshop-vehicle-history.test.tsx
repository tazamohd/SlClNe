import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** `VehicleHistory` (workshop/VehicleHistory.tsx).
 *
 *  Previously six invented rows — fake dates, fake technicians ("Ahmad
 *  Al-Harbi", "Mohammed Saeed", "Khalid Omar") and fake costs — rendered for
 *  every visitor alike. The point of this file: the timeline now comes from
 *  the real `jobs` collection's completed/delivered rows, and a column with
 *  nothing real behind it (no fixture technician id, no matching invoice)
 *  reads "—" rather than a fabricated figure.
 */
const { VehicleHistory } = await import('@/screens/workshop/VehicleHistory')

describe('VehicleHistory', () => {
  it('shows real completed/delivered job rows, not the old invented technicians', async () => {
    renderScreen(VehicleHistory, { role: 'manager' })

    // The fixture's own completed/delivered jobs (see generated/tables.ts JOBS).
    expect(await screen.findByText('diagnostic')).toBeInTheDocument()
    expect(screen.getByText('tire service')).toBeInTheDocument()

    // The old fixed cast of fabricated technicians is gone.
    expect(screen.queryByText('Ahmad Al-Harbi')).toBeNull()
    expect(screen.queryByText('Mohammed Saeed')).toBeNull()
    expect(screen.queryByText('Khalid Omar')).toBeNull()

    // A fixture job carries no technician id or matching invoice, so those
    // columns read an honest dash rather than an invented cost.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('drops any job still open (pending/in_progress), not just the invented rows', async () => {
    renderScreen(VehicleHistory, { role: 'manager' })

    await screen.findByText('diagnostic')
    // The fixture also carries in_progress/pending jobs (maintenance, repair,
    // inspection) that never belonged in a *service history* timeline.
    expect(screen.queryByText('maintenance')).toBeNull()
    expect(screen.queryByText('repair')).toBeNull()
  })
})
