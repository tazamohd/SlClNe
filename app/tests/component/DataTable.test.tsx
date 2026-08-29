import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, TableFooter, type Column } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/States'
import { MobileCardHeader, MobileCardRow } from '@/components/shell/MobileShell'
import { setViewportWidth } from '@/test-setup'
import { renderWithProviders } from '../helpers/render'

interface Job {
  id: string
  customer: string
  status: string
}

const JOBS: Job[] = [
  { id: 'JC-A3F8B2C1', customer: 'Ahmed Al-Rashid', status: 'in_progress' },
  { id: 'JC-B7D2E9F4', customer: 'Noura Al-Qahtani', status: 'pending' },
  { id: 'JC-C1A5F8B3', customer: 'Faisal Al-Harbi', status: 'completed' },
]

const COLUMNS: Column<Job>[] = [
  { header: 'Job ID', cell: (job) => job.id, code: true },
  { header: 'Customer', cell: (job) => job.customer },
  { header: 'Status', cell: (job) => job.status },
]

function table(rows: Job[] = JOBS, props: Partial<Parameters<typeof DataTable<Job>>[0]> = {}) {
  return (
    <DataTable<Job>
      columns={COLUMNS}
      rows={rows}
      rowKey={(job) => job.id}
      mobileCard={(job) => (
        <>
          <MobileCardHeader title={job.id} code trailing={job.status} />
          <MobileCardRow label="Customer">{job.customer}</MobileCardRow>
        </>
      )}
      {...props}
    />
  )
}

describe('DataTable — desktop', () => {
  it('renders one row per record under translated headers', () => {
    renderWithProviders(table())
    expect(screen.getAllByRole('row')).toHaveLength(JOBS.length + 1)
    for (const job of JOBS) expect(screen.getByText(job.customer)).toBeInTheDocument()
    for (const column of COLUMNS) {
      expect(screen.getByRole('columnheader', { name: column.header })).toBeInTheDocument()
    }
  })

  it('pins a code column LTR and monospaced so Arabic cannot reorder an id', () => {
    renderWithProviders(table(), { language: 'ar' })
    const cell = screen.getByText('JC-A3F8B2C1').closest('td') as HTMLElement
    expect(cell).toHaveAttribute('dir', 'ltr')
    expect(cell.className).toContain('font-mono')
    // A non-code column inherits the page direction instead.
    expect(screen.getByText('Ahmed Al-Rashid').closest('td')).not.toHaveAttribute('dir')
  })

  it('shows a real empty state instead of a headed table with no body', () => {
    renderWithProviders(
      table([], { empty: <EmptyState title="No job cards yet" description="Open one to start." /> })
    )
    expect(screen.queryAllByRole('row')).toHaveLength(2) // header + the empty cell's row
    expect(screen.getByText('No job cards yet')).toBeInTheDocument()
    expect(screen.getByText('Open one to start.')).toBeInTheDocument()
  })

  it('falls back to its own empty copy when the screen supplies none', () => {
    renderWithProviders(table([]))
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('shows placeholders while loading, and no data rows', () => {
    const { container } = renderWithProviders(table(JOBS, { loading: true }))
    expect(screen.queryByText('Ahmed Al-Rashid')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    // The header stays put so the column widths do not jump when data lands.
    expect(screen.getByRole('columnheader', { name: 'Job ID' })).toBeInTheDocument()
  })

  it('renders a footer summary under the table', () => {
    renderWithProviders(table(JOBS, { footer: <TableFooter summary="Showing 1–3 of 3" /> }))
    expect(screen.getByText('Showing 1–3 of 3')).toBeInTheDocument()
  })
})

describe('DataTable — keyboard reachable rows', () => {
  it('opens a row with Enter and with Space, not only with a click', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    renderWithProviders(table(JOBS, { onRowClick }))

    const rows = screen.getAllByRole('button')
    expect(rows).toHaveLength(JOBS.length)
    expect(rows[0]).toHaveAttribute('tabindex', '0')

    await user.tab()
    expect(rows[0]).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenCalledWith(JOBS[0])

    await user.tab()
    expect(rows[1]).toHaveFocus()
    await user.keyboard(' ')
    expect(onRowClick).toHaveBeenCalledWith(JOBS[1])
    expect(onRowClick).toHaveBeenCalledTimes(2)

    await user.click(rows[2])
    expect(onRowClick).toHaveBeenCalledWith(JOBS[2])
  })

  it('leaves rows out of the tab order when there is nothing to open', async () => {
    const user = userEvent.setup()
    renderWithProviders(table())
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    await user.tab()
    expect(document.body).toHaveFocus()
  })
})

describe('DataTable — mobile card layout', () => {
  it('replaces the table with the designed card list below 860px', () => {
    setViewportWidth(390)
    renderWithProviders(table())
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    for (const job of JOBS) {
      expect(screen.getByText(job.id)).toBeInTheDocument()
      expect(screen.getByText(job.customer)).toBeInTheDocument()
    }
    // The row label the table carried in its header comes back on the card.
    expect(screen.getAllByText('Customer')).toHaveLength(JOBS.length)
  })

  it('keeps the table when the screen gave no card design', () => {
    setViewportWidth(390)
    renderWithProviders(
      <DataTable<Job> columns={COLUMNS} rows={JOBS} rowKey={(job) => job.id} />
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('makes each card tappable when rows open something', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    setViewportWidth(390)
    renderWithProviders(table(JOBS, { onRowClick }))

    const cards = screen.getAllByRole('button')
    expect(cards).toHaveLength(JOBS.length)
    await user.click(cards[1])
    expect(onRowClick).toHaveBeenCalledWith(JOBS[1])
  })

  it('shows the same empty and loading states as the table', () => {
    setViewportWidth(390)
    const { unmount } = renderWithProviders(
      table([], { empty: <EmptyState title="No job cards yet" /> })
    )
    expect(screen.getByText('No job cards yet')).toBeInTheDocument()
    unmount()

    const { container } = renderWithProviders(table(JOBS, { loading: true }))
    expect(screen.queryByText('Ahmed Al-Rashid')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('switches layouts live when the viewport crosses the breakpoint', () => {
    function Harness() {
      const [rows] = useState(JOBS)
      return table(rows)
    }
    renderWithProviders(<Harness />)
    expect(screen.getByRole('table')).toBeInTheDocument()

    act(() => setViewportWidth(390))
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    act(() => setViewportWidth(1280))
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders every row of the card list, not a truncated one', () => {
    setViewportWidth(430)
    const { container } = renderWithProviders(table())
    const list = container.querySelector('[class*="flex-col"]') as HTMLElement
    for (const job of JOBS) expect(within(list).getByText(job.id)).toBeInTheDocument()
  })
})
