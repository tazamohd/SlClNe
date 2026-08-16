import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** The insurance and loan reports graduated (F-035): their data now exists as a
 *  server-computed aggregate. On a build with no API (`productReports` is null)
 *  they keep the honest gap — they name the server aggregate and show no figure,
 *  never a fabricated claim or loan. The live path (real figures from the
 *  summary endpoints) is a server computation with no fixture, exercised by the
 *  server suite; here we pin the fixture-gap behaviour, which is what this build
 *  renders. */

describe('insurance report — fixture gap', () => {
  it('keeps the honest gap and names the server aggregate, inventing no rows', async () => {
    const { InsuranceReports } = await import('@/screens/accounting/GapReports')
    renderScreen(InsuranceReports, { role: 'accountant' })
    expect(screen.getByText('Connect the API')).toBeInTheDocument()
    expect(screen.getByText(/insurance\/claims\/summary/)).toBeInTheDocument()
    // No fabricated money figure.
    expect(screen.queryByText(/SAR/)).not.toBeInTheDocument()
  })
})

describe('loan report — fixture gap', () => {
  it('keeps the honest gap and names the server aggregate, inventing no rows', async () => {
    const { LoanReports } = await import('@/screens/accounting/GapReports')
    renderScreen(LoanReports, { role: 'accountant' })
    expect(screen.getByText('Connect the API')).toBeInTheDocument()
    expect(screen.getByText(/loans\/summary/)).toBeInTheDocument()
    expect(screen.queryByText(/SAR/)).not.toBeInTheDocument()
  })
})
