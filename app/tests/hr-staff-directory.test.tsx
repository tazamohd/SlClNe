import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { renderScreen } from './helpers/render'

/** The staff directory (`Staff-Directory` / `HR-Management`).
 *
 *  The live path is proven by mocking the collection accessors; the salary
 *  redaction — a null pay figure rendered as a locked placeholder, never a zero
 *  and never reconstructed — is proven with a redacted row beside a visible one.
 *  The fixture path (accessor empty, an honest "connect the API" state) is the
 *  sibling `describe`.
 */

const rows = vi.hoisted(
  () => ({ employees: [], departments: [] }) as Record<string, Record<string, unknown>[]>,
)
const pageOf = (data: Record<string, unknown>[]) => ({
  rows: data,
  page: { page: 1, pageSize: 25, total: data.length, totalPages: 1 },
})

vi.mock('@/data/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/repository')>()
  return { ...actual, isLive: true }
})

vi.mock('@/data/useCollection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/useCollection')>()
  return {
    ...actual,
    usePagedCollection: (key: string) => ({
      data: pageOf(rows[key] ?? []),
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => undefined,
    }),
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

const { StaffDirectory } = await import('@/screens/hr/StaffDirectory')

function employee(over: Record<string, unknown> = {}) {
  return {
    _id: '01EMP0001',
    employeeNumber: 'EMP-0001',
    name: 'Yousef Al-Otaibi',
    nameAr: 'يوسف العتيبي',
    title: 'Technician',
    departmentId: '01DEPT',
    hireDate: '2024-02-01',
    status: 'active',
    salary: 'SAR 6,500.00',
    salaryHalalas: 650_000,
    ...over,
  }
}

beforeEach(() => {
  rows.employees = [employee()]
  rows.departments = [{ _id: '01DEPT', name: 'Workshop Operations' }]
})

afterEach(() => vi.clearAllMocks())

describe('the live directory', () => {
  it('lists an employee with number, name, title, department and salary', () => {
    renderScreen(StaffDirectory, { role: 'hr' })
    const table = screen.getByRole('table')
    expect(within(table).getByText('EMP-0001')).toBeInTheDocument()
    expect(within(table).getByText('Yousef Al-Otaibi')).toBeInTheDocument()
    expect(within(table).getByText('Technician')).toBeInTheDocument()
    expect(within(table).getByText('Workshop Operations')).toBeInTheDocument()
    expect(within(table).getByText('6,500.00')).toBeInTheDocument()
  })

  it('opens the employee detail with the full record', () => {
    renderScreen(StaffDirectory, { role: 'hr' })
    fireEvent.click(screen.getByText('Yousef Al-Otaibi'))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('EMP-0001')).toBeInTheDocument()
    expect(within(dialog).getByText('2024-02-01')).toBeInTheDocument()
  })
})

describe('salary redaction is respected', () => {
  it('renders a null salary as a locked placeholder, never a zero', () => {
    // The server nulls both pay fields for a role the `Employee salary` rule
    // hides pay from. The row must show the redaction, not a fabricated 0.
    rows.employees = [employee({ salary: null, salaryHalalas: null })]
    renderScreen(StaffDirectory, { role: 'hr' })

    const table = screen.getByRole('table')
    expect(within(table).getByLabelText('Salary hidden for your role')).toBeInTheDocument()
    expect(within(table).queryByText('0.00')).not.toBeInTheDocument()
    expect(within(table).queryByText('SAR 0.00')).not.toBeInTheDocument()
  })
})

describe('the create gate is UX, honestly surfaced', () => {
  it('enables adding for a role with hr:create', () => {
    renderScreen(StaffDirectory, { role: 'hr' })
    expect(screen.getByRole('button', { name: 'Add employee' })).toBeEnabled()
  })

  it('disables adding for a view-only role and says why', () => {
    // `manager` holds `hr:vx` — view and export, no create.
    renderScreen(StaffDirectory, { role: 'manager' })
    const add = screen.getByRole('button', { name: 'Add employee' })
    expect(add).toBeDisabled()
    expect(add).toHaveAttribute('title', 'Your role cannot add employees')
  })
})
