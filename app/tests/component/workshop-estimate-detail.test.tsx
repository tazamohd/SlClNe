import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { EstimateDetail } from '@/screens/workshop/EstimateDetail'
import { renderWithProviders } from '../helpers/render'

/** The estimate detail renders the shared `DetailPage` frame over a real
 *  estimate. It shows the server total (never a client-side sum), fetches line
 *  items from the sub-resource endpoint, and offers approve/reject only to a
 *  role the server would accept. */
describe('EstimateDetail', () => {
  it('renders the estimate header and the server total', async () => {
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-0231' })
    expect(await screen.findByRole('heading', { name: 'EST-0231' })).toBeInTheDocument()
    expect(screen.getByText(/Ahmed Al-Rashid/)).toBeInTheDocument()
    // The total is the server figure, formatted not computed.
    expect(screen.getAllByText(/SAR\s*1,250/).length).toBeGreaterThan(0)
  })

  it('offers approval to a role with estimates:a and the ceiling', async () => {
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-0231' })
    await screen.findByRole('heading', { name: 'EST-0231' })
    expect(screen.getByRole('button', { name: /Approve/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Decline/ })).toBeInTheDocument()
  })

  it('withholds approval from a role without estimates:a', async () => {
    // advisor has estimates:v/c/e but not `a`.
    renderWithProviders(<EstimateDetail />, { role: 'advisor', route: '/estimate-detail?id=EST-0231' })
    await screen.findByRole('heading', { name: 'EST-0231' })
    expect(screen.queryByRole('button', { name: /Approve/ })).toBeNull()
  })

  it('shows the honest line-items gap rather than fabricated lines', async () => {
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-0231' })
    await screen.findByRole('heading', { name: 'EST-0231' })
    // The fixture build cannot serve /estimates/:id/lines.
    expect(await screen.findByText(/No line items to show/)).toBeInTheDocument()
  })

  it('shows a not-found state for an unknown estimate', async () => {
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-9999' })
    expect(await screen.findByText(/Estimate not found/)).toBeInTheDocument()
  })

  it('marks an already-decided estimate read-only', async () => {
    // EST-0229 is approved in the seed.
    renderWithProviders(<EstimateDetail />, { role: 'owner', route: '/estimate-detail?id=EST-0229' })
    await screen.findByRole('heading', { name: 'EST-0229' })
    expect(screen.queryByRole('button', { name: /^Approve$/ })).toBeNull()
  })
})
