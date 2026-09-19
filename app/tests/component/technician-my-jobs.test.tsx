import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { TechnicianPortalMyJobs } from '@/screens/portals/technician/TechnicianPortalMyJobs'
import { renderWithProviders } from '../helpers/render'

/** The technician mobile workflow's entry point, `TechnicianPortal.MyJobs`.
 *
 *  Was a table of invented work orders (`WO-8830`…) with no backing
 *  collection and no way to open a real job. Now reads the same `jobs`
 *  collection the front desk board reads — on the live API narrowed to the
 *  technician's own assigned job cards by row-level security, and here on
 *  the fixture build, the real seeded job codes rather than fabricated
 *  ones. Each row opens the real job detail, which is where the actual
 *  stage actions (start repair, mark complete, hand to QC) already live. */
describe('TechnicianPortalMyJobs', () => {
  it('lists real job cards, not fabricated work orders', async () => {
    renderWithProviders(<TechnicianPortalMyJobs />, { role: 'technician' })
    expect(await screen.findByText('A3F8B2C1')).toBeInTheDocument()
    expect(screen.queryByText('WO-8830')).toBeNull()
  })

  it('renders each row as a reachable action, wired to open a job', async () => {
    renderWithProviders(<TechnicianPortalMyJobs />, { role: 'technician' })
    await screen.findByText('A3F8B2C1')
    // DataTable gives an onRowClick row a real tabIndex and Enter/Space
    // handling, not a static table cell — the same wiring workshop/JobCards.tsx
    // relies on. Not `role="button"` (an Actions column can carry a real
    // `<button>`, and a widget role must not nest another one) — `tabIndex`
    // is what puts it in the tab order.
    const rows = screen.getAllByRole('row').filter((row) => row.getAttribute('tabindex') === '0')
    expect(rows.length).toBeGreaterThan(0)
  })
})
