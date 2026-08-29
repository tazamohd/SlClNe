import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { WorkshopCheckIn } from '@/screens/workshop/WorkshopCheckIn'
import { WorkshopInspection } from '@/screens/workshop/WorkshopInspection'
import { WorkshopEstimate } from '@/screens/workshop/WorkshopEstimate'
import { WorkshopQC } from '@/screens/workshop/WorkshopQC'
import { JOBS } from '@/data/generated/tables'
import { renderWithProviders } from '../helpers/render'

const FIRST = JOBS[0]

/** The six-stage loop used to hold its progress in component state: every
 *  screen showed a toast and navigated on a timer, and nothing recorded that
 *  anything had happened. These pin the replacement — the primary action is a
 *  request, and with nowhere to send it the screen says so and stays put.
 *
 *  The request shape and the server's refusals are covered by
 *  `tests/unit/workshop-api.test.ts`, which can supply a live API; this file
 *  covers what a build with no API behind it must do, which is the build these
 *  tests and every default `npm run build` actually produce. */
const STAGES = [
  { name: 'Check-In', Screen: WorkshopCheckIn, action: /Complete Check-In/ },
  { name: 'Inspection', Screen: WorkshopInspection, action: /Submit Inspection/ },
  { name: 'Estimate', Screen: WorkshopEstimate, action: /Approve Estimate/ },
] as const

describe.each(STAGES)('$name', ({ Screen, action }) => {
  it('reads the job card from the query string instead of the design’s demo row', async () => {
    const second = JOBS[1]
    renderWithProviders(<Screen />, { route: `/x?id=${second.id}` })
    expect(await screen.findByText(new RegExp(second.id))).toBeInTheDocument()
    expect(screen.queryByText(/JC-A3F8B2C1/)).toBeNull()
  })

  it('will not claim a stage change it cannot persist', async () => {
    renderWithProviders(<Screen />, { route: '/x', role: 'owner' })
    // The notice appears once the job card resolves — the screen's own body is
    // readable throughout rather than blanked behind a spinner.
    expect(
      await screen.findByText(/does not hold edit on job cards, or no API is configured/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: action })).toBeDisabled()
  })
})

describe('WorkshopQC', () => {
  it('offers no quality decision on a card that is not at repair or QC', async () => {
    // Fixture rows carry no stage, so the card reads as still at check-in.
    renderWithProviders(<WorkshopQC />, { route: '/x', role: 'manager' })
    await screen.findByRole('heading', { level: 1, name: 'Quality Check' })

    expect(
      screen.getByText(/not at a stage quality control can act on/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Approve QC/ })).toBeDisabled()
    // Returning to repair is only offered from QC, so it is absent here.
    expect(screen.queryByRole('button', { name: /Return to Repair/ })).toBeNull()
  })

  it('still warns a technician about the duty conflict before any request', async () => {
    renderWithProviders(<WorkshopQC />, { route: '/x', role: 'technician' })
    expect(await screen.findByText('Segregation of duties')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Approve QC/ })).toBeDisabled()
  })

  it('shows the record it is judging, not a constant', async () => {
    renderWithProviders(<WorkshopQC />, { route: '/x' })
    expect(await screen.findByText(new RegExp(FIRST.id))).toBeInTheDocument()
    // The prototype's technician, work summary and prices were module
    // constants — the same three lines for every job card in the database.
    expect(screen.queryByText('Yousef Al-Otaibi')).toBeNull()
    expect(screen.getByText('No billed work yet')).toBeInTheDocument()
  })
})
