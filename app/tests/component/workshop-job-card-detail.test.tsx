import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { JobCardDetail } from '@/screens/workshop/JobCardDetail'
import { JOBS } from '@/data/generated/tables'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

const FIRST = JOBS[0]

/** `JobCardDetail.dc.html` + `JobCardDetail.Mobile.dc.html`.
 *
 *  These assert the two things a designed detail screen can get wrong and still
 *  look finished: that it renders the record it was asked for rather than the
 *  design's demo row, and that the phone gets the mobile composition rather
 *  than the desktop one at a narrower width. */
describe('JobCardDetail — desktop', () => {
  it('renders the job card named in the query string, not the first row', async () => {
    const second = JOBS[1]
    renderWithProviders(<JobCardDetail />, { route: `/job-card-detail?id=${second.id}` })

    expect(await screen.findByRole('heading', { level: 1, name: second.id })).toBeInTheDocument()
    expect(screen.getByText(second.cust)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: FIRST.id })).not.toBeInTheDocument()
  })

  it('shows the six-stage rail with the record’s own stage marked', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })

    const steps = screen.getAllByRole('listitem')
    expect(steps.length).toBeGreaterThanOrEqual(6)
    // Fixture rows carry no stage, so the rail sits at Check-In — the honest
    // reading, and the one the API will overwrite the moment it serves a row.
    const current = document.querySelector('[aria-current="step"]')
    expect(current).toHaveTextContent('Check-In')
  })

  it('says the job card is not invoiced instead of showing a total it never got', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail' })
    expect(await screen.findByText('Not invoiced yet')).toBeInTheDocument()
    // The design's SAR 1,546.75 was a constant. Nothing may render it from air.
    expect(screen.queryByText(/1,546\.75/)).not.toBeInTheDocument()
  })

  it('offers a route back when the id matches no record', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail?id=NOPE-0000' })
    expect(await screen.findByText('Job card not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Job Cards' })).toHaveAttribute(
      'href',
      '/job-cards'
    )
  })

  it('redacts the customer’s contact line for a role that may not see it', async () => {
    // FIELD_RULES hides "Customer contact details" from technicians.
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', role: 'technician' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })
    expect(screen.getByTitle('Hidden for your role')).toBeInTheDocument()
  })
})

describe('JobCardDetail — Arabic', () => {
  it('keeps the job code and the plate pinned LTR under an RTL page', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', language: 'ar' })
    const heading = await screen.findByRole('heading', { level: 1, name: FIRST.id })
    expect(heading).toHaveAttribute('dir', 'ltr')
  })

  it('titles the panels in Arabic, from the design’s own wording', async () => {
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail', language: 'ar' })
    expect(await screen.findByText('العميل والمركبة')).toBeInTheDocument()
    expect(screen.getByText('التعيين والجدول')).toBeInTheDocument()
  })
})

describe('JobCardDetail — mobile at 390', () => {
  it('replaces the desktop rail with the scrolling stage strip', async () => {
    setViewportWidth(390)
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail' })
    await screen.findByRole('heading', { level: 1, name: FIRST.id })

    // The mobile composition drops the desktop's Print control and the
    // 26px header for a 17px bar — it is a different layout, not a narrower one.
    await waitFor(() => expect(screen.queryByRole('button', { name: /Print/ })).toBeNull())
    const strip = document.querySelector('ol.overflow-x-auto')
    expect(strip).not.toBeNull()
    expect(strip?.querySelectorAll('li')).toHaveLength(6)
  })

  it('gives the customer’s phone a tel: link a thumb can use', async () => {
    setViewportWidth(390)
    renderWithProviders(<JobCardDetail />, { route: '/job-card-detail' })
    const link = await screen.findByRole('link', { name: /\+966/ })
    expect(link.getAttribute('href')).toMatch(/^tel:\+966/)
  })
})
