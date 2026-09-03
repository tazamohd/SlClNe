import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useSession } from '@/providers/SessionProvider'
import type { NavGroup } from '@/data/types'

export interface BreadcrumbItem {
  /** English source string — translated where it is rendered. */
  label: string
  /** Omit on the current page. */
  to?: string
}

/** Where the dashboard lives, the root every trail starts from. */
export const HOME_CRUMB: BreadcrumbItem = { label: 'Home', to: '/dashboard' }

/** The trail from the nav tree to `pathname`.
 *
 *  Exact match on a nav item gives `Home › Group › Item`. A route the nav does
 *  not list — a detail page, a stage screen, a print view — takes the nearest
 *  item whose route is a prefix of the path (so `/customers/abc` sits under
 *  Customers), or, failing that, the group whose items share the path's first
 *  segment. The current page's own title is appended by the header, which is
 *  the one thing this hook cannot know. */
export function breadcrumbsFor(pathname: string, nav: readonly NavGroup[]): BreadcrumbItem[] {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === HOME_CRUMB.to) return []

  let best: { group: NavGroup; item: NavGroup['items'][number]; exact: boolean; length: number } | null = null
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.route) continue
      const route = item.route.replace(/\/+$/, '')
      if (route === path) {
        best = { group, item, exact: true, length: route.length }
        break
      }
      if (path.startsWith(`${route}/`) || path.startsWith(`${route}-`)) {
        if (!best || (!best.exact && route.length > best.length)) {
          best = { group, item, exact: false, length: route.length }
        }
      }
    }
    if (best?.exact) break
  }

  if (!best) return [HOME_CRUMB]
  const groupCrumb: BreadcrumbItem = { label: best.group.label, to: best.group.items[0]?.route ?? undefined }
  if (best.exact) return [HOME_CRUMB, groupCrumb, { label: best.item.label }]
  return [HOME_CRUMB, groupCrumb, { label: best.item.label, to: best.item.route ?? undefined }]
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const { pathname } = useLocation()
  const { nav } = useSession()
  return useMemo(() => breadcrumbsFor(pathname, nav), [pathname, nav])
}
