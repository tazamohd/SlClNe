/** The test ids the e2e suite steers by, pinned on the primitives.
 *
 *  The smoke runner asserts copy; the Playwright specs added by the UX pass
 *  assert structure through these ids so that copy can change without
 *  breaking them. A refactor that drops one silently breaks a spec that only
 *  runs in CI — this keeps the failure local and fast. */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, Loading } from '@/components/ui/States'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { renderWithProviders } from '../helpers/render'

const COLUMNS: Column<{ id: string; name: string }>[] = [
  { header: 'Id', cell: (r) => r.id, code: true, key: 'id', sortValue: (r) => r.id },
  { header: 'Name', cell: (r) => r.name },
]

describe('test ids', () => {
  it('page header exposes root, title and actions', () => {
    renderWithProviders(<PageHeader title="Customers" icon="Users" actions={<Button>Add</Button>} />)
    expect(screen.getByTestId('page-header')).toBeInTheDocument()
    expect(screen.getByTestId('page-header-title')).toHaveTextContent('Customers')
    expect(screen.getByTestId('page-header-actions')).toBeInTheDocument()
  })

  it('data table exposes root, rows, sort buttons and the pagination summary', () => {
    const rows = Array.from({ length: 30 }, (_, i) => ({ id: `R-${i}`, name: `Row ${i}` }))
    renderWithProviders(<DataTable columns={COLUMNS} rows={rows} rowKey={(r) => r.id} />)
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getAllByTestId('data-table-row')).toHaveLength(25)
    expect(screen.getByTestId('data-table-sort-id')).toBeInTheDocument()
    expect(screen.getByTestId('data-table-pagination')).toBeInTheDocument()
    expect(screen.getByTestId('data-table-summary')).toHaveTextContent('1–25')
  })

  it('states expose loading, empty and error with its retry', () => {
    const retry = vi.fn()
    renderWithProviders(
      <>
        <Loading />
        <EmptyState />
        <ErrorState onRetry={retry} />
      </>
    )
    expect(screen.getByTestId('state-loading')).toBeInTheDocument()
    expect(screen.getByTestId('state-empty')).toBeInTheDocument()
    expect(screen.getByTestId('state-error')).toBeInTheDocument()
    expect(screen.getByTestId('state-error-retry')).toBeInTheDocument()
  })

  it('modal exposes its dialog', () => {
    renderWithProviders(
      <Modal open onClose={() => {}} title="Confirm">
        body
      </Modal>
    )
    expect(screen.getByTestId('modal')).toHaveAttribute('role', 'dialog')
  })
})
