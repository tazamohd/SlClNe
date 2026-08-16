import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** Payroll Management (`Payroll-Management`) on a live build.
 *
 *  The list, the per-employee lines, the post action and — the point of this
 *  file — the §5b invariant "a posted payroll run cannot be reopened after
 *  posting" as reflected in the UI: once a run is posted, the add-line and post
 *  affordances are gone and a read-only notice takes their place. The server is
 *  the boundary; the invariant's 409 is mapped and surfaced by `hr-api.test.ts`.
 */

const post = vi.hoisted(() => vi.fn())

const rows = vi.hoisted(
  () => ({ payrollRuns: [], payrollLines: [], employees: [] }) as Record<string, Record<string, unknown>[]>,
)

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true }
})

vi.mock('@/screens/hr/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/screens/hr/api')>()
  return { ...actual, postPayrollRun: post }
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
    useCreate: () => ({ mutateAsync: vi.fn() }),
  }
})

const { PayrollManagement } = await import('@/screens/hr/PayrollManagement')

function draftRun(over: Record<string, unknown> = {}) {
  return {
    _id: '01RUN0001',
    period: '2026-07',
    status: 'draft',
    grossPay: null,
    grossPayHalalas: null,
    allowances: null,
    allowancesHalalas: null,
    deductions: null,
    deductionsHalalas: null,
    netPay: null,
    netPayHalalas: null,
    postedAt: null,
    ...over,
  }
}

function postedRun(over: Record<string, unknown> = {}) {
  return draftRun({
    status: 'posted',
    grossPay: 'SAR 40,000.00',
    grossPayHalalas: 4_000_000,
    netPay: 'SAR 38,750.00',
    netPayHalalas: 3_875_000,
    postedAt: '2026-07-31T12:00:00.000Z',
    ...over,
  })
}

function line(over: Record<string, unknown> = {}) {
  return {
    _id: '01LINE0001',
    payrollRunId: '01RUN0001',
    employeeId: '01EMP0001',
    employeeName: 'Yousef Al-Otaibi',
    grossPay: 'SAR 6,500.00',
    grossPayHalalas: 650_000,
    allowances: 'SAR 975.00',
    allowancesHalalas: 97_500,
    deductions: 'SAR 585.00',
    deductionsHalalas: 58_500,
    netPay: 'SAR 6,890.00',
    netPayHalalas: 689_000,
    ...over,
  }
}

beforeEach(() => {
  rows.payrollRuns = [draftRun()]
  rows.payrollLines = [line()]
  rows.employees = [{ _id: '01EMP0001', employeeNumber: 'EMP-0001', name: 'Yousef Al-Otaibi' }]
  post.mockResolvedValue(postedRun())
})

afterEach(() => vi.clearAllMocks())

describe('the runs list and lines', () => {
  it('lists a run with its period, status and net pay', () => {
    renderScreen(PayrollManagement, { role: 'hr' })
    expect(screen.getByText('2026-07')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('opens a run and shows its per-employee lines with server figures', () => {
    renderScreen(PayrollManagement, { role: 'hr' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Yousef Al-Otaibi')).toBeInTheDocument()
    // Net is a server figure the row carries — displayed, not computed here.
    expect(within(dialog).getByText('6,890.00')).toBeInTheDocument()
  })
})

describe('posting a draft run', () => {
  it('posts through the action endpoint', async () => {
    renderScreen(PayrollManagement, { role: 'hr' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.click(screen.getByRole('button', { name: 'Post run' }))
    await waitFor(() => expect(post).toHaveBeenCalledWith('01RUN0001'))
  })

  it('cannot post a run with no lines', () => {
    rows.payrollLines = []
    renderScreen(PayrollManagement, { role: 'hr' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('button', { name: 'Post run' })).toBeDisabled()
  })
})

describe('the posting invariant is reflected in the UI', () => {
  it('offers no edit or post affordance once a run is posted, only a read-only notice', () => {
    rows.payrollRuns = [postedRun()]
    renderScreen(PayrollManagement, { role: 'hr' })
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText(
        'This run is posted. Its totals are frozen and it cannot be reopened or edited.',
      ),
    ).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Post run' })).not.toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Add line' })).not.toBeInTheDocument()
    // The frozen server total is shown, not a client sum.
    expect(within(dialog).getByText('SAR 38,750.00')).toBeInTheDocument()
  })
})

describe('the role gate is UX, honestly surfaced', () => {
  it('disables creating and posting for a view-only role', () => {
    // `manager` holds `hr:vx` — no create, no edit (posting is an edit).
    rows.payrollRuns = [draftRun()]
    renderScreen(PayrollManagement, { role: 'manager' })
    expect(screen.getByRole('button', { name: 'New draft run' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('button', { name: 'Post run' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add line' })).toBeDisabled()
  })
})
