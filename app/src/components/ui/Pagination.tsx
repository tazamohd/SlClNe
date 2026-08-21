import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import { Icon } from './Icon'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const { t, rtl } = usePreferences()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  const pages = buildPageList(page, totalPages)

  return (
    <nav
      aria-label={t('Pagination')}
      className={cn('flex items-center justify-between gap-4', className)}
    >
      <span className="text-xs text-muted">
        {total > 0
          ? `${from}–${to} ${t('of')} ${total}`
          : t('No results')}
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
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-md border-none px-2 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue',
        active
          ? 'bg-salis-gradient text-white'
          : 'bg-transparent text-body hover:bg-[rgba(10,94,215,.06)]',
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
