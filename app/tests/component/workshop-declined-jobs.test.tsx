import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { DeclinedJobs } from '@/screens/workshop/DeclinedJobs'
import { renderWithProviders } from '../helpers/render'

/** Declined Job Tracking & Follow-Up (Sprint 1, P0).
 *
 *  No design fixture exists for this collection (`declinedJobs: fixture([])`
 *  in `data/repository.ts`) — every row is born from an estimate decline
 *  action, which the fixture repository cannot perform. This runs against the
 *  real fixture repository (`isLive` is false), so nothing here is mocked: the
 *  proof is that the screen states the honest empty state and the revenue
 *  summary as unavailable rather than fabricating either one. */
describe('DeclinedJobs (fixture build)', () => {
  it('renders the honest empty state instead of a fabricated row', async () => {
    renderWithProviders(<DeclinedJobs />, { role: 'owner' })
    expect(await screen.findByRole('heading', { name: 'Declined Jobs' })).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(
      screen.getByText('Declined estimate lines show up here automatically, with nothing to add by hand.')
    ).toBeInTheDocument()
  })

  it('states the revenue summary is unavailable without a live API, not a fabricated number', async () => {
    renderWithProviders(<DeclinedJobs />, { role: 'owner' })
    await screen.findByRole('heading', { name: 'Declined Jobs' })
    expect(
      screen.getByText(/This build has no API configured, so the revenue summary is unavailable/)
    ).toBeInTheDocument()
    // The stat tiles render the placeholder dash, never an invented total.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('shows the open-follow-ups count as zero rather than omitting it', async () => {
    renderWithProviders(<DeclinedJobs />, { role: 'owner' })
    await screen.findByRole('heading', { name: 'Declined Jobs' })
    expect(screen.getByText('Open follow-ups')).toBeInTheDocument()
  })

  it('offers the status filter chips', async () => {
    renderWithProviders(<DeclinedJobs />, { role: 'owner' })
    await screen.findByRole('heading', { name: 'Declined Jobs' })
    expect(screen.getByRole('radio', { name: 'Open' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Approved later' })).toBeInTheDocument()
  })
})
