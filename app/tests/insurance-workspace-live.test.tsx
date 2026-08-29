import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'
import { setViewportWidth } from '@/test-setup'

/** The insurance workspace on a live build.
 *
 *  The accessors are mocked to return data and to observe the lifecycle calls,
 *  so the list, the claim lifecycle and its refusal mapping are all proven
 *  without a server. The fixture path — accessors null, an honest "connect the
 *  API" state and no reachable action — is its sibling file.
 */

const claimsApi = vi.hoisted(() => ({
  submit: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
  pay: vi.fn(),
}))

const rows = vi.hoisted(
  () =>
    ({
      insuranceClaims: [] as Record<string, unknown>[],
      insurancePolicies: [] as Record<string, unknown>[],
      loanContracts: [] as Record<string, unknown>[],
      loanRepayments: [] as Record<string, unknown>[],
    }) as Record<string, Record<string, unknown>[]>,
)

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true, insuranceClaimsApi: claimsApi, productReports: null }
})

vi.mock('@/data/useCollection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/useCollection')>()
  return {
    ...actual,
    useCollection: (key: string) => ({
      data: rows[key] ?? [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => undefined,
    }),
  }
})

const { RepositoryError } = await import('@/data/repository')
const { InsuranceClaims } = await import('@/screens/insurance/InsuranceClaims')

function submittedClaim(over: Record<string, unknown> = {}) {
  return {
    _id: '01CLAIM0001',
    claimNumber: 'CLM-2026-0007',
    policyId: '01POLICY',
    policyNumber: 'POL-2026-0003',
    vehicleId: '01VEH',
    vehicleLabel: 'Toyota Camry 2022 · RUH 4821',
    jobCardId: null,
    amountClaimed: 'SAR 15,000.00',
    amountClaimedHalalas: 1_500_000,
    amountApproved: null,
    amountApprovedHalalas: null,
    status: 'submitted',
    incidentDate: '2026-08-01',
    description: 'Rear bumper collision in a car park.',
    submittedBy: 'Layla Front-Desk',
    approvedBy: null,
    ...over,
  }
}

beforeEach(() => {
  rows.insuranceClaims = [submittedClaim()]
  rows.insurancePolicies = [
    {
      _id: '01POLICY',
      policyNumber: 'POL-2026-0003',
      insurer: 'Tawuniya',
      type: 'comprehensive',
      holder: 'Ahmed Al-Rashid',
      customerId: '01CUST',
      vehicleId: '01VEH',
      vehicleLabel: 'Toyota Camry 2022 · RUH 4821',
      premium: 'SAR 3,200.00',
      premiumHalalas: 320_000,
      coverage: 'SAR 90,000.00',
      coverageHalalas: 9_000_000,
      start: '2026-03-14',
      end: '2027-03-14',
      status: 'active',
    },
  ]
  claimsApi.submit.mockResolvedValue(submittedClaim())
  claimsApi.approve.mockResolvedValue(submittedClaim({ status: 'approved' }))
  claimsApi.reject.mockResolvedValue(submittedClaim({ status: 'rejected' }))
  claimsApi.pay.mockResolvedValue(submittedClaim({ status: 'paid' }))
})

afterEach(() => {
  vi.clearAllMocks()
  setViewportWidth(1280)
})

describe('the claims list', () => {
  it('lists the claim with its number, policy, vehicle and claimed amount', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    expect(screen.getByText('CLM-2026-0007')).toBeInTheDocument()
    expect(screen.getByText('POL-2026-0003')).toBeInTheDocument()
    expect(screen.getByText('Toyota Camry 2022 · RUH 4821')).toBeInTheDocument()
    expect(screen.getByText('SAR 15,000.00')).toBeInTheDocument()
  })

  it('filters the list by status', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('radio', { name: 'paid' }))
    expect(screen.queryByText('CLM-2026-0007')).not.toBeInTheDocument()
    expect(screen.getByText('No claims match this status.')).toBeInTheDocument()
  })
})

describe('the claim lifecycle', () => {
  it('approves a claim for an amount not exceeding the claimed figure', async () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    const amount = screen.getByLabelText('Approved amount (SAR)') as HTMLInputElement
    expect(amount.value).toBe('15,000.00')
    fireEvent.change(amount, { target: { value: '12,000.00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    // The wrapper posts the approved figure as the action body; the underlying
    // accessor (this mock) receives it wrapped.
    await waitFor(() =>
      expect(claimsApi.approve).toHaveBeenCalledWith('01CLAIM0001', {
        approvedAmountHalalas: 1_200_000,
      }),
    )
  })

  it('refuses an approved amount above the claim without calling the server', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.change(screen.getByLabelText('Approved amount (SAR)'), {
      target: { value: '20,000.00' },
    })
    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled()
    expect(screen.getByText('Enter an amount between 0 and the claimed figure.')).toBeInTheDocument()
    expect(claimsApi.approve).not.toHaveBeenCalled()
  })

  it('requires a reason to reject, then posts it', async () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Rejection reason'), {
      target: { value: 'Damage predates the policy.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))

    await waitFor(() =>
      expect(claimsApi.reject).toHaveBeenCalledWith('01CLAIM0001', 'Damage predates the policy.'),
    )
  })

  it('pays an approved claim', async () => {
    rows.insuranceClaims = [
      submittedClaim({ status: 'approved', amountApprovedHalalas: 1_400_000, approvedBy: 'Omar Manager' }),
    ]
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pay claim' }))
    await waitFor(() => expect(claimsApi.pay).toHaveBeenCalledWith('01CLAIM0001'))
  })

  it('maps a segregation-of-duties refusal to the server’s own words', async () => {
    claimsApi.approve.mockRejectedValue(
      new RepositoryError(
        'rule_violated',
        'A claim you submitted must be approved by a different approver.',
      ),
    )
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    expect(
      await screen.findByText('A claim you submitted must be approved by a different approver.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Segregation of duties')).toBeInTheDocument()
  })
})

describe('filing a claim', () => {
  it('submits against a chosen policy with the claimed amount in halalas', async () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('button', { name: 'New claim' }))

    fireEvent.change(screen.getByLabelText('Policy'), { target: { value: '01POLICY' } })
    fireEvent.change(screen.getByLabelText('Amount claimed (SAR)'), { target: { value: '8,500' } })
    fireEvent.change(screen.getByLabelText('Incident date'), { target: { value: '2026-08-10' } })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Windscreen crack' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'File claim' }))

    await waitFor(() =>
      expect(claimsApi.submit).toHaveBeenCalledWith(
        expect.objectContaining({
          policyId: '01POLICY',
          amountClaimedHalalas: 850_000,
          incidentDate: '2026-08-10',
          description: 'Windscreen crack',
        }),
        undefined,
      ),
    )
  })
})

describe('the role gate is UX, honestly surfaced', () => {
  it('disables filing for a role without the accounting create grant', () => {
    // `advisor` holds no accounting grant, so the create button is off and says why.
    renderScreen(InsuranceClaims, { role: 'advisor' })
    const fileButton = screen.getByRole('button', { name: 'New claim' })
    expect(fileButton).toBeDisabled()
    expect(fileButton).toHaveAttribute('title', 'Your role cannot file claims')
  })

  it('shows policies as read-only context in the Policies tab', () => {
    renderScreen(InsuranceClaims, { role: 'accountant' })
    fireEvent.click(screen.getByRole('radio', { name: 'Policies' }))
    const table = screen.getByRole('table')
    expect(within(table).getByText('POL-2026-0003')).toBeInTheDocument()
    expect(within(table).getByText('Comprehensive')).toBeInTheDocument()
  })
})
