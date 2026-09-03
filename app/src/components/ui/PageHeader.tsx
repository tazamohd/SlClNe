import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { useBreadcrumbs, type BreadcrumbItem } from '@/lib/useBreadcrumbs'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useShell } from '@/components/shell/ShellContext'
import { BackLink } from './BackLink'
import { Breadcrumbs } from './Breadcrumbs'
import { Icon } from './Icon'
import { Popover } from './Popover'
import { Search } from './Search'

/** The one page header.
 *
 *  Five headers grew up across the port — the dashboards' 48px gradient title,
 *  the registries' quiet 30px one, the feature kit's, the phone one and this
 *  file's — and the seams between them were the single biggest source of
 *  screens looking unlike each other. They are now four *variants* of one
 *  component, sharing markup, breadcrumbs, the actions slot and the phone
 *  layout; the old exports survive as thin wrappers so no screen had to move.
 *
 *  Variants:
 *  - `hero`      the dashboards: gradient-clipped 48px display title, icon
 *                tile with a blurred halo.
 *  - `standard`  most screens: 30px title, gradient icon tile. The default.
 *  - `quiet`     registries and ledgers: eyebrow + 30px title, no tile, room
 *                for an inline search box.
 *  - `compact`   what every variant becomes on a phone: 20px title, small
 *                tile, actions in a scrollable row underneath.
 *
 *  Breadcrumbs derive from the nav tree and the route (`useBreadcrumbs`) and
 *  render only inside the operational shell; pass `breadcrumbs={false}` to
 *  suppress them, or an explicit list for a detail page whose parent the nav
 *  cannot know. `title` is rendered through `t()` — callers that already
 *  translated it lose nothing, since a translated string is its own key. */
export type PageHeaderVariant = 'hero' | 'standard' | 'compact' | 'quiet'

export interface PageHeaderMeta {
  icon?: string
  /** English source string; labels the value for screen readers. */
  label: string
  value: ReactNode
  /** Latin identifier — pinned LTR and monospaced. */
  code?: boolean
}

export interface PageHeaderProps {
  title: string
  subtitle?: ReactNode
  /** lucide glyph for the tile. Ignored by `quiet`. */
  icon?: string
  variant?: PageHeaderVariant
  /** Module name above the title — "Accounting", "Front Desk". */
  eyebrow?: string
  /** Render the title as a Latin identifier (invoice number, plate). */
  titleCode?: boolean
  /** Badge beside the title. */
  status?: ReactNode
  /** Detail line under the title: icon · value pairs. */
  meta?: readonly PageHeaderMeta[]
  /** Trail above the title. Derived from the nav by default; `false` hides. */
  breadcrumbs?: readonly BreadcrumbItem[] | false
  /** Link out of a nested page. On a phone it stands in for the breadcrumbs. */
  back?: { to: string; label: string }
  /** Inline search box, as the registry headers draw it. */
  search?: { value: string; onChange: (next: string) => void; placeholder?: string }
  /** Primary and secondary buttons. Keep to one primary. */
  actions?: ReactNode
  /** Tertiary actions, behind a "More actions" button. */
  overflow?: ReactNode
  /** Toolbar row under the title — filter chips, tabs, a stage strip. */
  children?: ReactNode
  /** Stick to the top of the scroll container while a long list scrolls. */
  sticky?: boolean
  /** @deprecated use `variant="compact"`. */
  compact?: boolean
  className?: string
  testId?: string
}

const TITLE: Record<PageHeaderVariant, string> = {
  hero: 'bg-salis-gradient-r bg-clip-text font-display text-[40px] font-black leading-[1.1] text-transparent sm:text-5xl',
  standard: 'font-display text-[30px] font-black leading-tight text-heading',
  quiet: 'font-display text-[30px] font-black leading-tight text-heading',
  compact: 'font-display text-xl font-black leading-tight text-heading',
}

