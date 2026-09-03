import type { ReactNode } from 'react'
import { PageHeader, type PageHeaderProps } from '@/components/ui/PageHeader'

/** Header for a list screen: 30px title, eyebrow, inline search, and actions.
 *
 *  @deprecated Import `PageHeader` from `@/components/ui/PageHeader` with
 *  `variant="quiet"`. The registries' quieter header is now a variant of the
 *  one page header; this wrapper keeps its original prop names so the eight
 *  screens that use it need not move. */
export function ListPageHeader({
  title,
  subtitle,
  search,
  actions,
  overflow,
  children,
}: {
  title: string
  /** Module name shown above the title, as the accounting screens do. */
  subtitle?: string
  /** Wire up the filter box. Omit for lists with no search. */
  search?: PageHeaderProps['search']
  actions?: ReactNode
  overflow?: ReactNode
  children?: ReactNode
}) {
  return (
    <PageHeader
      variant="quiet"
      title={title}
      eyebrow={subtitle}
      search={search}
      actions={actions}
      overflow={overflow}
    >
      {children}
    </PageHeader>
  )
}
