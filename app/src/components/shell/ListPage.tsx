import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** Header for a list screen: 30px title, inline search, and actions.
 *
 *  Distinct from `PageHeader` — the dashboards use a 48px gradient title with
 *  an icon tile; the registries use this quieter one. Both are in the design. */
export function ListPageHeader({
  title,
  search,
  actions,
}: {
  title: string
  /** Wire up the filter box. Omit for lists with no search. */
  search?: { value: string; onChange: (next: string) => void; placeholder?: string }
  actions?: ReactNode
}) {
  const { t } = usePreferences()

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-3xl font-black text-heading">{title}</h1>
      <div className="flex flex-wrap items-center gap-2.5">
        {search ? (
          <span className="relative flex flex-shrink-0 items-center">
            <Icon
              name="Search"
              size={15}
              className="pointer-events-none absolute text-muted start-3"
            />
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? t('Search customers, vehicles, parts...')}
              aria-label={search.placeholder ?? t('Search')}
              className="h-9 w-[220px] rounded border border-border bg-inset px-3 ps-8 text-[13px] text-heading outline-none transition-all duration-200 focus:border-salis-blue focus:bg-card focus:shadow-[0_0_0_3px_rgba(10,94,215,.15)]"
            />
          </span>
        ) : null}
        {actions}
      </div>
    </div>
  )
}
