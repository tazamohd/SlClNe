import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { PageHeader, type PageHeaderProps } from '@/components/ui/PageHeader'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { useNotifications } from '@/data/useNotifications'
import { CommandPalette, useGlobalSearch } from './CommandPalette'
import { CountBadge } from './Topbar'

/** Mobile chrome: 56px header with the drawer trigger, user chip and controls.
 *
 *  The design's mobile screens are not narrow desktop screens — the header is
 *  a different composition (hamburger + avatar + name, no search box), padding
 *  drops 24px → 16px, and the body scrolls in a `100vh - 56px` container rather
 *  than the page. `AppShell` renders this instead of the sidebar below 860px. */
export function MobileHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const { t, theme, toggleTheme } = usePreferences()
  const { userName } = useSession()
  const navigate = useNavigate()
  const { open: searchOpen, setOpen: setSearchOpen } = useGlobalSearch()
  const { unread } = useNotifications()

  return (
    <header className="relative z-[5] flex h-14 flex-shrink-0 items-center gap-2 border-b border-border bg-sidebar px-3 shadow-sm">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={t('Open menu')}
        className="inline-flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name="Menu" size={20} />
      </button>
      <Avatar name={userName} size={26} />
      <p className="flex-1 truncate text-[13px] font-semibold text-heading">{userName}</p>
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label={t('Search')}
        className="inline-flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name="Search" size={16} />
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t('Toggle theme')}
        className="inline-flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
      </button>
      <button
        type="button"
        onClick={() => navigate('/notification-center')}
        aria-label={unread > 0 ? `${t('Notifications')}: ${unread} ${t('unread')}` : t('Notifications')}
        data-testid="topbar-notifications"
        className="relative inline-flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
      >
        <Icon name="Bell" size={16} />
        {unread > 0 ? <CountBadge count={unread} /> : null}
      </button>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

/** Tappable summary card — the mobile stand-in for a desktop table row.
 *
 *  Every mobile list screen in the design uses this shape: 14px radius, 14px
 *  padding, a title row, then stacked detail lines and badges. */
export function MobileCard({
  onClick,
  children,
}: {
  onClick?: () => void
  children: ReactNode
}) {
  const interactive = !!onClick
  return (
    <div
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={
        'flex flex-col gap-2 rounded-[14px] border border-border bg-card p-3.5 shadow-sm ' +
        (interactive
          ? 'cursor-pointer transition-colors duration-150 active:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue'
          : '')
      }
    >
      {children}
    </div>
  )
}

/** Title line of a MobileCard: a monospaced identifier and a trailing badge.
 *  Pass `title` for a plain string heading, or `leading` for rich ReactNode content. */
export function MobileCardHeader({
  title,
  leading,
  code,
  trailing,
}: {
  title?: string
  leading?: ReactNode
  /** Render the title as a Latin identifier (job id, invoice number). */
  code?: boolean
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {leading ?? (
        <span
          dir={code ? 'ltr' : undefined}
          className={
            'font-semibold text-heading ' + (code ? 'font-mono text-[13px]' : 'text-sm')
          }
        >
          {title}
        </span>
      )}
      {trailing}
    </div>
  )
}

/** A labelled detail line inside a MobileCard.
 *  Pass content as `children` or as `value` — whichever reads better at the call site. */
export function MobileCardRow({
  label,
  value,
  children,
}: {
  label?: string
  value?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px] text-body">
      {label ? <span className="text-muted">{label}</span> : null}
      <span className="min-w-0 truncate">{value ?? children}</span>
    </div>
  )
}

/** Vertical stack for a mobile list body, with the design's 16px page padding. */
export function MobileList({ children }: { children: ReactNode }) {
  return <div className="flex animate-fade-up motion-reduce:animate-none flex-col gap-3">{children}</div>
}

/** Compact page title for mobile screens (the 48px gradient heading doesn't
 *  fit a phone).
 *  @deprecated `PageHeader` from `@/components/ui/PageHeader` renders this
 *  layout itself below 860px, so a screen no longer needs an `isMobile`
 *  branch to pick it. Kept for the screens that still do. */
export function MobilePageHeader(props: Omit<PageHeaderProps, 'variant'>) {
  return <PageHeader variant="compact" {...props} />
}
