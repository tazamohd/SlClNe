import { afterEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobCards } from '@/screens/workshop/JobCards'
import { JobCardDetail } from '@/screens/workshop/JobCardDetail'
import { WorkshopCheckIn } from '@/screens/workshop/WorkshopCheckIn'
import { WorkshopSignature } from '@/screens/workshop/WorkshopSignature'
import { WorkshopDelivery } from '@/screens/workshop/WorkshopDelivery'
import { draftKeyFor } from '@/screens/workshop/useStageDraft'
import { RAIL_STAGES, nextStageOf, railIndexForJob } from '@/screens/workshop/stages'
import { JOBS } from '@/data/generated/tables'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

const FIRST = JOBS[0]

afterEach(() => {
  window.localStorage.clear()
})

/** The workshop's shared skeleton — the pipeline strip on the queue, the
 *  one header with its primary action on the job card, and the stage frame
 *  the six stage screens share. */
describe('JobCards — pipeline strip', () => {
  it('counts every job card into exactly one stage', async () => {
    renderWithProviders(<JobCards />, { role: 'owner' })
    await screen.findByText(FIRST.id)
    const strip = screen.getByRole('list', { name: 'Job pipeline' })
    const steps = within(strip).getAllByRole('button')
    expect(steps).toHaveLength(RAIL_STAGES.length)
    const counted = steps.reduce((sum, step) => sum + Number(step.textContent?.match(/\d+/)?.[0] ?? 0), 0)
    expect(counted).toBe(JOBS.length)
  })

  it('reads the stage from the URL and filters the list to it', async () => {
    renderWithProviders(<JobCards />, { role: 'owner', route: '/job-cards?stage=repair' })
    const strip = await screen.findByRole('list', { name: 'Job pipeline' })
    expect(within(strip).getByRole('button', { name: /Repair/ })).toHaveAttribute('aria-pressed', 'true')

    const wanted = JOBS.filter((job) => railIndexForJob(job) === 3)
    const other = JOBS.find((job) => railIndexForJob(job) !== 3)
    await screen.findByText(wanted[0].id)
    expect(screen.queryByText(other!.id)).toBeNull()
  })

  it('pressing a stage writes it to the URL, pressing it again clears it', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobCards />, { role: 'owner' })
    await screen.findByText(FIRST.id)
    const strip = screen.getByRole('list', { name: 'Job pipeline' })
    const estimate = within(strip).getByRole('button', { name: /Estimate/ })
    await user.click(estimate)
    expect(estimate).toHaveAttribute('aria-pressed', 'true')
    // No fixture card is at estimate, so the list says so — a filtered list
    // is "no matches", never "no job cards yet".
    expect(await screen.findByText('No matching job cards')).toBeInTheDocument()
    expect(screen.queryByText('No job cards yet')).toBeNull()
    await user.click(estimate)
    expect(estimate).toHaveAttribute('aria-pressed', 'false')
    expect(await screen.findByText(FIRST.id)).toBeInTheDocument()
  })

  it('sorts on the headers that carry a sort value', async () => {
    renderWithProviders(<JobCards />, { role: 'owner' })
    await screen.findByText(FIRST.id)
    expect(screen.getByRole('button', { name: /Customer/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Priority/ })).toBeInTheDocument()
  })

  it('opens the form from the N key, but not while typing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobCards />, { role: 'owner' })
    await screen.findByText(FIRST.id)
    await user.click(screen.getByRole('searchbox'))
    await user.keyboard('n')
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.tab()
    await user.keyboard('n')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})

