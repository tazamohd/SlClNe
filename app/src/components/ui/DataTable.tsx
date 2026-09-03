import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from './Card'
import { EmptyState, Skeleton } from './States'
import { Icon } from './Icon'
import { Pagination, type PaginationProps } from './Pagination'
import { usePreferences, type Density } from '@/providers/PreferencesProvider'
import { useIsMobile } from '@/lib/useMediaQuery'
import { MobileCard, MobileList } from '@/components/shell/MobileShell'

// Re-exported: `EmptyState` lived here while tables were its only caller, and
// screens still import it from this module.
export { EmptyState }

/** Column definition. `header` is an English source string — it gets
 *  translated at render, so callers pass plain text. */
export interface Column<TRow> {
  header: string
  /** Cell content. Return a node, not a string, when it needs a badge. */
  cell: (row: TRow) => ReactNode
  /** Latin-only content (ids, plates, SKUs, VINs) — pins the cell LTR and
   *  renders it monospaced, so Arabic pages don't reorder the characters. */
  code?: boolean
  className?: string
  /** Stable identity for sort state and test ids. Defaults to `header`. */
  key?: string
  /** The value to order by. Its presence is what makes a column sortable —
   *  a header with nothing to sort on stays a plain header. */
  sortValue?: (row: TRow) => string | number | Date | null | undefined
  align?: 'start' | 'center' | 'end'
  /** A figure: mono, tabular, end-aligned, LTR. Money and counts. */
  numeric?: boolean
  /** CSS width for the column, e.g. `'12rem'` or `'20%'`. */
  width?: string
}

export interface SortState {
  key: string
  dir: 'asc' | 'desc'
}

export interface DataTableProps<TRow> {
  columns: readonly Column<TRow>[]
  rows: readonly TRow[]
  rowKey: (row: TRow, index: number) => string
  onRowClick?: (row: TRow) => void
  loading?: boolean
  /** Shown when `rows` is empty. Defaults to a generic message. */
  empty?: ReactNode
  footer?: ReactNode
  className?: string
  /** Row body for the mobile card layout. */
  mobileCard?: (row: TRow) => ReactNode
  /** Names the table for assistive tech — announced when focus enters it and
   *  listed in a screen reader's table index, which is how a non-visual user
   *  tells two tables on a screen apart. An English source string, translated
   *  here; rendered visually hidden, so the visible layout is untouched. */
  caption?: string
  /** Server-side pagination. When set it wins over the built-in client paging. */
  pagination?: PaginationProps
  /** Controlled sort. With `onSortChange` the caller sorts (server-side, or
   *  its own memo) and the table only draws the indicator. */
  sort?: SortState
  /** Initial sort for the uncontrolled, client-side case. */
  defaultSort?: SortState
  onSortChange?: (sort: SortState) => void
  /** Client-side page size. Defaults to 25 — a registry with 300 rows is
   *  paged rather than dumped. `false` renders every row. */
  pageSize?: number | false
  /** Keep the header row visible while a long table scrolls. */
  stickyHeader?: boolean
  /** Row height. Defaults to the session preference. */
  density?: Density
  /** Row above the header inside the card — search, filters, a density toggle. */
  toolbar?: ReactNode
  /** Row selection. Ids come from `rowKey`. */
  selectable?: boolean
  selected?: ReadonlySet<string>
  onSelectedChange?: (next: Set<string>) => void
  /** Controls for the selection; the bar replaces the toolbar while any row
   *  is selected. */
  bulkActions?: (selected: ReadonlySet<string>) => ReactNode
  testId?: string
}

const DEFAULT_PAGE_SIZE = 25
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

function columnKey<TRow>(column: Column<TRow>): string {
  return column.key ?? column.header
}

