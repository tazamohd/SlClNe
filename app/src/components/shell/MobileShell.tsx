import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** Mobile chrome: 56px header with the drawer trigger, user chip and controls.
 *
 *  The design's mobile screens are not narrow desktop screens — the header is
 *  a different composition (hamburger + avatar + name, no search box), padding
 *  drops 24px → 16px, and the body scrolls in a `100vh - 56px` container rather
 *  than the page. `AppShell` renders this instead of the sidebar below 860px. */
export function MobileHeader({ onOpenNav }: { onOpenNav: () => void }) {
  const { theme, toggleTheme, t } = usePreferences()
  const { userName } = useSession()

  return (
    <header className="relative z-[5] flex h-14 flex-shrink-0 items-center gap-2 border-b border-border bg-sidebar px-3 shadow-sm">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={t("Open menu")}
        className="inline-flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-heading"
      >
        <Icon name="Menu" size={20} />
      </button>
      <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-salis-gradient text-[10px] font-bold text-white">
        {userName.trim()[0] ?? '?'}
      </span>
      <p className="flex-1 truncate text-[13px] font-semibold text-heading">{userName}</p>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={t("Toggle theme")}
        className="inline-flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted"
      >
        <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
      </button>
      <button
        type="button"
        aria-label={t("Notifications")}
        className="relative inline-flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted"
      >
        <Icon name="Bell" size={16} />
        <span className="absolute top-1.5 h-[7px] w-[7px] rounded-full border-2 border-sidebar bg-salis-orange end-[7px]" />
      </button>
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

/** Title line of a MobileCard: a monospaced identifier and a trailing badge. */
export function MobileCardHeader({
  title,
  code,
  trailing,
}: {
  title: string
  /** Render the title as a Latin identifier (job id, invoice number). */
  code?: boolean
  trailing?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        dir={code ? 'ltr' : undefined}
        className={
          'font-semibold text-heading ' + (code ? 'font-mono text-[13px]' : 'text-sm')
        }
      >
        {title}
      </span>
      {trailing}
    </div>
  )
}

/** A labelled detail line inside a MobileCard. */
export function MobileCardRow({
  label,
  children,
}: {
  label?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px] text-body">
      {label ? <span className="text-muted">{label}</span> : null}
      <span className="min-w-0 truncate">{children}</span>
    </div>
  )
}

/** Vertical stack for a mobile list body, with the design's 16px page padding. */
export function MobileList({ children }: { children: ReactNode }) {
  return <div className="flex animate-fade-up flex-col gap-3">{children}</div>
}

/** Compact page title for mobile screens (the 48px gradient heading doesn't
 *  fit a phone). */
export function MobilePageHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon: string
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex rounded-lg bg-salis-gradient p-2.5 text-white shadow-[0_12px_20px_-6px_rgba(10,94,215,.3)]">
        <Icon name={icon} size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-xl font-black text-heading">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-muted">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  )
}
