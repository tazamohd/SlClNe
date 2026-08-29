import { describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { TechnicianPortal } from '@/screens/portals/TechnicianPortal'
import { TechnicianPortalJobDetail } from '@/screens/portals/TechnicianPortalJobDetail'
import { JOBS, APPOINTMENTS } from '@/data/generated/tables'
import { renderWithProviders } from './helpers/render'

/** The technician's two screens, against the fixture repository — the build
 *  every `npm run build` produces. The live own-scope behaviour (a technician
 *  sees only their assigned jobs) is the server's RLS and is exercised there;
 *  these pin that the screens draw whatever list the API answers with and
 *  invent nothing beside it. */

const CURRENT = JOBS.find((job) => job.st === 'in_progress')!
const DONE = JOBS.filter((job) => job.st === 'completed' || job.st === 'delivered')

describe('TechnicianPortal', () => {
  it('computes the header stats from the records, not constants', async () => {
    renderWithProviders(<TechnicianPortal />, { route: '/technician-portal', role: 'technician' })
    await screen.findByText(CURRENT.cust)

    const stats = screen.getAllByRole('definition')
    // Assigned = jobs not yet done; Completed = the done ones; Today = the
    // whole fixture board, which carries no dates and reads as today's.
    const values = stats.map((node) => node.textContent)
    expect(values).toContain(String(JOBS.length - DONE.length))
    expect(values).toContain(String(DONE.length))
    expect(values).toContain(String(APPOINTMENTS.length))
    // The design's invented "6.5h logged" tile is gone.
    expect(screen.queryByText(/6\.5h/)).toBeNull()
  })

  it('links the current job through to the portal job detail', async () => {
    renderWithProviders(<TechnicianPortal />, { route: '/technician-portal', role: 'technician' })
    const open = await screen.findByRole('link', { name: /Open Job/ })
    expect(open).toHaveAttribute(
      'href',
      `/technician-portal/job-detail?id=${encodeURIComponent(CURRENT.id)}`
    )
  })

  it("shows today's schedule from the appointments collection", async () => {
    renderWithProviders(<TechnicianPortal />, { route: '/technician-portal', role: 'technician' })
    expect((await screen.findAllByText(APPOINTMENTS[0].svc)).length).toBeGreaterThan(0)
    expect(screen.getByText(APPOINTMENTS[0].time)).toBeInTheDocument()
  })
})

describe('TechnicianPortalJobDetail', () => {
  it('reads the job from the query string', async () => {
    const second = JOBS[1]
    renderWithProviders(<TechnicianPortalJobDetail />, {
      route: `/technician-portal/job-detail?id=${second.id}`,
      role: 'technician',
    })
    expect(await screen.findByText(second.id)).toBeInTheDocument()
    expect(screen.getByText(second.cust)).toBeInTheDocument()
    expect(screen.queryByText(CURRENT.id)).toBeNull()
  })

  it('says so when the link points at a job that does not exist', async () => {
    renderWithProviders(<TechnicianPortalJobDetail />, {
      route: '/technician-portal/job-detail?id=NOPE',
      role: 'technician',
    })
    expect(await screen.findByText('Job card not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute(
      'href',
      '/technician-portal'
    )
  })

  it('draws the task list from the record’s stage, not component state', async () => {
    renderWithProviders(<TechnicianPortalJobDetail />, {
      route: `/technician-portal/job-detail?id=${CURRENT.id}`,
      role: 'technician',
    })
    await screen.findByText(CURRENT.id)
    // Fixture rows carry no stage: the card is honestly at Check-In, 1/6.
    expect(screen.getByText('Check-In')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('1/6')).toBeInTheDocument()
    // No invented elapsed-time counter from the design mock-up.
    expect(screen.queryByText(/Elapsed/)).toBeNull()
  })

  it('is honest with a technician about billing they cannot read', async () => {
    renderWithProviders(<TechnicianPortalJobDetail />, {
      route: `/technician-portal/job-detail?id=${CURRENT.id}`,
      role: 'technician',
    })
    await screen.findByText(CURRENT.id)
    expect(
      screen.getByText(/your role cannot read invoices/)
    ).toBeInTheDocument()

    cleanup()
    // A manager viewing the same portal screen may read billing, and gets the
    // real empty state instead of the refusal.
    renderWithProviders(<TechnicianPortalJobDetail />, {
      route: `/technician-portal/job-detail?id=${CURRENT.id}`,
      role: 'manager',
    })
    await screen.findByText(CURRENT.id)
    expect(
      await screen.findByText(/Parts appear here once they are billed/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/your role cannot read invoices/)).toBeNull()
  })

  it('offers no stage move on a job that has not reached the repair bay', async () => {
    renderWithProviders(<TechnicianPortalJobDetail />, {
      route: `/technician-portal/job-detail?id=${CURRENT.id}`,
      role: 'technician',
    })
    await screen.findByText(CURRENT.id)
    // Fixture stage is check-in: the move belongs to the service desk, and the
    // screen says which desk rather than showing a button that would 422.
    expect(screen.getByText(/not reached the repair bay yet/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Mark Repair Complete/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Pass Quality Check/ })).toBeNull()
  })
})
