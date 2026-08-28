import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'

/** The customer-facing phone app.
 *
 *  A separate surface from the operational app: no sidebar, no RBAC nav — a
 *  430px frame with its own header and a five-tab bottom bar, exactly as the
 *  `CustomerApp.*.dc.html` files draw it. On a desktop viewport the frame
 *  centres rather than stretching, which is what the design's
 *  `max-width:430px;margin:0 auto` does. */

const TABS = [
  { to: '/customer-app/home', label: 'Home', icon: 'Home', end: true },
  { to: '/customer-app/garage', label: 'Garage', icon: 'Car' },
  { to: '/customer-app/appointments', label: 'Bookings', icon: 'Calendar' },
  { to: '/customer-app/service-tracking', label: 'Tracking', icon: 'Radio' },
  { to: '/customer-app/profile', label: 'Profile', icon: 'User' },
] as const

export function CustomerAppShell({ children }: { children: ReactNode }) {
  const { t, theme, toggleTheme } = usePreferences()
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen justify-center bg-page-alt font-ui">
      <div className="flex h-screen w-full max-w-[430px] flex-col border-x border-border bg-page">
        <header className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient text-white">
            <Icon name="Wrench" size={16} />
          </span>
          <span className="flex-1 font-display text-sm font-bold text-heading">SALIS AUTO</span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <NavLink
            to="/customer-app/notifications"
            aria-label={t('Notifications')}
            className="relative flex h-10 w-10 items-center justify-center rounded text-muted no-underline hover:no-underline"
          >
            <Icon name="Bell" size={16} />
            {pathname !== '/customer-app/notifications' ? (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-salis-orange" />
            ) : null}
          </NavLink>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="flex animate-fade-up flex-col gap-3.5 p-4">{children}</div>
        </main>

        <nav className="flex flex-shrink-0 border-t border-border bg-sidebar">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={'end' in tab ? tab.end : false}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 no-underline transition-colors hover:no-underline',
                  isActive ? 'text-salis-blue' : 'text-muted'
                )
              }
            >
              <Icon name={tab.icon} size={19} />
              <span className="font-action text-[10px] font-semibold">{t(tab.label)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

/** Gradient hero card used for the active-service and wallet-balance blocks. */
export function AppHeroCard({
  icon,
  label,
  value,
  children,
}: {
  icon: string
  label: string
  value: string
  children?: ReactNode
}) {
  return (
    <div className="rounded-xl bg-salis-gradient p-[18px] text-white shadow-[0_8px_24px_rgba(10,94,215,.25)]">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon name={icon} size={16} />
        <span className="font-action text-xs font-semibold opacity-90">{label}</span>
      </div>
      <p className="font-display text-2xl font-black" dir="ltr">
        {value}
      </p>
      {children}
    </div>
  )
}

/** Plain white list row with an icon chip — the app's repeated list unit. */
export function AppListRow({
  icon,
  iconTint = 'rgba(10,94,215,.08)',
  iconColor = 'var(--salis-blue)',
  title,
  subtitle,
  trailing,
  onClick,
}: {
  icon: string
  iconTint?: string
  iconColor?: string
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
}) {
  const interactive = !!onClick
  const Tag = interactive ? 'button' : 'div'
  return (
    <Tag
      {...(interactive ? { type: 'button' as const, onClick } : {})}
      className={cn(
        'flex w-full items-center gap-3 rounded-[14px] border border-border bg-card p-3.5 text-start',
        interactive && 'cursor-pointer transition-colors active:bg-inset'
      )}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
        style={{ background: iconTint, color: iconColor }}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-heading">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[11px] text-muted">{subtitle}</span>
        ) : null}
      </span>
      {trailing}
    </Tag>
  )
}

/** Section heading inside the app frame. */
export function AppSection({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 pt-1">
      <h2 className="font-display text-sm font-bold text-heading">{title}</h2>
      {action}
    </div>
  )
}
