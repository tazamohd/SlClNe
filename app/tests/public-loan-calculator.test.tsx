import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesProvider } from '@/providers/PreferencesProvider'
import { PublicLoans, monthlyPayment } from '@/screens/public/Loans'

function renderLoans() {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={['/public-portal/loans']}>
        <PublicLoans />
      </MemoryRouter>
    </PreferencesProvider>
  )
}

/** The design's terms: 60 months at 3.5% APR, standard amortisation. */
function expected(principal: number): number {
  const r = 0.035 / 12
  return Math.round((principal * r) / (1 - (1 + r) ** -60))
}

describe('loan calculator math', () => {
  it('computes the amortised payment for the design defaults (150k − 30k down)', () => {
    expect(monthlyPayment(120_000)).toBe(expected(120_000))
    // Pinned value so a silent formula change is caught, not re-derived away.
    expect(monthlyPayment(120_000)).toBe(2183)
  })
})

describe('loan calculator screen', () => {
  it('shows a real computed payment for the design default inputs', () => {
    renderLoans()
    expect(screen.getByText('Estimated Monthly Payment')).toBeInTheDocument()
    expect(screen.getByText(/SAR 2,183/)).toBeInTheDocument()
    expect(screen.getByText('60 months at 3.5% APR')).toBeInTheDocument()
  })

  it('recomputes when inputs change', async () => {
    const user = userEvent.setup()
    renderLoans()
    const priceField = screen.getByLabelText(/Vehicle Price/)
    await user.clear(priceField)
    await user.type(priceField, '90,000')
    expect(screen.getByText(/SAR 1,092/)).toBeInTheDocument()
  })

  it('refuses a down payment at or above the price, replacing the result with an error', async () => {
    const user = userEvent.setup()
    renderLoans()
    const downField = screen.getByLabelText(/Down Payment/)
    await user.clear(downField)
    await user.type(downField, '150,000')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The down payment must be less than the vehicle price.'
    )
    expect(screen.queryByText('Estimated Monthly Payment')).not.toBeInTheDocument()
  })

  it('Apply Now is a real link into registration, not a dead button', () => {
    renderLoans()
    expect(screen.getByRole('link', { name: 'Apply Now' })).toHaveAttribute('href', '/register')
  })
})
