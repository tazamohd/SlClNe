import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { CustomerHealthCheckReport } from '@/screens/workshop/CustomerHealthCheckReport'
import { renderWithProviders } from '../helpers/render'

/** The customer-facing DVHC report (Sprint 2, P0) — `GET
 *  /jobs/:id/health-check-report`. There is no fixture backing this bespoke
 *  route (`isLive` is false in this build, same as every other DVHC screen
 *  tested against the fixture repository), so the honest behaviour is an
 *  error state naming the problem — never a fabricated finding. */
describe('CustomerHealthCheckReport (fixture build)', () => {
  it('states the report is unavailable without a live API, not a fabricated finding', async () => {
    renderWithProviders(<CustomerHealthCheckReport />, {
      role: 'customer',
      route: '/customer-portal/health-check-report?id=A3F8B2C1',
    })
    expect(await screen.findByRole('heading', { name: 'Health Check Report' })).toBeInTheDocument()
    expect(await screen.findByText('This report is not available')).toBeInTheDocument()
  })

  it('states the report is unavailable when no job id is on the link', async () => {
    renderWithProviders(<CustomerHealthCheckReport />, {
      role: 'customer',
      route: '/customer-portal/health-check-report',
    })
    expect(await screen.findByText('This report is not available')).toBeInTheDocument()
  })
})
