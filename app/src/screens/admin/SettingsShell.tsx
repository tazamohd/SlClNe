import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useIsMobile } from '@/lib/useMediaQuery'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'
import { Icon } from '@/components/ui/Icon'
import { PageHeader } from '@/components/ui/PageHeader'
import { ReadOnlyNotice } from '@/components/ui/States'

/** The frame every settings screen sits in.
 *
 *  Three settings surfaces grew up separately (`admin/Settings`, the
 *  `settings/*` spec screens and the security/billing pages) with no way to
 *  move between them but the sidebar. This shell gives them one header, one
 *  start-side section nav that stays put while a long form scrolls, and on a
 *  phone a horizontal chip row instead — the same seven sections, one tap
 *  each, all of them ≥44px.
 *
 *  `title` stays per screen because the smoke contract reads each route's
 *  registry title from the H1 ("Security Settings", "Financial Settings"); the
 *  shell adds "Settings" as the eyebrow so the family is still visible.
 *  Sections the role cannot open are removed, never greyed (RBAC by
 *  disappearance). */
interface SettingsSection {
  label: string
  icon: string
  to: string
  /** Registry screen name, for `canScreen`. */
  screen: string
  /** Sibling routes that light up the same section. */
  also?: readonly string[]
}

const SECTIONS: readonly SettingsSection[] = [
  { label: 'Workshop', icon: 'Wrench', to: '/settings', screen: 'Settings' },
  { label: 'Notifications', icon: 'Bell', to: '/notification-center', screen: 'NotificationCenter' },
  { label: 'Security', icon: 'Lock', to: '/security-settings', screen: 'Security-Settings' },
  { label: 'Billing', icon: 'CreditCard', to: '/subscription', screen: 'Subscription' },
  { label: 'Financial', icon: 'Landmark', to: '/financial-settings', screen: 'Financial-Settings' },
  {
    label: 'Users & Roles',
    icon: 'Users',
    to: '/users-teams',
    screen: 'UsersTeams',
    also: ['/roles-permissions', '/role-management'],
  },
  { label: 'Integrations', icon: 'Plug', to: '/integrations', screen: 'Integrations' },
  { label: 'Advanced', icon: 'SlidersHorizontal', to: '/advanced-settings', screen: 'AdvancedSettings' },
]

export interface SettingsShellProps {
  /** Registry title of the screen — the H1. Defaults to the family name. */
  title?: string
  subtitle?: string
  icon?: string
  actions?: ReactNode
  /** Read-only banner under the header; a string is the English message. */
  readOnly?: boolean | string
  children: ReactNode
}

export function SettingsShell({
  title = 'Settings',
  subtitle,
  icon = 'Settings',
  actions,
  readOnly,
  children,
}: SettingsShellProps) {
  const { t } = usePreferences()
  const isMobile = useIsMobile()
  const { canScreen } = useSession()
  const { pathname } = useLocation()

  const sections = SECTIONS.filter((section) => canScreen(section.screen))
  const isCurrent = (section: SettingsSection) =>
    pathname === section.to || (section.also ?? []).includes(pathname)

  const nav = (
    <nav
      aria-label={t('Settings sections')}
      className={cn(
        isMobile
          ? '-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]'
          : 'flex flex-col gap-1 lg:sticky lg:top-6'
      )}
    >
      {sections.map((section) => {
        const current = isCurrent(section)
        return (
          <NavLink
            key={section.to}
            to={section.to}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 font-action text-[13px] font-medium no-underline transition-colors hover:no-underline',
              isMobile ? 'flex-shrink-0 border border-border bg-card' : 'w-full',
              current
                ? 'bg-salis-blue/[.08] text-salis-blue'
                : 'text-body hover:bg-inset hover:text-heading'
            )}
          >
            <Icon name={section.icon} size={16} className="flex-shrink-0" />
            <span className="whitespace-nowrap">{t(section.label)}</span>
          </NavLink>
        )
      })}
    </nav>
  )

  return (
    <div className="flex animate-fade-up flex-col gap-5 motion-reduce:animate-none sm:gap-6">
      <PageHeader
        title={title}
        subtitle={subtitle ? t(subtitle) : undefined}
        icon={icon}
        eyebrow={title === 'Settings' ? undefined : 'Settings'}
        actions={actions}
      />
      {readOnly ? (
        <ReadOnlyNotice message={typeof readOnly === 'string' ? t(readOnly) : undefined} />
      ) : null}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
        {nav}
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">{children}</div>
      </div>
    </div>
  )
}
