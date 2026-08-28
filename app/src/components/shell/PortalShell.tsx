import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { usePreferences } from '@/providers/PreferencesProvider'
import { useSession } from '@/providers/SessionProvider'

/** The chrome for a single-audience portal — technician, customer, and later
 *  supplier and procurement.
 *
 *  Deliberately not derived from `AppShell`: a portal serves one audience with
 *  a handful of destinations, so it gets a narrow nav rather than the 28-module
 *  sidebar. The portal designs (`TechnicianPortal.dc.html`,
 *  `CustomerPortal.dc.html`) draw a phone frame with a header and a bottom tab
 *  bar; this reproduces that on small viewports and swaps to a slim top bar
 *  with inline nav on wider ones, with the content column capped rather than
 *  stretched — the desktop reading of a mobile-first surface.
 *
 *  ### What a consuming domain supplies
 *
 *  `PortalShell` itself matches the `Shell` type in `screens/registry.ts` —
 *  it takes `{ children }` and nothing else, so a domain barrel can declare
 *  `shell: PortalShell` directly. The shell then resolves *which* portal it is
 *  dressing from the current route against the `SURFACES` table below. A domain
 *  whose portal is not in that table has two options:
 *
 *  - add its surface to `SURFACES` (one entry: route base, title, icon, nav) —
 *    an edit to this file, which is owned by agent 04 outside the W2 grant, so
 *    it goes through the owner or the orchestrator; or
 *  - bind its own config with `portalShellFor(config)` and declare the bound
 *    component in its barrel, touching nothing here.
 *
 *  Nav items may name the registry screen they lead to; items the signed-in
 *  role cannot open are removed, exactly like the operational sidebar. Every
 *  nav destination must be a built screen — this shell never links to a route
 *  that renders a placeholder, which is why the tables below carry fewer tabs
 *  than the design mock-ups until the remaining portal screens exist.
 *
 *  Session affordances: the signed-in identity (name + role), theme and
 *  language toggles, and sign-out via `/logout-confirmation` — the same
 *  confirmation route the operational shell uses, so no portal invents its own
 *  way out. RTL comes free: the document `dir` is set by `PreferencesProvider`
 *  and every rule here is logical (`ps`/`pe`/`border-e`/`text-start`).
 */

export interface PortalNavItem {
  /** Route the tab navigates to. Must render a real screen, not a pending one. */
  to: string
  /** lucide icon name. */
  icon: string
  /** English source string — translated at render. */
  label: string
  /** Registry screen name, for the role filter. Omit for an always-on item. */
  screen?: string
  /** React Router `end` matching, for the portal home tab. */
  end?: boolean
}

export interface PortalConfig {
  /** Route prefix that identifies this surface, e.g. `/technician-portal`. */
  base: string
  /** English portal name shown in the header — translated at render. */
  title: string
  /** lucide icon for the brand chip. */
  icon: string
  nav: readonly PortalNavItem[]
}

/** The portals this shell recognises by route.
 *
 *  Nav is deliberately shorter than the design's five-tab bar: the remaining
 *  tabs (Time, Parts, Profile…) are tranche-3 screens, and a tab that lands on
 *  a placeholder is a dead end wearing chrome. Tabs are added here as the
 *  screens become real. */
const SURFACES: readonly PortalConfig[] = [
  {
    base: '/technician-portal',
    title: 'Technician Portal',
    icon: 'Wrench',
    nav: [
      {
        to: '/technician-portal',
        icon: 'Home',
        label: 'Home',
        screen: 'TechnicianPortal',
        end: true,
      },
    ],
  },
  {
    base: '/customer-portal',
    title: 'Customer Portal',
    icon: 'Car',
    nav: [
      { to: '/customer-portal', icon: 'Home', label: 'Home', screen: 'CustomerPortal', end: true },
      {
        to: '/customer-portal/booking',
        icon: 'Calendar',
        label: 'Book',
        screen: 'CustomerPortal.Booking',
      },
    ],
  },
]

/** The last-resort identity for a portal route nobody registered: the shell
 *  still renders working chrome (identity, sign-out) rather than crashing or
 *  silently falling back to the operational sidebar. */
const UNREGISTERED: PortalConfig = {
  base: '',
  title: 'Portal',
  icon: 'LayoutGrid',
  nav: [],
}

function surfaceFor(pathname: string): PortalConfig {
  return (
    SURFACES.find(
      (surface) => pathname === surface.base || pathname.startsWith(`${surface.base}/`)
    ) ?? UNREGISTERED
  )
}