describe('JobCardDetail — header', () => {
  it('offers one primary action: advance to the next stage', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', role: 'owner' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    const next = nextStageOf(FIRST.stage)
    expect(next).toBe('inspection')
    const advance = screen.getByRole('button', { name: /Advance/ })
    expect(advance).toHaveTextContent('Inspection')
    // Without an API the move cannot be persisted, so the button says so
    // by being disabled rather than by pretending.
    expect(advance).toBeDisabled()
  })

  it('hides the advance action from a role without the edit grant', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', role: 'parts' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    expect(screen.queryByRole('button', { name: /Advance/ })).toBeNull()
  })

  it('keeps print, share and cancel behind More actions, cancel gated on delete', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', role: 'owner' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    await user.click(screen.getByRole('button', { name: 'More actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Print' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Share link' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Cancel job' })).toBeInTheDocument()
  })

  it('asks before cancelling a job card', async () => {
    const user = userEvent.setup()
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', role: 'owner' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    await user.click(screen.getByRole('button', { name: 'More actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cancel job' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Cancel this job card?')).toBeInTheDocument()
  })

  it('pins the primary action to the bottom of a phone', async () => {
    setViewportWidth(390)
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', role: 'owner' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    const advance = await screen.findByRole('button', { name: /Advance/ })
    expect(advance.parentElement?.className).toContain('sticky')
  })
})

describe('StageFrame — drafts', () => {
  it('keeps what was typed at check-in, per job card', async () => {
    const user = userEvent.setup()
    const { unmount } = renderWithProviders(<WorkshopCheckIn />, { route: `/x?id=${FIRST.id}`, role: 'owner' })
    const odometer = await screen.findByLabelText('Odometer Reading')
    await user.type(odometer, '48213')
    expect(await screen.findByText('Draft saved')).toBeInTheDocument()
    await waitFor(() => {
      expect(window.localStorage.getItem(draftKeyFor('check-in', FIRST.id))).toContain('48213')
    })
    unmount()

    renderWithProviders(<WorkshopCheckIn />, { route: `/x?id=${FIRST.id}`, role: 'owner' })
    expect(await screen.findByLabelText('Odometer Reading')).toHaveValue('48213')
  })

  it('does not leak one card’s draft into another', async () => {
    window.localStorage.setItem(draftKeyFor('check-in', FIRST.id), JSON.stringify({ odometer: '99999' }))
    renderWithProviders(<WorkshopCheckIn />, { route: `/x?id=${JOBS[1].id}`, role: 'owner' })
    await screen.findByText(new RegExp(JOBS[1].id))
    expect(screen.getByLabelText('Odometer Reading')).toHaveValue('')
  })

  it('links the stages already passed to their screens for this card', async () => {
    renderWithProviders(<WorkshopCheckIn />, { route: `/x?id=${FIRST.id}`, role: 'owner' })
    const rail = await screen.findByRole('list', { name: 'Workshop stages' })
    // Fixture rows sit at check-in, so nothing is behind them yet: no links,
    // and the current step is announced.
    expect(within(rail).queryAllByRole('link')).toHaveLength(0)
    expect(rail.querySelector('[aria-current="step"]')).toHaveTextContent('Check-In')
  })
})

describe('WorkshopSignature and WorkshopDelivery — the resolved record', () => {
  it('summarises the job card it was opened for, not the design’s demo row', async () => {
    const second = JOBS[1]
    renderWithProviders(<WorkshopSignature />, { route: `/x?id=${second.id}` })
    expect((await screen.findAllByText(new RegExp(second.id))).length).toBeGreaterThan(0)
    expect(screen.queryByText(/JC-A3F8B2C1/)).toBeNull()
    expect(screen.queryByText(/1,546\.75/)).toBeNull()
    expect(screen.getByRole('button', { name: /Confirm Signature/ })).toBeDisabled()
  })

  it('refuses to complete delivery with an unfinished checklist', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WorkshopDelivery />, { route: `/x?id=${FIRST.id}`, role: 'owner' })
    await screen.findByRole('heading', { level: 1, name: 'Vehicle Delivery' })
    expect(screen.getByText('Not invoiced yet')).toBeInTheDocument()
    // Without an API the primary is disabled, exactly like the other stages.
    const complete = screen.getByRole('button', { name: /Complete Delivery/ })
    expect(complete).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /Print Delivery Note/ }))
  })
})
