import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** The insurance workspace on the fixture build.
 *
 *  Every financial-product accessor is null or empty here — a claim total or a
 *  loan-outstanding figure is a server computation, and the lifecycle is a
 *  server transition. So each surface names the collection the API must serve
 *  and stops. The proof this file carries: no fabricated claim, policy or
 *  contract row, and no reachable action that could report a fake success. This
 *  runs against the real fixture repository (`isLive` is false), so nothing is
 *  mocked.
 */

const { InsuranceClaims } = await import('@/screens/insurance/InsuranceClaims')

describe('the fixture build is honest about the missing API', () => {
  it('names the claims collection instead of inventing a claim', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    expect(screen.getByText('No claims to show')).toBeInTheDocument()
    expect(screen.getByText('insuranceClaims')).toBeInTheDocument()
    // No fake claim number, and no way to file one against nothing.
    expect(screen.queryByText(/CLM-/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New claim' })).not.toBeInTheDocument()
  })

  it('names the policies collection on the Policies tab', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('tab', { name: 'Policies' }))
    expect(screen.getByText('No policies to show')).toBeInTheDocument()
    expect(screen.getByText('insurancePolicies')).toBeInTheDocument()
  })

  it('names the loan-contracts collection on the Loans tab', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('tab', { name: 'Loans' }))
    expect(screen.getByText('No finance to show')).toBeInTheDocument()
    expect(screen.getByText('loanContracts')).toBeInTheDocument()
  })

  it('states its provenance — a feature-map spec without a pixel design', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    expect(
      screen.getByText(
        'This screen has a feature-map spec but no pixel design, so its layout follows the design system rather than a prototype.',
      ),
    ).toBeInTheDocument()
  })
})
