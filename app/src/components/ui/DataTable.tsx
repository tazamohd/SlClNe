import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Card } from './Card'
import { Icon } from './Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

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
}

/** The bordered table every list screen in the design uses.
 *
 *  Beyond the prototypes' markup: a real empty state (they rendered a bare
 *  table with no rows and no explanation), a loading state, and keyboard-
 *  reachable rows when `onRowClick` is set — the originals put the handler on
 *  `<tr>`, so the whole list was unusable without a mouse. */
export function DataTable<TRow>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading,
  empty,
  footer,
  className,
}: {
  columns: readonly Column<TRow>[]
  rows: readonly TRow[]
  rowKey: (row: TRow, index: number) => string
  onRowClick?: (row: TRow) => void
  loading?: boolean
  /** Shown when `rows` is empty. Defaults to a generic message. */
  empty?: ReactNode
  footer?: ReactNode
  className?: string
}) {
  const { t } = usePreferences()

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-ui text-sm text-heading">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className="h-11 whitespace-nowrap border-b border-border px-6 text-start text-xs font-semibold uppercase tracking-[.05em] text-muted"
                >
                  {t(column.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows columns={columns.length} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12">
                  {empty ?? <EmptyState />}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
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
                    'transition-colors duration-150',
                    onRowClick &&
                      'cursor-pointer hover:bg-[rgba(10,94,215,.04)] focus-visible:bg-[rgba(10,94,215,.08)] focus-visible:outline-none'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      dir={column.code ? 'ltr' : undefined}
                      className={cn(
                        'border-b border-border px-6 py-3 align-middle',
                        column.code && 'font-mono text-[13px]',
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </Card>
  )
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, row) => (
        <tr key={row}>
          {Array.from({ length: columns }, (_, column) => (
            <td key={column} className="border-b border-border px-6 py-3">
              <span className="block h-4 w-full animate-pulse rounded bg-inset" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/** Neutral empty state. Screens pass their own copy via `empty` when they can
 *  say something more useful than "nothing here". */
export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  action,
}: {
  icon?: string
  title?: string
  description?: string
  action?: ReactNode
}) {
  const { t } = usePreferences()
  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="flex rounded-full bg-inset p-4 text-muted">
        <Icon name={icon} size={24} />
      </span>
      <div>
        <p className="font-action text-sm font-semibold text-heading">
          {title ?? t('No results')}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {description ?? t('Nothing matches the current filters.')}
        </p>
      </div>
      {action}
    </div>
  )
}

/** The "Showing 1–5 of 27" + page buttons footer under a table. */
export function TableFooter({ summary, children }: { summary: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 pb-5 pt-4">
      <span className="text-[13px] text-muted">{summary}</span>
      {children ? <div className="flex gap-1.5">{children}</div> : null}
    </div>
  )
}