export function PageHeader({
  title,
  subtitle,
  icon,
  variant: variantProp,
  eyebrow,
  titleCode,
  status,
  meta,
  breadcrumbs,
  back,
  search,
  actions,
  overflow,
  children,
  sticky,
  compact,
  className,
  testId = 'page-header',
}: PageHeaderProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { kind } = useShell()
  const derived = useBreadcrumbs()

  const variant: PageHeaderVariant = isMobile ? 'compact' : (variantProp ?? (compact ? 'compact' : 'standard'))
  const trail =
    breadcrumbs === false
      ? []
      : breadcrumbs ?? (kind === 'app' ? derived : [])
  const showCrumbs = !isMobile && trail.length > 0
  const showTile = variant !== 'quiet' && Boolean(icon)

  const heading = (
    <h1
      data-testid="page-header-title"
      dir={titleCode ? 'ltr' : undefined}
      className={cn(TITLE[variant], titleCode && 'font-mono tracking-normal', 'min-w-0 break-words')}
    >
      {t(title)}
    </h1>
  )

  const details = meta?.length ? (
    <dl className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      {meta.map((item) => (
        <div key={item.label} className="flex items-center gap-1 text-[13px] text-muted">
          <dt className="sr-only">{t(item.label)}</dt>
          {item.icon ? <Icon name={item.icon} size={13} className="flex-shrink-0" /> : null}
          <dd dir={item.code ? 'ltr' : undefined} className={cn('m-0', item.code && 'font-mono')}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  ) : null

  const overflowMenu = overflow ? (
    <Popover
      align="end"
      trigger={
        <button
          type="button"
          aria-label={t('More actions')}
          aria-haspopup="menu"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-border bg-card text-muted transition-colors hover:border-salis-blue hover:text-salis-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
        >
          <Icon name="MoreHorizontal" size={18} />
        </button>
      }
      contentClassName="flex min-w-[200px] flex-col gap-1 p-1.5"
    >
      {overflow}
    </Popover>
  ) : null

  const tile = showTile ? (
    <div className="relative flex-shrink-0">
      {variant === 'hero' ? (
        <div className="absolute inset-0 rounded-2xl bg-salis-blue opacity-30 blur-xl" aria-hidden />
      ) : null}
      <div
        className={cn(
          'relative flex rounded-xl bg-salis-gradient text-white',
          variant === 'hero'
            ? 'rounded-2xl p-3 shadow-[0_20px_25px_-5px_rgba(10,94,215,.25)]'
            : variant === 'compact'
              ? 'rounded-lg p-2.5 shadow-[0_12px_20px_-6px_rgba(10,94,215,.3)]'
              : 'p-3 shadow-[0_12px_20px_-6px_rgba(10,94,215,.35)]'
        )}
      >
        <Icon name={icon as string} size={variant === 'hero' ? 32 : variant === 'compact' ? 20 : 26} />
      </div>
    </div>
  ) : null

  // A `div`, not `<header>`: the print stylesheet hides every `header`
  // element to drop the shell chrome, and a detail screen printed inline
  // must keep its title.
  return (
    <div
      data-testid={testId}
      className={cn(
        'flex flex-col gap-3',
        sticky && '-mx-4 -mt-4 bg-page/90 px-4 pt-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6 sticky top-0 z-sticky',
        className
      )}
    >
      {isMobile && back ? <BackLink to={back.to} label={back.label} /> : null}
      {!isMobile && back && !showCrumbs ? <BackLink to={back.to} label={back.label} /> : null}
      {showCrumbs ? <Breadcrumbs items={[...trail, { label: title }]} /> : null}

      <div
        className={cn(
          'flex flex-wrap items-center gap-4',
          variant === 'compact' ? 'gap-2.5' : 'gap-x-6 gap-y-4'
        )}
      >
        <div className={cn('flex min-w-0 flex-1 items-center', variant === 'compact' ? 'gap-2.5' : 'gap-3')}>
          {tile}
          <div className="min-w-0 flex-1">
            {eyebrow ? (
              <p className="font-action text-xs font-semibold uppercase tracking-[.06em] text-muted">
                {t(eyebrow)}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {heading}
              {status}
            </div>
            {subtitle ? (
              <p
                className={cn(
                  'text-muted',
                  variant === 'hero' ? 'mt-0.5 font-light' : variant === 'compact' ? 'text-xs' : 'mt-0.5 text-[13px]'
                )}
              >
                {subtitle}
              </p>
            ) : null}
            {details}
          </div>
        </div>

        {!isMobile && (search || actions || overflowMenu) ? (
          <div data-testid="page-header-actions" className="flex flex-wrap items-center gap-2.5">
            {search ? (
              <Search
                value={search.value}
                onChange={search.onChange}
                placeholder={search.placeholder}
                compact
                className="w-full sm:w-[240px]"
              />
            ) : null}
            {actions}
            {overflowMenu}
          </div>
        ) : null}
      </div>

      {isMobile && (search || actions || overflowMenu) ? (
        <div data-testid="page-header-actions" className="flex flex-col gap-2">
          {search ? (
            <Search
              value={search.value}
              onChange={search.onChange}
              placeholder={search.placeholder}
              className="w-full"
            />
          ) : null}
          {actions || overflowMenu ? (
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {actions}
              {overflowMenu}
            </div>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  )
}