/** Every list screen in the design, in both its layouts.
 *
 *  Desktop renders the bordered table. Below 860px it renders the mobile
 *  design's stacked card list instead — those are genuinely different layouts
 *  in the bundle, not a narrowed table, so a horizontally-scrolling table would
 *  not be the designed mobile screen. Pass `mobileCard` to describe a row's
 *  card body; without it the table falls back to horizontal scroll.
 *
 *  Beyond the prototypes' markup: a real empty state (they rendered a bare
 *  table with no rows and no explanation), a loading state, keyboard-reachable
 *  rows when `onRowClick` is set — the originals put the handler on `<tr>`, so
 *  the whole list was unusable without a mouse — and, since the UX pass,
 *  sortable headers, a sticky header row, paging past 25 rows, a density
 *  preference and multi-row selection for bulk actions. All of it is additive:
 *  a call site written against the original API renders unchanged apart from
 *  the paging and the sticky header. */
export function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  empty,
  footer,
  className,
  mobileCard,
  caption,
  pagination,
  sort,
  defaultSort,
  onSortChange,
  pageSize = DEFAULT_PAGE_SIZE,
  stickyHeader = true,
  density: densityProp,
  toolbar,
  selectable,
  selected,
  onSelectedChange,
  bulkActions,
  testId = 'data-table',
}: DataTableProps<TRow>) {
  const { t, density: densityPref } = usePreferences()
  const isMobile = useIsMobile()
  const density = densityProp ?? densityPref

  // ── Sort ──────────────────────────────────────────────────────────────
  const [internalSort, setInternalSort] = useState<SortState | undefined>(defaultSort)
  const activeSort = sort ?? internalSort
  const clientSorts = !onSortChange

  const toggleSort = (column: Column<TRow>) => {
    const key = columnKey(column)
    const next: SortState =
      activeSort?.key === key
        ? { key, dir: activeSort.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    if (onSortChange) onSortChange(next)
    else setInternalSort(next)
  }

  const sortedRows = useMemo(() => {
    if (!clientSorts || !activeSort) return rows
    const column = columns.find((c) => columnKey(c) === activeSort.key)
    if (!column?.sortValue) return rows
    const read = column.sortValue
    const sign = activeSort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => sign * compareValues(read(a), read(b)))
  }, [rows, columns, activeSort, clientSorts])

  // ── Paging ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [clientPageSize, setClientPageSize] = useState(pageSize || DEFAULT_PAGE_SIZE)
  const clientPages = !pagination && pageSize !== false && sortedRows.length > clientPageSize
  useEffect(() => {
    setPage(1)
  }, [rows.length, activeSort?.key, activeSort?.dir, clientPageSize])

  const visibleRows = useMemo(() => {
    if (!clientPages) return sortedRows
    const start = (page - 1) * clientPageSize
    return sortedRows.slice(start, start + clientPageSize)
  }, [sortedRows, clientPages, page, clientPageSize])

  const pager: PaginationProps | null = pagination
    ? pagination
    : clientPages
      ? {
          page,
          pageSize: clientPageSize,
          total: sortedRows.length,
          onPageChange: setPage,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onPageSizeChange: setClientPageSize,
        }
      : null

  // ── Selection ─────────────────────────────────────────────────────────
  const selection = selected ?? new Set<string>()
  const allVisibleIds = visibleRows.map((row, index) => rowKey(row, index))
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selection.has(id))
  const someSelected = allVisibleIds.some((id) => selection.has(id))

  const toggleRow = (id: string) => {
    if (!onSelectedChange) return
    const next = new Set(selection)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectedChange(next)
  }
  const toggleAll = () => {
    if (!onSelectedChange) return
    const next = new Set(selection)
    if (allSelected) for (const id of allVisibleIds) next.delete(id)
    else for (const id of allVisibleIds) next.add(id)
    onSelectedChange(next)
  }

  const selectionBar =
    selectable && bulkActions && selection.size > 0 ? (
      <div
        role="region"
        aria-label={t('Selection')}
        className="flex flex-wrap items-center gap-3 border-b border-border bg-tint-blue px-4 py-2.5"
      >
        <span className="text-[13px] font-semibold text-heading">
          <span dir="ltr" className="font-mono tabular-nums">
            {selection.size}
          </span>{' '}
          {t('selected')}
        </span>
        <span className="flex-1" />
        <div className="flex flex-wrap items-center gap-2">{bulkActions(selection)}</div>
        <button
          type="button"
          onClick={() => onSelectedChange?.(new Set())}
          className="inline-flex h-8 cursor-pointer items-center rounded border-none bg-transparent px-2 font-action text-xs font-medium text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          {t('Clear selection')}
        </button>
      </div>
    ) : null

  const toolbarRow =
    selectionBar ??
    (toolbar ? (
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-2.5">
        {toolbar}
      </div>
    ) : null)

  // ── Mobile ────────────────────────────────────────────────────────────
  if (isMobile && mobileCard) {
    if (loading) {
      return (
        <MobileList>
          {Array.from({ length: 5 }, (_, index) => (
            <MobileCard key={index}>
              <Skeleton className="w-2/3" />
              <Skeleton className="h-3" />
            </MobileCard>
          ))}
        </MobileList>
      )
    }
    if (!rows.length) {
      return <Card className="p-6">{empty ?? <EmptyState />}</Card>
    }
    return (
      <MobileList>
        {toolbarRow ? <div className="-mx-1">{toolbarRow}</div> : null}
        {visibleRows.map((row, index) => {
          const id = rowKey(row, index)
          return (
            <div key={id} data-testid="data-table-row" className="flex items-start gap-2">
              {selectable ? (
                <SelectBox
                  checked={selection.has(id)}
                  onChange={() => toggleRow(id)}
                  label={t('Select row')}
                  className="mt-3.5"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <MobileCard onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {mobileCard(row)}
                </MobileCard>
              </div>
            </div>
          )
        })}
        {pager ? <Pagination {...pager} className="px-1 py-2" /> : null}
        {footer}
      </MobileList>
    )
  }

  // ── Desktop ───────────────────────────────────────────────────────────
  const rowHeight = density === 'compact' ? 'h-row-sm' : 'h-row'
  const cellPad = density === 'compact' ? 'py-1.5' : 'py-3'

  return (
    <Card
      data-testid={testId}
      className={cn(stickyHeader ? 'overflow-clip' : 'overflow-hidden', className)}
    >
      {toolbarRow}
      <div className={mobileCard ? 'overflow-x-clip' : 'overflow-x-auto'}>
        <table className="w-full border-collapse font-ui text-sm text-heading">
          {caption ? <caption className="sr-only">{t(caption)}</caption> : null}
          <thead>
            <tr>
              {selectable ? (
                <th
                  scope="col"
                  className={cn(
                    'w-11 border-b border-border px-3 text-start',
                    stickyHeader && 'sticky top-0 z-[1] bg-card'
                  )}
                >
                  <SelectBox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={toggleAll}
                    label={t('Select all')}
                  />
                </th>
              ) : null}
              {columns.map((column) => {
                const key = columnKey(column)
                const sortable = Boolean(column.sortValue) || (Boolean(onSortChange) && column.key !== undefined)
                const isActive = activeSort?.key === key
                const ariaSort = isActive ? (activeSort?.dir === 'asc' ? 'ascending' : 'descending') : undefined
                const alignClass =
                  column.numeric || column.align === 'end'
                    ? 'text-end'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-start'
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={ariaSort}
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      'h-11 whitespace-nowrap border-b border-border px-6 text-xs font-semibold uppercase tracking-[.05em] text-muted',
                      alignClass,
                      stickyHeader && 'sticky top-0 z-[1] bg-card'
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        data-testid={`data-table-sort-${key}`}
                        onClick={() => toggleSort(column)}
                        className={cn(
                          'group inline-flex h-8 cursor-pointer items-center gap-1 rounded border-none bg-transparent px-1 font-semibold uppercase tracking-[.05em] transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
                          isActive ? 'text-salis-blue' : 'text-muted hover:text-heading',
                          (column.numeric || column.align === 'end') && 'flex-row-reverse'
                        )}
                      >
                        <span>{t(column.header)}</span>
                        <Icon
                          name={
                            !isActive ? 'ArrowUpDown' : activeSort?.dir === 'asc' ? 'ArrowUp' : 'ArrowDown'
                          }
                          size={12}
                          className={cn(!isActive && 'opacity-40 group-hover:opacity-100')}
                        />
                        <span className="sr-only">
                          {isActive
                            ? activeSort?.dir === 'asc'
                              ? t('Sorted ascending')
                              : t('Sorted descending')
                            : t('Sort by')}
                        </span>
                      </button>
                    ) : (
                      t(column.header)
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows columns={columns.length + (selectable ? 1 : 0)} padding={cellPad} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12">
                  {empty ?? <EmptyState />}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => {
                const id = rowKey(row, index)
                const isSelected = selection.has(id)
                return (
                  <tr
                    key={id}
                    data-testid="data-table-row"
                    aria-selected={selectable ? isSelected : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              onRowClick(row)
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    className={cn(
                      rowHeight,
                      'transition-colors duration-150',
                      isSelected && 'bg-tint-blue',
                      onRowClick &&
                        'cursor-pointer hover:bg-salis-blue/[.04] focus-visible:bg-salis-blue/[.08] focus-visible:outline-none'
                    )}
                  >
                    {selectable ? (
                      <td
                        className={cn('border-b border-border px-3 align-middle', cellPad)}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <SelectBox
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          label={t('Select row')}
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td
                        key={columnKey(column)}
                        dir={column.code || column.numeric ? 'ltr' : undefined}
                        className={cn(
                          'border-b border-border px-6 align-middle',
                          cellPad,
                          column.code && 'font-mono text-[13px]',
                          column.numeric && 'font-mono text-[13px] tabular-nums',
                          (column.numeric || column.align === 'end') && 'text-end',
                          column.align === 'center' && 'text-center',
                          column.className
                        )}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {pager ? <Pagination {...pager} className="px-6 py-3.5" /> : null}
      {footer}
    </Card>
  )
}

function SkeletonRows({ columns, padding }: { columns: number; padding: string }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, row) => (
        <tr key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className={cn('border-b border-border px-6', padding)}>
              <Skeleton />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function SelectBox({
  checked,
  indeterminate,
  onChange,
  label,
  className,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  label: string
  className?: string
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(node) => {
        if (node) node.indeterminate = Boolean(indeterminate)
      }}
      onChange={onChange}
      aria-label={label}
      className={cn(
        'h-4 w-4 cursor-pointer rounded border-border accent-[var(--salis-blue)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2',
        className
      )}
    />
  )
}

/** Comfortable / compact switch for a table toolbar. Writes the session
 *  preference, so every table follows. */
export function DensityToggle({ className }: { className?: string }) {
  const { t, density, setDensity } = usePreferences()
  const options: { value: Density; label: string; icon: string }[] = [
    { value: 'comfortable', label: 'Comfortable', icon: 'Rows3' },
    { value: 'compact', label: 'Compact', icon: 'LayoutList' },
  ]
  return (
    <div
      role="group"
      aria-label={t('Density')}
      className={cn('inline-flex rounded border border-border bg-inset p-0.5', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={density === option.value}
          aria-label={t(option.label)}
          onClick={() => setDensity(option.value)}
          className={cn(
            'inline-flex h-8 w-9 cursor-pointer items-center justify-center rounded border-none transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
            density === option.value
              ? 'bg-card text-salis-blue shadow-sm'
              : 'bg-transparent text-muted hover:text-heading'
          )}
        >
          <Icon name={option.icon} size={15} />
        </button>
      ))}
    </div>
  )
}

/** The "Showing 1–5 of 27" + page buttons footer under a table. */
export function TableFooter({ summary, children }: { summary: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-5 pt-4 sm:px-6">
      <span className="text-[13px] text-muted">{summary}</span>
      {children ? <div className="flex gap-1.5">{children}</div> : null}
    </div>
  )
}
