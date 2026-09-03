import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { usePreferences } from '@/providers/PreferencesProvider'
import type { BreadcrumbItem } from '@/lib/useBreadcrumbs'
import { Icon } from './Icon'

export type { BreadcrumbItem }

/** Where the page sits in the product.
 *
 *  Every operational route is at least two levels deep (group › screen), and
 *  detail pages are three, so a trail is orientation the sidebar's highlight
 *  cannot give once the group is scrolled out of view. The last item is the
 *  page itself: not a link, marked `aria-current`. Separators are decorative
 *  glyphs that flip with the document direction. */
export function Breadcrumbs({
  items,
  className,
  testId = 'page-header-breadcrumbs',
}: {
  items: readonly BreadcrumbItem[]
  className?: string
  testId?: string
}) {
  const { t, rtl } = usePreferences()
  if (items.length === 0) return null
  return (
    <nav aria-label={t('Breadcrumb')} data-testid={testId} className={className}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-[12px] text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <li aria-hidden className="flex text-faint">
                  <Icon name={rtl ? 'ChevronLeft' : 'ChevronRight'} size={12} />
                </li>
              ) : null}
              <li className="flex min-w-0 items-center">
                {item.to && !last ? (
                  <Link
                    to={item.to}
                    className={cn(
                      'truncate rounded px-0.5 no-underline transition-colors hover:text-salis-blue hover:no-underline',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue'
                    )}
                  >
                    {t(item.label)}
                  </Link>
                ) : (
                  <span
                    aria-current={last ? 'page' : undefined}
                    className={cn('truncate px-0.5', last && 'font-medium text-heading')}
                  >
                    {t(item.label)}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
