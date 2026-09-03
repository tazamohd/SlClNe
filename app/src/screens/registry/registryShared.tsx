import { useMemo, useState, type ReactNode } from 'react'
import { EmptyState } from '@/components/ui/DataTable'
import { Icon } from '@/components/ui/Icon'
import { useDebounce } from '@/lib/useDebounce'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The pieces every registry list shares: the row action pair, the debounced
 *  search, the "no matches" empty state and the overflow-menu item. Kept in
 *  one file so the customer and vehicle registries cannot drift apart. */

/** The row-level actions column every writable registry carries.
 *
 *  Edit and delete are separate grants in the matrix (`e` and `d`), and only
 *  the owner and the manager hold `d` on customers and vehicles — an advisor or
 *  a front-desk user can add and correct records but not remove them. The
 *  buttons follow that rather than showing a control the server would refuse. */
export function RowActions({
  onEdit,
  onDelete,
  label,
}: {
  onEdit?: () => void
  onDelete?: () => void
  /** The record's own name, so the two icon buttons are distinguishable to a
   *  screen reader in a table of twenty identical pairs. */
  label: string
}) {
  const { t } = usePreferences()
  if (!onEdit && !onDelete) return null
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit ? (
        <button
          type="button"
          aria-label={`${t('Edit')} ${label}`}
          onClick={(event) => {
            event.stopPropagation()
            onEdit()
          }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors duration-150 hover:bg-inset hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name="Pencil" size={15} />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          aria-label={`${t('Delete')} ${label}`}
          onClick={(event) => {
            event.stopPropagation()
            onDelete()
          }}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted transition-colors duration-150 hover:bg-inset hover:text-salis-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name="Trash2" size={15} />
        </button>
      ) : null}
    </div>
  )
}

/** The search-filter every registry uses. The box updates on every keystroke;
 *  the rows follow a quarter of a second later, so a three-hundred-row registry
 *  is not re-filtered on each letter typed. */
export function useSearch<TRow>(rows: readonly TRow[], fields: (row: TRow) => (string | number | null | undefined)[]) {
  const [query, setQuery] = useState('')
  const needle = useDebounce(query.trim().toLowerCase(), 250)
  const filtered = useMemo(() => {
    if (!needle) return rows
    return rows.filter((row) =>
      fields(row).some((value) => value != null && String(value).toLowerCase().includes(needle))
    )
  }, [rows, needle, fields])
  return { query, setQuery, filtered, searching: Boolean(needle) }
}

export function NoMatches({
  query,
  icon,
  title,
  description,
  action,
}: {
  query: string | boolean
  icon: string
  title: string
  description: string
  /** Offered only when the list is genuinely empty — a search that matched
   *  nothing is fixed by changing the search, not by creating a record. */
  action?: ReactNode
}) {
  const { t } = usePreferences()
  return query ? (
    <EmptyState
      icon="SearchX"
      title={t('No results')}
      description={t('Nothing matches the current filters.')}
    />
  ) : (
    <EmptyState icon={icon} title={t(title)} description={t(description)} action={action} />
  )
}

/** One row of a header overflow menu. The popover closes itself after the
 *  click, so the item only has to do its job. */
export function OverflowItem({
  icon,
  label,
  onClick,
  destructive,
  disabled,
}: {
  icon: string
  /** English source string, translated here. */
  label: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  const { t } = usePreferences()
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={
        'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded border-none bg-transparent px-3 text-start font-action text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue disabled:cursor-not-allowed disabled:opacity-50 ' +
        (destructive
          ? 'text-salis-orange hover:bg-salis-orange/[.08]'
          : 'text-body hover:bg-inset hover:text-heading')
      }
    >
      <Icon name={icon} size={15} />
      {t(label)}
    </button>
  )
}
