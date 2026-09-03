import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useCollection } from '@/data/useCollection'
import { useNotifications } from '@/data/useNotifications'
import { isInProgress, todayIso, type AppointmentRow } from '@/screens/portals/portal-data'
import type { JobRow } from '@/screens/workshop/stages'
import { ShellContext } from './ShellContext'
import { CountBadge } from './Topbar'

/** The customer-facing phone app.
 *
 *  A separate surface from the operational app: no sidebar, no RBAC nav — a
 *  430px frame with its own header and a five-tab bottom bar, exactly as the
 *  `CustomerApp.*.dc.html` files draw it. On a desktop viewport the frame
 *  centres rather than stretching, which is what the design's
 *  `max-width:430px;margin:0 auto` does.
 *
 *  The tab bar carries two live badges beside the bell: Tracking lights when a
 *  job is in the workshop right now, Bookings when an appointment falls today.
 *  Both come from the same collections the screens behind the tabs read, so
 *  the badge and the screen cannot disagree. */

const TABS = [
  { to: '/customer-app/home', label: 'Home', icon: 'Home', end: true },
  { to: '/customer-app/garage', label: 'Garage', icon: 'Car' },
  { to: '/customer-app/appointments', label: 'Bookings', icon: 'Calendar' },
  { to: '/customer-app/service-tracking', label: 'Tracking', icon: 'Radio' },
  { to: '/customer-app/profile', label: 'Profile', icon: 'User' },
] as const

const CUSTOMER_SHELL = { kind: 'customer-app' } as const

/** Tab badges derived from the collections. A fixture appointment carries no
 *  date and is read as today's, the same rule the technician's schedule uses. */
function useTabBadges(): Record<string, number> {
  const jobs = useCollection('jobs')
  const appointments = useCollection('appointments')
  const today = todayIso()

  const inProgress = ((jobs.data ?? []) as readonly JobRow[]).filter(isInProgress).length
  const dueToday = ((appointments.data ?? []) as readonly AppointmentRow[]).filter(
    (row) => !row.scheduledDate || row.scheduledDate === today
  ).length

  return {
    '/customer-app/service-tracking': inProgress,
    '/customer-app/appointments': dueToday,
  }
}

export function CustomerAppShell({ children }: { children: ReactNode }) {
  const { t, theme, toggleTheme } = usePreferences()
  const { pathname } = useLocation()
  const { unread } = useNotifications()
  const badges = useTabBadges()

  return (
    <ShellContext.Provider value={CUSTOMER_SHELL}>
    <div className="flex min-h-screen justify-center bg-page-alt font-ui">
      <div className="flex h-screen w-full max-w-[430px] flex-col border-x border-border bg-page">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only fixed start-4 top-2 z-[100] inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-salis-blue px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-salis-blue focus:ring-offset-2"
        >
          {t('Skip to main content')}
        </a>
        <header className="flex flex-shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-salis-gradient text-white">
            <Icon name="Wrench" size={16} />
          </span>
          <span className="flex-1 font-display text-sm font-bold text-heading">SALIS AUTO</span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded border-none bg-transparent text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>
          <NavLink
            to="/customer-app/notifications"
            aria-label={unread > 0 ? `${t('Notifications')}: ${unread} ${t('unread')}` : t('Notifications')}
            className="relative flex h-11 w-11 items-center justify-center rounded text-muted no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue"
          >
            <Icon name="Bell" size={16} />
            {unread > 0 && pathname !== '/customer-app/notifications' ? <CountBadge count={unread} /> : null}
          </NavLink>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="flex animate-fade-up motion-reduce:animate-none flex-col gap-3.5 p-4">{children}</div>
        </main>

        <nav aria-label={t('App navigation')} className="flex flex-shrink-0 border-t border-border bg-sidebar">
          {TABS.map((tab) => {
            const count = badges[tab.to] ?? 0
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={'end' in tab ? tab.end : false}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2 no-underline transition-colors hover:no-underline',
                    isActive ? 'text-salis-blue' : 'text-muted'
                  )
                }
              >
                <span className="relative flex">
                  <Icon name={tab.icon} size={19} />
                  {count > 0 ? <CountBadge count={count} className="-end-2.5 -top-1.5" /> : null}
                </span>
                <span className="font-action text-[11px] font-semibold">{t(tab.label)}</span>
                {count > 0 ? <span className="sr-only">{count}</span> : null}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
    </ShellContext.Provider>
  )
}

/** Gradient hero card used for the active-service and wallet-balance blocks.
 *  The value is rendered in the document direction; a caller whose value is a
 *  Latin run (a plate, a SAR amount) pins that line itself. */
export function AppHeroCard({
  icon,
  label,
  value,
  children,
}: {
  icon: string
  label: string
  value: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="rounded-xl bg-salis-gradient p-[18px] text-white shadow-[0_8px_24px_rgba(10,94,215,.25)]">
      <div className="mb-2.5 flex items-center gap-2">
        <Icon name={icon} size={16} />
        <span className="font-action text-xs font-semibold opacity-90">{label}</span>
      </div>
      <p className="font-display text-2xl font-black">{value}</p>
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
        'flex min-h-[56px] w-full items-center gap-3 rounded-[14px] border border-border bg-card p-3.5 text-start',
        interactive &&
          'cursor-pointer transition-colors active:bg-inset focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-salis-blue focus-visible:ring-offset-2'
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

/** Skeleton for a list row, sized like `AppListRow` so nothing jumps. */
export function AppRowSkeleton() {
  return (
    <span aria-hidden className="flex min-h-[56px] items-center gap-3 rounded-[14px] border border-border bg-card p-3.5">
      <span className="h-9 w-9 flex-shrink-0 animate-pulse rounded-[10px] bg-inset motion-reduce:animate-none" />
      <span className="flex flex-1 flex-col gap-2">
        <span className="h-3 w-2/3 animate-pulse rounded bg-inset motion-reduce:animate-none" />
        <span className="h-2.5 w-1/3 animate-pulse rounded bg-inset motion-reduce:animate-none" />
      </span>
    </span>
  )
}
