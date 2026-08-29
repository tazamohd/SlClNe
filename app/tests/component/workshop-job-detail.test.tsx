import { describe, expect, it, vi } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobDetail } from '@/screens/workshop/JobDetail'
import { JOBS } from '@/data/generated/tables'
import { renderWithProviders } from '../helpers/render'

const FIRST = JOBS[0]

/** JobDetail inherited a screen whose technician, parts and totals were module
 *  constants — the same "Yousef Al-Otaibi · SAR 840" for every record in the
 *  database. These pin that they are gone and that the header controls do
 *  something. */
describe('JobDetail', () => {
  it('never invents a technician, a part or a total the record does not have', async () => {
    renderWithProviders(<JobDetail />, { route: '/job-detail' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })

    expect(screen.getByText('No technician assigned yet')).toBeInTheDocument()
    expect(screen.getByText('Not invoiced yet')).toBeInTheDocument()
    expect(screen.queryByText('Yousef Al-Otaibi')).toBeNull()
    expect(screen.queryByText(/840/)).toBeNull()
  })

  it('draws the timeline from the record’s stage rather than fixed timestamps', async () => {
    renderWithProviders(<JobDetail />, { route: '/job-detail' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })

    const timeline = screen.getByText('Timeline').closest('div') as HTMLElement
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(6)
    // The design's "Jul 18, 9:02 AM" was a constant; no endpoint exposes the
    // real transition times yet, so the rail states what it can prove.
    expect(within(timeline).queryByText(/9:02 AM/)).toBeNull()
  })

  it('prints from the print button instead of doing nothing', async () => {
    const print = vi.fn()
    vi.stubGlobal('print', print)
    const user = userEvent.setup()
    renderWithProviders(<JobDetail />, { route: '/job-detail' })

    await user.click(await screen.findByRole('button', { name: /Print Job Card/ }))
    expect(print).toHaveBeenCalledTimes(1)
  })

  it('asks before deleting, and only offers it to a role holding the grant', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobDetail />, { route: '/job-detail', role: 'owner' })

    await user.click(await screen.findByRole('button', { name: /^Delete$/ }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Delete Job Card?')).toBeInTheDocument()
    expect(within(dialog).getByText(new RegExp(FIRST.cust))).toBeInTheDocument()
  })

  it('offers each control to exactly the grant that carries it', async () => {
    // technician holds `jobcards: ve` — it edits its own work and deletes
    // nothing. parts holds `v` alone and gets neither control.
    renderWithProviders(<JobDetail />, { route: '/job-detail', role: 'technician' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    expect(screen.getByRole('button', { name: /^Edit$/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Delete$/ })).toBeNull()

    cleanup()
    renderWithProviders(<JobDetail />, { route: '/job-detail', role: 'parts' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    expect(screen.queryByRole('button', { name: /^Edit$/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Delete$/ })).toBeNull()
  })

  it('links across to the full job card', async () => {
    renderWithProviders(<JobDetail />, { route: '/job-detail' })
    const link = await screen.findByRole('link', { name: 'Job Card' })
    expect(link).toHaveAttribute('href', `/job-card-detail?id=${FIRST.id}`)
  })
})
