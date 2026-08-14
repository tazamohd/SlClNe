import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** Insurance and loan reports have no server data source. These pin that the
 *  screens say so and name the collection that is missing, rather than rendering
 *  a fabricated claim or a made-up loan. When the collection lands, the GAP:
 *  test fails and forces the placeholder to be replaced with the real report. */

describe('insurance reports', () => {
  it('GAP: names the missing insuranceClaims collection and invents no rows', async () => {
    const { InsuranceReports } = await import('@/screens/accounting/GapReports')
    renderScreen(InsuranceReports, { role: 'accountant' })
    expect(screen.getByText('No data source yet')).toBeInTheDocument()
    expect(screen.getByText(/insuranceClaims/)).toBeInTheDocument()
  })
})

describe('loan reports', () => {
  it('GAP: names the missing loanContracts collection and invents no rows', async () => {
    const { LoanReports } = await import('@/screens/accounting/GapReports')
    renderScreen(LoanReports, { role: 'accountant' })
    expect(screen.getByText('No data source yet')).toBeInTheDocument()
    expect(screen.getByText(/loanContracts/)).toBeInTheDocument()
  })
})
