import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  /** Offer a rows-per-page choice. Omit to keep the page size fixed. */
  pageSizeOptions?: readonly number[]
  onPageSizeChange?: (pageSize: number) => void
  className?: string
  testId?: string
}

/** "Showing 1–25 of 140" plus the page buttons, as the design's table footers
 *  draw it. Numerals are Latin and LTR in both languages (README §7). */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  className,
  testId = 'data-table-pagination',
}: PaginationProps) {
  const { t, rtl } = usePreferences()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  const pages = buildPageList(page, totalPages)

  return (
    <nav
      aria-label={t('Pagination')}
      data-testid={testId}
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
    >
      <span className="flex items-center gap-3 text-xs text-muted">
        <span data-testid="data-table-summary">
          {total > 0 ? (
            <>
              {t('Showing')}{' '}
              <span dir="ltr" className="font-mono tabular-nums text-body">
                {from}–{to}
              </span>{' '}
              {t('of')}{' '}
              <span dir="ltr" className="font-mono tabular-nums text-body">
                {total}
              </span>
            </>
          ) : (
            t('No results')
          )}
        </span>
        {pageSizeOptions?.length && onPageSizeChange ? (
          <label className="flex items-center gap-1.5">
            <span className="sr-only">{t('Rows per page')}</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-8 rounded border border-border bg-inset px-2 font-mono text-xs text-heading outline-none focus:border-salis-blue focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span aria-hidden>{t('per page')}</span>
          </label>
        ) : null}
      </span>
      <div className="flex items-center gap-1">
        <PageButton
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('Previous page')}
        >
          <Icon name={rtl ? 'ChevronRight' : 'ChevronLeft'} size={14} />
        </PageButton>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted">
              &hellip;
            </span>
          ) : (
            <PageButton
              key={p}
              active={p === page}
              onClick={() => onPageChange(p as number)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </PageButton>
          )
        )}

        <PageButton
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('Next page')}
        >
          <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={14} />
        </PageButton>
      </div>
    </nav>
  )
}

function PageButton({
  active,
  disabled,
  onClick,
  children,
  ...rest
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  'aria-label'?: string
  'aria-current'?: 'page'
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-9 min-w-[36px] cursor-pointer items-center justify-center rounded-md border-none px-2 font-mono text-xs font-medium tabular-nums transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
        active
          ? 'bg-salis-gradient text-white'
          : 'bg-transparent text-body hover:bg-salis-blue/[.06]',
        disabled && 'pointer-events-none opacity-40'
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
}