/** The `Shell` the domain barrels declare: resolves the portal from the route. */
export function PortalShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <PortalFrame config={surfaceFor(pathname)}>{children}</PortalFrame>
}

/** Binds a config for a portal this file does not know about, so a future
 *  domain can ship its surface without editing the `SURFACES` table. */
export function portalShellFor(config: PortalConfig) {
  return function BoundPortalShell({ children }: { children: ReactNode }) {
    return <PortalFrame config={config}>{children}</PortalFrame>
  }
}

function PortalFrame({ config, children }: { config: PortalConfig; children: ReactNode }) {
  const { t, theme, toggleTheme, rtl, toggleLanguage } = usePreferences()
  const { userName, roleLabel, canScreen } = useSession()

  const nav = config.nav.filter((item) => !item.screen || canScreen(item.screen))
  const tabbed = nav.length > 1

  return (
    <div className="flex min-h-screen flex-col bg-page-alt font-ui">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed start-4 top-2 z-[100] rounded-lg bg-salis-blue px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-salis-blue focus:ring-offset-2"
      >
        {t('Skip to main content')}
      </a>
      <header className="sticky top-0 z-20 border-b border-border bg-sidebar">
        <div className="mx-auto flex w-full max-w-[960px] items-center gap-2.5 px-4 py-3">
          <NavLink
            to={config.base || '/'}
            end
            className="flex items-center gap-2.5 no-underline hover:no-underline"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-salis-gradient text-white">
              <Icon name={config.icon} size={16} />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-sm font-bold leading-tight text-heading">
                SALIS AUTO
              </span>
              <span className="text-[11px] leading-tight text-muted">{t(config.title)}</span>
            </span>
          </NavLink>

          {/* Inline nav on wide viewports; the bottom bar covers small ones. */}
          {tabbed ? (
            <nav aria-label={t(config.title)} className="ms-4 hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-action text-[13px] font-medium no-underline transition-colors hover:no-underline',
                      isActive
                        ? 'bg-salis-gradient-r text-white shadow'
                        : 'text-heading hover:bg-[rgba(10,94,215,.08)]'
                    )
                  }
                >
                  <Icon name={item.icon} size={14} />
                  {t(item.label)}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <span className="flex-1" />

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2 font-action text-xs font-medium text-muted transition-colors hover:bg-[rgba(10,94,215,.08)] hover:text-salis-blue"
          >
            <Icon name="Globe" size={14} />
            <span>{rtl ? 'English' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('Toggle theme')}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-muted transition-colors hover:bg-[rgba(10,94,215,.08)] hover:text-salis-blue"
          >
            <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={16} />
          </button>

          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />

          <span className="hidden items-center gap-2 sm:flex">
            <Avatar name={userName} aria-hidden />
            <span className="hidden min-w-0 flex-col md:flex">
              <span className="max-w-[160px] truncate text-[13px] font-semibold leading-tight text-heading">
                {userName}
              </span>
              <span className="text-[11px] leading-tight text-muted">{roleLabel}</span>
            </span>
          </span>

          {/* Through the confirmation screen, never straight to /login — the
              same decision the operational sidebar records. */}
          <NavLink
            to="/logout-confirmation"
            aria-label={t('Logout')}
            className="flex h-8 items-center gap-1.5 rounded-md px-2 font-action text-xs font-medium text-salis-orange no-underline transition-colors hover:bg-salis-orange hover:text-white hover:no-underline"
          >
            <Icon name="LogOut" size={15} />
            <span className="hidden sm:inline">{t('Logout')}</span>
          </NavLink>
        </div>
      </header>

      <main id="main-content" className={cn('mx-auto w-full max-w-[960px] flex-1 p-4 md:p-6', tabbed && 'pb-24 md:pb-6')}>
        {children}
      </main>

      {/* The design's bottom tab bar, on viewports where the inline nav is
          hidden. Rendered only when there is more than one destination — a
          one-tab bar is chrome with nothing to say. */}
      {tabbed ? (
        <nav
          aria-label={t(config.title)}
          className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden"
        >
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 no-underline transition-colors hover:no-underline',
                  isActive ? 'text-salis-blue' : 'text-muted'
                )
              }
            >
              <Icon name={item.icon} size={19} />
              <span className="font-action text-[10px] font-semibold">{t(item.label)}</span>
            </NavLink>
          ))}
        </nav>
      ) : null}
    </div>
  )
}
